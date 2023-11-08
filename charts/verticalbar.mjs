
import dataTools from "./shared/dataTools"
import ColorScale from "./shared/colorscale"
import { numberFormat, mustache, mobileCheck, textPadding, textPaddingMobile, stackMin, stackMax, timeCheck } from './shared/toolbelt';
import Dropdown from "./shared/dropdown";
import { addDrops } from "./shared/drops"
import Tooltip from "./shared/tooltip"
import { addPeriods } from "./shared/periods"
import { addLabels } from "./shared/labels"
import { addTrendline } from "./shared/trendline"

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
          baseline, 
          periodDateFormat, 
          xAxisDateFormat,
          x_axis_cross_y,
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
          enableShowMore, 
          aria, 
          colorScheme, 
          type, 
          labels, 
          userkey, 
          dropdown, 
          periods,
          parseTime,
          stackedbars } = this.settings

          console.log(`x_axis_cross_y: ${x_axis_cross_y}`)
          console.log(`baseline: ${baseline}`)

          //x_axis_cross_y = -1.2

    d3.select("#graphicContainer svg").remove()

    const chartKey = d3.select("#chartKey")

    chartKey.html("")

    colors = new ColorScale()
    
    isMobile = mobileCheck()

    width = document.querySelector("#graphicContainer").getBoundingClientRect().width
    
    height = width * 0.5

    width = width - marginleft - marginright

    height = height - margintop - marginbottom

    datum = JSON.parse(JSON.stringify(data))

    const keyColor = dataTools.getKeysColors({
      keys: stackedbars,
      userKey: userkey,
      option: { colorScheme : colorScheme }
    })

    colors.set(keyColor.keys, keyColor.colors)

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

    datum.forEach((d) => {
      if (xFormat.date) {
        d[xColumn] = parseTime(d[xColumn])
      }
      stackedbars.forEach((key, i) => {
        d[key] = (d[key] == null) ? null : +d[key]
      })
      d.Total = d3.sum(stackedbars, (k) => +d[k])
    })

    console.log("datum",datum)
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

    const svg = d3.select("#graphicContainer")
    .append("svg")
    .attr("width", width + marginleft + marginright)
    .attr("height", height + margintop + marginbottom)
    .attr("id", "svg")
    .attr("overflow", "hidden")
    
    const features = svg
    .append("g")
    .attr("transform", "translate(" + marginleft + "," + margintop + ")")

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
    .attr("transform", () => (x_axis_cross_y != null && x_axis_cross_y != "") ? "translate(0," + y(x_axis_cross_y) + ")" : "translate(0," + height + ")")
    .call(xAxis)

    if (periods.length > 0) {

      addPeriods(periods, parseTime, features, x, height, xFormat)

    }

    if (labels.length > 0) {

      addLabels(labels, parseTime, features, isMobile, x, y)
      
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