
import dataTools from "./shared/dataTools"
import ColorScale from "./shared/colorscale"
import { getMargins, numberFormat, mustache, mobileCheck, stackMin, stackMax, textPadding, textPaddingMobile } from './shared/toolbelt';
import { addLabel, clickLogging } from './shared/arrows'
import Dropdown from "./shared/dropdown";
import { addDrops } from "./shared/drops"
import Tooltip from "./shared/tooltip"
import { addPeriods } from "./shared/periods"
import { addLabels } from "./shared/labels"

export default class Stackedarea {

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
          title, 
          subtitle, 
          source, 
          dateFormat, 
          yScaleType, 
          xAxisLabel, 
          yAxisLabel, 
          minY, 
          maxY, 
          periodDateFormat, 
          marginleft, 
          margintop, 
          marginbottom, 
          marginright, 
          tooltip, 
          keys, 
          data, 
          labels, 
          userkey, 
          lines, 
          periods, 
          type, 
          aria, 
          colorScheme, 
          dropdown,
          parseTime,
          timeInterval,
          xAxisDateFormat,
          xColumn,
          stackedbars } = this.settings

    d3.select("#graphicContainer svg").remove()

    const chartKey = d3.select("#chartKey")

    chartKey.html("")

    datum = JSON.parse(JSON.stringify(data))

    colors = new ColorScale()
    
    isMobile = mobileCheck()
    
    width = document
    .querySelector("#graphicContainer")
    .getBoundingClientRect().width

    height = width * 0.5

    const keyColor = dataTools.getKeysColors({ keys: stackedbars, userKey: userkey, option: { colorScheme : colorScheme }})

    colors.set(keyColor.keys, keyColor.colors)

    stackedbars.forEach((key, i) => {

      const keyDiv = chartKey
      .append("div")
      .attr("class", "keyDiv")

      keyDiv
      .append("span")
      .attr("class", "keyCircle")
      .style("background-color", () => colors.get(key))

      keyDiv
      .append("span")
      .attr("class", "keyText")
      .text(key)

    })

    datum.forEach((d) => {

      if (parseTime != null) {
        if (typeof d[xColumn] === "string") {
          d[xColumn] = parseTime(d[xColumn])
        }
      }

      stackedbars.forEach((key, i) => {
        d[key] = (d[key] != null) ? +d[key] : null
      })

      d.Total = d3.sum(stackedbars, (k) => +d[k])

    })

    labels.forEach((d) => {
      if (parseTime != null) {
        d.x1 = parseTime(d.x1)
      }
      d.y1 = +d.y1
      d.y2 = +d.y2
    })

    const layers = d3.stack()
    .keys(stackedbars)(datum)

    layers.forEach(function (layer) {
      layer.forEach(function (subLayer) {
        subLayer.group = layer.key
        subLayer.groupValue = subLayer.data[layer.key]
        subLayer.total = subLayer.data.Total
      })
    })

    width = width - marginleft - marginright
    
    height = height - margintop - marginbottom

    const svg = d3
    .select("#graphicContainer")
    .append("svg")
    .attr("width", width + marginleft + marginright)
    .attr("height", height + margintop + marginbottom)
    .attr("id", "svg")
    .attr("overflow", "hidden")

    const features = svg
    .append("g")
    .attr("transform", "translate(" + marginleft + "," + margintop + ")")
  
    const x = d3.scaleTime()
    .range([0, width])

    x.domain(d3.extent(datum, d => d[xColumn]))
  
    const y = d3.scaleLinear()
    .range([height, 0])

    y.domain([d3.min(layers, stackMin), d3.max(layers, stackMax)])  

    var area = d3.area()
    .x((d, i) => x(d.data[xColumn]))
    .y0((d) => y(d[0]))
    .y1((d) => y(d[1]));

    var xAxis
    var yAxis
    var ticks = 3

    if (isMobile) {

      xAxis = d3.axisBottom(x)
      .tickFormat(xAxisDateFormat)
      .ticks(4)

      yAxis = d3
      .axisLeft(y)
      .tickFormat((d) => numberFormat(d))
      .ticks(5)

    } else {

      xAxis = d3.axisBottom(x)
      .tickFormat(xAxisDateFormat)

      yAxis = d3.axisLeft(y)
      .tickFormat((d) => numberFormat(d))

    }

    features.append("g").attr("class", "y").call(yAxis)

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

    layer.append("path")
    .attr("class", "area")
    .attr("d", area);

    features
    .append("g")
    .attr("class", "x")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)

    if (xAxisLabel) {

      features
      .append("text")
      .attr("x", width)
      .attr("y", height + (marginbottom / 2))
      .attr("fill", "#767676")
      .attr("text-anchor", "end")
      .text(xAxisLabel)  
    }

    if (yAxisLabel) {
      
      features
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#767676")
      .attr("text-anchor", "end")
      .text(yAxisLabel)

    }

    labels.forEach((config) => {
      addLabel(svg, config, width + marginleft + marginright, height + margintop + marginbottom,{ top: margintop,right: marginright, bottom: marginbottom, left: marginleft }, false)
    })
  }
}
