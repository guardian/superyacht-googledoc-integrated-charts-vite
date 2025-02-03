import { getURLParams, contains } from './charts/shared/toolbelt';
import { yachtCharter } from "./yachtCharter.js"
import './style.scss'

const docsdata = "docsdata" // "yacht-charter-data" // "docsdata" 
const keyloc = "1Mj8LtKyD55fwoEzE_WQHSG1jV7JN6rwg8Uyy7RTTHxI" // https://interactive.guim.co.uk/embed/superyacht/index.html?location=yacht-charter-data&key=woolworths-prices-2024-1
const key = getURLParams("key") ? getURLParams("key") : keyloc ;
const location = getURLParams("location") ? getURLParams("location") : docsdata ;
const theme = getURLParams("theme") ? getURLParams("theme") : false ;

if (theme == 'dark') {
	document.querySelector("body").classList.add("dark-mode-on")
}

// https://interactive.guim.co.uk/yacht-charter-data/woolworths-prices-2024-1.json

console.log(`theme: ${theme}`)

console.log(`https://interactive.guim.co.uk/${location}/${key}.json`)

console.log(`https://interactive.guim.co.uk/embed/superyacht/index.html?key=${key}&location=${location}`)

new yachtCharter(key, location)