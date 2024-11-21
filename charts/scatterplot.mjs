
import dataTools from "./shared/dataTools"
import Tooltip from "./shared/tooltip"
import ColorScale from "./shared/colorscale"
import { numberFormat, mustache, mobileCheck, bufferize, validateString, getLabelFromColumn } from './shared/toolbelt';
import { addLabels } from "./shared/labels"

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
          xAxisLabel,
          yAxisLabel,
          groupBy,
          yMin,
          xMin,
          xMax,
          yMax,
          hideKey,
          zColumn,
          zMin,
          zMax,
          zScale,
          zLabel,
          opacity,
          xFormat,
          columns
         } = this.settings

          console.log(`Opacity: ${opacity / 100}`)

    const $tooltip = (this.tooltip) ? this.tooltip : false

    d3.select("#graphicContainer svg").remove();

    const chartKey = d3.select("#chartKey")

    chartKey.html("")

    isMobile = mobileCheck()

    width = document.querySelector("#graphicContainer").getBoundingClientRect().width

    height = isMobile ? width * 0.7 : width * 0.5;

    width = width - marginleft - marginright

    height = height - margintop - marginbottom

    const xRange = d3.extent(data.map(d => d[xColumn]))

    const yRange = d3.extent(data.map(d => d[yColumn]))

    const zRange = (zColumn in data[0]) ? d3.extent(data.map(d => d[zColumn])) : null
    
    const groupData = data.map(d => d[groupBy])
    
    const keyData = Array.from(new Set(groupData));

    const svg = d3.select("#graphicContainer").append("svg")
    .attr("width", width + marginleft + marginright)
    .attr("height", height + margintop + marginbottom)
    .append("g")
    .attr("transform", `translate(${marginleft}, ${margintop})`);      

    colors = new ColorScale()

    const keyColor = dataTools.getKeysColors({
      keys: keys,
      userKey: userkey,
      option: { colorScheme : colorScheme }
    })

    colors.set(keyColor.keys, keyColor.colors)

    console.log(columns)

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
        .text(key) //getLabelFromColumn(columns, key)
  
      })

    )

    const labelsXY = []

    data.forEach((d) => {
      if ("label" in d) {
        if (d.label === "TRUE") {
          labelsXY.push(d)
        }
      }
    })

    yMin = (!isNaN(yMin) && yMin != "") ?  yMin : yRange[0]
    yMax = (!isNaN(yMax) && yMax != "") ?  yMax : yRange[1]
    xMin = (!isNaN(xMin) && xMin != "") ?  xMin : xRange[0]
    xMax = (!isNaN(xMax) && xMax != "") ?  xMax : xRange[1]

    const x = d3.scaleLinear()
    .domain(bufferize(xMin,xMax))
    .range([ 0, width ]);

    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

    const y = d3.scaleLinear()
    .domain(bufferize(yMin,yMax))
    .range([ height, 0]);

    const z = (zRange != null) ? d3[zScale]()
    .domain(zRange)
    .range([zMin, zMax]) : null

    svg.append("g")
    .call(d3.axisLeft(y));

    svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => x(d[xColumn]))
    .attr("cy", (d) => y(d[yColumn]))
    .attr("r", (d) => {
      return (z) ? z(d[zColumn]) : 3
    })
    .style("fill", (d) => colors.get(d[groupBy]))
    .style("opacity", opacity / 100)


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
      .attr("x", width)
      .attr("y", height - 6)
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

    if (trendline.length > 0) {

      let default_filter = "default"

      let trend = trendline.filter((value) => value.trendline == default_filter)
      
      if (trend.length == 0) {
        trend = trendline.filter((value) => value.trendline == "default")
      }

      const x1 = parseFloat(trendline[0].min_x)
      const y1 = parseFloat(trendline[0].min_y)
      const x2 = parseFloat(trendline[0].max_x)
      const y2 = parseFloat(trendline[0].max_y)

      const trendData = [[x1, y1, x2, y2]]

      const tline = svg.
      selectAll(".trendline")
      .data(trendData)

      tline
      .enter()
      .append("line")
      .attr("class", "trendline")
      .attr("x1", (d) => x(d[0]))
      .attr("y1", (d) => y(d[1]))
      .attr("x2", (d) => x(d[2]))
      .attr("y2", (d) => y(d[3]))
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .style("opacity", 1)
      .style("stroke-dasharray", "3, 3")

    }

  }

}
