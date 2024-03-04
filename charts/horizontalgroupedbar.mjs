
import dataTools from "./shared/dataTools"
import ColorScale from "./shared/colorscale"
import { numberFormat, mustache, mobileCheck, getURLParams } from './shared/toolbelt';
import Dropdown from "./shared/dropdown";
import { addDrops } from "./shared/drops"
import Tooltip from "./shared/tooltip"
import { drawShowMore } from "./shared/showmore"
import  { addLabel, clickLogging } from './shared/arrows'


export default class Groupedbar {

  constructor(settings) {

    this.settings = settings

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

        //this.settings.chartlines = [ this.settings.xColumn, ...data.values.split(',') ]

        if (this.settings.tooltip != "") {

          //this.tooltip.updateTemplate(data.tooltip)

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
          featuresWidth,
          featuresHeight,
          svgWidth,
          svgHeight, 
          isMobile, 
          colors, 
          datum, 
          title, 
          subtitle, 
          source, 
          marginleft, 
          margintop, 
          marginbottom, 
          marginright,
          maxHeight,
          footnote, 
          dateFormat, 
          tooltip,
          xAxisLabel, 
          yAxisLabel, 
          periodDateFormat, 
          data, 
          keys,
          userkey,
          labels, 
          lines, 
          periods, 
          type,
          enableShowMore, 
          aria, 
          colorScheme, 
          dropdown,
          groupBy } = this.settings

    d3.select("#graphicContainer svg").remove();

    const chartKey = d3.select("#chartKey")

    chartKey.html("")

    const groupKey = data.map(d => d[groupBy])

    datum = []

    let columns = JSON.parse(JSON.stringify(keys))

    columns = columns.filter(d => d != groupBy)

    data.map(d => columns.map(key => (+d[key]))).forEach(ob => datum.push(...ob))

    isMobile = mobileCheck()

    svgWidth = document.querySelector("#graphicContainer").getBoundingClientRect().width

    console.log("columns.length", columns.length, "groupKey.length", groupKey.length)
    svgHeight = (columns.length * maxHeight) * groupKey.length   

    featuresWidth = svgWidth - marginleft - marginright
    featuresHeight = svgHeight - margintop - marginbottom

    const svg = d3.select("#graphicContainer").append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .attr("id", "svg")
    .attr("overflow", "hidden");         

    const y0 = d3.scaleBand()
    .domain(groupKey)
    .rangeRound([margintop, svgHeight - marginbottom])
    .paddingInner(0.1)

    const y1 = d3.scaleBand()
    .domain(columns)
    .rangeRound([y0.bandwidth(), 0])
    .padding(0.05)

    console.log(y1.bandwidth())

    const x = d3.scaleLinear()
    .domain([0, d3.max(datum)])
    .rangeRound([ marginleft, ( featuresWidth + marginleft )  - marginright ])

    colors = new ColorScale()

    const keyColor = dataTools.getKeysColors({
      keys: columns,
      userKey: userkey,
      option: { colorScheme : colorScheme }
    })

    columns.forEach((key, i) => {

      if (key != groupBy) {

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

      }

    })

    const xAxis = g => g
    .attr("transform", `translate(0,${0 + margintop})`)
    .attr("class", "axisgroup") 
    .call(d3.axisTop(x).tickSizeOuter(0))
    .call(d3.axisTop(x)
    .ticks(3)
    .tickFormat((d) => {
      return numberFormat(d)
    })
    .tickSize(-featuresHeight, 0, 0)
    .tickPadding(10))
    
      
    const yAxis = g => g
    .attr("transform", `translate(${marginleft},0)`)
    .call(d3.axisLeft(y0))

    const bars = svg.append("g")
    .selectAll("g")
    .data(data)
    .enter()
    .append("g")
    .attr("transform", d => `translate(0,${y0(d[[groupBy]])})`)

    bars.selectAll("rect")
    .data(d => {
      return columns.filter(key => d[key] !== null).map(key => ({key, value: d[key], ...d}))
    })
    .enter()
    .append("rect")
    .attr("class", "barPart")
    .attr("x", d => x(0))
    .attr("y", d => y1(d.key))
    .attr("height", y1.bandwidth())
    .attr("width", d => x(d.value) - x(0))
    .attr("fill", d => colors.get(d.key))

    bars.selectAll("text")
    .data(d => columns.filter(key => d[key] !== null).map(key => ({key, value: d[key]})))
    .enter()
    .append("text")
    .attr("text-anchor", d => (x(d.value) - x(0) < 100) ? "start" : "end" )
    .attr("x", d => (x(d.value) - x(0) < 100) ? x(d.value) + 10 : x(d.value) - 10)
    .attr("y", d => y1(d.key) + ( y1.bandwidth() - 7 ) )
    .attr("fill", d => (x(d.value) - x(0) < 100) ? "black" : "white")
    .attr("font-weight","600")
    .text((d) => numberFormat(d.value));

    bars.selectAll("line")
    .data(d => columns.map(key => ({key, value: d[key]})))
    .enter()
    .append("line")
    .style("stroke", "#767676")
    .style("stroke-width", 1)
    .attr("x1", d => x(0))
    .attr("y1", y0(0))
    .attr("x2", d => x(0))
    .attr("y2", d => y1(d.key) + ( y1.bandwidth() + 2 ) )

    svg.append("g")
    .call(xAxis);

    svg.append("g")
    .call(yAxis);

    d3.selectAll('.axisgroup')
    .moveToBack()

    d3.selectAll('.domain')
    .remove()

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
