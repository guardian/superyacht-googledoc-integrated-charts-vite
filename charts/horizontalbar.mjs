
import dataTools from "./shared/dataTools"
import ColorScale from "./shared/colorscale"
import colorPresets from "./constants/colors"
import { numberFormat, mustache, mobileCheck, getMinMax, textPadding, textPaddingMobile, stackMin, stackMax, contains, getURLParams } from './shared/toolbelt';
import { addDrops } from "./shared/drops"
import Dropdown from "./shared/dropdown";
import Tooltip from "./shared/tooltip"
import { drawShowMore } from "./shared/showmore"
import  { addLabel, clickLogging } from './shared/arrows'

export default class Horizontalbar {

  constructor(settings) {

    this.settings = settings

    this.init()

  }

  init() {
    console.log('enableshowmore',this.settings.enableShowMore)
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

        let values = data.values.split(",").map(function (value) {
           return value.trim();
        });

        this.settings.xColumn = values[0]

        this.settings.stackedhorizontal = values

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
          type,
          colors,
          height, 
          width, 
          isMobile, 
          title, 
          subtitle, 
          source, 
          marginleft, 
          margintop, 
          marginbottom, 
          marginright, 
          tooltip, 
          xAxisLabel,
          suffix, 
          minX, 
          yColumn, 
          xColumn, 
          data,
          datum,
          labels, 
          userkey, 
          keys,
          forceCentre,
          lines, 
          periods, 
          enableShowMore, 
          aria, 
          colorScheme, 
          maxXticks, 
          scaleByAllMax, 
          autoSort, 
          dropdown,
          xMin,
          xMax,
          xAxis,
          yAxis,
          stackedhorizontal,
          parseTime } = this.settings
     

    d3.select("#graphicContainer svg").remove()

    //xColumn = stackedhorizontal[0] // Changed this so it is set by default before this module is loaded

    stackedhorizontal = stackedhorizontal.filter(d => d != 'Color')

    const chartKey = d3.select("#chartKey")

    chartKey.html("")

    colors = new ColorScale()

    isMobile = mobileCheck()

    const keyColor = dataTools.getKeysColors({
      keys: stackedhorizontal,
      userKey: userkey,
      option: { colorScheme : colorScheme }
    })

    colors.set(keyColor.keys, keyColor.colors)

    let showTotals = (contains(keys,'Color')) ? true : false 

    const columns = keys.filter(d => d != "Color" && d != "keyCategory")

    let allValues = []

    data.forEach((d) => {
      for (let i = 1; i < keys.length; i++) {
        allValues.push(d[keys[i]])
      }
    })

    datum = JSON.parse(JSON.stringify(data))

    let wrangle = []

    datum = datum.map(d => Object.keys(d).filter((key) => contains(key, [yColumn, ...stackedhorizontal]) || key === 'Color' || key === 'keyCategory').reduce((cur, key) => { 
      
      if (contains(key, stackedhorizontal) && d[key] != null) {
        wrangle.push(Object.assign(cur, { [key]: d[key] }))
      }
      return Object.assign(cur, { [key]: d[key] })
    }, {}))

    datum = wrangle

    let set = new Set(datum.map(d => d[yColumn]))

    let barheight = Array.from(set).length;

    datum.forEach((d) => {
      stackedhorizontal.forEach((key, i) => {
        d[key] = (d[key] == null) ? null : +d[key]
      })
      d.Total = d3.sum(stackedhorizontal, (k) => +d[k])
      d.negative = (d3.min(stackedhorizontal, (k) => +d[k]) >= 0) ? false : true
      d.extent = d3.min(stackedhorizontal, (k) => +d[k])
    })

    if (autoSort) {
      datum = datum.sort((a, b) => d3.descending(+a.Total, +b.Total))
    }
    
    width = document
    .querySelector("#graphicContainer")
    .getBoundingClientRect().width

    height = (barheight) * 75 + margintop + marginbottom

    width = width - marginleft - marginright

    const svg = d3
    .select("#graphicContainer")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("id", "svg")
    .attr("overflow", "hidden")

    const features = svg
    .append("g")
    .attr("transform","translate(" + marginleft + "," + margintop + ")")

    if (stackedhorizontal.length > 1 && !showTotals) {

      stackedhorizontal.forEach((k, i) => {

        const keyDiv = chartKey
        .append("div")
        .attr("class", "keyDiv")

        keyDiv
        .append("span")
        .attr("class", "keyCircle")
        .style("background-color", () => colors.get(k))

        keyDiv
        .append("span")
        .attr("class", "keyText")
        .text(k)

      })

    }

    const x = d3.scaleLinear()
    .range([0, width - marginright - marginleft])

    const y = d3
    .scaleBand()
    .range([0, height])
    .paddingInner(0.45)
    .paddingOuter(0.45)

    y.domain(datum.map((d) => d[yColumn]))
    console.log("forceCentre", forceCentre)
    if (forceCentre) {
      const minMax = getMinMax([...datum.map(d => d.Total), ...datum.map(d => d.extent)]) // (scaleByAllMax) ? getMinMax(allValues) : getMinMax(datum.map(d => d[1]))
      xMax = (xMax == "") ? minMax.max : xMax
      xMin = (xMin == "") ? minMax.min : xMin
    }
    
    else {
      const extent = d3.extent([...datum.map(d => d.Total), ...datum.map(d => d.extent)])  
      console.log('extent',extent)
      xMax = extent[1]
      xMin = extent[0]
    }
    

    if (minX != null) {
      if (minX != "") {
        xMin = parseInt(minX)
      }
    }

    x.domain([xMin, xMax]).nice()

    const xTicks = Math.round(width / 100)

    xAxis = g => g
    .attr("transform", `translate(0,${0})`)
    .attr("class", "axisgroup") 
    .call(d3.axisTop(x).tickSizeOuter(0))
    .call(d3.axisTop(x)
    .tickSize(-height, 0, 0)
    .ticks(xTicks)
    .tickFormat((d) => {
      return numberFormat(d)
    })
    .tickPadding(10))

    yAxis = g => g
    .call(d3.axisLeft(y)) 

    features
    .append("g")
    .attr("class", "x")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)

    var layers = d3.stack()
    .offset(d3.stackOffsetDiverging)
    .keys(stackedhorizontal)(Array.from(new Set(datum.map(e => e))))

    layers.forEach(function(layer) {
      layer.forEach(function(subLayer) {
        subLayer.group = layer.key
        subLayer.groupValue = subLayer.data[layer.key]
        subLayer.total = subLayer.data.Total
        if (subLayer.data.Color) {
          subLayer.color = subLayer.data.Color
        }
        
      })
    })

    const layer = features
    .selectAll("layer")
    .data(layers, (d) => d.key)
    .enter()
    .append("g")
    .attr("class", (d) => "layer " + d.key)

    layer
    .selectAll("rect")
    .attr("class", "rect")
    .data((d,i) => {
      return d
    })
    .enter()
    .append("rect")
    .style("fill", (d, i) => {
      return (d.color) ? d.color : colors.get(d.group)
    })
    .attr("x", (d) => {
      return x(d[0]) //(d[1] >= 0) ? x(0) : x(d[1])
    })
    .attr("y", (d) => {
      return y(d.data[yColumn])
    })
    .attr("class", "barPart")
    .attr("title", (d) => d.data[d.key])
    .attr("data-group", (d) => d.group)
    .attr("data-count", (d) => d.data[d.key])
    .attr("height", (d) => y.bandwidth()) // )
    .attr("width", (d) => {
      return x(d[1]) - x(d[0]) //(d.data["Total"] >= 0) ? x(d.data["Total"]) - x(0) : x(0) - x(d.data["Total"]) // x(d[1])
    })

    features
    .selectAll(".barText")
    .data(Array.from(new Set(datum.map(e => e))))
    .enter()
    .append("text")
    .attr("class", "barText")
    .attr("x", (d) => {
      return (!d.negative) ? x(0) + 5 : x(0) - 5
    })
    .attr("text-anchor",(d) => {
      return (!d.negative) ? "start" : "end"
    })
    .attr("y", (d) => y(d[yColumn]) - 5)
    .text((d) => d[yColumn])


    // Testing for label positions
    // ?key=1BJG_8rB8nkob0O7DsNU_oBpRq-5qsixNxfosp5AVphE&location=docsdata
    // ?key=oz-2023-school-state-federal-funding-change-grouped-bar&location=yacht-charter-data
    // ?key=2023-education-school-quartiles&location=yacht-charter-data
    // ?key=1DL9_rNNg3XVKodTmVHWO1DdABBRrOKVXQ5wshSK7pGw&location=docsdata

    // Show totals
    // console.log("showTotals", showTotals)
    if (showTotals) {

      layer
      .selectAll(".barNumber")
      .data(datum)
      .enter()
      .append("text")
      .attr("class", "barNumber")
      .style("font-weight", "bold")
      .attr("x", (d) => {
        let pos = x(d.Total) + 10
        
        if (d.Total > 0) {
          if (x(d.Total) > x(0) + 100) {
            pos = x(d.Total) - 50
          }

        } else if (d.Total < 0) {

          if (x(d.Total) > x(0) - 100) {
            pos = x(d.Total) - 50
          }

        } else {
          pos = x(0)
        }
        return pos
      })
      .style("fill", (d) => {

        let colour = "black"

        if (d.Total > 0) {

          if (x(d.Total) > x(0) + 100) {
            colour = "white"
          }

        } else if (d.Total < 0) {

          if (x(d.Total) > x(0) - 100) {
            colour = "black"
          } else {
            colour = "white"
          }

        } else {
          colour = "black"
        }

        return colour
      })
      .attr("y", (d) => y(d[yColumn]) + (y.bandwidth() / 2 + 5))
      .text((d) => numberFormat(d.Total) + suffix)

    } else {

      layer
      .selectAll(".barNumber")
      .data((d) => d)
      .enter()
      .append("text")
      .attr("class", "barNumber")
      .style("font-weight", "bold")
      .attr("x", (d, i) => {
    
        let barWidth = x(d[1]) - x(d[0])
        let label = numberFormat(d.data[d.group]) + suffix
        let buffer = 10
        let labelLength = label.length * 12 + buffer

        if (d.groupValue < 0) {
            // room for label in bar
            if (barWidth > labelLength) {
              return x(d[0]) + buffer
            }

            // no room for you!!! 
            else {
              return x(d[0]) - buffer 
            }

        }

        else if (d.groupValue > 0) {
          // room for label in bar
            if (barWidth > labelLength) {
              return x(d[1]) - buffer
            }

            // no room for you!!!
            else {
              return x(d[1]) + buffer 
            }
        }

        else {
          return x(d.groupValue) + buffer 
        }


      })
      .style("fill",(d) => {

        let pos = "white"

        let label = numberFormat(d.data[d.group]) + suffix

        if (stackedhorizontal.length == 1) {

          if (x(d[1]) - x(d[0]) > (label.length * 12 + 10)) {
            pos = "white"
          } else {
            pos = "black"
          }

        }
        return pos
      })
      .attr("y", (d) => y(d.data[yColumn]) + (y.bandwidth() / 2 + 5))
      .attr("text-anchor",(d) => {
        let barWidth = x(d[1]) - x(d[0])
        let label = numberFormat(d.data[d.group]) + suffix
        let buffer = 10
        let labelLength = label.length * 12 + buffer
        
        if (d.groupValue < 0) {
            // room for label in bar
            if (barWidth > labelLength) {
              return "start"
            }

            // no room for you!!! 
            else {
              return "end"
            }

        }

        else if (d.groupValue > 0) {
          // room for label in bar
            if (barWidth > labelLength) {
              return "end"
            }

            // no room for you!!!
            else {
              return "start"
            }
        }

        else {
          return "start"
        }
      })
      .text((d) => {

        if (stackedhorizontal.length > 1) {
          let label = numberFormat(d.data[d.group]) + suffix
          if (x(d[1]) - x(d[0]) > (label.length * 9 + 10)) {
            return numberFormat(d.data[d.group]) + suffix
          } else {
            return " " //numberFormat(d.data[d.group]) + suffix
          }
        } else {

          return numberFormat(d.data[d.group]) + suffix

        }
      })

    }


    // Draws a solid line at zero

    features.append('line')
        .style("stroke", "#767676")
        .style("stroke-width", 1)
        .attr("x1", x(0))
        .attr("y1", 0)
        .attr("x2", x(0))
        .attr("y2", height); 

  

    if (this.settings.tooltip != "") {

      this.tooltip.bindEvents(
        d3.selectAll(".barPart"),
        width,
        height + margintop + marginbottom
      )

    }

    if (xAxisLabel) {

      features
        .append("text")
        .attr("x", width - marginright)
        .attr("y", -25)
        .attr("fill", "#767676")
        .attr("text-anchor", "end")
        .text(xAxisLabel)

    }

    if (labels.length > 0) {
    	const clickLoggingOn = getURLParams("labelling") ? true : false;
    	console.log("clickLoggingOn", clickLoggingOn);
    	// Move this to wrangle later once we re-factor the labelling stuff
    	if (typeof labels[0].coords === 'string') {
    		labels.forEach(function(d) {
    			d.coords = JSON.parse(d.coords)
    			d.sweepFlag = +d.sweepFlag
    			d.largeArcFlag = +d.largeArcFlag
    			d.radius = +d.radius
    		})
    	}
    	console.log("annotations", labels)
    	labels.forEach((config) => {
    		addLabel(svg, config, width + marginleft + marginright, height + margintop + marginbottom, {
    			"left": marginleft,
    			"right": marginright,
    			"top": margintop,
    			"bottom": marginbottom
    		}, clickLoggingOn)
    	})
    }


  }

}
