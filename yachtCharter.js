import { getJson, getTemplate, premerge, merge, contains, mustache, preflight } from './charts/shared/toolbelt';
import { wrangle } from './charts/shared/wrangle';

d3.selection.prototype.moveToBack = function() {  
    return this.each(function() { 
        var firstChild = this.parentNode.firstChild; 
        if (firstChild) { 
            this.parentNode.insertBefore(this, firstChild); 
        } 
    });
};

export class yachtCharter {

  constructor(key, location) {

    this.setUp(key, location)

  }

  async setUp(key, location) {


    const myChart = "" // Leave it blank or enter a chart type

    /*
    horizontalbar -
    horizontalgroupedbar - (Was formerlly groupedbar)
    linechart -
    verticalbar (Was formerlly stackedbar)
    stackedarea
    scatterplot
    smallmultiples -
    table
    textable
    lollipop
    bubble
    */

    this.url = (import.meta.env.MODE == 'development') ? '/' : 'https://interactive.guim.co.uk/embed/superyacht/'

    this.charts  = await this.setChartType()

    this.chartTypes = this.charts.flatMap(item => item.names)

    const testing = (window.location.hostname === "localhost") ? preflight(this.charts, myChart) : false ;
    console.log("testing", testing)
    if (key != null && !testing) {

      this.getData(location, key)

    } else if (testing) {

      this.testing(testing)

    }

  }

  async getData(location, key) {

    let data  = await getJson(`https://interactive.guim.co.uk/${location}/${key}.json`)

    this.googledoc = await premerge(data)

    this.type = false

    let type = (this.googledoc.sheets.chartId[0].type == undefined) ? false : this.googledoc.sheets.chartId[0].type

    if (type && contains(this.chartTypes, type)) {

      let chart = this.charts.find(d => contains(d.names, type))

      this.type = chart.type

      this.defaults = await getJson(`${this.url}json/${this.type}.json`)

      this.data = merge(this.defaults, this.googledoc)

      if (this.data.sheets.template[0].title != "") {

        document.title = `Chart: ${this.data.sheets.template[0].title}`

      }

      this.loadTemplate()

    } else {

      console.log(`The chart type has not been defined`)

    }

  }

  async setChartType() {

    return await getJson(`${this.url}types/charts.json`)

  }

  async loadTemplate() {

    this.data.sheets.template[0].pathway = ""

    const templateHtml = await getTemplate(`${this.url}templates/${this.type}.html`)

    document.querySelector("#app").innerHTML = mustache(templateHtml, this.data.sheets.template[0])

    this.settings = await wrangle(this.data.sheets, this.charts.find(chart => chart.type == this.type).config)

    console.log("Import chart")
    
    import(`${this.url}charts/${this.type}${(this.url=='/')?'.mjs':'.js'}`).then((chartModule) => { 

      /* @vite-ignore */

      let chart = new chartModule.default(this.settings) 

      window.addEventListener("resize", () => { clearTimeout(document.body.data), document.body.data = setTimeout( () => chart.render(), 800)});
      
    })

  }

  async testing(chart) {

    if (contains(this.chartTypes, chart)) {

      console.log(`Testing the ${chart} chart`)

      this.type = chart

      let data = await getJson(`${this.url}testing/${chart}.json`)

      this.googledoc = await premerge(data)

      this.defaults = await getJson(`${this.url}json/${this.type}.json`)

      this.data = merge(this.defaults, this.googledoc)

      this.loadTemplate()

    } else {

      console.log(`You have not specified a valid chart type`)

    }

  }

}