
import dataTools from "./shared/dataTools"
import ColorScale from "./shared/colorscale"
import { numberFormat,getURLParams, mustache, mobileCheck, textPadding, textPaddingMobile, stackMin, stackMax, timeCheck } from './shared/toolbelt';
import Dropdown from "./shared/dropdown";
import { addDrops } from "./shared/drops"
import Tooltip from "./shared/tooltip"
import { addPeriods } from "./shared/periods"
import { addLabel } from './shared/arrows'
import { addTrendline } from "./shared/trendline"
import Sonic from "./shared/sonic"

export default class Stackedbar {

  constructor(settings) {

    this.settings = settings
    
    this.init()

  }

  init() {

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

        this.settings.stackedbars = data.values.split(',').map(d => d.trim())

        if (this.settings.tooltip != "") {

          this.tooltip.updateTemplate(data.tooltip)

        }

        this.render()

      })

    }

    this.render()

  }

  render() {

    let { modules, 
          height, 
          width, 
          isMobile, 
          colors, 
          datum, 
          data, 
          keys, 
          calcs, 
          title, 
          subtitle, 
          source, 
          dateFormat, 
          timeInterval,
          xAxisLabel, 
          yAxisLabel, 
          tooltip,
          periodDateFormat, 
          xAxisDateFormat,
          xColumn,
          xFormat,
          yColumn,
          marginleft, 
          margintop, 
          marginbottom, 
          marginright, 
          footnote, 
          minY,
          trendline, 
          aria, 
          colorScheme, 
          type, 
          labels, 
          userkey, 
          dropdown, 
          periods,
          parseTime,
          stackedbars,
          hideKey
          } = this.settings


    d3.select("#graphicContainer svg").remove()
    // console.log("type", type)  
    const chartKey = d3.select("#chartKey")

    chartKey.html("")

    colors = new ColorScale()
    
    isMobile = mobileCheck()

    width = document.querySelector("#graphicContainer").getBoundingClientRect().width
    
    height = width * 0.4

    width = width - marginleft - marginright

    height = height - margintop - marginbottom

    datum = JSON.parse(JSON.stringify(data))

    // console.log("data", data)

    const keyColor = dataTools.getKeysColors({
      keys: stackedbars,
      userKey: userkey,
      option: { colorScheme : colorScheme }
    })

    // console.log("stackedbars",stackedbars)
    colors.set(keyColor.keys, keyColor.colors)

    if (!hideKey) {

      stackedbars.forEach((key, i) => {
        const keyDiv = chartKey
        .append("div")
        .attr("class", "keyDiv")

        keyDiv.append("span")
        .attr("class", "keyCircle")
        .style("background-color", () => colors.get(key))

        keyDiv.append("span")
        .attr("class", "keyText")
        .text(key)
      })

    }

    datum.forEach((d) => {
      if (xFormat.date) {
        d[xColumn] = parseTime(d[xColumn])
      }

      stackedbars.forEach((key, i) => {
        d[key] = (d[key] == null) ? null : +d[key]
      })
      d.Total = d3.sum(stackedbars, (k) => +d[k])
    })

 

    let playButton = d3.select("#playChart")
    playButton
      .on("click", () => {sonic.playPause(datum)})

    let xRange = timeCheck(timeInterval, datum, xColumn)

    var layers = d3.stack()
    .offset(d3.stackOffsetDiverging)
    .keys(stackedbars)(datum)

    layers.forEach(function(layer) {
      layer.forEach(function(subLayer) {
        subLayer.group = layer.key
        subLayer.groupValue = subLayer.data[layer.key]
        subLayer.total = subLayer.data.Total
      })
    })

    // console.log(layers)  
    const svg = d3.select("#graphicContainer")
    .append("svg")
    .attr("width", width + marginleft + marginright)
    .attr("height", height + margintop + marginbottom)
    .attr("id", "svg")
    .attr("overflow", "hidden")
    
    const features = svg
    .append("g")
    .attr("transform", "translate(" + marginleft + "," + margintop + ")")
    .attr("id", "features")

    const x = d3.scaleBand()
    .range([0, width])

    x.domain(xRange)

    const y = d3.scaleLinear()
    .range([height, 0])

    y.domain([d3.min(layers, stackMin), d3.max(layers, stackMax)])

    let xAxis

    let yAxis

    let ticks = 3

    let tickMod = Math.round(x.domain().length / 10)

    if (isMobile) {

      tickMod = Math.round(x.domain().length / 5)

    }

    ticks = x.domain()
    .filter((d, i) => !(i % tickMod))

    if (isMobile) {

      xAxis = d3.axisBottom(x)
      .tickValues(ticks)

      if (xFormat.date) {
        xAxis.tickFormat(xAxisDateFormat)
      }
      
      yAxis = d3.axisLeft(y)
      .tickFormat((d) => numberFormat(d)).ticks(5)

    } else {

      xAxis = d3.axisBottom(x)
      .tickValues(ticks)

      if (xFormat.date) {
        xAxis.tickFormat(xAxisDateFormat)
      }

      yAxis = d3.axisLeft(y)
      .tickFormat((d) => numberFormat(d))

    }

    let sonic = new Sonic(this.settings, x, y, colors)
    sonic.setupSonicData(datum, keys=stackedbars)
    sonic.addInteraction()


    features
    .append("g")
    .attr("class", "y")
    .call(yAxis)

    d3.selectAll(".y .tick line")
    .style("stroke", "#dcdcdc")
    .style("stroke-dasharray", "2 2")
    .attr("x2", width)
    
    d3.selectAll(".y path")
    .style("stroke-width", "0")

    const layer = features
    .selectAll("layer")
    .data(layers, (d) => d.key)
    .enter()
    .append("g")
    .attr("class", (d) => "layer " + d.key)
    .style("fill", (d, i) => colors.get(d.key))
    
    layer
    .selectAll("rect")
    .data((d) => d)
    .enter()
    .append("rect")
    .attr("x", (d) => x(d.data[xColumn]))
    .attr("y", (d) => y(d[1]))
    .attr("class", "barPart")
    .attr("title", (d) => d.data[d.key])
    .attr("data-group", (d) => d.group)
    .attr("data-count", (d) => d.data[d.key])
    .attr("height", (d) => y(d[0]) - y(d[1]))
    .attr("width", (d) => {
      let band = x.bandwidth()
      return (band < 4) ? band : band - 2
    }) //x(data[data.length - 1][xColumn]) / data.length

    features
    .append("g")
    .attr("class", "x")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)

    if (xAxisLabel) {

      svg
      .append("text")
      .attr("x", width + marginleft)
      .attr("y", height + margintop + marginbottom)
      .attr("fill", "#767676")
      .attr("text-anchor", "end")
      .text(xAxisLabel)  
    }

    if (yAxisLabel) {
      
      svg
      .append("text")
      //.attr("transform", "rotate(-90)")
      .attr("x", marginleft)
      .attr("y", 0)
      .attr("dy", "0.71em")
      .attr("fill", "#767676")
      .attr("text-anchor", "end")
      .text(yAxisLabel)

    }


    if (periods.length > 0) {

      addPeriods(periods, parseTime, features, x, height, xFormat)

    }

    if (labels.length > 0) {

      const clickLoggingOn = getURLParams("labelling") ? true : false ;
      // console.log("clickLoggingOn", clickLoggingOn);

      // Move this to wrangle later once we re-factor the labelling stuff

      if (typeof labels[0].coords  === 'string') {
        labels.forEach(function(d) {
          d.coords = JSON.parse(d.coords)
          d.sweepFlag = +d.sweepFlag
          d.largeArcFlag = +d.largeArcFlag
          d.radius = +d.radius
        })
      }

      labels.forEach((config) => {
        addLabel(svg, config, width + marginleft + marginright, height + margintop + marginbottom, {"left":marginleft, "right":marginright, "top":margintop, "bottom":marginbottom}, clickLoggingOn)
      })
      
    }

    if (trendline.length > 0) {
      addTrendline(trendline, data, xColumn, parseTime, x, y, features, xFormat)
    }

    if (this.settings.tooltip != "") {

      this.tooltip.bindEvents(
        d3.selectAll(".barPart"),
        width,
        height + margintop + marginbottom
      )

    }
  }
}