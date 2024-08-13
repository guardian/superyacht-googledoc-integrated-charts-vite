const t="colorScheme",e="colorLinearRange",r={getDropdown(t,e){if(t&&t.length>0)return t;const r=[];return e.forEach(((t,e)=>{0!==e&&(t=>"Color"!==t&&"keyCategory"!==t)(t)&&r.push({data:t,display:t})})),r},getId:t=>t.replace(/ |-|\(|\)/g,"_"),getColorDomainRangeMax(r){const a=t=>r&&r[t],o=Array.isArray(r[e]),n=a(e)?o?Object.values(r[e]):Object.keys(r[e]).map((t=>parseInt(t))):[],s=a(e)?o?[]:Object.values(r[e]):[],l=r[t],i=r.colorMax||d3.max(n);return{colorDomain:n.map((t=>t/i)),colorRange:s&&s.length>0?s:l,colorMax:i}},getUserDefinedKeysColors(t){const e=[],r=[];return t.forEach((t=>{e.push(t.key?t.key:t.keyName),r.push(t.colour)})),{keys:e,colors:r}},getKeysColors({keys:e,userKey:r,option:a}){let o={keys:e};return r.length>=1?o=this.getUserDefinedKeysColors(r):a[t]&&(o.colors=a[t]),o},chartlines:t=>0==t.dropdown.length?t.keys:[t.xColumn,...t.dropdown[0].values.split(",").map((t=>t.trim()))],stackedhorizontal:t=>0==t.dropdown.length?t.keys.filter((e=>e!=t.yColumn)):t.dropdown[0].values.split(",").map((t=>t.trim())),stackedbars:t=>0==t.dropdown.length?t.keys.filter((e=>e!=t.xColumn)):t.dropdown[0].values.split(",").map((t=>t.trim())),smallmultiples:t=>0==t.dropdown.length?t.keys:[t.xColumn,t.groupBy,...t.dropdown[0].values.split(",").map((t=>t.trim()))]};var a={guardian:["#CC0A11","#046DA1","#f28e2c","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab","#000000"],guardian2:["rgb(204, 10, 17)","rgb(4, 109, 161)","#ff7f00","rgb(0, 178, 255)","rgb(245, 189, 44)","rgb(179, 179, 180)","rgb(128, 128, 128)","#000000"],darkmode:["#ffd700","#ea5f94","#13F4EF","#fa8775","#cd34b5","#9d02d7","#0000ff"],"the-crunch":["#ffd700","#ea5f94","#13F4EF","#fa8775","#cd34b5","#9d02d7","#0000ff"]};class o{constructor(t){const e=a.guardian,r="string"==typeof t,o=e=>!t||r?null:t[e],n=t?r?t:t.type:"ordinal",s=o("domain"),l=o("colors");switch(this.divisor=o("divisor"),n){case"linear":this.cScale=d3.scaleLinear().range(e);break;case"threshold":this.cScale=d3.scaleThreshold().range(e);break;case"quantile":this.cScale=d3.scaleQuantile().range(e);break;case"quantize":this.cScale=d3.scaleQuantize().range(e);break;default:this.cScale=d3.scaleOrdinal().range(e)}this.set(s,l)}get(t){const e=this.divisor?t/this.divisor:t;return this.cScale(e)}set(t,e){let r=!1,o=null;"string"==typeof e&&(a[e]?(o=a[e],r=!0):d3[e]?(o=d3[e],r=!0):console.error(`${e} is not part of the color presets or d3 scale chromatic colour scheme`)),Array.isArray(e)&&e.length>0&&(o=e,r=!0),r&&this.cScale.range(o),t&&t.length>0&&this.cScale.domain(t)}}function n(t,e,r,a,o,i=!1){if(t.select(`#${e.id}`).remove(),e.path||"true"==e.path)!function(t,e,r,a,o){const n=r-o.left-o.right,i=a-o.top-o.bottom,c=t.append("g").attr("transform",`translate(${o.left}, ${o.top})`).attr("id",e.id).attr("class","labelWrapper").style("opacity",0);c.append("path").attr("class","labelPath mobHide").attr("fill","none").attr("stroke","black").attr("stroke-width",2).attr("data-id",e.id).attr("d",s(n*e.coords.targetX,i*e.coords.targetY,n*e.coords.centreX,i*e.coords.centreY,n*e.coords.sourceX,i*e.coords.sourceY)),c.append("text").attr("class","labelText mobHide").attr("x",n*e.coords.textX).attr("y",i*e.coords.textY).attr("text-anchor",e.align).attr("data-id",e.id).text(e.text),t.selectAll(`#${e.id} text`).each(l),c.transition().style("opacity",1)}(t,e,r,a,o);else{var c=t.append("g").attr("id",e.id).attr("class","labelWrapper").attr("data-config",JSON.stringify(e)).style("opacity",0),d=function(t,e,r,a,o){e.largeArcFlag||(e.largeArcFlag=0);e.sweepFlag||(e.sweepFlag=0);e.radius||(e.radius=75);var n=JSON.parse(JSON.stringify(e.coords));if(e.coordType&&("pct"===e.coordType||""===e.coordType)){t.select("g");var s=a-r.left-r.right,l=o-r.top-r.bottom;n.sourceX=e.coords.sourceX*s+r.left,n.targetX=e.coords.targetX*s+r.left,n.sourceY=e.coords.sourceY*l+r.top,n.targetY=e.coords.targetY*l+r.top,n.textX=e.coords.textX*s+r.left,n.textY=e.coords.textY*l+r.top}var i=`M ${n.sourceX}, ${n.sourceY} A ${e.radius}, ${e.radius} 0 ${e.largeArcFlag},${e.sweepFlag} ${n.targetX}, ${n.targetY}`;return{curvePath:i,newCoords:n}}(t,e,o,r,a),p=d.curvePath,g=d.newCoords;if(t.append("svg:defs").append("svg:marker").attr("id","arrow").attr("refX",6).attr("refY",6).attr("markerWidth",30).attr("markerHeight",30).attr("markerUnits","userSpaceOnUse").attr("orient","auto").append("path").attr("d","M 0 0 12 6 0 12 3 6").style("fill","black"),c.append("path").attr("class","labelPath mobHide").attr("fill","none").attr("stroke","black").attr("stroke-width",2).attr("data-id",e.id).attr("marker-end",(()=>e.arrow&&"true"==e.arrow?"url(#arrow)":"none")).attr("d",p),i){var u=t.select(`#${e.id} .labelPath`).node(),f=u.getPointAtLength(u.getTotalLength()/2);c.append("circle").attr("fill","black").attr("stroke","black").attr("class","clickControl").attr("r",5).attr("data-id",e.id).attr("cx",f.x).attr("cy",f.y)}c.append("text").attr("class","labelText mobHide").attr("text-anchor",(()=>e.align?e.align:"start")).attr("x",g.textX).attr("y",g.textY).attr("dy",15).attr("data-id",e.id).attr("dx",0).attr("fill","black").text(e.text),t.selectAll(`#${e.id} text`).each(l),i&&function(t,e,r,a,o){console.log("click");var s=0,l=null,i="svg",c={targetX:0,targetY:0,sourceX:0,sourceY:0,textX:0,textY:0},d=t.selectAll(".clickControl");d.on("click",(function(t){s-=1,l=d3.select(this).attr("data-id"),d3.select(`#${l} .clickControl`).transition().attr("opacity",.2),d3.select(`#${l} .labelPath`).transition().attr("opacity",.2),i="path"}));var p=t.selectAll(".labelText");p.on("click",(function(t){s-=1,l=d3.select(this).attr("data-id"),d3.select(this).transition().attr("opacity",.2),i="label"})),t.on("click",(function(d){console.log("clicktype",i,"clickNo",s),console.log("clickPos",d3.pointer(event)[0],d3.pointer(event)[1],"modifiedPos",d3.pointer(event)[0]-a.left,d3.pointer(event)[1]-a.top),console.log("clickPos",d3.pointer(event)[0],d3.pointer(event)[1],"modifiedPos",d3.pointer(event)[0]-a.left,d3.pointer(event)[1]-a.top);var p=(d3.pointer(event)[0]-a.left)/(e-a.left-a.right),g=(d3.pointer(event)[1]-a.top)/(r-a.top-a.bottom);if(console.log("clickXpct",p,"clickYpct",g),-1==s)s+=1;else if(0==s){if(s+=1,c.targetX=p,c.targetY=g,"label"===i&&null!=l){var u=JSON.parse(t.select(`#${l}`).attr("data-config"));console.log("newConfig",u),l=null,c.textX=p,c.textY=g,u.coords.textX=c.textX,u.coords.textY=c.textY,n(t,u,e,r,a,o),console.log(JSON.stringify(u.coords))}}else if(1===s&&(s=0,null!=l)){u=JSON.parse(t.select(`#${l}`).attr("data-config"));console.log("newConfig",u),l=null,"path"===i&&(c.sourceX=p,c.sourceY=g,u.coords.sourceX=c.sourceX,u.coords.sourceY=c.sourceY,u.coords.targetX=c.targetX,u.coords.targetY=c.targetY),n(t,u,e,r,a,o),console.log(JSON.stringify(u.coords))}}))}(t,r,a,o,i),c.transition().style("opacity",1)}}const s=(t,e,r,a,o,n)=>`M ${t} ${e} Q ${r} ${a} ${o} ${n}`,l=function(){var t=d3.select(this),e=t.text().split("\n");t.text("");for(var r=0;r<e.length;r++){var a=t.append("tspan").text(e[r]);r>0&&a.attr("x",t.attr("x")).attr("dy","15")}};class i{constructor(t){this.settings=t,this.init()}init(){var t,e,r;console.log("enableshowmore",this.settings.enableShowMore),t=this.settings.enableShowMore,e=document.querySelector("#button2"),r=document.querySelector("#outer-wrapper"),t?(console.log("Activate"),e.addEventListener("click",(function(){r.classList.toggle("min"),document.getElementById("showbutton").classList.toggle("hide"),document.getElementById("hidebutton").classList.toggle("hide")})),r.classList.toggle("min")):(console.log("Do not Activate"),null!=e&&e.remove()),this.render()}render(){let{modules:t,type:e,colors:a,height:s,width:l,featuresWidth:i,featuresHeight:c,svgWidth:d,svgHeight:p,isMobile:g,title:u,subtitle:f,source:h,marginleft:y,margintop:x,marginbottom:m,marginright:k,tooltip:b,data:v,datum:w,labels:S,userkey:C,keys:X,rowHeight:Y,enableShowMore:$,colorScheme:A,dropdown:F,groupBy:O,minX:N,maxX:T,xFormat:E,xScale:M,yScale:P,parseTime:L,xAxisLabel:J,minMax:D,xColumn:H}=this.settings;d3.select("#graphicContainer svg").remove();const K=d3.select("#chartKey");K.html(""),w=JSON.parse(JSON.stringify(v)),a=new o,g=Math.max(document.documentElement.clientWidth,window.innerWidth||0)<610;let W=X.filter((t=>"Color"!=t&&t!=O));const U=r.getKeysColors({keys:W,userKey:C,option:{colorScheme:A}});a.set(U.keys,U.colors),d=document.querySelector("#graphicContainer").getBoundingClientRect().width,p=w.length*Y+x+m,i=d-k-y,c=p-x-m;let q=[];w.forEach((function(t){E.date&&W.forEach((e=>{var r,a;r=W,a=e,(Array.isArray(a)?a.some((t=>r.indexOf(t)>-1)):r.indexOf(a)>-1)&&(t[e]=L(t[e]))}))}));for(var z=0;z<w.length;z++)W.forEach((t=>{q.push(w[z][t])}));let B=d3.extent(q),I=function(t,e,r=.05){let a=t,o=e;return 0==t&&e>0&&(o=e+e*r),t>0&&e>0?(o=e+e*r,a=t-t*r):t<0&&e>0||t<0&&e<0?(o=e+e*r,a=t+t*r):t<0&&0==e&&(a=t+t*r),[a,o]}(B[0],B[1]);console.log("extent",B,"buffer",I),N=isNaN(N)?+N:I[0],T=isNaN(T)?+T:I[1];const R=d3.select("#graphicContainer").append("svg").attr("width",d).attr("height",p).attr("id","svg").attr("overflow","hidden"),j=R.append("g").attr("transform","translate("+y+","+x+")");var G=d3[M]();G.range([0,i]),console.log("yScale",P);var Q=d3[P]().range([0,c]).domain(w.map((function(t){return t[O]}))).padding(.9);E.date?G.domain(d3.extent(q)):G.domain([N,T]),(D.status||G(0)>y)&&j.append("line").style("stroke","#767676").style("stroke-width",1).attr("x1",G(0)).attr("y1",x/2).attr("x2",G(0)).attr("y2",p).attr("opacity",.5),1==W.length?(N<0&&T>0&&j.append("line").attr("x1",(function(t){return G(0)})).attr("x2",(function(t){return G(0)})).attr("y1",(function(t){return 0})).attr("y2",(function(t){return c})).style("stroke","#767676").style("stroke-width","1px"),j.selectAll("lines").data(w).enter().append("line").attr("x1",(function(t){return G(0)})).attr("x2",(function(t){return G(+t[W[0]])})).attr("y1",(function(t){return Q(t[O])})).attr("y2",(function(t){return Q(t[O])})).style("stroke",((t,e)=>t.Color?t.Color:a.get(t[W[0]]))).style("stroke-width","4px"),j.selectAll(".barText").data(w).enter().append("text").attr("class","barText").attr("x",(function(t){let e=t[W[0]]<0?-6:6;return G(0)+e})).attr("text-anchor",(function(t){return t[W[0]]>0?"start":"end"})).attr("y",(function(t){return Q(t[O])-Y/3.5})).text((t=>t[O]))):j.selectAll(".barText").data(w).enter().append("text").attr("class","barText").attr("x",(function(t){let e=[];for(var r=0;r<W.length;r++)e.push(t[W[r]]);return G(d3.min(e))-3})).attr("text-anchor",(function(t){return"start"})).attr("y",(function(t){return Q(t[O])-Y/3})).text((t=>t[O]));const _=function(t,e,r){if(t)return 4;let a=Math.round(e[1]-e[0]),o=Math.round(r/100);return o>a?a:o}(g,G.domain(),i);if(j.append("g").attr("class","x").attr("transform","translate(0,"+p+")").call((t=>t.attr("transform",`translate(0,${x/2})`).attr("class","axisgroup").call(d3.axisTop(G).tickSizeOuter(0)).call(d3.axisTop(G).tickSize(-p,0,0).ticks(_).tickFormat((t=>E.date?d3.timeFormat("%b %Y")(t):function(t){if(t>0)return t>=1e9?t/1e9%1==0?t/1e9+"bn":(t/1e9).toFixed(1)+"bn":t>=1e6?t/1e6%1==0?t/1e6+"m":(t/1e6).toFixed(1)+"m":t>=1e3?t/1e3%1==0?t/1e3+"k":(t/1e3).toFixed(1)+"k":t;if(t<0){var e=-1*t;return e>=1e9?e/1e9%1==0?"-"+e/1e9+"bn":"-"+(e/1e9).toFixed(1)+"bn":e>=1e6?e/1e6%1==0?"-"+e/1e6+"m":"-"+(e/1e6).toFixed(1)+"m":e>=1e3?e/1e3%1==0?"-"+e/1e3+"k":"-"+(e/1e3).toFixed(1)+"k":"-"+e}return t}(t))).tickPadding(10)))),2==W.length){let t=a.get(W[0]),e=a.get(W[1]);j.selectAll("lines").data(w).enter().append("line").attr("x1",(function(t){return G(+t[W[0]])})).attr("x2",(function(t){return G(+t[W[1]])})).attr("y1",(function(t){return Q(t[O])})).attr("y2",(function(t){return Q(t[O])})).attr("stroke",(function(r,a){let o=G(+r[W[0]]),n=G(+r[W[1]]),s=o<n?t:e,l=n>o?e:t,i=o<n?o:n,c=n>o?n:o,d=R.append("defs").append("linearGradient").attr("id",`svgGradient_${a}`).attr("gradientUnits","userSpaceOnUse").attr("x1",i).attr("x2",c).attr("y1",Q(r[O])).attr("y2",Q(r[O])+10);return d.append("stop").attr("class","start").attr("offset","0%").attr("stop-color",s).attr("stop-opacity"),d.append("stop").attr("class","end").attr("offset","100%").attr("stop-color",l).attr("stop-opacity",1),`url(#svgGradient_${a})`})).style("stroke-width","6px")}W.length>1&&W.forEach(((t,e)=>{const r=K.append("div").attr("class","keyDiv");r.append("span").attr("class","keyCircle").style("background-color",(()=>a.get(t))),r.append("span").attr("class","keyText").text(t)})),J&&R.append("text").attr("x",y).attr("y",x/2).attr("fill","#767676").attr("text-anchor","start").text(J);for(const t of W)j.selectAll(".lolly").data(w).enter().append("circle").attr("cx",(function(e){return G(+e[t])})).attr("cy",(function(t){return Q(t[O])})).attr("r","7").style("fill",((e,r)=>e.Color?e.Color:a.get(t))).style("stroke",((e,r)=>e.Color?e.Color:a.get(t)));if(S.length>0){const t=!!function(t){var e="";e=top!==self?window.location.search.substring(1).split("&"):window.parent.location.search.substring(1).split("&");for(let r=0;r<e.length;r++){let a=e[r].split("=");if(a[0]==t)return a[1]}return null}("labelling");console.log("clickLoggingOn",t),"string"==typeof S[0].coords&&S.forEach((function(t){t.coords=JSON.parse(t.coords),t.sweepFlag=+t.sweepFlag,t.largeArcFlag=+t.largeArcFlag,t.radius=+t.radius})),console.log("annotations",S),S.forEach((e=>{n(R,e,d,p,{left:y,right:k,top:x,bottom:m},t)}))}}}export{i as default};
