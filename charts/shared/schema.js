import { timeParse, timeFormat } from 'd3-time-format';
const regexNumFormats = /,|%|[$\xA2-\xA5\u058F\u060B\u09F2\u09F3\u09FB\u0AF1\u0BF9\u0E3F\u17DB\u20A0-\u20BD\uA838\uFDFC\uFE69\uFF04\uFFE0\uFFE1\uFFE5\uFFE6]/g;
const regexCurrencies = /[$\xA2-\xA5\u058F\u060B\u09F2\u09F3\u09FB\u0AF1\u0BF9\u0E3F\u17DB\u20A0-\u20BD\uA838\uFDFC\uFE69\uFF04\uFFE0\uFFE1\uFFE5\uFFE6]/g;

/**
 * Analyzes json data and generates a schema to make generating graphics, charts and tables from the data a bit easier.
 *
 * @param {Array} data - The input data array of objects.
 * @returns {Object} - The generated schema containing column names and data types, as well as useful info relating to the column (min, max values, date format and that kind of thing).
 */
export async function schema(data) {
    let dataTableRaw = {
        rows: [], // Data rows
        cols: []  // Column names
    };

    // Get column names from the first object in the data array
    dataTableRaw.head = Object.keys(data[0]);
    dataTableRaw.rows = convertJSONToArrayOfRows(data);
    dataTableRaw.cols = swapArray(dataTableRaw.rows);
    dataTableRaw.body = dataTableRaw.rows.slice(1);

    const { cols, rows } = dataTableRaw;

    let dataTableDraw = {};

    // Analyze data types for columns ... This is where the magic happens
    dataTableDraw.type = await getDataTypesForColumns(cols);

    return processJsonData({
        ...dataTableRaw,
        ...dataTableDraw
    })
}

/**
 * Analyzes data and identifies its types.
 *
 * @param {Array|string} dataArr - The input data array or string.
 * @param {string} src - The source of the data, typically "body".
 * @returns {Object} - The analysis of the data, including identified types and formats.
 */
export function getDataTypeAnalysis(dataArr = "", src) {

  let data = { types: [] };
  let dataClean = src === "body" ? dataArr.filter(data => data) : dataArr;

  /* Date format analysis */
  const dataDate = getDateAnalysis(dataClean);
  if (dataDate.valid) {
    data.types.push("date");
  }

  /* Number format analysis */
  const dataNumber = getNumberAnalysis(dataClean);

  if (dataNumber.valid) {
    data.types.push("number");
  }

  /* String format analysis */
  if (!dataNumber.format && data.types.join() !== "number") {
    const uniqueLen = uniqueArray(dataClean).length;
    const hasRepeat = dataClean.length !== uniqueLen;
    data.types.push("string");
  }

  // Data type priority: 1. date -> 2. number -> 3. string*
  data.types.sort();
  return data;
}

/**
 * Removes duplicates from an array.
 *
 * @param {Array} arr - The input array.
 * @returns {Array} - The array with duplicates removed.
 */
function uniqueArray(arr) {
  return arr.filter((d, i) => i === arr.indexOf(d));
}

/**
 * Analyzes the format of numeric data.
 *
 * @param {Array} data - The input data array.
 * @returns {Object} - The analysis of the numeric data.
 */
function getNumberAnalysis(data) {

  // Map through data to handle currency and empty values
  let values = data
    .map(d => {
      // Remove currency symbols
      if (typeof d === 'string') {
        d = d.replace(regexNumFormats, "");
      }
      // If value is empty, treat it as NaN
      if (d === "") {
        return NaN;
      }
      return d;
    })
    .filter(d => !isNaN(d)) // Filter out non-number values
    .map(d => parseFloat(d)); // Convert remaining string values to numbers

  // Check if all non-empty values are numbers
  let isNumber = values.length === data.filter(d => d !== "").length;

  return {
    valid: isNumber,
    values: values
  };
}

export function getNumberFormatting(data) {
    
  let values = getNumberAnalysis(data).values

  return {
    min : Math.min(...values),
    max : Math.max(...values),
    scale : determineD3ScaleType(values),
    hasEmptyValues : values.length == data.length ? false : true
  };
}

const formatList = [
  "%d-%b-%y", "%d %b %Y", "%d %b", "%d-%B-%y", "%d %B %Y", "%d %B",
  "%Y-%m-%d", "%Y-%m-%dT%H:%M:%S%Z", "%m/%d/%y %H:%M", "%m/%d/%y %I:%M %p",
  "%H:%M:%S", "%b-%y", "%b %y", "%Y %b", "%b %Y", "%B-%y", "%B %y",
  "%Y %B", "%B %Y", "%Y-%y", "%Y/%y", "%b", "%B"
];

const formatSp1 = [
  "%m/%d/%y", "%m/%d/%Y"
];

/**
 * Analyzes the format of date data.
 *
 * @param {Array} data - The input data array.
 * @returns {Object} - The analysis of the date data.
 */
function getDateAnalysis(data) {
  const dateFormat =
    testDateFormatSp1(data) ||
    testDateFormatSp2(data) ||
    testDateFormats(data, formatList) ||
    testDateFormatSp3(data) ||
    testDateFormatSp4(data);

  return {
    valid: !!dateFormat
  };
}

export function getDateFormatting(data) {
  const dateFormat =
    testDateFormatSp1(data) ||
    testDateFormatSp2(data) ||
    testDateFormats(data, formatList) ||
    testDateFormatSp3(data) ||
    testDateFormatSp4(data);

  const dateHasDay = dateFormat.includes("%d") || dateFormat.includes("%H");

  return {
    dateFormat: dateFormat,
    hasDay: dateHasDay,
    scale : determineD3ScaleType(data)
  };
}


/**
 * Tests multiple date formats.
 *
 * @param {Array} data - The input data array.
 * @param {Array} formats - The list of formats to test.
 * @returns {string} - The matched date format.
 */
function testDateFormats(data, formats) {
  let dateParser;
  let dateFormat = formats.find(f => {
    dateParser = timeParse(f);
    return dateParser(String(data[0])); // Convert to string for parsing
  });

  return dateFormat && data.every(d => dateParser(String(d))) ? dateFormat : "";
}

/**
 * Tests specific date formats (sp1).
 *
 * @param {Array} data - The input data array.
 * @returns {string} - The matched date format.
 */
function testDateFormatSp1(data) {
  let format = testDateFormats(data, formatSp1);
  if (format) {
    const isMonthFirst = data.every(d => typeof d === 'string' && d.split("/")[0] <= 12);
    const isDaySecond = data.some(d => typeof d === 'string' && d.split("/")[1] > 12);
    format = isMonthFirst && isDaySecond ? format : "%d/%m/" + format.slice(-2);

    if (isMonthFirst && !isDaySecond) console.warn("Format unclear!!!");
  }
  return format ? format : "";
}

/**
 * Tests specific date formats (sp2).
 *
 * @param {Array} data - The input data array.
 * @returns {string} - The matched date format.
 */
function testDateFormatSp2(data) {
  const format = "%Y";
  const isYear = testDateFormats(data, [format]) === format;
  const is4Digits = data.every(d => typeof d === 'string' && d.length === 4);
  return isYear && is4Digits ? format : "";
}

/**
 * Tests specific date formats (sp3).
 *
 * @param {Array} data - The input data array.
 * @returns {string} - The matched date format.
 */
function testDateFormatSp3(data) {
  const isSp3 = data.every(d => typeof d === 'string' && (d[0] === "Q" || d[5] === "Q") && d.length === 7);
  const dataYear = data.map(d => typeof d === 'string' ? d.replace(/Q([1-4])/g, "").trim() : d);
  const isYear = testDateFormats(dataYear, ["%Y"]) === "%Y";
  return isSp3 && isYear ? "Q*" : "";
}

/**
 * Tests specific date formats (sp4).
 *
 * @param {Array} data - The input data array.
 * @returns {string} - The matched date format.
 */
function testDateFormatSp4(data) {
  const format = "%Y%m%d";
  const isYmd = testDateFormats(data, [format]) === format;
  const isMonth = data.every(ymd => typeof ymd === 'string' && parseInt(ymd.slice(4, 6), 10) >= 1 && parseInt(ymd.slice(4, 6), 10) <= 12);
  const isDay = data.every(ymd => typeof ymd === 'string' && parseInt(ymd.slice(6), 10) >= 1 && parseInt(ymd.slice(6), 10) <= 31);
  return isYmd && isMonth && isDay ? format : "";
}


/**
 * Converts dates to scale values.
 *
 * @param {Array} dates - The input dates array.
 * @param {string} format - The date format.
 * @param {boolean} hasDay - Indicates if the date has a day component.
 * @param {boolean} [isEditor=false] - Indicates if the function is used in an editor context.
 * @returns {Array} - The scale values of the dates.
 */
export function getDateScaleValues(dates, format, hasDay, isEditor = false) {
  let parser;
  const getDateParsed = parser => dates.map(d => parser(d));

  switch (true) {
    case ["%Y"].includes(format):
      return dates.map(d => +d);

    case ["Q*"].includes(format): {
      const indexQ = dates[0].indexOf("Q");
      return dates.map(d => +(d.replace(/Q([1-4])/g, "").trim()) + ((+d[indexQ + 1]) - 1) * 0.25);
    }

    case ["%Y-%y", "%Y/%y"].includes(format):
      return dates.map(d => +d.slice(0, 4));

    case ["%b", "%B"].includes(format):
      parser = timeParse(!isEditor ? format : "%b");
      return getDateParsed(parser).map(d => d.getMonth());

    case !hasDay:
      parser = timeParse(!isEditor ? format : "%b %Y");
      return getDateParsed(parser).map(d => d.getFullYear() + d.getMonth() / 12);

    default:
      parser = timeParse(format);
      return getDateParsed(parser);
  }
}

/**
 * Converts numeric date values to text.
 *
 * @param {number} value - The numeric date value.
 * @param {string} format - The date format.
 * @param {boolean} hasDay - Indicates if the date has a day component.
 * @returns {string|null} - The formatted date text.
 */
export function dateNumToTxt(value, format, hasDay) {
  const year = value.toString().split(".")[0];
  const deci = value % 1; // Get decimal portion
  let date, month, toText;

  switch (true) {
    case ["%Y"].includes(format):
      return value.toString();

    case ["Q*"].includes(format): {
      const quad = (value % 1) * 4 + 1;
      return "Q" + quad + " " + year;
    }

    case ["%Y-%y", "%Y/%y"].includes(format):
      return value + "-" + (value + 1).toString().slice(-2);

    case ["%b", "%B"].includes(format):
      date = new Date(2017, value);
      toText = timeFormat("%b");
      return toText(date);

    case !hasDay:
      month = Math.round(parseFloat(deci * 12));
      date = new Date(year, month || 0);
      toText = timeFormat("%b %Y");
      return toText(date);

    default:
      return null;
  }
}

/**
 * Determines the appropriate date format for a given domain.
 *
 * @param {Array} domain - The date domain.
 * @returns {string} - The appropriate date format.
 */
export function getDateTextFormat(domain) {
  const diffYear = domain[1].getFullYear() - domain[0].getFullYear();
  const diffMonth = domain[1].getMonth() - domain[0].getMonth();
  const diffDay = domain[1].getDate() - domain[0].getDate();
  const diffHour = domain[1].getHours() - domain[0].getHours();

  switch (true) {
    case diffYear > 4:
      return "%Y";
    case diffYear > 0:
      return "%b %Y";
    case diffMonth > 4:
      return "%b";
    case diffMonth > 0:
      return "%d %b";
    case diffDay > 0:
      return "%d %I%p";
    case diffHour > 0:
      return "%H:%M";
    default:
      console.error("A new time format is required!");
      return "";
  }
}

export function getStringFormatting(data) {

    return {
      hasRepeat: hasDuplicates(data),
      longest: getLongestStringLength(data),
      scale : determineD3ScaleType(data)
    };

}

/**
 * Returns the length of the longest string in an array of strings.
 *
 * @param {string[]} array - The array of strings.
 * @returns {number} - The length of the longest string in the array.
 */
function getLongestStringLength(array) {
    if (array.length === 0) {
        return 0;
    }

    let maxLength = 0;

    for (const str of array) {
        if (str.length > maxLength) {
            maxLength = str.length;
        }
    }

    return maxLength;
}

/**
 * Checks if an array of strings contains duplicates.
 *
 * @param {string[]} array - The array of strings.
 * @returns {boolean} - True if the array contains duplicates, false otherwise.
 */
function hasDuplicates(array) {
    const seen = new Set();

    for (const item of array) {
        if (seen.has(item)) {
            return true;
        }
        seen.add(item);
    }

    return false;
}

/**
 * Determines the appropriate D3 scale type based on the provided dataset.
 * @param {Array} data - The dataset to be analyzed.
 * @returns {string} - The determined scale type or an error message.
 */
export function determineD3ScaleType(data) {
  // Check if the data is a valid non-empty array
  if (!Array.isArray(data) || data.length === 0) {
    return 'Invalid data';
  }

  const sample = data[0];
  const allNumbers = data.every(d => typeof d === 'number');
  const allDates = data.every(d => d instanceof Date);
  const hasNegative = data.some(d => d < 0);
  const distinctValues = new Set(data).size;

  // Rule for Time Data
  if (allDates) {
    return "scaleTime";
  }

  // Rule for Numerical Data
  if (allNumbers) {
    // Log scale cannot handle negative values
    if (hasNegative) {
      return "scaleLinear";
    }
    
    const max = Math.max(...data);
    const min = Math.min(...data);

    // Use log scale for wide range values
    if (max / min > 1000) {
      return "scaleLog";
    }
    
    // Use linear scale as a default for numerical data
    return "scaleLinear";
  }

  // Rule for Categorical Data
  if (typeof sample === 'string' || !allNumbers) {
    // If the dataset is small and distinct, use ordinal scale
    if (distinctValues === data.length) {
      return "scaleOrdinal";
    }
    
    // Use band scale for ordinal data with repetition
    return "scaleBand";
  }

  // Fallback if data type is not recognized
  return "Unknown scale type";
}

/**
 * Processes the given JSON data and returns a schema
 *
 * @param {Object} jsonData - The input JSON data.
 * @returns {Array} - An array of objects with keys: column, list, and format.
 */
export function processJsonData(jsonData) {
  const { head, type, rows, body } = jsonData;
  
  // Initialize the result array
  const result = head.map((column, index) => {

    return {
      column,
      index,
      label : column,
      dataType: type[index].list,
      format: type[index].format
    };
  });

  return result;
}

/**
 * Sorts a JSON array based on a specified column order.
 * 
 * @param {Array<Object>} jsonArray - The array of JSON objects to be sorted.
 * @param {Array<string>} columnOrder - The array of column names defining the desired order.
 * @returns {Array<Object>} - The sorted JSON array with updated index values, or the original array if the validation fails.
 */
export function sortJsonByColumnOrder(jsonArray, columnOrder) {
  // Check if the number of items matches
  if (jsonArray.length !== columnOrder.length) {
    return jsonArray;
  }

  // Extract columns from jsonArray
  const jsonColumns = jsonArray.map(item => item.column);

  // Check if columns match the columnOrder exactly
  const columnsMatch = columnOrder.every(column => jsonColumns.includes(column));

  // If columns do not match, return the original jsonArray
  if (!columnsMatch) {
    return jsonArray;
  }

  // Sort jsonArray based on the columnOrder
  const sortedArray = columnOrder.map(columnName => {
    return jsonArray.find(item => item.column === columnName);
  });

  // Update the index values in the sorted array
  sortedArray.forEach((item, index) => {
    item.index = index;
  });

  // Return the sorted array
  return sortedArray;
}

/**
 * Gets the data types for each column.
 *
 * @param {Array} cols - The columns array.
 * @returns {Array} - An array of objects containing data types and formatters for each column.
 */
const getDataTypesForColumns = async (cols) => cols.map((col, columnIndex) => {
    let dataTypesAndFormats = getDataTypeAnalysis(col.slice(1), "body");

    let listOfDataTypes = dataTypesAndFormats.types;

    // If this is not the first column, remove date from the possible types
    // To avoid misinterpreting a numerical value that looks like a date, e.g., 1998
    if (columnIndex > 0) {
        listOfDataTypes = listOfDataTypes.filter(dataType => dataType !== "date");
    }

    // Get the type with the highest precedence and its formatter
    let probableDataType = listOfDataTypes[0];

    let formatter = { status : false } //dataTypesAndFormats[probableDataType];

    if (probableDataType == 'number') {
        formatter = getNumberFormatting(col.slice(1))
    }

    if (probableDataType == 'string') {
        formatter = getStringFormatting(col.slice(1))
    }

    if (probableDataType == 'date') {
        formatter = getDateFormatting(col.slice(1))
    }

    // Return all possible types and the formatter for the type with the highest precedence
    return { list: listOfDataTypes, format : { ...formatter } };
});


/**
 * Converts a JSON array of objects to an array of rows.
 *
 * @param {Array} jsonData - The input JSON data.
 * @returns {Array} - An array of rows where the first row contains column names.
 */
function convertJSONToArrayOfRows(jsonData) {
    // Check if jsonData is not empty and is an array
    if (!jsonData || !Array.isArray(jsonData) || jsonData.length === 0) return [];

    // Extract column names from the first object (assuming all objects have the same keys)
    const columnNames = Object.keys(jsonData[0]);

    // Create an array of rows, including the column names as the first row
    const rows = jsonData.map(obj => 
        columnNames.map(colName => obj[colName])
    );

    // Optionally, add column names as the first row
    rows.unshift(columnNames);

    return rows;
}

/**
 * Swaps the rows and columns of a 2D array.
 *
 * @param {Array} arr - The input 2D array.
 * @returns {Array} - The transposed 2D array.
 */
function swapArray(arr) {
    return arr[0].map((col, i) => arr.map(row => row[i]));
}
