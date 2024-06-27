import { scaleLinear, scaleThreshold, scaleQuantile, scaleQuantize, scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import colorPresets from './colors';

export class ColorScale {
  constructor(options) {
    const colorPreset = colorPresets["guardian"]
    const isString = typeof options === "string"
    const getProp = (p) => (!options || isString ? null : options[p])
    const type = options ? (isString ? options : options.type) : "ordinal"
    const domain = getProp("domain")
    const colors = getProp("colors")
    this.divisor = getProp("divisor")

    switch (type) {
      case "linear":
        this.cScale = scaleLinear().range(colorPreset)
        break

      case "threshold":
        this.cScale = scaleThreshold().range(colorPreset)
        break

      case "quantile":
        this.cScale = scaleQuantile().range(colorPreset)
        break

      case "quantize":
        this.cScale = scaleQuantize().range(colorPreset)
        break

      case "ordinal":
      default:
        this.cScale = scaleOrdinal().range(colorPreset)
    }

    this.set(domain, colors)
  }

  get(key) {
    const k = this.divisor ? key / this.divisor : key
    return this.cScale(k)
  }

  /***
  - domain
  - colors: string name of the d3 colour scheme OR array of colours
  - reference for d3 schemes available here: https://github.com/d3/d3-scale-chromatic
-------------*/
  set(domain, colors) {
    let colorSet = false
    let range = null

    if (typeof colors === "string") {
      if (colorPresets[colors]) {
        range = colorPresets[colors]
        colorSet = true
      } else if (schemeCategory10[colors]) {
        range = schemeCategory10[colors]
        colorSet = true
      } else {
        console.error(
          `${colors} is not part of the color presets or d3 scale chromatic colour scheme`
        )
      }
    }

    if (Array.isArray(colors) && colors.length > 0) {
      range = colors
      colorSet = true
    }

    if (colorSet) {
      this.cScale.range(range)
    }

    if (domain && domain.length > 0) {
      this.cScale.domain(domain)
    }
  }
}
