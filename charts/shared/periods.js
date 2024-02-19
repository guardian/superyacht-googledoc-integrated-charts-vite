export function addPeriods(periods, parseTime, features, x, height, xFormat) {

	console.log(periods, parseTime, features, x, height, xFormat)

	d3.selectAll(".periodLine").remove()

	d3.selectAll(".periodLabel").remove()

	periods.forEach((d) => {
		if (xFormat.date) {

		      d.start = parseTime(d.start)
		      if (d.end != "") {
		        d.end = parseTime(d.end)
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
	})

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
	.attr("class", "periodLine mobHide end")
	.attr("stroke", "#bdbdbd")
	.attr("opacity", (d) => (d.end > x.domain()[1]) ? 0 : 1)
	.attr("stroke-width", 1)

	features
	.selectAll(".periodLabel")
	.data(periods)
	.enter()
	.append("text")
	.attr("x", (d) => {
	if (d.labelAlign == "middle") {
	  return x(d.middle)
	} else if (d.labelAlign == "start") {
	  return x(d.start) + 5
	}
	})
	.attr("y", -5)
	.attr("text-anchor", (d) => d.labelAlign)
	.attr("class", "periodLabel mobHide")
	.attr("opacity", 1)
	.text((d) => d.label)
	
}