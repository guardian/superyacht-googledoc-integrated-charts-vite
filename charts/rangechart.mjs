
import dataTools from "./shared/dataTools"
import ColorScale from "./shared/colorscale"
import colorPresets from "./constants/colors"
import { getURLParams, numberFormat, mustache, mobileCheck, getMinMax, textPadding, textPaddingMobile, bufferize, tickTok, contains, wrap } from './shared/toolbelt';
import  { addLabel, clickLogging } from './shared/arrows'
import { drawShowMore } from "./shared/showmore"

/**
 * The Rangechart class creates a chart with a central circle, with bars on each side to denote a range
 * such as the maximum and minimum, or error bars
 */

export default class Rangechart {

  constructor(settings) {

    this.settings = settings
    
    this.init()

  }

  init() {
    console.log('enableshowmore',this.settings.enableShowMore)
    drawShowMore(this.settings.enableShowMore)  
    this.render()

  }

  render() {

    let { modules,
          type,
          colors,
          height, 
          width,
          featuresWidth,
          featuresHeight,
          svgWidth,
          svgHeight, 
          isMobile, 
          title, 
          subtitle, 
          source, 
          marginleft, 
          margintop, 
          marginbottom, 
          marginright, 
          tooltip, 
          data,
          datum,
          labels, 
          userkey, 
          keys,
          rowHeight,
          enableShowMore, 
          colorScheme, 
          dropdown,
          groupBy,
          minX,
          maxX,
          xFormat,
          xScale,
          yScale,
          parseTime,
          xAxisLabel,
          hideKey,
          xColumn } = this.settings

   
    d3.select("#graphicContainer svg").remove()

    const chartKey = d3.select("#chartKey")

    chartKey.html("")

    datum = JSON.parse(JSON.stringify(data))

    colors = new ColorScale()
    
    let defaultColour = colorPresets.guardian[0]  

    isMobile = mobileCheck()

    let circleRadius = 10  

    let keysToChart = keys.filter(d => d != 'Color' && d != groupBy)

    // Check our data columns are in order from smallest (left) to largest (right)
    // As otherwise the layout will break

    let keysInOrder = []

    keysToChart.forEach(key => {
      keysInOrder.push({"key":key, "value":datum[0][key]})
    })

    keysInOrder.sort((a, b) => d3.ascending(a.value, b.value))

    console.log("keysInOrder", keysInOrder)

    //Reset to get the new keys in order

    keysToChart = []

    // Add the sorted keys back to keysToChart

    keysInOrder.forEach(d => {
      keysToChart.push(d.key)
    })

    console.log("keysToChart", keysToChart)
  
    const keyColor = dataTools.getKeysColors({
      keys: keysToChart,
      userKey: userkey,
      option: { colorScheme : colorScheme }
    })

    colors.set(keyColor.keys, keyColor.colors)

    svgWidth = document
      .querySelector("#graphicContainer")
      .getBoundingClientRect().width

    svgHeight = datum.length * rowHeight + margintop + marginbottom

    featuresWidth = svgWidth - marginright - marginleft
    featuresHeight = svgHeight - margintop - marginbottom

    let range = []

    for (var i = 0; i < datum.length; i++) {
      keysToChart.forEach((d) => {
        range.push(datum[i][d])
      })
    }
  

    datum.forEach(function(d) {
      if (xFormat.date) {
        keysToChart.forEach((lolly) => {
          if (contains(keysToChart, lolly)) {
            d[lolly] = parseTime( d[lolly] )
          }
        })
      }
    })

    
    let extent = d3.extent(range)

    const minMax = getMinMax(range.map(d => d))

    let max = minMax.max

    let min = minMax.min

    // Bufferize now takes a percetange as the third argument

    let buffer = bufferize(extent[0], extent[1])

    minX = (!isNaN(minX)) ? buffer[0] : +minX

    maxX = (!isNaN(maxX)) ? buffer[1] : +maxX

    const svg = d3
    .select("#graphicContainer")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .attr("id", "svg")
    .attr("overflow", "hidden")

    const features = svg
    .append("g")
    .attr("transform","translate(" + marginleft + "," + margintop + ")")

    var x = d3[xScale]()
    
    x.range([ 0, featuresWidth]);

    //features.append("g")
      //.attr("transform", "translate(0," + svgHeight + ")")
      //.call(d3.axisBottom(x))

    console.log("yScale", yScale)  
    var y = d3[yScale]()
    .range([ 0, featuresHeight])
    .domain(datum.map(function(d) { return d[groupBy]; }))
    .padding(0.9);

    (xFormat.date) ? x.domain(d3.extent(range)) : x.domain([minX, maxX]); //.nice() // 

    if (minMax.status || x(0) > marginleft) {

      features.append('line')
          .style("stroke", "#767676")
          .style("stroke-width", 1)
          .attr("x1", x(0))
          .attr("y1", margintop / 2)
          .attr("x2", x(0))
          .attr("y2", svgHeight)
          .attr("opacity", 0.5); 
  
    }



    features
      .selectAll(".barText")
      .data(datum)
      .enter()
      .append("text")
      .attr("class", "barText")
      .attr("x", function(d) {
        // let range = []
        // for (var i = 0; i < keysToChart.length; i++) {
        //   range.push(d[keysToChart[i]])
        // }
        // return x(d3.min(range)) - 3
        // return marginleft + 20
        return x(d[keysToChart[1]])
      })
      .attr("text-anchor",function(d) {
        if (x(d[keysToChart[1]]) < 100) {
          return "start"
        }

        else {
          return "end"
        }
         //(minMax.status) ? "start" : "end" ; 
      })
      .attr("y", function(d) { return y(d[groupBy]) - (rowHeight / 3); })
      .text((d) => d[groupBy])


    const xTicks = tickTok(isMobile, x.domain(), featuresWidth) // Set the number of ticks

    const xAxis = g => g
    .attr("transform", `translate(0,${margintop / 2})`)
    .attr("class", "axisgroup") 
    .call(d3.axisTop(x).tickSizeOuter(0))
    .call(d3.axisTop(x)
    .tickSize(-svgHeight, 0, 0)
    .ticks(xTicks)
    .tickFormat((d) => {
      return xFormat.date ? d3.timeFormat("%b %Y")(d) : numberFormat(d)
    })
    .tickPadding(10))

    const yAxis = g => g
    .call(d3.axisLeft(y)) 

    features
    .append("g")
    .attr("class", "x")
    .attr("transform", "translate(0," + svgHeight + ")")
    .call(xAxis)

 
    features.selectAll(".rangeBars")
      .data(datum)
      .enter()
      .append("rect")
      .attr("x", function(d) { 
        return x(+d[keysToChart[0]]); })
      .attr("width", (d) => ( x(+d[keysToChart[1]]) -  x(+d[keysToChart[0]])))
      .attr("y", function(d) { return y(d[groupBy]) - (circleRadius/2) })
      .attr("height", circleRadius)
      .attr("fill", function(d,i) {

        let defs = svg.append("defs");

        let gradient = defs.append("linearGradient")
          .attr("id", `svgGradient_left_${i}`)
          // .attr("gradientUnits", "userSpaceOnUse")
          // .attr("x1", start)
          // .attr("x2", finish)
          // .attr("y1", y(d[groupBy]))
          // .attr("y2",y(d[groupBy]) + 10)

        gradient.append("stop")
          .attr("class", "start")
          .attr("offset", "0%")
          .attr("stop-color", (d.Color) ? d.Color : defaultColour)
          .attr("stop-opacity", 0);

        gradient.append("stop")
          .attr("class", "end")
          .attr("offset", "100%")
          .attr("stop-color", (d.Color) ? d.Color : defaultColour)
          .attr("stop-opacity", 1);

        return `url(#svgGradient_left_${i})`
      })

    
      features.selectAll(".rangeBars")
      .data(datum)
      .enter()
      .append("rect")
      .attr("x", function(d) { 
        return x(+d[keysToChart[1]]); })
      .attr("width", (d) => ( x(+d[keysToChart[2]]) -  x(+d[keysToChart[1]])))
      .attr("y", function(d) { return y(d[groupBy]) - (circleRadius/2) })
      .attr("height", circleRadius)
      .attr("fill", function(d,i) {
        console.log(d)
        let defs = svg.append("defs");

        let gradient = defs.append("linearGradient")
          .attr("id", `svgGradient_right_${i}`)
          // .attr("gradientUnits", "userSpaceOnUse")
          // .attr("x1", start)
          // .attr("x2", finish)
          // .attr("y1", y(d[groupBy]))
          // .attr("y2",y(d[groupBy]) + 10)

        gradient.append("stop")
          .attr("class", "start")
          .attr("offset", "0%")
          .attr("stop-color", (d.Color) ? d.Color : defaultColour)
          .attr("stop-opacity", 1);

        gradient.append("stop")
          .attr("class", "end")
          .attr("offset", "100%")
          .attr("stop-color", (d.Color) ? d.Color : defaultColour)
          .attr("stop-opacity", 0);

        return `url(#svgGradient_right_${i})`
      })  


    // features
    //   .append("circle")
    //   .attr("cx", `${ (featuresWidth) /2}`)
    //   .attr("cy", `${ (featuresHeight) /2}`)
    //   .attr("fill", "red")
    //   .attr("r", 5)


    if (!hideKey) {
      if (keysToChart.length > 1) {

        keysToChart.forEach((k, i) => {
  
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
    }
   

    if (xAxisLabel) {

      svg
      .append("text")
      .attr("x", marginleft)
      .attr("y", margintop / 2)
      .attr("fill", "#767676")
      .attr("text-anchor", "start")
      .text(xAxisLabel)
      //.call(wrap, marginleft > 15 ? marginleft - 15 : marginleft); // Assuming `maxWidth` is defined

    }

    

      features.selectAll(".lolly")
        .data(datum)
        .enter()
        .append("circle")
          .attr("cx", function(d) { return x(+d[keysToChart[1]]); })
          .attr("cy", function(d) { return y(d[groupBy]); })
          .attr("r", circleRadius)
          .style("fill", (d, i) => {
            return (d.Color) ? d.Color : defaultColour
          })
          .style("stroke", (d, i) => {
            return (d.Color) ? d.Color : defaultColour
          })

      features.selectAll(".circleText")
          .data(datum)
          .enter()
          .append("text")
            .attr("x", function(d) { return x(+d[keysToChart[1]]); })
            .attr("y", function(d) { return y(d[groupBy]) + circleRadius/2 - 2 })
            .style("font-size", circleRadius)
            .style("font-weight", "bold")
            .style("fill", (d, i) => {
              return "#FFF";
            })
            .text(d => d[keysToChart[1]])
            .attr("text-anchor", "middle")
      
 


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
    		addLabel(svg, config, svgWidth, svgHeight, {
    			"left": marginleft,
    			"right": marginright,
    			"top": margintop,
    			"bottom": marginbottom
    		}, clickLoggingOn)
    	})

    }

  }

}
