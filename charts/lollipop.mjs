
import dataTools from "./shared/dataTools"
import ColorScale from "./shared/colorscale"
import colorPresets from "./constants/colors"
import { getURLParams, numberFormat, mustache, mobileCheck, setMinToMax, textPadding, textPaddingMobile, bufferize, tickTok, contains, wrap, getLabelFromColumn } from './shared/toolbelt';
import  { addLabel, clickLogging } from './shared/arrows'
import { drawShowMore } from "./shared/showmore"

export default class Lollipop {

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
          minMax,
          xColumn,
          columns } = this.settings

   
    d3.select("#graphicContainer svg").remove()

    const chartKey = d3.select("#chartKey")

    chartKey.html("")

    datum = JSON.parse(JSON.stringify(data))

    colors = new ColorScale()

    isMobile = mobileCheck()

    let lollies = keys.filter(d => d != 'Color' && d != groupBy)

    const keyColor = dataTools.getKeysColors({
      keys: lollies,
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

    datum.forEach(function(d) {
      if (xFormat.date) {
        lollies.forEach((lolly) => {
          if (contains(lollies, lolly)) {
            d[lolly] = parseTime( d[lolly] )
          }
        })
      }
    })

    for (var i = 0; i < datum.length; i++) {
      lollies.forEach((d) => {
        range.push(datum[i][d])
      })
    }

    let extent = d3.extent(range)


    // Removed temporarily as getMinMax is only needed for charts where we want to use the same min and max on the positive and negative x axis, getMinMax
    // has been renamed to setMinToMa
    // const minMax = getMinMax(range.map(d => d))

    // let max = minMax.max
    // let min = minMax.min

    // Bufferize now takes a percetange as the third argument

    let buffer = bufferize(extent[0], extent[1])
    
    console.log("extent", extent, "buffer",buffer)
    
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

    if (lollies.length == 1) {

      if (minX < 0 && maxX > 0) {

        features.append("line")
        .attr("x1", function(d) { return x(0); })
        .attr("x2", function(d) { return x(0); })
        .attr("y1", function(d) { return 0; })
        .attr("y2", function(d) { return featuresHeight; })
        .style("stroke", '#767676')
        .style("stroke-width", "1px")

      }

      features.selectAll("lines")
      .data(datum)
      .enter()
      .append("line")
      .attr("x1", function(d) { return x(0); })
      .attr("x2", function(d) { return x(+d[lollies[0]]); })
      .attr("y1", function(d) { return y(d[groupBy]); })
      .attr("y2", function(d) { return y(d[groupBy]); })
      .style("stroke", (d, i) => {
        return (d.Color) ? d.Color : colors.get(d[lollies[0]])
      })
      .style("stroke-width", "4px")

      features
      .selectAll(".barText")
      .data(datum)
      .enter()
      .append("text")
      .attr("class", "barText")
      .attr("x", function(d) {
        let gap = (d[lollies[0]] < 0 ) ? -6 : 6 ;
        return x(0) + gap //(d[lollies[0]] > 0) ? x(d[lollies[0]]) + 20 : x(d[lollies[0]]) - 20; 
      })
      .attr("text-anchor",function(d) {
        return (d[lollies[0]] > 0) ? "start" : "end" ; 
      })
      .attr("y", function(d) { return y(d[groupBy]) - (rowHeight / 3.5); })
      .text((d) => d[groupBy])

    } else {

      features
      .selectAll(".barText")
      .data(datum)
      .enter()
      .append("text")
      .attr("class", "barText")
      .attr("x", function(d) {
        let range = []
        for (var i = 0; i < lollies.length; i++) {
          range.push(d[lollies[i]])
        }
        return x(d3.min(range)) - 3
      })
      .attr("text-anchor",function(d) {
        return "start" //(minMax.status) ? "start" : "end" ; 
      })
      .attr("y", function(d) { return y(d[groupBy]) - (rowHeight / 3); })
      .text((d) => d[groupBy])

    }


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

    if (lollies.length == 2) {

      let col1 = colors.get(lollies[0]) 

      let col2 = colors.get(lollies[1]) 

      features.selectAll("lines")
      .data(datum)
      .enter()
      .append("line")
      .attr("x1", function(d) { 
        return x(+d[lollies[0]]); })
      .attr("x2", function(d) { return x(+d[lollies[1]]); })
      .attr("y1", function(d) { return y(d[groupBy]); })
      .attr("y2", function(d) { return y(d[groupBy]); + 10})
      .attr("stroke", function(d,i) {

        let x1 = x(+d[lollies[0]])

        let x2 = x(+d[lollies[1]])

        let minBall = (x1 < x2) ? col1 : col2

        let maxBall = (x2 > x1) ? col2 : col1

        let start = (x1 < x2) ? x1 : x2

        let finish = (x2 > x1) ? x2 : x1

        let defs = svg.append("defs");

        let gradient = defs.append("linearGradient")
        .attr("id", `svgGradient_${i}`)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", start)
        .attr("x2", finish)
        .attr("y1", y(d[groupBy]))
        .attr("y2",y(d[groupBy]) + 10)

        gradient.append("stop")
        .attr("class", "start")
        .attr("offset", "0%")
        .attr("stop-color", minBall)
        .attr("stop-opacity", );

        gradient.append("stop")
        .attr("class", "end")
        .attr("offset", "100%")
        .attr("stop-color", maxBall)
        .attr("stop-opacity", 1);

        return `url(#svgGradient_${i})`
      })
      .style("stroke-width", "6px")

    }



    // features
    //   .append("circle")
    //   .attr("cx", `${ (featuresWidth) /2}`)
    //   .attr("cy", `${ (featuresHeight) /2}`)
    //   .attr("fill", "red")
    //   .attr("r", 5)

    if (lollies.length > 1) {

      lollies.forEach((k, i) => {

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
        .text(getLabelFromColumn(columns, k))

      })

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

    for (const lolly of lollies) {

      features.selectAll(".lolly")
      .data(datum)
      .enter()
      .append("circle")
      .attr("cx", function(d) { return x(+d[lolly]); })
      .attr("cy", function(d) { return y(d[groupBy]); })
      .attr("r", "7")
      .style("fill", (d, i) => {
        return (d.Color) ? d.Color : colors.get(lolly)
      })
      .style("stroke", (d, i) => {
        return (d.Color) ? d.Color : colors.get(lolly)
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
