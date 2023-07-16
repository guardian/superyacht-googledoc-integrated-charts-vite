export function getJson(url) {
  return fetch(`${url}`).then(r => r.json())
}

export function getTemplate(path) {
  return fetch(`${path}`).then(r => r.text())
}

export async function premerge(data) {

  const clean = JSON.parse(JSON.stringify(data))

  let templateFields = ["title", "subtitle", "footnote", "source", "tooltip"]

  if (!clean.sheets.template) {

    clean.sheets.template = [{ "title" : "" }, { "subtitle" : "" }, { "footnote" : "" }, { "source" : "" }, {"tooltip" : ""}]

  }

  let template = Object.keys(data.sheets.template[0])

  clean.sheets.template = [{}]

  if (!clean.sheets.options) {

    clean.sheets.options = [{}]

  }

  for (const item of template) {

    if (contains(templateFields, item)) {

      clean.sheets.template[0][item] = data.sheets.template[0][item]

    } else {

      if (data.sheets.template[0][item] != "") {

        clean.sheets.options[0][item] = data.sheets.template[0][item]

      }

    }
  
  }

  return clean

};

export function dodge(data, radius) {
  const radius2 = radius ** 2;
  console.log(radius2, radius)
  const circles = data
  const epsilon = 1e-3;
  let head = null, tail = null;

  // Returns true if circle ⟨x,y⟩ intersects with any circle in the queue.
  function intersects(x, y) {
    let a = head;
    while (a) {
      if (radius2 - epsilon > (a.x - x) ** 2 + (a.y - y) ** 2) {
        return true;
      }
      a = a.next;
    }
    return false;
  }

  // Place each circle sequentially.
  for (const b of circles) {

    // Remove circles from the queue that can’t intersect the new circle b.
    while (head && head.x < b.x - radius2) head = head.next;

    // Choose the minimum non-intersecting tangent.
    if (intersects(b.x, b.y = 0)) {
      let a = head;
      b.y = Infinity;
      do {
        let y1 = a.y + Math.sqrt(radius2 - (a.x - b.x) ** 2);
        let y2 = a.y - Math.sqrt(radius2 - (a.x - b.x) ** 2);
        if (Math.abs(y1) < Math.abs(b.y) && !intersects(b.x, y1)) b.y = y1;
        if (Math.abs(y2) < Math.abs(b.y) && !intersects(b.x, y2)) b.y = y2;
        a = a.next;
      } while (a);
    }

    // Add b to the queue.
    b.next = null;
    if (head === null) head = tail = b;
    else tail = tail.next = b;
  }

  return circles;
}

export function relax(data, width, height) {
    var spacing = 16;
    var dy = 2;
    var repeat = false;
    var count = 0;
    data.forEach(function(dA, i) {
        var yA = dA.labelY;
        data.forEach(function(dB, j) {
            var yB = dB.labelY;
            if (i === j) {
                return;
            }
            let diff = yA - yB;
            if (Math.abs(diff) > spacing) {
                return;
            }
            repeat = true;
            let magnitude = diff > 0 ? 1 : -1;
            let adjust = magnitude * dy;
            dA.labelY = +yA + adjust;
            dB.labelY = +yB - adjust;
            dB.labelY = dB.labelY > height ? height : dB.labelY
            dA.labelY = dA.labelY > height ? height : dA.labelY
        })
    })
    if (repeat) {
        relax(data);
    }
}

export function merge(to, from) {

  for (const n in from) {
      if (typeof to[n] != 'object') {
        to[n] = from[n];
      } else if (typeof from[n] == 'object') {
          to[n] = merge(to[n], from[n]);
      }
  }

  return to;

};

export function isWithinRange(arr, target, range=10) {
  for (let i = 0; i < arr.length; i++) {
    if (Math.abs(arr[i] - target) <= range) {
      return true;
    }
  }
  return false;
}

export function contains(a, b) {

  if (Array.isArray(b)) {
      return b.some(x => a.indexOf(x) > -1);
  }

  return a.indexOf(b) > -1;

}

export function commas(x) {

  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

}

export function getMargins(settings) {

  let margins = {
    top: settings["margintop"],
    right: settings["marginright"],
    bottom: settings["marginbottom"],
    left: settings["marginleft"]
  }

  return margins
}

export function mobileCheck() {

  var windowWidth = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
  )

  return windowWidth < 610 ? true : false
}

export function getLongestKeyLength($svg, keys, isMobile, lineLabelling) {

  if (lineLabelling) {
      d3.select("#dummyText").remove()
      const longestKey = keys.sort(function (a, b) {
          return b.length - a.length
      })[0]
      const dummyText = $svg
        .append("text")
        .attr("x", -50)
        .attr("y", -50)
        .attr("id", "dummyText")
        .attr("class", "annotationText")
        .style("font-weight", "bold")
        .style("font-size", "15px")
        .text(longestKey)
      return dummyText.node().getBBox().width
  }
  return 0
}

export function numberFormat(num) {
  if ( num > 0 ) {
      if ( num >= 1000000000 ) { 

          if ((num / 1000000000) % 1 == 0) {
              return ( num / 1000000000 ) + 'bn' 
          }
          else {
              return ( num / 1000000000 ).toFixed(1) + 'bn' 
          }
          
          }
      if ( num >= 1000000 ) { 

          if (( num / 1000000 ) % 1 == 0) {
            return ( num / 1000000 ) + 'm' 
          }  
          else {
            return ( num / 1000000 ).toFixed(1) + 'm' 
          }
          
          }
      if ( num >= 1000 ) {

          if (( num / 1000 ) % 1 == 0) {
            return ( num / 1000 ) + 'k' 
          }

          else {
            return ( num / 1000 ).toFixed(1) + 'k' 
          }
        }
      if (num % 1 != 0) { 
          return num
      } else { 
        return num }
  }
  if ( num < 0 ) {
      var posNum = num * -1;
      if ( posNum >= 1000000000 ) return [ "-" + String(( posNum / 1000000000 ).toFixed(1)) + 'bn'];
      if ( posNum >= 1000000 ) return ["-" + String(( posNum / 1000000 ).toFixed(1)) + 'm'];
      if ( posNum >= 1000 ) return ["-" + String(( posNum / 1000 ).toFixed(1)) + 'k'];
      else { return num }
  }
  return num;
}

export function mustache(template, self, parent, invert) {
  var render = mustache
  var output = ""
  var i

  function get (ctx, path) {
    path = path.pop ? path : path.split(".")
    ctx = ctx[path.shift()]
    ctx = ctx != null ? ctx : ""
    return (0 in path) ? get(ctx, path) : ctx
  }

  self = Array.isArray(self) ? self : (self ? [self] : [])
  self = invert ? (0 in self) ? [] : [1] : self
  
  for (i = 0; i < self.length; i++) {
    var childCode = ''
    var depth = 0
    var inverted
    var ctx = (typeof self[i] == "object") ? self[i] : {}
    ctx = Object.assign({}, parent, ctx)
    ctx[""] = {"": self[i]}
    
    template.replace(/([\s\S]*?)({{((\/)|(\^)|#)(.*?)}}|$)/g,
      function(match, code, y, z, close, invert, name) {
        if (!depth) {
          output += code.replace(/{{{(.*?)}}}|{{(!?)(&?)(>?)(.*?)}}/g,
            function(match, raw, comment, isRaw, partial, name) {
              return raw ? get(ctx, raw)
                : isRaw ? get(ctx, name)
                : partial ? render(get(ctx, name), ctx)
                : !comment ? new Option(get(ctx, name)).innerHTML
                : ""
            }
          )
          inverted = invert
        } else {
          childCode += depth && !close || depth > 1 ? match : code
        }
        if (close) {
          if (!--depth) {
            name = get(ctx, name)
            if (/^f/.test(typeof name)) {
              output += name.call(ctx, childCode, function (template) {
                return render(template, ctx)
              })
            } else {
              output += render(childCode, name, ctx, inverted) 
            }
            childCode = ""
          }
        } else {
          ++depth
        }
      }
    )
  }
  return output
}

export function createElement(element, attribute, inner) {
  if (typeof(element) === "undefined") {
    return false;
  }
  if (typeof(inner) === "undefined") {
    inner = "";
  }
  var el = document.createElement(element);
  if (typeof(attribute) === 'object') {
    for (var key in attribute) {
      el.setAttribute(key, attribute[key]);
    }
  }
  if (!Array.isArray(inner)) {
    inner = [inner];
  }
  for (var k = 0; k < inner.length; k++) {
    if (inner[k].tagName) {
      el.appendChild(inner[k]);
    } else {
      el.appendChild(document.createTextNode(inner[k]));
    }
  }
  return el;
}

export function getURLParams(paramName) {
  var params = ""
  if (top !== self) {
    params = window.location.search.substring(1).split("&")
  } else {
    params = window.parent.location.search.substring(1).split("&")
  }

  for (let i = 0; i < params.length; i++) {
    let val = params[i].split("=")
    if (val[0] == paramName) {
      return val[1]
    }
  }
  return null

}

export function preflight(array, chart) {

  let charts = array.map(item => item.type)

  return (chart=="") ? false :
  (contains(charts,chart)) ? chart : false ;

}

export function getMinMax(array) {

  let range =  d3.extent(array)
  let min = 0
  let max = range[1]
  let status = false

  if (range[0] < 0) {

    range[0] = Math.floor(range[0])
        
    range[1] = Math.ceil(range[1])
          
    max = (Math.abs(range[0]) > range[1]) ? Math.abs(range[0]) : range[1]

    min = -max

    status = true

  }

  return { min : min , max : max , status : status }

}

export function bufferize(min, max, buff=5) {
  const buffer = ((max - min) / 100) * buff
  return [min - buffer, max + buffer]
}

export function textPadding(d) {
  if (d.y2 > 0) {
    return 12
  } else {
    return -2
  }
}

export function textPaddingMobile(d) {
  if (d.y2 > 0) {
    return 12
  } else {
    return 4
  }
}

export function stackMin(serie) {
  return d3.min(serie, function (d) {
    return d[0]
  })
}

export function stackMax(serie) {
  return d3.max(serie, function (d) {
    return d[1]
  })
}

export function validate(value, type) {

  return (typeof value == type) ? true : false

}

export function validateString(value, array=[]) {

  let status = (typeof value == 'string') ? true : false

  if (array.length > 0) {

    status = (status && contains(array, value)) ? true : false

  }

  if (value == "") {

    status = false

  }

  return status

}

export function timeCheck(timeInterval, data, xColumn) {

  console.log(`timeInterval: ${timeInterval}`)

  if (timeInterval != "") {

    switch(timeInterval) {
        case "year" :
            return d3.timeYear
            .range(data[0][xColumn], d3.timeYear
            .offset(data[data.length - 1][xColumn], 1))
            break;
        case "day" :
            return d3.timeDay
            .range(data[0][xColumn], d3.timeDay
            .offset(data[data.length - 1][xColumn], 1))
            break;
        case "month" :
            return d3.timeMonth
            .range(data[0][xColumn], d3.timeMonth
            .offset(data[data.length - 1][xColumn], 1))
            break;
        case "week" :
            return d3.timeWeek
            .range(data[0][xColumn], d3.timeWeek
            .offset(data[data.length - 1][xColumn], 1))
            break;
        default:
          return data.map((d) => d[xColumn])
          break;
    }

  } else {

    return data.map((d) => d[xColumn])

  }

}

export function sorter(arr, value) {

      return arr.sort((a, b) => (a[value] < b[value]) ? 1 : -1).reverse()

}

export function xFormatting(settings) {

  let xData = { date : false, string : false , number : false, status : "", type : null }

  if (!settings["xColumn"]) {

    xData.status = "The xColumn is not defined"

  } else {

    if (settings["dateFormat"]) {
      console.log(settings["dateFormat"])
      xData.date = true;
      xData.type = 'date';
      xData.status = "".concat(settings.data[0][settings["xColumn"]], " from the ").concat(settings["xColumn"], " inferred as date based on dateFormat");
    }

    else if (typeof settings.data[0][settings["xColumn"]] == 'number') {

      xData.number = true

      xData.type = 'number'

      xData.status = `The ${settings["xColumn"]} contains number data`

    }

    else if (typeof settings.data[0][settings["xColumn"]] == 'string') {

      if(Date.parse(settings.data[0][settings["xColumn"]])){

        xData.date = true

        xData.type = 'date'

        xData.status = `${settings.data[0][settings["xColumn"]]} from the ${settings["xColumn"]} column is a valid date`;

      } else {

        xData.string = true

        xData.type = 'string'

        xData.status = `The ${settings["xColumn"]} contains string data`

      }

    }

  }

  console.log(xData.status)

  return xData

}
