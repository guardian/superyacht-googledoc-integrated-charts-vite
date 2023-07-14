
import dataTools from "./shared/dataTools"
import Tooltip from "./shared/tooltip"
import ColorScale from "./shared/colorscale"
import { numberFormat, mustache, mobileCheck, bufferize, validateString } from './shared/toolbelt';
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
          defaultRadius
      } = this.settings


      console.log(`xScale: ${xScale}`)
      console.log(`yScale: ${yScale}`)
      console.log(`zScale: ${zScale}`)
      console.log(`Date (X col): ${xFormat.date}`)
      console.log(`zColumn: ${zColumn}`)

    datum = JSON.parse(JSON.stringify(data));

    const $tooltip = (this.tooltip) ? this.tooltip : false

    d3.select("#graphicContainer svg").remove();

    const chartKey = d3.select("#chartKey")

    chartKey.html("")

    isMobile = mobileCheck()

    width = document.querySelector("#graphicContainer").getBoundingClientRect().width

    height = isMobile ? width * 0.7 : width * 0.5;

    datum.forEach(function(d) {
      if (xFormat.date) {
        d[xColumn] = parseTime(d[xColumn])
      }
    })

    const xRange = d3.extent(datum.map(d => d[xColumn]))

    const yRange = d3.extent(datum.map(d => d[yColumn]))

    const zRange = (zColumn in datum[0]) ? d3.extent(datum.map(d => d[zColumn])) : null
    
    const keyData = Array.from(new Set(datum.map(d => d[groupBy])));

    const svg = d3.select("#graphicContainer").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${marginleft}, ${margintop})`);      

    colors = new ColorScale()

    const keyColor = dataTools.getKeysColors({
      keys: keys,
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
    .range([ zMax, width - marginright - marginleft - zMax ]) // .domain(bufferize(xMin,xMax))
    .domain(d3.extent(datum.map(d => d[xColumn])))

    const xLabel = d3[xScale]()
    .range([ zMax, width - marginright - marginleft - zMax ]) // .domain(bufferize(xMin,xMax))
    .domain(datum.map(d => d[xColumn]))

    const tickMod = Math.round(datum.map(d => d[xColumn]).length / 6)

    let ticks = xLabel.domain().filter((d, i) => !(i % tickMod) || i === xLabel.domain().length - 1)

    var xAxis = (xFormat.date) ? d3.axisTop(x)
    .ticks(ticks)
    .tickSize(-(  height - margintop - marginbottom), 0, 0) :

    d3.axisTop(x)
    .tickSize(-(  height - margintop - marginbottom), 0, 0) 

    if (xFormat.date) {

      xAxis.tickValues(ticks).tickFormat(d3.timeFormat("%b %Y"))

    }

    function dodge(X, radius) {
      const Y = new Float64Array(X.length);
      const radius2 = radius ** 2;
      const epsilon = 1e-3;
      let head = null, tail = null;

      // Returns true if circle ⟨x,y⟩ intersects with any circle in the queue.
      function intersects(x, y) {
        let a = head;
        while (a) {
          const ai = a.index;
          if (radius2 - epsilon > (X[ai] - x) ** 2 + (Y[ai] - y) ** 2) return true;
          a = a.next;
        }
        return false;
      }

      // Place each circle sequentially.
      for (const bi of d3.range(X.length).sort((i, j) => X[i] - X[j])) {

        // Remove circles from the queue that can’t intersect the new circle b.
        while (head && X[head.index] < X[bi] - radius2) head = head.next;

        // Choose the minimum non-intersecting tangent.
        if (intersects(X[bi], Y[bi] = 0)) {
          let a = head;
          Y[bi] = Infinity;
          do {
            const ai = a.index;
            let y = Y[ai] + Math.sqrt(radius2 - (X[ai] - X[bi]) ** 2);
            if (y < Y[bi] && !intersects(X[bi], y)) Y[bi] = y;
            a = a.next;
          } while (a);
        }

        // Add b to the queue.
        const b = {index: bi, next: null};
        if (head === null) head = tail = b;
        else tail = tail.next = b;
      }

      return Y;
    }

const dodgie = (data, radius) => {
  const radius2 = radius ** 2;
  const circles = data
  const epsilon = 1e-3;
  let head = null, tail = null;

  // Returns true if circle ⟨x,y⟩ intersects with any circle in the queue.
  function intersects(x, y) {
    let a = head;
    while (a) {
      if (radius2 - epsilon > (a.x - x) ** 2 + (a.y - y) ** 2) {
        return true;
      }
      a = a.next;
    }
    return false;
  }

  // Place each circle sequentially.
  for (const b of circles) {

    // Remove circles from the queue that can’t intersect the new circle b.
    while (head && head.x < b.x - radius2) head = head.next;

    // Choose the minimum non-intersecting tangent.
    if (intersects(b.x, b.y = 0)) {
      let a = head;
      b.y = Infinity;
      do {
        let y1 = a.y + Math.sqrt(radius2 - (a.x - b.x) ** 2);
        let y2 = a.y - Math.sqrt(radius2 - (a.x - b.x) ** 2);
        if (Math.abs(y1) < Math.abs(b.y) && !intersects(b.x, y1)) b.y = y1;
        if (Math.abs(y2) < Math.abs(b.y) && !intersects(b.x, y2)) b.y = y2;
        a = a.next;
      } while (a);
    }

    // Add b to the queue.
    b.next = null;
    if (head === null) head = tail = b;
    else tail = tail.next = b;
  }

  return circles;
}


    svg
    .append("g")
    .attr("class", "x")
    .attr("transform", "translate(0," + 0 + ")")
    .call(xAxis)
    .style("stroke-dasharray", "2 2")

    const y = d3[yScale]()
    .range([ height - margintop - marginbottom, margintop])
    .domain(datum.map(d => d[yColumn]))

    const z = (zRange != null) ? d3[zScale]()
    .domain(zRange)
    .range([zMin, zMax]) : null

    datum.forEach(d => {
      d.x = x(d[xColumn])
      d.y = y(d[yColumn])
    })

    // https://www.chartfleau.com/tutorials/d3swarm
    const cats = Array.from(new Set(datum.map(d => d[yColumn])));

    for (const cat of cats) {
      let targs = datum.filter(d => d[yColumn] == cat)
      let originY = targs[0].y
      targs = dodgie(targs, defaultRadius / 2)
      for (var i = 0; i < targs.length; i++) {
        targs[i].y = targs[i].y + (originY)
      }
    }

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
    .style("fill", (d) => colors.get(d[groupBy]))
    .style("opacity", opacity / 100)

    svg.append("g")
    .attr("class","axis y")
    .call(d3.axisLeft(y))

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
      .attr("x", width - marginright - marginleft)
      .attr("y", height - margintop - marginbottom)
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

  }

}
