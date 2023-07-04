import ColorScale from "./colorscale"

export function addTrendline(trendline, data, xColumn, parseTime, x, y, features, xFormat) {

  const trendColors = new ColorScale()

  const chartKey = d3.select("#chartKey")

  const tkeys = Object.keys(trendline[0])
  .filter((item) => item != xColumn)

  trendline.forEach((d) => {
    if (xFormat.date) {
      d[xColumn] = parseTime(d[xColumn])
    }
  })

  let colourIndex = 0

  d3.selectAll(".trendKey")
  .remove()  

  for (const trend of tkeys) {

    let tline = d3.line()

    let offset = (xFormat.date) ? x(parseTime(data[data.length - 1][xColumn])) / data.length / 2 : x(data[data.length - 1][xColumn]) / data.length / 2

    let filterData = trendline
    .filter((item) => !isNaN(item[trend]))

    let tdata = filterData
    .map((item) => [x(item[xColumn]) + offset, y(+item[trend])])

    features
    .append("path")
    .attr("d", function(d){
      return tline(tdata)
    })
    .attr("stroke", trendColors.get(colourIndex))
    .attr("fill", "none")
    .attr("stroke-width", "3")

    const keyDiv = chartKey
    .append("div")
    .attr("class", "keyDiv trendKey")
    .style("position", "relative")

    keyDiv
    .append("svg")
    .attr("class", "keyDash")
    .attr("width", 12)
    .attr("height", 12)
    .attr("fill", "none")
    .append("rect")
    .attr("x", 0)
    .attr("y", 6)
    .attr("width", 12)
    .attr("height", 2)
    .attr("fill", () => trendColors.get(colourIndex))  

    keyDiv.append("span")
    .attr("class", "keyText")
    .style("margin-left", "18px")
    .text(tkeys[colourIndex])

    colourIndex++

  }
	
}