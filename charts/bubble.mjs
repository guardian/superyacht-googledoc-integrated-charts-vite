
import dataTools from "./shared/dataTools"
import Tooltip from "./shared/tooltip"
import ColorScale from "./shared/colorscale"
import { numberFormat, mustache, mobileCheck, bufferize, validateString, dodge, wrap, getMaxDuplicate, getURLParams } from './shared/toolbelt';
// import { addLabels } from "./shared/labels"
import  { addLabel, clickLogging } from './shared/arrows'

// https://svelte.dev/repl/e4cd6985a78a4d169fe5c54977a4336c?version=4.0.5
// // https://www.chartfleau.com/tutorials/d3swarm

export default class Scatterplot {

  constructor(settings) {

    this.settings = settings

    this.init()

  }

  init() {

    if (this.settings.tooltip != "") {

      this.tooltip = new Tooltip(this.settings.tooltip)

    }

    this.render()

  }

  render() {

    let { modules, 
          height, 
          width,
          featuresWidth,
          featuresHeight,
          svgWidth,
          svgHeight,
          rowHeight, 
          isMobile, 
          colors, 
          datum, 
          keys, 
          data, 
          title, 
          subtitle, 
          source, 
          tooltip, 
          marginleft, 
          margintop, 
          marginbottom, 
          marginright, 
          trendline, 
          enableShowMore, 
          aria, 
          colorScheme, 
          labels, 
          userkey, 
          type, 
          dropdown,
          xColumn,
          yColumn,
          zColumn,
          xAxisLabel,
          yAxisLabel,
          yMin,
          xMin,
          xMax,
          yMax,
          hideKey,
          zMin,
          zMax,
          xScale,
          yScale,
          zScale,
          zLabel,
          xFormat,
          opacity,
          parseTime,
          groupBy, 
          defaultRadius,
          beeswarm
      } = this.settings

    console.log(this.settings)  
    datum = JSON.parse(JSON.stringify(data));

    const $tooltip = (this.tooltip) ? this.tooltip : false

    d3.select("#graphicContainer svg").remove();

    const chartKey = d3.select("#chartKey")

    chartKey.html("")

    isMobile = mobileCheck()

    svgWidth = document.querySelector("#graphicContainer").getBoundingClientRect().width

    datum.forEach(function(d) {
      if (xFormat.date) {
        d[xColumn] = parseTime(d[xColumn])
      }
    })

    let buffer = defaultRadius

    if (zMax > 0) {
      buffer = zMax
    }
    console.log("xMin", xMin, !xMin)
    // marginleft = marginleft + buffer
    if (xMin === "") {
      xMin = d3.min(datum.map(d => d[xColumn]))
    }
    
    if (xMax === "") {
      xMax = d3.max(datum.map(d => d[xColumn]))
    }

    console.log("xMin", xMin, "xMax",xMax)
    const xRange = [xMin, xMax]

    const yRange = d3.extent(datum.map(d => d[yColumn]))
    
    const zRange = (zColumn in datum[0]) ? d3.extent(datum.map(d => d[zColumn])) : null
    
    const keyData = Array.from(new Set(datum.map(d => d[groupBy])));

    let cats = []

    if (beeswarm) {
    
      cats = Array.from(new Set(datum.map(d => d[yColumn])));
      const duplicates = getMaxDuplicate(datum, yColumn, xColumn)
      console.log("duplicates", duplicates)
      height = cats.length * duplicates * ( defaultRadius * 2 )

    }

    let rowCount = Array.from(new Set(datum.map(d => d[yColumn]))).length
    console.log(rowCount)
    svgHeight = rowCount * rowHeight + margintop + marginbottom

    featuresHeight = svgHeight - marginbottom - margintop
    featuresWidth = svgWidth - marginleft - marginright

    const svg = d3.select("#graphicContainer").append("svg")
    .attr("width",svgWidth)
    .attr("height", svgHeight)

    const features = svg
      .append("g")
      .attr("transform", `translate(${marginleft}, ${margintop})`)
        

    const svg2 = d3.select("#graphicContainer svg")

    console.log("keys", keys)
    colors = new ColorScale()

    const keyColor = dataTools.getKeysColors({
      keys: keyData,
      userKey: userkey,
      option: { colorScheme : colorScheme }
    })

    colors.set(keyColor.keys, keyColor.colors)

    if (!hideKey) (

      keyData.forEach((key, i) => {

        const keyDiv = chartKey
        .append("div")
        .attr("class", "keyDiv")
  
        keyDiv
        .append("span")
        .attr("class", "keyCircle")
        .style("background-color", () => colors.get(key))
        .style("opacity", opacity / 100)
  
        keyDiv
        .append("span")
        .attr("class", "keyText")
        .text(key)
  
      })

    )

    const labelsXY = []

    datum.forEach((d) => {
      if ("label" in d) {
        if (d.label === "TRUE") {
          labelsXY.push(d)
        }
      }
    })

    //yMin = (!isNaN(yMin) && yMin != "") ?  yMin : yRange[0]
    //yMax = (!isNaN(yMax) && yMax != "") ?  yMax : yRange[1]
    //xMin = (!isNaN(xMin) && xMin != "") ?  xMin : xRange[0]
    //xMax = (!isNaN(xMax) && xMax != "") ?  xMax : xRange[1]

    const x = d3[xScale]()
    .range([ zMax, featuresWidth - buffer ]) // .domain(bufferize(xMin,xMax))
    .domain(xRange)

    const xLabel = d3[xScale]()
    .range([ zMax, featuresWidth - buffer ]) // .domain(bufferize(xMin,xMax))
    .domain(datum.map(d => d[xColumn]))

    const tickMod = Math.round(datum.map(d => d[xColumn]).length / 6)

    let ticks = xLabel.domain().filter((d, i) => !(i % tickMod) || i === xLabel.domain().length - 1)
    console.log("ticks", ticks)

    const xTicks = Math.round(featuresWidth / 100)
    
    console.log("xTicks", xTicks)
    var xAxis = (xFormat.date) ? d3.axisTop(x)
    .ticks(ticks)
    .tickSize(-(  featuresHeight), 0, 0) :

    d3.axisTop(x)
    .ticks(xTicks)
    .tickSize(-(  featuresHeight), 0, 0)
    .tickPadding(10) 

    if (xFormat.date) {

      xAxis.tickValues(ticks).tickFormat(d3.timeFormat("%b %Y"))

    }

    features
      .append("g")
      .attr("class", "x")
      .attr("transform", "translate(0," + 0 + ")")
      .call(xAxis)
    
    d3.selectAll(".x line")
      .attr("class", "dashed")  

    const y = d3[yScale]()
    .range([ featuresHeight, margintop])
    .domain(datum.map(d => d[yColumn]))

    const z = (zRange != null) ? d3[zScale]()
    .domain(zRange)
    .range([zMin, zMax]) : null

    datum.forEach(d => {
      d.x = x(d[xColumn])
      d.y = y(d[yColumn])
    })

    if (beeswarm) {
    
      for (const cat of cats) {
        let targs = datum.filter(d => d[yColumn] == cat)
        let originY = targs[0].y
        targs = dodge(targs, defaultRadius * 2)
        for (var i = 0; i < targs.length; i++) {
          targs[i].y = targs[i].y + (originY)
        }
      }

    }

    features.append('g')
      .selectAll("dot")
      .data(datum)
      .enter()
      .append("circle")
      .attr("cx", (d) => {
        return d.x
      })
      .attr("cy", (d) => {
        return d.y + (y.bandwidth() / 2)
      })
      .attr("r", (d) => {
        return (zRange) ? z(d[zColumn]) : defaultRadius
      })
      .style("fill", (d) => colors.get(d[groupBy]))
      .style("opacity", opacity / 100)

    let yAxis = features.append("g")
    .attr("class","axis y")
    .attr("transform", `translate(${-buffer},0)`)

    yAxis
      .call(d3.axisLeft(y))
      .selectAll(".tick text")
      .attr("text-anchor", "end")
      .style("font-size", "12px")
      .call(wrap, marginleft);

    // Add back in a zero line
    console.log("x0", y(0))

    // features
    //   .append("line")
    //   .attr("id", "zeroLine")
    //   .attr("class", "dashed")
    //   .attr("x1", x(0))
    //   .attr("y1", y(0))
    //   .attr("x2", 0)
    //   .attr("y2", featuresHeight)

    features.selectAll(".domain").remove()

    features.selectAll("rect")
      .data(d => y.domain())
      .enter()
      .append("rect")
      .attr("x", -buffer)
      .attr("y", d => y(d) + (y.bandwidth() / 4))
      .attr("height", y.bandwidth() / 2)
      .attr("width", 1)
      .attr("fill", "#767676")

    if ($tooltip) {

      $tooltip.bindEvents(
        d3.selectAll("circle"),
        svgWidth,
        svgHeight
      )

    }

    if (xAxisLabel) {

      svg
      .append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("fill", "#767676")
      .attr("text-anchor", "end")
      .text(xAxisLabel)

    }

    if (yAxisLabel) {
      
      svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#767676")
      .attr("text-anchor", "end")
      .text(yAxisLabel)

    }

    // Highlight dots if their label property is set to TRUE
    if (labelsXY.length > 0) {

      svg
      .selectAll(".dot-label")
      .data(labelsXY)
      .enter()
      .append("text")
      .attr("class", "dot-label")
      .attr("x", (d) => x(d[xColumn]))
      .attr("dy", (d) => {
        return (z) ? z(d[zColumn]) + 10 : 15
      })
      .attr("text-anchor", "middle")
      .attr("y", (d) => y(d[yColumn]))
      .text(function (d) {
        return zLabel != "" ? d[zLabel] : "" 
      })

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
    		addLabel(svg2, config, svgWidth, svgHeight, {
    			"left": marginleft,
    			"right": marginright,
    			"top": margintop,
    			"bottom": marginbottom
    		}, clickLoggingOn)
    	})

    }

  }

}
