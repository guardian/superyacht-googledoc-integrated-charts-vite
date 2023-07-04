 import helpers from "./helpers"
import { mustache } from "./toolbelt"

/****** Example tooltip template */
// `
//   <b>{{#formatDate}}date{{/formatDate}}</b><br/>
//   <b>Australia</b>: {{Australia}}<br/>
//   <b>France</b>: {{France}}<br/>
//   <b>Germany</b>: {{Germany}}<br/>
//   <b>Italy</b>: {{Italy}}<br/>
//   <b>Sweden</b>: {{Sweden}}<br/>
//   <b>United Kingdom</b>: {{United Kingdom}}<br/>
// `
/****** end tooltip template */

class Tooltip {
  /***
    Tooltip constructor
    
    - parentSelector: provide where the tooltip element is going to be appended
    - className (optional): provide additional css class names for more style control
  -------------*/
  constructor(template) {

    this.settings = {}

    this.settings.template = template

    const parentSelector = "#graphicContainer"

    this.$el = d3
      .select(parentSelector)
      .append("div")
      .attr("class", `tooltip`)
      .attr("width", "100px")
      .attr("id", "tooltip")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("opacity", 0)

    this.parentOffset = d3
      .select(parentSelector)
      .node()
      .getBoundingClientRect().top

    this.templateRender = (d) => {
      return mustache(this.settings.template, { ...helpers, ...d })
    }

  }

  updateTemplate(template) {

    this.settings.template = template

  }

  /***
    Show tooltip. 
    
    - html: HTML string to display
    - containerWidth: width of area where hover events should trigger
    - pos (optional): {
        left: Number,
        top: Number,
        leftOffset: Number,
        topOffset: Number
      } - Provide overrides for left/top positions
  -------------*/
  show(html, containerWidth, containerHeight, pos) {
    this.$el.html(html)

    const tipWidth = this.$el.node().getBoundingClientRect().width
    const tipHeight = this.$el.node().getBoundingClientRect().height
    const left = pos && pos.left ? pos.left : d3.pointer(event)[0]
    const top = pos && pos.top ? pos.top : d3.pointer(event)[1] - this.parentOffset
    const leftOffset = pos && pos.leftOffset ? pos.leftOffset : 0
    const topOffset = pos && pos.topOffset ? pos.topOffset : 0

    // console.log("containerWidth:", containerWidth, "containerHeight:", containerHeight, "pageX", d3.event.pageX, "pageY", d3.event.pageY, "top", top, "parentOffset", this.parentOffset)

    if (d3.pointer(event)[0] < containerWidth / 2) {
      this.$el.style("left", `${d3.pointer(event)[0] + tipWidth/2 + 10}px`)
    } else if (d3.pointer(event)[0] >= containerWidth / 2) {
      this.$el.style("left", `${left - tipWidth - 10}px`)
    }

    // this.$el.style("top", `${top + topOffset}px`)

    if (top < containerHeight - tipHeight) {
      this.$el.style("top", `${top + topOffset}px`)
    } else if (top >= containerHeight - tipHeight) {
      this.$el.style("top", `${top + topOffset - tipHeight}px`)
    }

    this.$el.transition().duration(200).style("opacity", 0.9)
  }

  /***
    Hide tooltip
  -------------*/
  hide() {
    this.$el.transition().duration(500).style("opacity", 0)
  }

  /***
    Bind events to target element. 
    
    - $bindEls: Elements that trigger the mouse events
    - containerWidth: width of area where hover events should trigger
    - templateRender: accepts function, string or number. Function to return the tooltip text.
      (Usually this passes in the data and the mustache template will render the output)
    - pos (optional): {
        left: Number,
        top: Number,
        leftOffset: Number,
        topOffset: Number
      } - Provide overrides for left/top positions
  -------------*/
  bindEvents($bindEls, containerWidth, containerHeight, pos) {
    //console.log(pos)
    const self = this
    $bindEls
      .on("mouseover", function (d) {
        let data = (d3.select(this).datum().data == undefined) ? d.target.__data__ : d3.select(this).datum().data ;
        
        //console.log(data)
        const html = self.templateRender(data)
        self.show(html, containerWidth, containerHeight, pos)
      })
      .on("mouseout", () => {
        this.hide()
      })
  }

  drawHoverFeature(features, height, width, xVar, marginleft, chartKeyData, x, datum, spareKeys) {
    let tooltipData
    let templateRender = this.templateRender
    let $el = d3.select("#tooltip")

    var tooltip = $el.node();

    const $hoverLine = features
    .append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 0)
    .attr("y2", height)
    .style("opacity", 0)
    .style("stroke", "#333")
    .style("stroke-dasharray", 4)

    const $hoverLayerRect = features
    .append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("opacity", 0)

    // Handle mouse hover event
    // Find the datum based on mouse position
    const getTooltipData = (event, d) => {

      const bisectX = d3.bisector((d) => d[xVar]).left,
        x0 = x.invert(event.clientX - marginleft),
        i = bisectX(datum, x0, 1),
        tooltipData = {}

      spareKeys.forEach((key) => {
        
        const datum = chartKeyData[key],
          d0 = datum[i - 1],
          d1 = datum[i]

          if (d0 && d1) {

            d = (d0 && d1) ? x0 - d0[xVar] > d1[xVar] - x0 ? d1 : d0 : d0
            
            tooltipData[xVar] = d[xVar]
            tooltipData[key] = d[key]

          }
        
      })
      return tooltipData
    }

    $hoverLayerRect
    .on("mousemove touchmove", function (event, d) {

      const tooltipData = getTooltipData(event, this)
      const tooltipText = templateRender(tooltipData)

      $el.html(tooltipText)

      let tipWidth = 200
      let tipHeight = 100
      let topOffset = 100

      if (event.clientX < width / 2) {

        $el.style("left", `${x(tooltipData[xVar]) + marginleft + 10}px`)

      } else {

        $el.style("left", `${x(tooltipData[xVar]) + marginleft - ( tipWidth) + 20}px`)

      }


      if (event.clientY > height / 2) {

        $el.style("top", `${event.clientY - ( tooltip.getBoundingClientRect().height * 2 ) + 20}px`)

      } else {

        $el.style("top", `${event.clientY - ( tooltip.getBoundingClientRect().height ) - 20}px`)

      }

      $el.transition().duration(200).style("opacity", 0.9)

      $hoverLine
      .attr("x1", x(tooltipData[xVar]))
      .attr("x2", x(tooltipData[xVar]))
      .style("opacity", 0.5)
    })
    .on("mouseout touchend", function () {
      $el.transition().duration(500).style("opacity", 0)
      $hoverLine.style("opacity", 0)
    })
  }
}

export default Tooltip
