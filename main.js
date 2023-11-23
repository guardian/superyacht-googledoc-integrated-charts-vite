import { getURLParams, contains } from './charts/shared/toolbelt';
import { yachtCharter } from "./yachtCharter.js"
import './style.scss'

const docsdata = "docsdata" // "yacht-charter-data" // "docsdata" 

// long data 10EMTCsz3lOVDFImtDm_LxIufnDw0QMYLcqd6ceLNOdc
// short data 1MVhSw-zT2XBl8gFzLhXBp1OBkkeWVyJ5x0owS3RKTJw"
const keyloc = "10EMTCsz3lOVDFImtDm_LxIufnDw0QMYLcqd6ceLNOdc"
const key = getURLParams("key") ? getURLParams("key") : keyloc ;
const location = getURLParams("location") ? getURLParams("location") : docsdata ;

console.log(`https://interactive.guim.co.uk/${location}/${key}.json`)

console.log(`https://interactive.guim.co.uk/embed/superyacht/index.html?key=${key}&location=${location}`)

new yachtCharter(key, location)