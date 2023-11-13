function e(e,t){return Array.isArray(t)?t.some((t=>e.indexOf(t)>-1)):e.indexOf(t)>-1}function t(e,r,n,a){var o,l=t,s="";function i(e,t){return e=null!=(e=e[(t=t.pop?t:t.split(".")).shift()])?e:"",0 in t?i(e,t):e}r=Array.isArray(r)?r:r?[r]:[],r=a?0 in r?[]:[1]:r;for(o=0;o<r.length;o++){var c,d="",u=0,h="object"==typeof r[o]?r[o]:{};(h=Object.assign({},n,h))[""]={"":r[o]},e.replace(/([\s\S]*?)({{((\/)|(\^)|#)(.*?)}}|$)/g,(function(e,t,r,n,a,o,f){u?d+=u&&!a||u>1?e:t:(s+=t.replace(/{{{(.*?)}}}|{{(!?)(&?)(>?)(.*?)}}/g,(function(e,t,r,n,a,o){return t?i(h,t):n?i(h,o):a?l(i(h,o),h):r?"":new Option(i(h,o)).innerHTML})),c=o),a?--u||(f=i(h,f),/^f/.test(typeof f)?s+=f.call(h,d,(function(e){return l(e,h)})):s+=l(d,f,h,c),d=""):++u}))}return s}var r={guardian:["#CC0A11","#046DA1","#f28e2c","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab","#000000"],guardian2:["rgb(204, 10, 17)","rgb(4, 109, 161)","#ff7f00","rgb(0, 178, 255)","rgb(245, 189, 44)","rgb(179, 179, 180)","rgb(128, 128, 128)","#000000"],darkmode:["#ffd700","#ea5f94","#13F4EF","#fa8775","#cd34b5","#9d02d7","#0000ff"],"the-crunch":["#ffd700","#ea5f94","#13F4EF","#fa8775","#cd34b5","#9d02d7","#0000ff"]};class n{constructor(e){const t=r.guardian,n="string"==typeof e,a=t=>!e||n?null:e[t],o=e?n?e:e.type:"ordinal",l=a("domain"),s=a("colors");switch(this.divisor=a("divisor"),o){case"linear":this.cScale=d3.scaleLinear().range(t);break;case"threshold":this.cScale=d3.scaleThreshold().range(t);break;case"quantile":this.cScale=d3.scaleQuantile().range(t);break;case"quantize":this.cScale=d3.scaleQuantize().range(t);break;default:this.cScale=d3.scaleOrdinal().range(t)}this.set(l,s)}get(e){const t=this.divisor?e/this.divisor:e;return this.cScale(t)}set(e,t){let n=!1,a=null;"string"==typeof t&&(r[t]?(a=r[t],n=!0):d3[t]?(a=d3[t],n=!0):console.error(`${t} is not part of the color presets or d3 scale chromatic colour scheme`)),Array.isArray(t)&&t.length>0&&(a=t,n=!0),n&&this.cScale.range(a),e&&e.length>0&&this.cScale.domain(e)}}var a=null,o=null,l=null;async function s(t,r,a){const o=function(e,t){const r=t.map((t=>{var r=d3.extent(e.map((e=>e[t.key]))),a={};a.name=t.key;let o=t.values.split(",");o=""==o[0]?r:o;let l=t.colours.split(",");return a.profile=new n({type:t.scale,domain:o,colors:l.length>0?l:["grey"]}),a}));return r}(a,r),l=r.map((e=>e.key)),s=r.map((e=>e.format?e.format.includes(",")?e.format.split(","):[e.format.trim()]:[])),c=s.map((t=>e(t,"date"))),d=r.map((e=>e.graphics?e.graphics:void 0)),u=(r,n)=>!!e(t[n],l)&&o.find((e=>e.name===t[n])).profile.get(r),h=a.map((e=>Object.values(e))),f=e=>l.indexOf(t[e])>-1?s[l.indexOf(t[e])]:[""],m=(e,t)=>c[t-1]?Math.floor(new Date(e).getTime()/1e3):e,g=e=>l.indexOf(t[e])>-1?d[l.indexOf(t[e])]:null;return await h.map(((e,t)=>e.map(((e,t)=>({value:e,sort:m(e,t),format:f(t),color:u(e,t),contrast:i(u(e,t)),graphics:g(t)})))))}function i(e){if(e){if(0===e.indexOf("#"))return function(e,t=!0){3===e.length&&(e=e[0]+e[0]+e[1]+e[1]+e[2]+e[2]);if(6!==e.length)throw new Error("Invalid HEX color.");let r=parseInt(e.slice(0,2),16),n=parseInt(e.slice(2,4),16),a=parseInt(e.slice(4,6),16);if(t)return.299*r+.587*n+.114*a>186?"#000000":"#FFFFFF";return r=(255-r).toString(16),n=(255-n).toString(16),a=(255-a).toString(16),"#"+padZero(r)+padZero(n)+padZero(a)}(e=e.slice(1));{let t=e.includes("#")?function(e){e=e.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,(function(e,t,r,n){return t+t+r+r+n+n}));var t=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);return t?{r:parseInt(t[1],16),g:parseInt(t[2],16),b:parseInt(t[3],16)}:null}(e.trim()):e;if(e.includes("rgb(")){let r=function(e){let t=e.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);return t?[+t[1],+t[2],+t[3]]:[]}(e);t={r:r[0],g:r[1],b:r[1]}}return.299*t.r+.587*t.g+.114*t.b>186?"#000000":"#FFFFFF"}}return"black"}function c(){return this.color&&"shading"==this.format[0]?`style="background-color:${this.color};text-align:center;color:${this.contrast};"`:isNaN(this.value)?"":'style="text-align:center;"'}function d(){var t="";if(null!=this.format&&null!=this.value){let r=this.format.map((e=>e.trim())),n=this.value;if(t+=e(r,"$")?"$":"",t+=e(r,"numberFormat")?function(e){if(e>0)return e>=1e9?e/1e9%1==0?e/1e9+"bn":(e/1e9).toFixed(1)+"bn":e>=1e6?e/1e6%1==0?e/1e6+"m":(e/1e6).toFixed(1)+"m":e>=1e3?e/1e3%1==0?e/1e3+"k":(e/1e3).toFixed(1)+"k":e;if(e<0){var t=-1*e;return t>=1e9?["-"+String((t/1e9).toFixed(1))+"bn"]:t>=1e6?["-"+String((t/1e6).toFixed(1))+"m"]:t>=1e3?["-"+String((t/1e3).toFixed(1))+"k"]:e}return e}(n):e(r,"commas")?n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,","):n,t=e(r,"nozero")?function(e){return console.log(0==e),0==e?"":e}(n):t,e(r,"bar")&&this.graphics.max){let e=100/this.graphics.max*this.value,r=e<30?e+5:5;t=`<div class="table-bar-chart"><div class="table-bar" style="background: ${this.color?this.color:"grey"}; margin-left: 0%; width: ${e}%;"></div><div class="table-bar-label" style="left:${r}%;color:${e<20?"black":"white"}">${t}</div></div>`}if(e(r,"textColor")&&(t=`<span style="color:${this.color};"><strong>${t}<strong></span>`),e(r,"date")){t=new Date(t).toLocaleDateString("en-AU",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}}else t=null!=this.value?this.value:"";return t}class u{constructor(e){this.settings=e,this.init()}init(){var e,t,r;console.log("blah"),e=this.settings.enableShowMore,t=document.querySelector("#button2"),r=document.querySelector("#outer-wrapper"),e?(console.log("Activate"),t.addEventListener("click",(function(){r.classList.toggle("min"),document.getElementById("showbutton").classList.toggle("hide"),document.getElementById("hidebutton").classList.toggle("hide")})),r.classList.toggle("min")):(console.log("Do not Activate"),null!=t&&t.remove()),function(e,t,r,n){var a="",o=document.head||document.getElementsByTagName("head")[0],l=document.createElement("style");a="@media (max-width: 30em) {",e.map(((e,t)=>{a+=`.collapse-true table tbody tr td:nth-child(${t+1}) span.header-prefix::before { content: '${e}: '; font-weight: 600; }`})),a+="}",a+="th {\n\t  position: sticky!Important;\n\t  top: 0;\n\t}",r&&!n&&t>10&&(a+="table {\n\t\t  text-align: left;\n\t\t  border-collapse: collapse; \n\t\t  position: relative;\n\t\t}",a+="#yacht__table__wrapper {\n\t\t\theight: 480px;\n\t\t\toverflow: scroll!Important;\n\t\t\ttouch-action: auto;\n\t\t}"),l.type="text/css",l.styleSheet?l.styleSheet.cssText=a:l.appendChild(document.createTextNode(a)),o.appendChild(l)}(this.settings.keys,this.settings.data.length,this.settings.enableScroll,this.settings.enableShowMore),this.render()}render(){let{modules:e,height:r,width:n,isMobile:i,colors:u,datum:h,title:f,subtitle:m,footnote:g,source:p,data:b,keys:y,labels:v,userkey:S,type:x,enableSearch:w,enableSort:F,enableShowMore:k,enableScroll:N,aria:E,dropdown:L}=this.settings;const $=document.querySelector("#yacht__table"),C=document.querySelector("#search-field");function I(){const e=document.querySelector("#yacht__table tbody"),r=t('{{#rows}}\n    <tr>\n        {{#item}}\n            <td {{#styleCheck}}{{/styleCheck}} class="column"><div class="wrap"><span class="header-prefix"></span><span>{{#formatedNumber}}{{/formatedNumber}}</span></div></td>\n        {{/item}}\n    </tr>\n{{/rows}}',{rows:(""!==C.value?b.filter((e=>{return t=e.map((e=>Object.values(e)[0])),r=C.value,!!t.toString().toLowerCase().includes(r.toLowerCase());var t,r})):b).map(((e,t)=>({index:t,item:e}))),styleCheck:c,formatedNumber:d});e.innerHTML=r}$.innerHTML="",function(e,t,r){let n=e.createTHead().insertRow();for(let e of t){let t=document.createElement("th");t.classList.add("column-header");let a=document.createElement("SPAN"),o=document.createTextNode(e);if(t.appendChild(a),a.appendChild(o),"TRUE"===r){let e=document.createElement("DIV");e.classList.add("toggle-wrapper"),t.appendChild(e)}n.appendChild(t)}e.appendChild(document.createElement("tbody")).classList.add("table-body")}($,y,F),s(y,S,b).then((e=>function(e){b=e,I(),document.querySelector("#yacht__table tr").addEventListener("click",(e=>function(e){b=b.sort(function(e){var t,r;return a=a!==e?e:null,function(n,o){return t="string"!=typeof n[e].sort||isNaN(parseFloat(n[e].sort))?n[e].sort:parseFloat(n[e].sort.replace(/,/g,"")),r="string"!=typeof o[e].sort||isNaN(parseFloat(o[e].sort))?o[e].sort:parseFloat(o[e].sort.replace(/,/g,"")),"<svg>"==(""+t).substring(0,5)?t<r?a!==e?1:-1:t>r?a!==e?-1:1:0:t<r?a!==e?-1:1:t>r?a!==e?1:-1:0}}(e.target.cellIndex)),function(e){const t=document.querySelectorAll("#yacht__table .column-header"),r=document.querySelector("#yacht__table");for(var n=0;n<t.length;n++)t[n].className="column-header";o===e.target&&!1===l?(e.target.className="column-header sorted-reversed",l=!0):(e.target.className="column-header sorted",l=!1),function(e,t){if(e.className){var r=" "+t+" ";return-1!==(" "+e.className+" ").indexOf(r)}return!1}(r,"table-sorted")||(r.className="table-sorted"),o=e.target}(e),I()}(e))),C.addEventListener("input",(()=>I())),w&&(document.getElementById("search-container").style.display="block")}(e)))}}export{u as default};
