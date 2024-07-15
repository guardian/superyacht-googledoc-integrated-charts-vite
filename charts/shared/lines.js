export function addLines(lines, x, y, features, parseTime) {

	lines.forEach((d) => {
	  if (parseTime && typeof d.x1 == "string") {
	    d.x1 = parseTime(d.x1)
	    d.x2 = parseTime(d.x2)
	  }

	  if (typeof d.y1 == "string") {
	    d.y1 = +d.y1
	    d.y2 = +d.y2
	  }

	})

    features
    .selectAll(".line")
    .data(lines)
    .enter()
    .append("line")
    .attr("x1", (d) => x(d.x1))
    .attr("y1", (d) => y(d.y1))
    .attr("x2", (d) => x(d.x2))
    .attr("y2", (d) => y(d.y1))
    .attr("class", "line")
    .attr("stroke", "#767676")
    .attr("stroke-dasharray", "2,2")
    .attr("stroke-width", 1)  

    features
    .selectAll(".lineTextOutline")
    .data(lines)
    .enter()
    .append("text")
    .attr("x", (d) => x(d.x1))
    .attr("y", (d) => y(d.y1) - 5)
    .attr("class", "lineTextOutline")
    .attr("opacity", 1)
    .text((d) => d.text)     

    features
      .selectAll(".lineText")
      .data(lines)
      .enter()
      .append("text")
      .attr("x", (d) => x(d.x1))
      .attr("y", (d) => y(d.y1) - 5)
      .attr("class", "lineText")
      .attr("opacity", 1)
      .text((d) => d.text)  


	
}