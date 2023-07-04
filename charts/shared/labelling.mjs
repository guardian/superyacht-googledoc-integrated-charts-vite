import  { addLabel, clickLogging } from './arrows';
import { textPadding, textPaddingMobile } from './toolbelt';

class Labelling {
  /***
    Labelling constructor
  -------------*/
  constructor(labels) {

    this.settings = {}

    this.settings.labels = labels

    this.settings.annotations = d3.select("#annotations")

    console.log("Load labels component")

  }

  addlabels() {

    let { labels } = this.settings

    labels.forEach((config) => {

      //addLabel(svg, config, width, height, setting)

    })

  }

  drawAnnotation(features, isMobile, x, y) {

    const { annotations , labels  } = this.settings

    annotations.html("")

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
        .attr("text-anchor", () => (label.align != "") ? label.align : "middle")
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
}

export default Labelling