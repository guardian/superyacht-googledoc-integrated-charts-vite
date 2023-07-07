import { contains, numberFormat, commas } from './toolbelt';
import ColorScale from "./colorscale"

var currentSort = null
var lastSorted = null
var reversed = null

export function propComparator(prop) {
	var c, d;
	currentSort = (currentSort !== prop) ? prop : null;
	return function Comparator(a, b) {
	  c = (typeof a[prop].sort === "string" && !isNaN(parseFloat(a[prop].sort))) ? parseFloat(a[prop].sort.replace(/,/g, '')) : a[prop].sort;
	  d = (typeof b[prop].sort === "string" && !isNaN(parseFloat(b[prop].sort))) ? parseFloat(b[prop].sort.replace(/,/g, '')) : b[prop].sort;
	  if (("" + c).substring(0, 5) == "<svg>") {
	      if (c < d) return (currentSort !== prop) ? 1 : -1;
	      if (c > d) return (currentSort !== prop) ? -1 : 1;
	      return 0;
	  } else {
	  if (c < d) return (currentSort !== prop) ? -1 : 1;
	  if (c > d) return (currentSort !== prop) ? 1 : -1;
	  return 0;
	  }
	}
}

export function getMax(array) {
	return d3.max(array)
}

export function addCustomCSS(headerRows, rows, enableScroll, enableShowMore) {

  	var css = "",
	head = document.head || document.getElementsByTagName('head')[0],
	style = document.createElement('style'),

	css = "@media (max-width: 30em) {";

		headerRows.map((name, index) => {
			css += `.collapse-true table tbody tr td:nth-child(${index + 1}) span.header-prefix::before { content: '${name}: '; font-weight: 600; }`;
		});

	css += "}";

	css += `th {
	  position: sticky!Important;
	  top: 0;
	}`

	if (enableScroll &&  !enableShowMore && rows > 10) {

		css += `table {
		  text-align: left;
		  border-collapse: collapse; 
		  position: relative;
		}`
		
		css += `#yacht__table__wrapper {
			height: 480px;
			overflow: scroll!Important;
			touch-action: auto;
		}`

	}

	style.type = 'text/css';

	if (style.styleSheet) {
	  style.styleSheet.cssText = css;
	} else {
	  style.appendChild(document.createTextNode(css));
	}

	head.appendChild(style);

}

export async function colourize(headings, userKey, data) {

	const pantone = swatches(data, userKey)

	const highlighted = userKey.map(item => item.key)

    const formating = userKey.map(item => { 

		if (item.format) {

			if (item.format.includes(",")) {

				return item.format.split(",")

			} else {

				return [ item.format.trim() ]

			}

		} else {

			return []

		}
        
    })

    const hasDate = formating.map(item => contains(item, 'date'))

    const graphics = userKey.map(item => { 

        return (item.graphics) ? item.graphics : undefined ;
        
    })

	const colourizer = (value, index) => (!contains(headings[index], highlighted)) ? false : pantone.find(item => item.name === headings[index]).profile.get(value) ;

	const values = data.map((row) => Object.values(row))

    const getFormat = (index) => {
        return (highlighted.indexOf(headings[index]) > -1) ? formating[highlighted.indexOf(headings[index])] : [""]
    }

    const checkDate = (value, index) => {
        return (hasDate[index-1]) ? Math.floor(new Date(value).getTime() / 1000) : value
    }

    const getGraphics = (index) => {
        return (highlighted.indexOf(headings[index]) > -1) ? graphics[highlighted.indexOf(headings[index])] : null
    }

	return await values.map((row, i) => {
		return row.map((value, index) => { return { value : value, sort : checkDate(value, index), format: getFormat(index), color : colourizer(value, index), contrast : setContrast(colourizer(value, index)), graphics: getGraphics(index) }})
	})
}

function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function setContrast(colour) {

	if (colour) {

	    if (colour.indexOf('#') === 0) {

	    	colour = colour.slice(1);

	    	return invertColor(colour)

	    } else {

			let rgb = (colour.includes("#")) ? hexToRgb(colour.trim()) : colour

			if (colour.includes('rgb(')) {

				let shade = getRGB(colour)

				rgb = { r: shade[0], g: shade[1], b: shade[1] }

			}

	        return (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114) > 186
	            ? '#000000'
	            : '#FFFFFF';

	    }

	}

	return 'black'
}

function invertColor(hex, bw=true) {

    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }

    let r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) {


        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
    }

    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);

    return "#" + padZero(r) + padZero(g) + padZero(b);

}

function getRGB(str){
  let match = str.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);
  return match ? [
    +match[1],
    +match[2],
    +match[3]
  ] : [];
}

function swatches(data, userKey) {

	const swatches = userKey.map((name) => {

        var extent =  d3.extent(data.map((item) => item[name.key]));

        var swatch = {}

        swatch.name = name.key

        let domain = name.values.split(',')

        domain = (domain[0]=="") ? extent : domain

        let colours = name.colours.split(',')

        swatch.profile = new ColorScale({
								type: name.scale,
								domain: domain,
								colors: (colours.length>0) ? colours : ['grey']
							})

        return swatch

    })

    return swatches

}

export function createTable(table, data, enableSort) {

	let thead = table.createTHead()
	let row = thead.insertRow()
	for (let key of data) {
		let th = document.createElement("th")
		th.classList.add("column-header")

		let span = document.createElement("SPAN")
		let text = document.createTextNode(key)
		th.appendChild(span)
		span.appendChild(text)
		if (enableSort==="TRUE") {
			let div = document.createElement("DIV")
			div.classList.add("toggle-wrapper")
			th.appendChild(div)
		}
		row.appendChild(th)
	}
	let body = table.appendChild(document.createElement('tbody'))
	body.classList.add("table-body")
}

export function matchArray(array, value) {
  return (array.toString().toLowerCase().includes(value.toLowerCase())) ? true : false ;
}

export function styleHeaders(e) {

	const headers = document.querySelectorAll(`#yacht__table .column-header`);
	const tableEl = document.querySelector(`#yacht__table`);


	for (var h = 0; h < headers.length; h++) {

		headers[h].className = "column-header";

	}

	if (lastSorted === e.target && reversed === false) {
		e.target.className = "column-header sorted-reversed";
		reversed = true;
	} else {
		e.target.className = "column-header sorted";
		reversed = false;
	}
	if (!hasClass(tableEl, "table-sorted")) {
		tableEl.className = "table-sorted";
	}
	lastSorted = e.target;
}

function hasClass(el, cls) {
  if (!el.className) {
      return false;
  } else {
      var newElementClass = ' ' + el.className + ' ';
      var newClassName = ' ' + cls + ' ';
      return newElementClass.indexOf(newClassName) !== -1;
  }
}

export function styleCheck() {
	return (this.color && this.format[0] ==  "shading") ? `style="background-color:${this.color};text-align:center;color:${this.contrast};"` :
	(!isNaN(this.value)) ? `style="text-align:center;"` : '' ;
}

function removeZero(value) {
	console.log(value==0)
	return (value==0) ? '' : value
}

export function formatedNumber() {
	
	var value = ""

	if (this.format!=undefined && this.value != null) {

		let arr = this.format.map(item => item.trim())

		/*
		Formatting options are
		$, nozero, numberFormat, commas, bar, date, textColor, shading
		*/

		let val = this.value

		value += (contains(arr,'$')) ? '$' : '' ;

		value += (contains(arr,'numberFormat')) ? numberFormat(val) : (contains(arr,'commas')) ? commas(val) : val ;

		value = (contains(arr,'nozero')) ? removeZero(val) : value ;
		
		if (contains(arr,'bar') && this.graphics.max) {

			let percentage = 100 / this.graphics.max * this.value

			let position = (percentage < 30) ? percentage + 5 : 5 ;

			let background = (this.color) ? this.color : 'grey' //this.graphics.colour.get(value) 

			let contrast = (percentage < 20) ? 'black' : 'white'

			value = `<div class="table-bar-chart"><div class="table-bar" style="background: ${background}; margin-left: 0%; width: ${percentage}%;"></div><div class="table-bar-label" style="left:${position}%;color:${contrast}">${value}</div></div>`

	  	}

		if (contains(arr,'textColor')) {

			value = `<span style="color:${ this.color };"><strong>${value}<strong></span>`

		}

		if (contains(arr,'date')) {

			let date = new Date(value);

			var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

			value = date.toLocaleDateString("en-AU", options)   

		}

	} else {

	  value = (this.value != null) ? this.value : ""

	}

	return value

}



