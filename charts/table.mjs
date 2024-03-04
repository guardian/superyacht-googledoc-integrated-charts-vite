
import { mustache } from './shared/toolbelt';
import { createTable, addCustomCSS, propComparator, styleHeaders, colourize, matchArray, styleCheck, formatedNumber, getMax } from './shared/table';
//import dataTools from "./dataTools"
import ColorScale from "./shared/colorscale"
import { drawShowMore } from "./shared/showmore"
const template = `{{#rows}}
    <tr>
        {{#item}}
            <td {{#styleCheck}}{{/styleCheck}} class="column"><div class="wrap"><span class="header-prefix"></span><span>{{#formatedNumber}}{{/formatedNumber}}</span></div></td>
        {{/item}}
    </tr>
{{/rows}}`;

export default class Table {

  constructor(settings) {

    this.settings = settings

    this.init()

  }

  init() {

    drawShowMore(this.settings.enableShowMore)  

    addCustomCSS(this.settings.keys, this.settings.data.length, this.settings.enableScroll, this.settings.enableShowMore)

    this.render()

  }

  render() {

    let { modules, 
          height, 
          width, 
          isMobile, 
          colors, 
          datum, 
          title, 
          subtitle, 
          footnote, 
          source, 
          data, 
          keys, 
          labels, 
          userkey, 
          type, 
          enableSearch, 
          enableSort, 
          enableShowMore, 
          enableScroll, 
          aria, 
          dropdown } = this.settings

    const table = document.querySelector(`#yacht__table`)

    const searchEl = document.querySelector(`#search-field`);

    table.innerHTML = ""

    createTable(table, keys, enableSort)

    colourize(keys, userkey, data).then(d => init(d))

    function init(d) {

      data = d

      renderChart()

      document.querySelector(`#yacht__table tr`).addEventListener("click", (e) => sortColumns(e));

      searchEl.addEventListener(`input`, () => renderChart());

      if (enableSearch) {

        document.getElementById(`search-container`).style.display = "block";

      }
      
    }

    function sortColumns(e) {

      data = data.sort(propComparator(e.target.cellIndex));

      styleHeaders(e)

      renderChart()

    }

    function sortMobile(index) {

      data = data.sort(propComparator(index));

      styleHeaders(e)

      renderChart()

    }

    function renderChart() {

      const tbodyEl = document.querySelector(`#yacht__table tbody`);

      const rowsToRender = (searchEl.value !== "") ? data.filter((item) => { 
        return matchArray(item.map((row) => Object.values(row)[0]), searchEl.value)
      }) : data ;

      const finalRows = rowsToRender.map((item,index) => {
        return { index : index , item : item}
      })

      const html = mustache( template, { rows : finalRows, styleCheck : styleCheck, formatedNumber : formatedNumber })

      tbodyEl.innerHTML = html;

    }

  }

}