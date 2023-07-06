
//import { getJson, getTemplate, premerge, merge, contains, mustache } from '../charts/shared/toolbelt';
//import { wrangle } from '../charts/shared/wrangle';
import { charts } from "./charts"
/*
d3.selection.prototype.moveToBack = function() {  
    return this.each(function() { 
        var firstChild = this.parentNode.firstChild; 
        if (firstChild) { 
            this.parentNode.insertBefore(this, firstChild); 
        } 
    });
};
*/
console.log("charts")

console.log(charts)


export default class Preview {

  constructor() {

   // this.url = (import.meta.env.MODE == 'development') ? '/' : 'https://interactive.guim.co.uk/embed/superyacht/'



  }

  async getData(location, key) {

    //let data  = await getJson(`https://interactive.guim.co.uk/${location}/${key}.json`)

  }

}