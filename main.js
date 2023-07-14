import { getURLParams, contains, preflight } from './charts/shared/toolbelt';
import { yachtCharter } from "./modules/chart"
import { charts } from "./modules/charts"
import './style.scss'


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
lollipop
bubble
*/
// https://interactive.guim.co.uk/docsdata/1lwRASZGsEDlFGFlVvwsDpLNW4Gy1B7JSfzBwt4C-slc.json
const docsdata = "yacht-charter-data" // "yacht-charter-data" // "docsdata" 
const keyloc = "oz-2023-school-state-federal-funding-change-grouped-bar"

const key = getURLParams("key") ? getURLParams("key") : keyloc ;
const location = getURLParams("location") ? getURLParams("location") : docsdata ;
//const testing = false
const testing = (window.location.hostname === "localhost") ? preflight(charts, myChart) : false ;

console.log(`https://interactive.guim.co.uk/${location}/${key}.json`)

console.log(` https://interactive.guim.co.uk/embed/superyacht/index.html?key=${key}&location=${location}`)

new yachtCharter(key, location, testing, charts)