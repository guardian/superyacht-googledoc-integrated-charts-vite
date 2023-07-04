import  { addLabel, clickLogging } from './arrows';
import { textPadding, textPaddingMobile } from './toolbelt';

export function addLabels(labels, parseTime, features, isMobile, x, y) {

  const annotations = d3.select("#annotations")

  annotations.html("")
 
  labels.forEach((d) => {
    
    if (parseTime && typeof d.x == "string") {
      d.x = parseTime(d.x)
    } else {
      d.x = +d.x
    }

    if (typeof d.y == "string") {
      d.y = +d.y
    }

    if (typeof d.offset == "string") {
      d.offset = +d.offset
    }

  })

  labels.forEach((label, i) => {

    features
    .append("line")
    .attr("class", "annotationLine")
    .attr("x1", () => x(label.x))
    .attr("y1", () => y(label.y))
    .attr("x2", () => x(label.x))
    .attr("y2", () => y(label.y) - label.offset)
    .style("opacity", 1)
    .attr("stroke", "#000")

    if (isMobile) {

      features
      .append("circle")
      .attr("class", "annotationCircle")
      .attr("cy", () => y(label.y) - label.offset - 4)
      .attr("cx", () => x(label.x))
      .attr("r", 8)
      .attr("fill", "#000")

      features
      .append("text")
      .attr("class", "annotationTextMobile")
      .attr("y", () => y(label.y) - label.offset)
      .attr("x", () => x(label.x))
      .attr("text-anchor", () => (label.align != "" && !isMobile) ? label.align : "middle")
      .style("opacity", 1)
      .attr("fill", "white")
      .text(i + 1)

      if (labels.length > 0) {

        annotations
        .append("span")
        .attr("class", "annotationFooterHeader")
        .text("Notes: ")
      }

      annotations
      .append("span")
      .attr("class", "annotationFooterNumber")
      .text(i + 1 + " - ")

        if (i < labels.length - 1) {

          annotations
          .append("span")
          .attr("class", "annotationFooterText")
          .text(label.text + ", ")

        } else {

          annotations
          .append("span")
          .attr("class", "annotationFooterText")
          .text(label.text)

        }

    } else {

      features
      .append("text")
      .attr("class", "annotationText2")
      .attr("y", () => y(label.y) - label.offset - textPadding(label) / 2)
      .attr("x", () => x(label.x))
      .style("text-anchor", () => label.align)
      .style("opacity", 1)
      .text(() => label.text)

    }
  })

}