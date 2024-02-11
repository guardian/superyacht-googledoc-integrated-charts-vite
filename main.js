import { getURLParams, contains } from './charts/shared/toolbelt';
import { yachtCharter } from "./yachtCharter.js"
import './style.scss'

const docsdata = "yacht-charter-data" // "yacht-charter-data" // "docsdata" 
const keyloc = "oz-datablogs-sydney-sm-pedestrians--testo"
const key = getURLParams("key") ? getURLParams("key") : keyloc ;
const location = getURLParams("location") ? getURLParams("location") : docsdata ;
const theme = getURLParams("theme") ? getURLParams("theme") : false ;

if (theme == 'dark') {
	document.querySelector("body").classList.add("dark-mode-on")
}

console.log(`theme: ${theme}`)

console.log(`https://interactive.guim.co.uk/${location}/${key}.json`)

console.log(`https://interactive.guim.co.uk/embed/superyacht/index.html?key=${key}&location=${location}`)

new yachtCharter(key, location)