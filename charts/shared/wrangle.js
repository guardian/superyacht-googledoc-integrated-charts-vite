import { xFormatting, capitalizeFirstLetter } from './toolbelt';
import { schema, contains, merge } from 'newsroom-dojo/dist/index.js'
//import dataTools from "../dataTools"
//import ColorScale from "./colorscale"

import dataTools from "./dt.js";
import { ColorScale } from "./colorscale.js";

import { max as d3Max } from 'd3-array';
import { timeParse as d3TimeParse, timeFormat as d3TimeFormat } from 'd3-time-format';

// Define constants for frequently used values
const SPECIAL_KEYS = ["template", "options", "chartId"];
const CONVERT_TO_NUMBER = ['marginleft','marginright','margintop','marginbottom', 'numCols', 'height', 'maxHeight', 'opacity'];
const SCALE_KEYS = ['xScale', 'yScale', 'zScale'];
const SCALE_TYPES = ['scaleLinear', 'scaleSqrt', 'scalePow', 'scaleLog', 'scaleTime', 'scaleSequential', 'scaleQuantize', 'scaleThreshold', 'scaleOrdinal', 'scaleBand'];
const BOOLEAN_KEYS = ['enableShowMore','aria', 'forceCentre','enableSearch', 'enableSort', 'enableScroll', 'zero_line_x', 'zero_line_y', 'lineLabelling', "autoSort", "scaleByAllMax", "hideKey", "beeswarm", "invertY", "breaks", "zeroLineX", "zeroLineY", "rangeFormat"];
const AXIS_TYPES = ['stackedbar', 'linechart', 'smallmultiples', 'stackedarea', 'bubble', 'scatterplot', 'lollipop', 'verticalbar', 'horizontalbar', 'horizontalgroupedbar'];

/**
 * Data preprocessing function
 * @param {Object} data - The input data object.
 * @param {Object} chart - The chart configuration object.
 * @returns {Object} - The processed settings object.
 */
export async function wrangle(data, chart) {
  const settings = initializeSettings(data);

  if (data.columns && data.data) {
    const columns = data.columns.length ? data.columns : await schema(data.data);
    settings.columns = columns;
    settings.columnMap = new Map(columns.map(d => [d.column, d]));
    console.log("---- New schema info ----", columns, "---- Ends ----");
  }

  processSettings(settings);

  if (settings.dropdown?.length) {
    settings.dropdown = settings.dropdown.map(dropdown => {
      const mergedDropdown = merge({ label: "", values: "", tooltip: "", colours: "", data: "" }, dropdown);
      if (!mergedDropdown.label && mergedDropdown.data) {
        mergedDropdown.label = mergedDropdown.data;
        if (!mergedDropdown.values) {
          mergedDropdown.values = mergedDropdown.data;
        }
      }
      return mergedDropdown;
    });
  }

  updateAxisSettings(chart, settings);
  applyChartSettings(chart, settings);

  if (settings.type === "table" && data.userkey) {
    processTableGraphics(data.userkey, settings, data);
  }

  if (contains(AXIS_TYPES, settings.type)) {
    settings.xFormat = xFormatting(settings);
  }

  processDateSettings(settings);

  console.log(Object.keys(settings), settings);
  return settings;
}

/**
 * Initializes settings from the input data.
 * @param {Object} data - The input data object.
 * @returns {Object} - The initialized settings object.
 */
function initializeSettings(data) {
  const settings = {
    modules: {},
    height: 0,
    width: 0,
    svgWidth: 0,
    svgHeight: 0,
    featuresWidth: 0,
    featuresHeight: 0,
    isMobile: null,
    colors: null,
    datum: []
  };

  Object.keys(data).forEach(key => {
    if (SPECIAL_KEYS.includes(key)) {
      Object.entries(data[key][0]).forEach(([specialKey, value]) => {
        settings[specialKey.replace('-', '')] = value;
      });
    } else {
      settings[key === 'key' ? 'userkey' : key] = data[key];
      if (key === 'data') {
        processData(data[key], settings);
      }
    }
  });

  return settings;
}

/**
 * Processes the data and updates settings.
 * @param {Array} data - The data array.
 * @param {Object} settings - The settings object to be updated.
 */
function processData(data, settings) {
  const dataKeys = Object.keys(data[0]);
  settings.keys = dataKeys;

  data.forEach(row => {
    dataKeys.forEach(cell => {
      if (row[cell] === "0" || row[cell] === "0.0") {
        row[cell] = 0;
      }
      if (row[cell] === "") {
        row[cell] = null;
      }
      if (typeof row[cell] === "string" && row[cell].includes(",") && !isNaN(row[cell].replace(/,/g, ""))) {
        row[cell] = +row[cell].replace(/,/g, "");
      }
      row[cell] = (typeof row[cell] === "string" && !isNaN(row[cell])) ? +row[cell] : row[cell];
    });
  });
}

/**
 * Processes settings by converting values to appropriate types.
 * @param {Object} settings - The settings object to be processed.
 */
function processSettings(settings) {
  Object.keys(settings).forEach(setting => {
    if (contains(CONVERT_TO_NUMBER, setting)) {
      settings[setting] = isNaN(settings[setting]) ? settings[setting] : +settings[setting];
    }

    if (contains(['xMin', 'xMax', 'yMin', 'yMax', 'zMin', 'zMax'], setting) && settings[setting] !== "") {
      settings[setting] = isNaN(settings[setting]) ? settings[setting] : +settings[setting];
    }

    if (contains(BOOLEAN_KEYS, setting)) {
      settings[setting] = settings[setting].toLowerCase() !== 'false';
    }

    if (contains(SCALE_KEYS, setting)) {
      settings[setting] = contains(SCALE_TYPES, settings[setting]) ? settings[setting] : 'scaleLinear';
    }
  });
}

/**
 * Updates axis settings based on the chart configuration.
 * @param {Object} chart - The chart configuration object.
 * @param {Object} settings - The settings object to be updated.
 */
function updateAxisSettings(chart, settings) {
  if (chart.axis) {
    chart.axis.forEach(setting => {
      if (!settings[setting.name]) {
        settings[setting.name] = settings.keys[setting.default];
      }
    });
  }
}

/**
 * Applies additional chart settings.
 * @param {Object} chart - The chart configuration object.
 * @param {Object} settings - The settings object to be updated.
 */
function applyChartSettings(chart, settings) {
  if (chart.settings) {
    chart.settings.forEach(setting => {
      settings[setting.name] = dataTools[setting.name](settings);
    });
  }
}

/**
 * Processes table graphics for the settings object.
 * @param {Array} userKeys - The user keys array.
 * @param {Object} settings - The settings object to be updated.
 * @param {Object} data - The input data object.
 */
function processTableGraphics(userKeys, settings, data) {
  userKeys.forEach(key => {
    key.format = key.format || [];
    if (contains('bar', key.format)) {
      const range = data.data.map(item => item[key.key]);
      const max = d3Max(range);
      const colors = key.colours?.includes(",") ? key.colours.split(',') : [key.colours || "red"];
      const domain = key.values?.includes(",") ? key.values.split(',') : [key.values || ""];
      const scale = key.scale || 'Linear';

      key.graphics = {
        type: "bar",
        max: max,
        colour: new ColorScale({
          type: capitalizeFirstLetter(scale),
          domain: domain,
          colors: colors
        })
      };
    }
  });
}

/**
 * Processes date settings for the settings object.
 * @param {Object} settings - The settings object to be updated.
 */
function processDateSettings(settings) {
  if (settings.dateFormat) {
    console.log(`Set date format to ${settings.dateFormat}`);
    settings.parseTime = settings.dateFormat ? d3TimeParse(settings.dateFormat) : null;
  }

  if (settings.xAxisDateFormat) {
    settings.xAxisDateFormat = settings.xAxisDateFormat ? d3TimeFormat(settings.xAxisDateFormat) : d3TimeFormat("%d %b '%y");
  }
}
