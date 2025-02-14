
import helpers from "./shared/helpers"
import dataTools from "./shared/dataTools"
import Tooltip from "./shared/tooltip"
import ColorScale from "./shared/colorscale"
import { numberFormat, mustache, mobileCheck, validate, validateString, contains, stackMin, stackMax, timeCheck } from './shared/toolbelt';
import Dropdown from "./shared/dropdown";
import { addDrops } from "./shared/drops";
import { drawShowMore } from "./shared/showmore";

export default class Smallmultiples {

  constructor(settings) {

    this.settings = settings
    console.log("settings",settings)
    this.init()

  }

  init() {

    drawShowMore(this.settings.enableShowMore)  

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

        this.settings.smallmultiples = [ this.settings.xColumn, this.settings.groupBy, ...data.values.split(',').map(d => d.trim()) ]

        if (this.settings.tooltip != "") {

          //this.tooltip.updateTemplate(data.tooltip)

        }

        this.render()

      })

    }

    d3.select("#switch").on("click", () => {

      this.settings.scaleBy = (this.settings.scaleBy == "group") ? "chart" : "group"

      this.render()

    })

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
          xAxisLabel, 
          yAxisLabel, 
          timeInterval, 
          tooltip, 
          periodDateFormat, 
          marginleft, 
          margintop, 
          marginbottom, 
          marginright, 
          xAxisDateFormat, 
          groupBy, 
          xColumn, 
          keys, 
          data, 
          labels, 
          trendline, 
          userkey, 
          periods, 
          type, 
          numCols, 
          breaks, 
          chartType, 
          scaleBy,
          parseTime,
          enableShowMore, 
          aria, 
          smallmultiples,
          colorScheme, 
          dropdown,
          xScale,
          yScale,
          xFormat } = this.settings

    const $tooltip = (this.tooltip) ? this.tooltip : false

    console.log(`xFormat: ${xFormat}`)

    datum = data.map(d => Object.keys(d).filter((key) => contains(key, smallmultiples)).reduce((cur, key) => { return Object.assign(cur, { [key]: d[key] })}, {}))

    const chartKey = d3.select("#chartKey")

    isMobile = mobileCheck()

    let label = (scaleBy == "group")
      ? "Show max scale for group"
      : "Show max scale for each chart"

    d3.select("#switch").html(label)

   
    let hideNullValues = (chartType === "bar") ? "no" : "yes"

    let dataKeys = JSON.parse(JSON.stringify(smallmultiples));
    // console.log(dataKeys)

    // User has not set groupBy, so guess second column

    if (groupBy == '') {
      console.log("yeah")
      groupBy = dataKeys[1];
    }

    dataKeys.splice(dataKeys.indexOf(xColumn), 1)
    dataKeys.splice(dataKeys.indexOf(groupBy), 1)

    const multiples = [...new Set(datum.map((d) => d[groupBy]))]

    console.log("multiples",multiples)

    const windowWidth = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    )

    datum.forEach(function(d) {
      if (xFormat.date) {
        d[xColumn] = parseTime(d[xColumn])
      }

      if (chartType === "bar") {
        d.Total = d3.sum(dataKeys, (k) => +d[k])
      }
    })
    // console.log("datum", datum)
    /*
    if (periods.length > 0) {
      periods.forEach((d) => {
        if (typeof d.start == "string") {
          if (this.parseTime != null) {
            d.start = this.parseTime(d.start)
            if (d.end != "") {
              d.end = this.parseTime(d.end)
              d.middle = new Date((d.start.getTime() + d.end.getTime()) / 2)
            } else {
              d.middle = d.start
            }
          } else {
            d.start = +d.start
            if (d.end != "") {
              d.end = +d.end
              d.middle = (d.end + d.start) / 2
            } else {
              d.middle = d.start
            }
          }
        }
      })
    }
    */
 
    colors = new ColorScale()

    let showGroupMax = (scaleBy == "group") ? true : false ;

    const containerWidth = document
    .querySelector("#graphicContainer")
    .getBoundingClientRect().width

    const containerHeight = containerWidth

    let noColsSet = false

    if (numCols === null) {
      if (containerWidth <= 500) {
        numCols = 1
      } else if (containerWidth <= 750) {
        numCols = 2
      } else {
        numCols = 3
      }
    } else {
      noColsSet = true
      if (numCols > 3) {
        if (isMobile) {
          numCols = 2
        }
      }
    }

    width = containerWidth / numCols

    if (height != null) {
      height = height
    } else {
      height = 200
      if (isMobile) {
        height = 150
      }
    }

    width = width - marginleft - marginright

    console.log(`Height 1: ${height}`)

    height = height - margintop - marginbottom

    console.log(`Height 2: ${height}`)

    d3.select("#graphicContainer")
    .selectAll(".chart-grid")
    .remove()

    multiples.forEach((key, index) => {
      drawChart({
        data: datum,
        key,
        chartType: chartType,
        isMobile: isMobile,
        hasTooltip: (tooltip != ""),
        index
      })
    })

    chartKey.html("")
    if (dataKeys.length > 1) {
      dataKeys.forEach((key) => {
        const keyDiv = chartKey.append("div").attr("class", "keyDiv")
        keyDiv.append("span").attr("class", "keyCircle").style("background-color", () => colors.get(key))
        keyDiv.append("span").attr("class", "keyText").text(key)
      })
    }

    function sanitizeCSSIdentifier(identifier) {
      // Remove any characters that are not letters, digits, underscores, or hyphens.
      let sanitized = identifier.replace(/[^a-zA-Z0-9_-]/g, '');
      
      // CSS identifiers cannot start with a digit.
      if (/^\d/.test(sanitized)) {
        sanitized = '_' + sanitized;
      }
      
      return sanitized;
    }


    function drawChart({
      data,
      key,
      chartType,
      isMobile,
      hasTooltip,
      index
    }) {
      console.log("key", key)

      const id = sanitizeCSSIdentifier(dataTools.getId(key)),
        chartId = `#${id}`,
        isBar = chartType === "bar",
        isLine = chartType === "line",
        isArea = chartType === "area"

      d3.select("#graphicContainer")
      .append("div")
      .attr("id", id)
      .attr("class", "chart-grid")
      .style("width", function(d) {
        if (numCols === 1) {
          return "100%"
        } else if (numCols === 2) {
          return "49.9%"
        } else if (numCols === 3) {
          return "32.9%"
        } else if (numCols > 3) {
          var smWidth = (100 / numCols - 0.1).toString() + "%"
          return smWidth
        }
      })

      d3.select(chartId)
      .append("div")
      .text(key)
      .attr("class", "chartSubTitle")
      .style("padding-left", marginleft + "px")

      const svg = d3.select(chartId)
      .append("svg")
      .attr("width", width + marginleft + marginright)
      .attr("height", height + margintop + marginbottom)
      .style("overflow", "visible")

      const features = svg.append("g")
      .attr("transform", "translate(" + marginleft + "," + margintop + ")")

      console.log("scales", xScale, yScale)

      var x = d3[xScale]()
      .range([0, width])
      //.padding(0)

   
      if (parseTime) {
        if (!isBar) {
          x = d3.scaleTime()
          .range([0, width])
        }
      } else {
        if (!isBar) {
          x = d3.scaleLinear()
          .range([0, width])
        }
      }
    
      const y = d3[yScale]()
      .range([height,0])



      const duration = 1000

      let yMax = showGroupMax ? datum : datum.filter((item) => item[groupBy] === key)

      if (xScale == 'scaleBand') {

        x.domain(datum.map(d => d[xColumn]))

      } else {

        x.domain(d3.extent(datum.map(d => d[xColumn])))

      }


      const tickMod = Math.round(x.domain().length / 3)

      let ticks = x.domain().filter((d, i) => !(i % tickMod) || i === x.domain().length - 1)

      var xAxis = d3.axisBottom(x)
      .tickValues(ticks)

     if (isBar) {

      if (x.domain().length > 9 && numCols > 2) {

       ticks = [ x.domain()[3] , x.domain()[x.domain().length - 4]]

      }

      if (xFormat.date) {

        xAxis.tickValues(ticks).tickFormat(d3.timeFormat("%b %Y"))

      }

     } 

     if (numCols > 3 && !isBar && xFormat.date) {
    
      var blahTicks = [x.domain()[0],
                      new Date((x.domain()[0].getTime() + x.domain()[1].getTime())/2),
                      x.domain()[1]
                    ]

      xAxis = d3
        .axisBottom(x)
        .tickValues(blahTicks)
        .tickFormat(d3.timeFormat("%-d %b"))
     }

     if (numCols == 1 && !isBar && xFormat.date) {
      xAxis = d3.axisBottom(x)
        .ticks(6)
     }

      const yAxis = d3.axisLeft(y)
      .tickFormat((d) => numberFormat(d))
      .ticks(3)

      features
      .append("g")
      .attr("class", "x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)

      features
      .append("g")
      .attr("class", "y")

      const update = () => {
        yMax = showGroupMax ? datum : datum.filter((item) => item[groupBy] === key)

        var allValues = []
        dataKeys.forEach(key => {
          allValues = allValues.concat(d3.extent(yMax, (d) => d[key]))
        })

        if (chartType === "bar" && scaleBy == "group") {

          y.domain([Math.floor(0), d3.max(datum.map(d => d.Total))]) // d3.min(datum.map(d => d.Total))

        } else {

          y.domain(d3.extent(allValues))

        }

        const chartData = data.filter((d) => d[groupBy] === key)

        const drawOptions = {
          features,
          data: chartData,
          duration,
          x,
          y,
          hasTooltip,
          index
        }
        if (isBar) {
          drawBarChart(drawOptions)
        } else if (isLine) {
          drawLineChart(drawOptions)
        } else if (isArea) {
          drawAreaChart(drawOptions)
        }
        if (hasTooltip && !isBar) {
          //drawHoverFeature(drawOptions)
        }
        if (periods.length > 0) {
          // drawPeriods(drawOptions)
        }
        features.select(".y").transition().duration(duration).call(yAxis)
      }

      update()
    }

    function drawBarChart({ features, data, duration, x, y, hasTooltip}) {

      let xRange = timeCheck(timeInterval, datum, xColumn)

      x.domain(xRange)

      let layers = d3.stack()
      .offset(d3.stackOffsetDiverging)
      .keys(dataKeys)(data)

      layers.forEach(function(layer) {
        layer.forEach(function(subLayer) {
          subLayer.group = layer.key
          subLayer.groupValue = subLayer.data[layer.key]
          subLayer.total = subLayer.data.Total
        })
      })

      if (scaleBy != "group") {

        y.domain([d3.min(layers, stackMin), d3.max(layers, stackMax)])

      }

      var bars = features.selectAll(".bar")
      .data(layers, (d) => d.key)
      .enter()
      .append("g")
      .attr("class", 'bar') // (d) => "layer " + d.key
      .style("fill", (d, i) => colors.get(d.key))

      bars
      .selectAll("rect")
      .data((d) => d)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("height", 0)
      .attr("y", height)
      .merge(bars)
      .transition()
      .duration(duration)
      .attr("x", (d) => x(d.data[xColumn]))
      .attr("y", (d) => y(d[1]))
      .attr("class", "barPart")
      .attr("title", (d) => d.data[d.key])
      .attr("data-group", (d) => d.group)
      .attr("data-count", (d) => d.data[d.key])
      .attr("height", (d) => y(d[0]) - y(d[1]))
      .attr("width", (d) =>  {
        return (x.bandwidth() > 4) ? x.bandwidth() - 2 :
        (x.bandwidth() > 2) ? x.bandwidth() - 1 : 0
      })

      bars
        .exit()
        .transition()
        .duration(duration)
        .attr("height", 0)
        .attr("y", height)
        .remove()

      if ($tooltip) {

        $tooltip.bindEvents(
          d3.selectAll(".bar"),
          containerWidth,
          containerHeight
        )

      }
      
    }

    function drawLineChart({ features, data, duration, x, y }) {

      features.selectAll(`.line-path`).remove()
      // console.log("data", data)
      smallmultiples.forEach((key, i) => {          
          
        const line = d3
          .line()
          .x((d) => x(d[xColumn]))
          .y((d) => y(d[key]))

        if (hideNullValues === "yes") {
     
         line.defined(function (d) {
            return !isNaN(d[key])
          })

        }  
         
        const initialLine = d3
          .line()
          .x((d) => x(d[xColumn]))
          .y(height)

        if (hideNullValues === "yes") {
   
          initialLine.defined(function (d) {
            return !isNaN(d[key])
          })
        }   

        features
        .append("path")
        .datum(data)
        .attr("class", `${key} line-path`)
        .attr("fill", "transparent")
        .attr("d", initialLine)
        .transition()
        .duration(duration)
        .attr("d", line)
        .attr("stroke-width", 2)
        .attr("stroke", (d) => colors.get(key))

        if ($tooltip) {

          $tooltip.bindEvents(
            d3.selectAll(".line-path"),
            containerWidth,
            containerHeight
          )

        }
        
      })

    }

    function drawAreaChart({
      features,
      data,
      duration,
      x,
      y
    }) {
      const $area = features.selectAll(".area-path").data([data])

        dataKeys.forEach((key, i) => {
          const area = d3.area()
          .x((d) => x(d[xColumn]))
          .y0((d) => y(0))
          .y1((d) => y(d[key]))

          const initialArea = d3.area()
          .x((d) => x(d[xColumn]))
          .y0((d) => y(0))
          .y1((d) => height)

          $area
          .enter()
          .append("path")
          .attr("class", "area-path")
          .attr("fill", colors.get(key))
          .attr("d", initialArea)
          .merge($area)
          .transition()
          .duration(duration)
          .attr("d", area)

          $area
          .exit()
          .transition()
          .duration(duration)
          .attr("d", initialArea)
          .remove()
        })

    }

    /*

    function drawPeriods({ features, data, x, index }) {

      features.selectAll(".periodLine").remove()
      features.selectAll(".periodLabel").remove()

      features
      .selectAll(".periodLine .start")
      .data(periods)
      .enter()
      .append("line")
      .attr("x1", (d) => x(d.start))
      .attr("y1", 0)
      .attr("x2", (d) => x(d.start))
      .attr("y2", height)
      .attr("class", "periodLine mobHide start")
      .attr("stroke", "#bdbdbd")
      .attr("stroke-dasharray", "2,2") 
      .attr("opacity", (d) => (d.start < x.domain()[0]) ? 0 : 1)
      .attr("stroke-width", 1)

      features
      .selectAll(".periodLine .end")
      .data(periods.filter(b => b.end != ""))
      .enter()
      .append("line")
      .attr("x1", (d) => x(d.end))
      .attr("y1", 0)
      .attr("x2", (d) => x(d.end))
      .attr("y2", height)
      .attr("class", "periodLine mobHide")
      .attr("stroke", "#bdbdbd")
      .attr("stroke-dasharray", "2,2") 
      .attr("opacity", (d) => (d.end > x.domain()[1]) ? 0 : 1)
      .attr("stroke-width", 1)

      if (index === 0) {
         features
        .selectAll(".periodLabel")
        .data(periods)
        .enter()
        .append("text")
        .attr("x", (d) => {

          if (d.labelPosition) {
            if (d.labelPosition == "start") {
              return x(d.start) + 5
            } else {
              return x(d.middle)
            }
          } else {
            return x(d.middle)
          }
        })
        .attr("y", -5)
        .attr("text-anchor", (d) => (d.textAnchor) ? d.textAnchor : "middle")
        .attr("class", "periodLabel mobHide")
        .attr("opacity", 1)
        .text((d) => d.label)

      }  
    }

    function drawHoverFeature({ features, data, x }) {
      const xColumn = xColumn
      const $hoverLine = features
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", height)
        .style("opacity", 0)
        .style("stroke", "#333")
        .style("stroke-dasharray", 4)

      const $hoverLayerRect = features
        .append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("opacity", 0)

      // Find the data based on mouse position
      const getTooltipData = (d, event) => {
        const bisectDate = d3.bisector((d) => d[xColumn]).left,
          x0 = x.invert(d3.mouse(event)[0]),
          i = bisectDate(data, x0, 1),
          d0 = data[i - 1],
          d1 = data[i]

        let tooltipData = {}

        if (d0 && d1) {
          tooltipData = x0 - d0[xColumn] > d1[xColumn] - x0 ? d1 : d0
        } else {
          tooltipData = d0
        }

        return tooltipData
      }

      // Render tooltip data
      const templateRender = (d, event) => {
        const data = getTooltipData(d, event)
        return mustache(template, {
          ...helpers,
          ...data
        })
      }

      $hoverLayerRect
        .on("mousemove touchmove", function (d) {
          const x0 = x.invert(d3.mouse(this)[0])
          const tooltipText = templateRender(d, this)

          tooltip.show(
            tooltipText,
            width,
            height + margin.top + margin.bottom
          )
          $hoverLine.attr("x1", x(x0)).attr("x2", x(x0)).style("opacity", 0.5)
        })
        .on("mouseout touchend", function () {
          tooltip.hide()
          $hoverLine.style("opacity", 0)
        })
    }

    */
  }
}
