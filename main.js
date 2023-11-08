import { getURLParams, contains } from './charts/shared/toolbelt';
import { yachtCharter } from "./yachtCharter.js"
import './style.scss'

const docsdata = "docsdata" // "yacht-charter-data" // "docsdata" 
const keyloc = "11LFp54PIb08Cqu6fBpQGDcQ15enT2F-9HsO8kokXbfQ"
const key = getURLParams("key") ? getURLParams("key") : keyloc ;
const location = getURLParams("location") ? getURLParams("location") : docsdata ;

console.log(`https://interactive.guim.co.uk/${location}/${key}.json`)

console.log(`https://interactive.guim.co.uk/embed/superyacht/index.html?key=${key}&location=${location}`)

new yachtCharter(key, location)