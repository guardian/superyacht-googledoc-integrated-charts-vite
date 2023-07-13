import { contains, merge, xFormatting } from './toolbelt';
import dataTools from "../dataTools"
import ColorScale from "./colorscale"

/*
/
/ This is the data preprocessing function.
/ The ultimate goal is ...
/
*/

export function wrangle(data, chart) {

  let keys = Object.keys(data)

  let settings = {}

  settings.modules = {}

  settings.height = 0

  settings.width = 0

  settings.isMobile = null

  settings.colors = null

  settings.datum = []

  for (let key of keys) {

    if (key == "template" || key == "options" || key == "chartId" ) {

      let special_keys = Object.keys(data[key][0])

      for (let special_key of special_keys) {

        settings[special_key.replace('-', '')] = data[key][0][special_key]
      
      }

    } else {

      if (key == 'key') {

        settings.userkey = data[key]

      }

      if (key == 'data') {

        console.log(Object.keys(data[key][0]))

        let dataKeys = Object.keys(data[key][0])

        settings.keys = dataKeys

        for (let row of data[key]) {

          for (let cell of dataKeys) {

            if (row[cell] === "0" || row[cell] === "0.0") {

              row[cell] = 0

            }

            if (row[cell] === "") {

              row[cell] = null

            }

            /*
            / Handle numbers with commas
            */

            if (row[cell] && typeof row[cell] === "string"  && row[cell].includes(",")) {

              if (!isNaN(row[cell].replace(/,/g, ""))) {

                row[cell] = +row[cell].replace(/,/g, "")

              }

            }

            row[cell] = (typeof row[cell] === "string" && !isNaN(row[cell])) ? +row[cell] : row[cell]

          }
        
        }

      }

      settings[key] = data[key]

    }

  }

  let curated = Object.keys(settings)

  for (const setting of curated) {

    // Convert strings to numbers

    if (contains(['marginleft','marginright','margintop','marginbottom', 'numCols', 'height', 'x_axis_cross_y', 'maxHeight', 'baseline', 'opacity'], setting)) {

      settings[setting] = (isNaN(settings[setting])) ? settings[setting] : +settings[setting]

    }

    if (contains(['xMin','xMax','yMin','yMax', 'zMin', 'zMax'], setting)) {

      if (settings[setting] != "") {

        settings[setting] = (isNaN(settings[setting])) ? settings[setting] : +settings[setting]

      }      

    }

    // Convert booleans

    if (contains(['enableShowMore','aria', 'enableSearch', 'enableSort', 'enableScroll', 'zero_line_x', 'zero_line_y', 'lineLabelling', "autoSort", "scaleByAllMax", "hideKey"], setting)) {

      settings[setting] = (settings[setting].toLowerCase() == 'false') ? false : true

    }

    // Check that d3 scales are valid

    if (contains(['xScale, yScale, zScale'], setting)) {

      settings[setting] = (contains(['scaleLinear','scaleSqrt','scalePow','scaleLog','scaleTime','scaleSequential','scaleQuantize','scaleThreshold','scaleOrdinal','scaleBand'], settings[setting])) ? settings[setting] : 'scaleLinear'

    }

  }

  /*
  / Add any missing stuff to the dropdown object
  */

  if (settings.dropdown) {

    if (settings.dropdown.length > 0) {

      let drops = []

      for (let dropdown of settings.dropdown) {

        dropdown = merge({ "label" : "" , "values" : "" , "tooltip" : "", "colours" : "", "data" : "" }, dropdown)

        if (dropdown.label == "" && dropdown.data != "") {

          dropdown.label = dropdown.data

          if (dropdown.values == "") {

            dropdown.values = dropdown.data

          }

        }

        drops.push(dropdown)
      
      }

      settings.dropdown = drops

    }

  }


  /*
  / Set axis values if they are not specified
  */

  if (chart.axis) {

    for (const setting of chart.axis) {

      if (settings[setting.name] == "") {

        //console.log(setting.name)

        settings[setting.name] = settings.keys[setting.default]

      }
    
    }

  }


  if (chart.settings) {

    for (const setting of chart.settings) {

      settings[setting.name] = dataTools[setting.name](settings)
    
    }

  }


  /*
  / Specify if you hide null values
  */

  if (settings["breaks"]) {

    settings.hideNullValues = (settings["breaks"] != "") ? settings["breaks"] : "yes"

  }


  /*
  / Set x_axis_cross_y
  */

  if (settings["baseline"]) {

    if (settings["baseline"] != "") {

      settings["x_axis_cross_y"] = settings["baseline"]

    }

  }

  /*
  / If this is a table with graphics
  / format the graphics data
  */

  if (settings["type"] == "table") {

    if (data.userkey) {

      for (const key of data.userkey) {

        key.format = (key.format) ? key.format : [] ;

        if (contains('bar', key.format)) {

          let range = data.data.map(item => item[key.key])

          let max = d3.max(range)

          key.graphics = { type : "bar", max : max }

        }

      }

    }

  }

  /*
  / If the chart type includes an xColumn 
  / check if it is a date, a string
  */

  if (contains(['stackedbar', 'linechart', 'smallmultiples', 'stackedarea', 'bubble', 'scatterplot'], settings["type"])) {

    settings["xFormat"] = xFormatting(settings)

  }

  /*
  / change dateFormat var to xFormat... types to be datastring, number, string
  */

  if (settings["dateFormat"]) {

    console.log(`Set date format to ${settings["dateFormat"]}`)

    /*
    / Handle dates - set parseTime if it is a date... 
    / replaced all instances of dateParse with parseTime
    / Add date detection for xColumn to linechart, stacked bar, stackedarea, smallmultiples... 
    / use xFormat variable (req dateFormat and dateParse, xAxisDateFormat needs a default)
    */

    settings.parseTime = (settings["dateFormat"]!="") ? d3.timeParse(settings["dateFormat"]) : null


  }

  /*
  / Set xAxisDateFormat
  */

  if (settings["xAxisDateFormat"]) {

    if (settings["xAxisDateFormat"] != "") {

      settings["xAxisDateFormat"] = d3.timeFormat(settings["xAxisDateFormat"])

    } else {

      if (settings["dateParse"]) {

        settings["xAxisDateFormat"] = d3.timeFormat("%d %b '%y")

      }

    }

  }

  // console.log(Object.keys(settings))

  // console.log(settings)

  return settings

}