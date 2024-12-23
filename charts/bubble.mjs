
import dataTools from "./shared/dataTools"
import Tooltip from "./shared/tooltip"
import ColorScale from "./shared/colorscale"
import { numberFormat, mustache, mobileCheck, bufferize, validateString, dodge, wrap, getMaxDuplicate, getURLParams, isNumber, getLabelFromColumn } from './shared/toolbelt';
// import { addLabels } from "./shared/labels"
import  { addLabel, clickLogging } from './shared/arrows'
import { makeTopLinedAxis } from './shared/makeAxis'

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
          minY,
          minX,
          maxX,
          maxY,
          hideKey,
          dataLabels,
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
          beeswarm,
          columns
      } = this.settings

    datum = JSON.parse(JSON.stringify(data));

    console.log("settings",this.settings)

    const $tooltip = (this.tooltip) ? this.tooltip : false

    d3.select("#graphicContainer svg").remove();

    const chartKey = d3.select("#chartKey")

    chartKey.html("")

    isMobile = mobileCheck()

    width = document.querySelector("#graphicContainer").getBoundingClientRect().width

    height = isMobile ? width * 1.7 : width * 0.5;
    if (!groupBy) {
      height = datum.length * rowHeight + margintop + marginbottom
    }
   
    // svgHeight = datum.length * rowHeight + margintop + marginbottom

    datum.forEach(function(d) {
      if (xFormat.date) {
        d[xColumn] = parseTime(d[xColumn])
      }
    })

    // Bufferize now takes a percetange as the third argument


    let extent = d3.extent(datum.map(d => d[xColumn]))

    let buffer = bufferize(extent[0], extent[1])

    console.log("extent", extent, "buffer",buffer, "minX", minX, isNaN(minX))
    
    minX = (isNumber(minX)) ? minX : buffer[0]
    maxX = (isNumber(maxX)) ? maxX : buffer[1]

    const xRange = [minX, maxX]

    console.log("xRange", xRange)
    let yRange = d3.extent(datum.map(d => d[yColumn]))
    if (yScale == "scaleBand") {
      yRange = Array.from(new Set(datum.map(d => d[yColumn])))
    }
   
    console.log("yRange", yRange)
    const zRange = (zColumn in datum[0]) ? d3.extent(datum.map(d => d[zColumn])) : null
    
    let keyData = []

    if (groupBy) {
      keyData = Array.from(new Set(datum.map(d => d[groupBy])));
    }
    
    else {
      keyData = [xColumn];
    }

    console.log("keyData", keyData)
    let cats = []

    if (beeswarm) {
    
      cats = Array.from(new Set(datum.map(d => d[yColumn])));

      const duplicates = getMaxDuplicate(datum, yColumn, xColumn)
      console.log("duplicates", duplicates)
      height = cats.length * duplicates * ( defaultRadius * 2 )

    }

    const svg = d3.select("#graphicContainer").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${marginleft}, ${margintop})`);      

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
        .text(key) // getLabelFromColumn(columns, key)
  
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

    const x = d3[xScale]()
    .range([ zMax, width - marginright - marginleft - zMax ]) // .domain(bufferize(xMin,xMax))
    .domain(xRange)

    const xLabel = d3[xScale]()
    .range([ zMax, width - marginright - marginleft - zMax ]) // .domain(bufferize(xMin,xMax))
    .domain(datum.map(d => d[xColumn]))

    let xAxis = makeTopLinedAxis(width - marginright - marginleft - zMax, height, margintop, marginbottom, xFormat, x)

    svg
    .append("g")
    .attr("class", "x")
    .attr("transform", "translate(0," + 0 + ")")
    .call(xAxis)
    .style("stroke-dasharray", "2 2")

    const y = d3[yScale]()
    .range([ margintop, height - margintop - marginbottom])
    .domain(datum.map(d => d[yColumn]))

    // console.log(y("Brazil"))

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

    console.log("datum", datum)

    svg.append('g')
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
    .style("fill", (d) => { 
      if (groupBy) {
        return colors.get(d[groupBy])
      }
      else {
        return colors.get(xColumn)
      }

    })
    .style("opacity", opacity / 100)

    if (dataLabels) {
      svg.append('g')
      .selectAll("dotLabels")
      .data(datum)
      .enter()
      .append("text")
      .attr("x", (d) => {
        let radius = (zRange)? z(d[zColumn]) : defaultRadius
        return (d.x + radius * 2)
      })
      .attr("y", (d) => {
        return d.y + (y.bandwidth() / 2) + 4
      })
      .text((d) => d[xColumn])
    }

    svg.append("g")
    .attr("class","axis y")
    .call(d3.axisLeft(y))
    .selectAll(".tick text")
    .attr("text-anchor", "end")
    .style("font-size", "12px")
    .call(wrap, marginleft);

    svg.selectAll(".domain").remove()

    svg.selectAll("rect")
      .data(d => y.domain())
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", d => y(d) + (y.bandwidth() / 4))
      .attr("height", y.bandwidth() / 2)
      .attr("width", 1)
      .attr("fill", "#767676")

    if ($tooltip) {

      $tooltip.bindEvents(
        d3.selectAll("circle"),
        width,
        height
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
    		addLabel(svg2, config, width, height, {
    			"left": marginleft,
    			"right": marginright,
    			"top": margintop,
    			"bottom": marginbottom
    		}, clickLoggingOn)
    	})

    }

  }

}
