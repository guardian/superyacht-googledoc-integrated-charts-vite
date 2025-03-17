
import dataTools from "./shared/dataTools";
import ColorScale from "./shared/colorscale";
import colorPresets from "./constants/colors";
import { numberFormat, mustache, mobileCheck, setMinToMax, textPadding, textPaddingMobile, stackMin, stackMax, contains, getURLParams, getLabelFromColumn } from './shared/toolbelt';
import { addDrops } from "./shared/drops"
import Dropdown from "./shared/dropdown";
import Tooltip from "./shared/tooltip";
import { drawShowMore } from "./shared/showmore";
import  { addLabel, clickLogging } from './shared/arrows';
import Sonic from "./shared/sonic";
import { checkApp } from 'newsroom-dojo';

export default class Horizontalbar {

  constructor(settings) {

    this.settings = settings
    this.noisyChartsSetup = false
    this.sonic = null  
    this.init()

  }

  init() {
    console.log('enableshowmore',this.settings.enableShowMore)
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

        let values = data.values.split(",").map(function (value) {
           return value.trim();
        });

        this.settings.xColumn = values[0]

        this.settings.stackedhorizontal = values

        if (this.settings.tooltip != "") {

          this.tooltip.updateTemplate(data.tooltip)

        }

        this.render()

      })

    }

    this.render()

  }
  render() {
    let chart = this
    let { modules,
          type,
          colors,
          height, 
          width, 
          isMobile, 
          title, 
          subtitle, 
          source, 
          marginleft, 
          margintop, 
          marginbottom, 
          marginright, 
          tooltip, 
          xAxisLabel,
          prefix,
          suffix, 
          minX, 
          yColumn, 
          xColumn, 
          data,
          datum,
          labels, 
          userkey, 
          keys,
          forceCentre,
          lines, 
          periods, 
          enableShowMore, 
          aria, 
          colorScheme, 
          autoSort, 
          dropdown,
          xMin,
          xMax,
          xFormat,
          xAxis,
          yAxis,
          stackedhorizontal,
          parseTime,
          columns } = this.settings


          console.log( `xAxisLabel: ${xAxisLabel}`)
     

    d3.select("#graphicContainer svg").remove()

    //xColumn = stackedhorizontal[0] // Changed this so it is set by default before this module is loaded

    stackedhorizontal = stackedhorizontal.filter(d => d != 'Color')

    const chartKey = d3.select("#chartKey")

    chartKey.html("")

    colors = new ColorScale()

    isMobile = mobileCheck()

    const keyColor = dataTools.getKeysColors({
      keys: stackedhorizontal,
      userKey: userkey,
      option: { colorScheme : colorScheme }
    })

    colors.set(keyColor.keys, keyColor.colors)

    let showTotals = (contains(keys,'Color')) ? true : false 

    const columnsKey = keys.filter(d => d != "Color" && d != "keyCategory")

    let allValues = []

    data.forEach((d) => {
      for (let i = 1; i < keys.length; i++) {
        allValues.push(d[keys[i]])
      }
    })

    console.log("data", data)
    datum = JSON.parse(JSON.stringify(data))

    let wrangle = []

    datum = datum.map(d => Object.keys(d).filter((key) => contains(key, [yColumn, ...stackedhorizontal]) || key === 'Color' || key === 'keyCategory').reduce((cur, key) => { 
      
      if (contains(key, stackedhorizontal) && d[key] != null) {
        wrangle.push(Object.assign(cur, { [key]: d[key] }))
      }
      return Object.assign(cur, { [key]: d[key] })
    }, {}))

    datum = wrangle

    let set = new Set(datum.map(d => d[yColumn]))

    let barheight = Array.from(set).length;
  
    datum.forEach((d) => {
      stackedhorizontal.forEach((key, i) => {
        d[key] = (d[key] == null) ? null : +d[key]
      })
      d.Total = d3.sum(stackedhorizontal, (k) => +d[k])
      d.negative = (d3.min(stackedhorizontal, (k) => +d[k]) >= 0) ? false : true
      d.extent = d3.min(stackedhorizontal, (k) => +d[k])
    })

    if (autoSort) {
      datum = datum.sort((a, b) => d3.descending(+a.Total, +b.Total))
    }
    
    let sonicData = JSON.parse(JSON.stringify(data))

    sonicData = sonicData.map(obj => {
      delete obj.Color;
      return obj;
    });

  
    datum.forEach((d) => {
      let newData = {}
      columnsKey.forEach((key, i) => {
        newData[key] = d[key]
      })
      // sonicData.push(newData)
    })

    // console.log("sonicdata1", sonicData)
    // sonicData = sonicData.sort((a, b) => d3.ascending(+a[columnsKey[1]], +b[columnsKey[1]]))

    console.log("stack",stackedhorizontal, stackedhorizontal.length)

    width = document.querySelector("#graphicContainer").getBoundingClientRect().width - marginleft - marginright;

    height = (barheight) * 75 //+ margintop + marginbottom


    //width = width - marginleft - marginright

    const svg = d3
    .select("#graphicContainer")
    .append("svg")
    .attr("width", width + marginleft + marginright)
    .attr("height", height + margintop + marginbottom)
    .attr("id", "svg")
    .attr("overflow", "hidden")

    const features = svg
    .append("g")
    .attr("transform","translate(" + marginleft + "," + margintop + ")")

    if (stackedhorizontal.length > 1 && !showTotals) {

      stackedhorizontal.forEach((k, i) => {

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

    const x = d3.scaleLinear()
    .range([0, width - marginright - marginleft])

    const y = d3
    .scaleBand()
    .range([0, height])
    .paddingInner(0.45)
    .paddingOuter(0.45)

    y.domain(datum.map((d) => d[yColumn]))
    console.log("forceCentre", forceCentre)
    if (forceCentre) {
      const minMax = setMinToMax([...datum.map(d => d.Total), ...datum.map(d => d.extent)]) // (scaleByAllMax) ? getMinMax(allValues) : getMinMax(datum.map(d => d[1]))
      xMax = (xMax == "") ? minMax.max : xMax
      xMin = (xMin == "") ? minMax.min : xMin
    }
    
    else {
      const extent = d3.extent([...datum.map(d => d.Total), ...datum.map(d => d.extent)])  
      console.log('extent',extent)
      xMax = extent[1]
      xMin = extent[0]
    }
    

    if (minX != null) {
      if (minX != "") {
        xMin = parseInt(minX)
      }
    }

    x.domain([xMin, xMax]).nice()

    const xTicks = Math.round(width / 100)
    this.settings.audioRendering = 'categorical'

    // Don't run noisycharts in the apps until we can build a workaround
    
    let isApp = checkApp();

    if (!isApp) {
      if (!chart.noisyChartsSetup) {
        chart.sonic = new Sonic(this.settings, sonicData, x, y, colors)
        chart.sonic.addInteraction('buttonContainer', 'showAudioControls')
        chart.noisyChartsSetup = true
      }  
      
      let playButton = d3.select("#playChart")
      playButton
        .on("click", () => {sonic.playPause()})
    }

    if (isApp) {
      d3.select("#showAudioControls").remove();
      d3.select("#audioControl").remove();
    }
  
    xAxis = g => g
    .attr("transform", `translate(0,${0})`)
    .attr("class", "axisgroup") 
    .call(d3.axisTop(x).tickSizeOuter(0))
    .call(d3.axisTop(x)
    .tickSize(-height, 0, 0)
    .ticks(xTicks)
    .tickFormat((d) => {
      return numberFormat(d)
    })
    .tickPadding(10))

    yAxis = g => g
    .call(d3.axisLeft(y)) 

    features
    .append("g")
    .attr("class", "x")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)

    var layers = d3.stack()
    .offset(d3.stackOffsetDiverging)
    .keys(stackedhorizontal)(Array.from(new Set(datum.map(e => e))))

    layers.forEach(function(layer) {
      layer.forEach(function(subLayer) {
        subLayer.group = layer.key
        subLayer.groupValue = subLayer.data[layer.key]
        subLayer.total = subLayer.data.Total
        if (subLayer.data.Color) {
          subLayer.color = subLayer.data.Color
        }
        
      })
    })

    const layer = features
    .selectAll("layer")
    .data(layers, (d) => d.key)
    .enter()
    .append("g")
    .attr("class", (d) => "layer " + d.key)
    .attr("id", "features")

    layer
    .selectAll("rect")
    .attr("class", "rect")
    .data((d,i) => {
      return d
    })
    .enter()
    .append("rect")
    .style("fill", (d, i) => {
      return (d.color) ? d.color : colors.get(d.group)
    })
    .attr("x", (d) => {
      return x(d[0]) //(d[1] >= 0) ? x(0) : x(d[1])
    })
    .attr("y", (d) => {
      return y(d.data[yColumn])
    })
    .attr("class", "barPart")
    .attr("title", (d) => d.data[d.key])
    .attr("data-group", (d) => d.group)
    .attr("data-count", (d) => d.data[d.key])
    .attr("height", (d) => y.bandwidth()) // )
    .attr("width", (d) => {
      return x(d[1]) - x(d[0]) //(d.data["Total"] >= 0) ? x(d.data["Total"]) - x(0) : x(0) - x(d.data["Total"]) // x(d[1])
    })

    features
    .selectAll(".barText")
    .data(Array.from(new Set(datum.map(e => e))))
    .enter()
    .append("text")
    .attr("class", "barText")
    .attr("x", (d) => {
      return (!d.negative) ? x(0) + 5 : x(0) - 5
    })
    .attr("text-anchor",(d) => {
      return (!d.negative) ? "start" : "end"
    })
    .attr("y", (d) => y(d[yColumn]) - 5)
    .text((d) => `${d[yColumn]}`)


    // Testing for label positions
    // ?key=1BJG_8rB8nkob0O7DsNU_oBpRq-5qsixNxfosp5AVphE&location=docsdata
    // ?key=oz-2023-school-state-federal-funding-change-grouped-bar&location=yacht-charter-data
    // ?key=2023-education-school-quartiles&location=yacht-charter-data
    // ?key=1DL9_rNNg3XVKodTmVHWO1DdABBRrOKVXQ5wshSK7pGw&location=docsdata

    // ===============================
    // Constants for Label Sizing
    // ===============================
    const LABEL_BUFFER = 10;       // Buffer in pixels (formerly hardcoded as 10)
    const LABEL_CHAR_WIDTH = 6;    // Approximate pixel width per character

    /**
     * Estimate the total width of a label in pixels.
     *
     * @param {string} label - The label text.
     * @param {number} [charWidth=LABEL_CHAR_WIDTH] - The multiplier for each character.
     * @returns {number} - Estimated label width (including buffer on both sides).
     */
    function estimateLabelWidth(label, charWidth = LABEL_CHAR_WIDTH) {
      return label.length * charWidth + LABEL_BUFFER;
    }

    // *****************************************
    // Helper Functions for Bar Label Placement
    // *****************************************

    /**
     * Determine the “value” used to compute a bar’s width.
     * For stacked bars we expect d.Total or d.groupValue,
     * otherwise d.value is used.
     *
     * @param {Object} d - The data object for the bar.
     * @returns {number} - The value used to calculate the bar’s width.
     */
    function getBarValue(d) {
      console.log(d);
      return d.Total != null ? d.Total : (d.groupValue != null ? d.groupValue : d.value);
    }

    /**
     * Calculate the x-coordinate for a non-stacked bar’s label.
     *
     * The label is placed inside the bar if it fits (with a left/right buffer)
     * and outside otherwise.
     *
     * @param {Object} d          - The data object for the bar.
     * @param {Function} x        - A scale function mapping data values to pixels.
     * @param {number} labelWidth - The estimated width of the label in pixels.
     * @param {number} [buffer=LABEL_BUFFER] - The buffer space (in pixels).
     * @returns {number} - The x position for the label.
     */
    function calculateXPosition(d, x, labelWidth, buffer = LABEL_BUFFER) {
      const val = getBarValue(d);
      if (val === 0) return x(0);

      // Calculate the bar’s width in pixels (always a positive value).
      const barWidth = Math.abs(x(val) - x(0));
      const fitsInside = (labelWidth) <= barWidth;

      if (val > 0) {
        // For positive bars, if the label fits, align it inside (flush with the right edge).
        return fitsInside ? x(val) - buffer : x(val) + buffer;
      } else {
        // For negative bars, if the label fits, align it inside (flush with the left edge).
        return fitsInside ? x(val) + buffer : x(val) - buffer;
      }
    }

    /**
     * Calculate the text-anchor for a non-stacked bar’s label.
     *
     * If the label fits within the bar:
     *   - "end" for positive bars (right-aligned)
     *   - "start" for negative bars (left-aligned)
     * Otherwise, the anchor is reversed so that the label is drawn outside.
     *
     * @param {Object} d          - The data object for the bar.
     * @param {Function} x        - Scale function mapping data values to pixels.
     * @param {number} labelWidth - The estimated label width.
     * @param {number} [buffer=LABEL_BUFFER] - The buffer in pixels.
     * @returns {string} - "start", "end", or "middle".
     */
    function calculateTextAnchor(d, x, labelWidth, buffer = LABEL_BUFFER) {
      const val = getBarValue(d);
      if (val === 0) return "middle";

      const barWidth = Math.abs(x(val) - x(0));
      const fitsInside = (labelWidth) <= barWidth;

      if (val > 0) {
        return fitsInside ? "end" : "start";
      } else {
        return fitsInside ? "start" : "end";
      }
    }

    /**
     * Decide the text color for a non-stacked bar’s label.
     *
     * The assumption is that if the label fits inside the bar, it should contrast
     * with the bar’s color (e.g. white text on a dark bar).
     *
     * @param {Object} d          - The data object for the bar.
     * @param {Function} x        - Scale function mapping data values to pixels.
     * @param {number} labelWidth - The estimated label width.
     * @param {number} [buffer=LABEL_BUFFER] - Buffer in pixels.
     * @returns {string} - "white" or "black"
     */
    function calculateTextColor(d, x, labelWidth, buffer = LABEL_BUFFER) {
      const val = getBarValue(d);
      if (val === 0) return "black";

      const barWidth = Math.abs(x(val) - x(0));
      const fitsInside = (labelWidth) <= barWidth;
      return fitsInside ? "white" : "black";
    }

    // --------------------------------------------------
    // Stacked Bar Label Functions
    // --------------------------------------------------

    /**
     * Calculate the x-coordinate for a stacked bar’s label.
     *
     * Uses d.Total (or d.groupValue) for the cumulative value.
     *
     * @param {Object} d          - The data object for the stacked bar.
     * @param {Function} x        - Scale function mapping data values to pixels.
     * @param {number} labelWidth - The estimated label width.
     * @param {number} [buffer=LABEL_BUFFER] - Buffer in pixels.
     * @returns {number} - The computed x position for the label.
     */
    function calculateXPositionStacked(d, x, labelWidth, buffer = LABEL_BUFFER) {
      if (d.Total > 0 || d.groupValue > 0) {
        const barEnd = x(d.Total || d[1]);
        return (labelWidth < barEnd) ? barEnd - buffer : barEnd + buffer;
      } else if (d.Total < 0 || d.groupValue < 0) {
        const barStart = x(d.Total || d[0]);
        return (x(0) - barStart > labelWidth) ? barStart - buffer : x(0) - buffer;
      }
      return x(0);
    }

    /**
     * Calculate the text-anchor for a stacked bar’s label.
     *
     * @param {Object} d          - The data object for the stacked bar.
     * @param {Function} x        - Scale function mapping data values to pixels.
     * @param {number} labelWidth - The estimated label width.
     * @returns {string} - "start" or "end".
     */
    function calculateTextAnchorStacked(d, x, labelWidth) {
      if (d.Total > 0 || d.groupValue > 0) {
        return (labelWidth < x(d.Total || d[1])) ? "end" : "start";
      } else if (d.Total < 0 || d.groupValue < 0) {
        return (x(0) - x(d.Total || d[0]) > labelWidth) ? "end" : "start";
      }
      return "start";
    }

    /**
     * Decide the text color for a stacked bar’s label.
     *
     * @param {Object} d          - The data object for the stacked bar.
     * @param {Function} x        - Scale function mapping data values to pixels.
     * @param {number} labelWidth - The estimated label width.
     * @returns {string} - "white" if the label fits, otherwise "black".
     */
    function calculateTextColorStacked(d, x, labelWidth) {
      if ((d.Total > 0 || d.groupValue > 0) && (x(d.Total || d[1]) - x(0) > labelWidth)) {
        return "white";
      } else if ((d.Total < 0 || d.groupValue < 0) && (x(0) - x(d.Total || d[0]) > labelWidth)) {
        return "white";
      }
      return "black";
    }

    /**
     * Build the label text using an optional prefix, a formatted number, and a suffix.
     *
     * @param {Object} d           - The data object for the bar.
     * @param {string} prefix      - A prefix to display before the number.
     * @param {Function} numberFormat - A function to format the number.
     * @param {string} suffix      - A suffix to display after the number.
     * @returns {string} - The formatted label.
     */
    function calculateLabel(d, prefix, numberFormat, suffix) {
      return `${prefix} ${numberFormat(d.Total || d.data[d.group])} ${suffix}`.trim();
    }

    // *****************************************
    // Main Rendering Logic
    // *****************************************

    if (showTotals) {
      // When each datum represents one bar.
      layer
        .selectAll(".barNumber")
        .data(datum)
        .enter()
        .append("text")
        .attr("class", "barNumber")
        .style("font-weight", "bold")
        .attr("x", (d) => {
          const label = calculateLabel(d, prefix, numberFormat, suffix);
          // Use the helper to estimate label width.
          const labelWidth = estimateLabelWidth(label);
          return (d.total == d.groupValue)
            ? calculateXPosition(d, x, labelWidth)
            : calculateXPositionStacked(d, x, labelWidth);
        })
        .attr("text-anchor", (d) => {
          const label = calculateLabel(d, prefix, numberFormat, suffix);
          const labelWidth = estimateLabelWidth(label);
          return (d.total == d.groupValue)
            ? calculateTextAnchor(d, x, labelWidth)
            : calculateTextAnchorStacked(d, x, labelWidth);
        })
        .style("fill", (d) => {
          const label = calculateLabel(d, prefix, numberFormat, suffix);
          const labelWidth = estimateLabelWidth(label);
          return (d.total == d.groupValue)
            ? calculateTextColor(d, x, labelWidth)
            : calculateTextColorStacked(d, x, labelWidth);
        })
        .attr("y", (d) => y(d[yColumn]) + (y.bandwidth() / 2 + 5))
        .text((d) => calculateLabel(d, prefix, numberFormat, suffix));
    } else {
      // When the data is in an array format (typically for stacked bars).
      layer
        .selectAll(".barNumber")
        .data((d) => d)
        .enter()
        .append("text")
        .attr("class", "barNumber")
        .style("font-weight", "bold")
        .attr("x", (d) => {
          const label = calculateLabel(d, prefix, numberFormat, suffix);
          // Consistently estimate the label width.
          const labelWidth = estimateLabelWidth(label);
          return (d.total == d.groupValue)
            ? calculateXPosition(d, x, labelWidth)
            : calculateXPositionStacked(d, x, labelWidth);
        })
        .style("fill", (d) => {
          const label = calculateLabel(d, prefix, numberFormat, suffix);
          const labelWidth = estimateLabelWidth(label);
          return (d.total == d.groupValue)
            ? calculateTextColor(d, x, labelWidth)
            : calculateTextColorStacked(d, x, labelWidth);
        })
        .attr("y", (d) => y(d.data[yColumn]) + (y.bandwidth() / 2 + 5))
        .attr("text-anchor", (d) => {
          const label = calculateLabel(d, prefix, numberFormat, suffix);
          const labelWidth = estimateLabelWidth(label);
          return (d.total == d.groupValue)
            ? calculateTextAnchor(d, x, labelWidth)
            : calculateTextAnchorStacked(d, x, labelWidth);
        })
        .text((d) => {
          const label = calculateLabel(d, prefix, numberFormat, suffix);
          const barWidth = x(d[1]) - x(d[0]);
          // Only display the label if the bar is wide enough.
          if (stackedhorizontal.length > 1 && barWidth < estimateLabelWidth(label)) {
            return " ";
          }
          return label;
        });
    }


    // Draws a solid line at zero

    features.append('line')
        .style("stroke", "#767676")
        .style("stroke-width", 1)
        .attr("x1", x(0))
        .attr("y1", 0)
        .attr("x2", x(0))
        .attr("y2", height); 

  

    if (this.settings.tooltip != "") {

      this.tooltip.bindEvents(
        d3.selectAll(".barPart"),
        width,
        height + margintop + marginbottom
      )

    }

    if (xAxisLabel != "") {

      features
        .append("text")
        .attr("x", width - marginright)
        .attr("y", setXLabelPosition(margintop))
        .attr("fill", "#767676")
        .attr("text-anchor", "end")
        .text(xAxisLabel)

    }

    function setXLabelPosition(mt) {
      return  mt < 34 ? 6 : - (mt - 10)
    }

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
    		addLabel(svg, config, width + marginleft + marginright, height + margintop + marginbottom, {
    			"left": marginleft,
    			"right": marginright,
    			"top": margintop,
    			"bottom": marginbottom
    		}, clickLoggingOn)
    	})
    }


  }

}
