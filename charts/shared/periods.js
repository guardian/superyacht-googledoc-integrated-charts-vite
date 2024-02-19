export function addPeriods(periods, features, x, height, xFormat, isMobile) {

	// All dates must be in standard format
	console.log("isMobile",isMobile)
	let parseTime = d3.timeParse("%Y-%m-%d")

	d3.selectAll(".periodLine").remove()

	d3.selectAll(".periodLabel").remove()

	let periodsCopy = structuredClone(periods);
	// console.log(periods)
	// console.log(periodsCopy)

	periodsCopy.forEach((d,i) => {
		console.log(d)
		d['index'] = i + 1
		if (xFormat.date) {
			console.log("yeh")
		      d.start = parseTime(d.start)

		      if (d.end != "") {
		        d.end = parseTime(d.end)
		        d.middle = new Date((d.start.getTime() + d.end.getTime()) / 2)
		      } else {
		        d.middle = d.start
				d.end = d.start
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
	.data(periodsCopy)
	.enter()
	.append("line")
	.attr("x1", (d) => x(d.start))
	.attr("y1", 0)
	.attr("x2", (d) => x(d.start))
	.attr("y2", height)
	.attr("class", "periodLine start")
	.attr("stroke", "#bdbdbd")
	.attr("opacity", (d) => (d.start < x.domain()[0]) ? 0 : 1)
	.attr("stroke-width", 1)

	features
	.selectAll(".periodLine .end")
	.data(periodsCopy.filter(b => b.end != ""))
	.enter()
	.append("line")
	.attr("x1", (d) => x(d.end))
	.attr("y1", 0)
	.attr("x2", (d) => x(d.end))
	.attr("y2", height)
	.attr("class", "periodLine end")
	.attr("stroke", "#bdbdbd")
	.attr("opacity", (d) => (d.end > x.domain()[1]) ? 0 : 1)
	.attr("stroke-width", 1)

	features
	.selectAll(".periodLabel")
	.data(periodsCopy)
	.enter()
	.append("text")
	.attr("x", (d) => {

		if (!isMobile) {
			if (d.labelAlign == "middle") {
				return x(d.middle)
				} 
				else if (d.labelAlign == "start") {
					  return x(d.start) + 5
				}
		
				else if (d.labelAlign == "end") {
					return x(d.end) + 5
				  }
		}

		else if (isMobile) {
			return x(d.middle)
		}
		

	})
	.attr("y", -5)
	.attr("text-anchor", (d) => { 
		if (!isMobile) {
			return d.labelAlign
		}
		else {
			return "middle"
		}	
	})
	.attr("class", "periodLabel")
	.attr("opacity", 1)
	.text((d) => {
		if (!isMobile) {
			return d.label
		}
		
		else if(isMobile) {
			return d.index
		}
	})

	if (isMobile) {
		let noteText = ""
		periodsCopy.forEach((d,i) => {
			let text = `${d.index}) ${d.label} `
			noteText = noteText + text	
		})
		d3.select("#annotations").text(noteText)
	}

}