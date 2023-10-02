
import helpers from "./shared/helpers"
import dataTools from "./shared/dataTools"
import Tooltip from "./shared/tooltip"
import ColorScale from "./shared/colorscale"
import { addPeriods } from "./shared/periods"
import { addLines } from "./shared/lines"
//import { addLabels } from "./shared/labels"
import  { addLabel, clickLogging } from './shared/arrows'
import { addDrops } from "./shared/drops"
import { getURLParams, getLongestKeyLength, numberFormat, mustache, mobileCheck, sorter, relax} from './shared/toolbelt';
import Dropdown from "./shared/dropdown";

export default class Linechart {

  constructor(settings) {

    this.settings = settings

    this.init()

  }

  init() {

    this.settings.chartlines = this.settings.chartlines.filter(d => d != "")

    this.settings.chartlines = this.settings.chartlines.filter(d => d != this.settings.xColumn)

    if (this.settings.tooltip != "") {

      this.tooltip = new Tooltip(this.settings.tooltip)

    }

    if (this.settings.dropdown.length > 0) {

      addDrops()

      this.dropdown = new Dropdown(

        "dataPicker",

        dataTools.getDropdown(this.settings.dropdown, this.settings.keys)

      )

      this.dropdown.on("dropdown-change", (label) => {

        let data = this.settings.dropdown.find(d => d.label == label)

        this.settings.chartlines = [...data.values.split(',').map(d => d.trim()) ] //d.trim()

        this.settings.chartlines = this.settings.chartlines.filter(d => d != "")

        // this.settings.chartlines = this.settings.chartlines.filter(d => d != this.settings.xColumn)

        if (this.settings.tooltip != "") {

          this.tooltip.updateTemplate(data.tooltip)

        }

        this.render()

      })

    }

    this.render()

  }
 
  render() {

    let chart = this

    let { modules, 
          height, 
          width, 
          isMobile, 
          colors, 
          datum, 
          data, 
          keys, 
          title, 
          subtitle, 
          source, 
          dateFormat, 
          yScaleType, 
          xAxisLabel, 
          yAxisLabel, 
          baseline, 
          tooltip, 
          periodDateFormat, 
          marginleft, 
          margintop, 
          marginbottom, 
          marginright, 
          minX, 
          minY, 
          maxY,
          footnote, 
          enableShowMore, 
          aria, 
          colorScheme, 
          lineLabelling, 
          type, 
          userkey, 
          periods, 
          labels, 
          dropdown, 
          x_axis_cross_y,
          xAxisDateFormat,
          breaks,
          lines,
          xColumn,
          xFormat,
          chartlines,
          current,
          parseTime,
          invertY,
          hideNullValues,
          tooltipModule } = this.settings

    d3.select("#graphicContainer svg").remove() 

    const chartKey = d3.select("#chartKey")

    chartKey.html("")
    
    isMobile = mobileCheck()

    datum = JSON.parse(JSON.stringify(data))

    let keyCopy = JSON.parse(JSON.stringify(keys))
    keyCopy = keyCopy.filter(d => d != xColumn)
    const containerwidth = document
    .querySelector("#graphicContainer")
    .getBoundingClientRect().width

    const containerheight = containerwidth * 0.6

    width = containerwidth - marginleft - marginright

    height = containerheight - margintop - marginbottom
  
    // Reverses the yAxis
    
    let yRange = [height, 0]
    if (invertY) {
      yRange = [0, height]
    
    }
    
    let y = d3.scaleLinear()
    .rangeRound(yRange)

    console.log("invertY", invertY)
   
    if (yScaleType != "" && yScaleType != null) {
      y = d3[yScaleType]()
      .range(yRange)
      .nice()
    }  


    let lineGenerators = {}
    let chartValues = []
    let chartKeyData = {}

    colors = new ColorScale()

    const keyColor = dataTools.getKeysColors({
      keys: keyCopy,
      userKey: userkey,
      option: { colorScheme : colorScheme }
    })
    //console.log("keyColor",keyColor)
    colors.set(keyColor.keys, keyColor.colors)

  


    const svg = d3
    .select("#graphicContainer")
    .append("svg")
    .attr("width", containerwidth)
    .attr("height", containerheight)
    .attr("id", "svg")
    .attr("overflow", "hidden")
    
    let buffer = (lineLabelling) ? getLongestKeyLength(svg, keyCopy, isMobile, lineLabelling) : 0 ;

    console.log("xFormat",xFormat)

    // Set a default x scale
    let x = d3.scaleLinear()
      .rangeRound([0, width - buffer])

    if (xFormat.date) {
      x = d3.scaleTime()
      .rangeRound([0, width - buffer])
    } else if (xFormat.string) {
      x = d3.scaleLinear()
      .rangeRound([0, width - buffer])
    } else if (xFormat.number) {
      x = d3.scaleLinear()
      .rangeRound([0, width - buffer])
    }
    const features = svg
    .append("g")
    .attr("transform","translate(" + marginleft + "," + margintop + ")")
    .attr("id", "features")

    //console.log("chartlines", chartlines)
    chartlines.forEach((key) => {

      lineGenerators[key] = d3
      .line()
      .x((d) => x(d[xColumn]))
      .y((d) => y(d[key]))

      if (hideNullValues === "yes") {

        lineGenerators[key].defined( (d) => d)

      }
    
      datum.forEach((d) => {

        if (key != xColumn) {

          chartValues.push(d[key])

          //console.log(`${key}: ${d[key]}`)

        }
        
      })

    })


    if (chartlines.length > 1) {

     if (isMobile && !lineLabelling  || lineLabelling === false) {

        let chartKeys = JSON.parse(JSON.stringify(chartlines))

        //chartKeys.splice(chartKeys.indexOf(xColumn), 1)

        chartKeys.forEach((key) => {

          const $keyDiv = chartKey.append("div").attr("class", "keyDiv")

          $keyDiv
          .append("span")
          .attr("class", "keyCircle")
          .style("background-color", () => colors.get(key))

          $keyDiv
          .append("span")
          .attr("class", "keyText")
          .text(key)

          })
       }

     }

    datum.forEach((d) => {
      if (xFormat.date) {
        d[xColumn] = parseTime(d[xColumn])
      }
    })

    keyCopy.forEach((key) => {
      chartKeyData[key] = []
      datum.forEach((d) => {
        if (d[key] != null) {
          let newData = {}
          newData[xColumn] = d[xColumn]
          newData[key] = d[key]
          chartKeyData[key].push(newData)
        } else if (hideNullValues === "yes") {
          chartKeyData[key].push(null)
        }
      })
    })

    const max = (maxY && maxY !== "")
        ? parseInt(maxY)
        : d3.max(chartValues)

    const min = (minY && minY !== "")
        ? parseInt(minY)
        : d3.min(chartValues)

   let range = datum.map( d => d[xColumn])

   console.log("renage",range) 
    x.domain(d3.extent(range))

    y.domain([min, max])

    const xTicks = Math.round(width / 110)

    const yTicks = (yScaleType === "scaleLog") ? 3 : 5

    const xAxis = d3.axisBottom(x)
    .ticks(xTicks)

    if (xFormat.date) {
  
        xAxis
        .tickFormat(d3.timeFormat(xAxisDateFormat))

    }

    const yAxis = d3
    .axisLeft(y)
    .tickFormat((d) => numberFormat(d))
    .ticks(yTicks)
    .tickSize(-(width - buffer))  

    features.append("g")
    .attr("class", "y dashed")
    .call(yAxis)
    .style("stroke-dasharray", "2 2")  

    features
    .append("g")
    .attr("class", "x")
    .attr("transform", () => (x_axis_cross_y != "") ? "translate(0," + y(x_axis_cross_y) + ")" : "translate(0," + height + ")")
    .call(xAxis)

    features
    .select(".y .domain")
    .remove()    

    features
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("fill", "#767676")
    .attr("text-anchor", "end")
    .text(yAxisLabel)

    features
    .append("text")
    .attr("x", width)
    .attr("y", height - 6)
    .attr("fill", "#767676")
    .attr("text-anchor", "end")
    .text(xAxisLabel)

    d3.selectAll(".tick line")
    .attr("stroke", "#767676")

    d3.selectAll(".tick text")
    .attr("fill", "#767676")

    d3.selectAll(".domain")
    .attr("stroke", "#767676")

    var keyOrder = []

    let labelPos = []

    if (lineLabelling) { 
      
      chartlines.forEach((key) => {
        if (key != xColumn) {
          let value = y(chartKeyData[key][chartKeyData[key].length - 1][key]) + 4
          labelPos.push({ key : key , value : value , labelY : value })
        }
      })

      relax(labelPos);

    }
    
    chartlines.forEach((key) => {
      //console.log("key",key)
      features
      .append("path")
      .datum(chartKeyData[key])
      .attr("fill", "none")
      .attr("stroke", (d) => colors.get(key))
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 2)
      .attr("d", lineGenerators[key])

      const tempLabelData = chartKeyData[key].filter((d) => d != null)
      let lineLabelAlign = "start"
      let lineLabelOffset = 10

      keyOrder.push(key)

       if (lineLabelling) { 

        features
        .append("circle")
        .attr("cy", (d) => y(tempLabelData[tempLabelData.length - 1][key]))
        .attr("fill", (d) => colors.get(key))
        .attr("cx", (d) => x(tempLabelData[tempLabelData.length - 1][xColumn]))
        .attr("r", 4)
        .style("opacity", 1)

        features
        .append("text")
        .attr("class", "lineLabels")
        .style("font-weight","bold")
        .style("font-size","15px")
        .attr("y", (d) => {
          let pos = (labelPos.find(d => d.key == key)) ? labelPos.find(d => d.key === key).labelY : - 100
          return pos
        })
        .attr("x", (d) => x(tempLabelData[tempLabelData.length - 1][xColumn]) + 5)
        .style("opacity", 1)
        .attr("text-anchor", lineLabelAlign)
        .attr("fill", (d) => colors.get(key))
        .text((d) => `${key.replace(/_/g, "")}`)

      }

    })


    if (periods.length > 0) {

      addPeriods(periods, parseTime, features, x, height, xFormat)

    }

    if (lines.length > 0) {

      addLines(lines, x, y, features, parseTime)

    } 

    if (labels.length > 0) {
     
      const clickLoggingOn = getURLParams("labelling") ? true : false ;
      console.log("clickLoggingOn", clickLoggingOn);

      // Move this to wrangle later once we re-factor the labelling stuff

      if (typeof labels[0].coords  === 'string') {
        labels.forEach(function(d) {
          d.coords = JSON.parse(d.coords)
          d.sweepFlag = +d.sweepFlag
          d.largeArcFlag = +d.largeArcFlag
          d.radius = +d.radius
        })
      }
     
      console.log("annotations", labels)
      labels.forEach((config) => {
        addLabel(svg, config, width + marginleft + marginright - buffer, height + margintop + marginbottom, {"left":marginleft, "right":marginright, "top":margintop, "bottom":marginbottom}, clickLoggingOn)
      })

    }



    /*

    if (labels.length > 0) {

      addLabels(labels, parseTime, features, isMobile, x, y)
      
    }

    */

    if (this.settings.tooltip != "") {

      this.tooltip.drawHoverFeature(features, height, width, xColumn, marginleft, chartKeyData, x, datum, keyCopy)
 
    }

  }

}
