<<<<<<< HEAD
const t="colorScheme",e="colorLinearRange",r={getDropdown(t,e){if(t&&t.length>0)return t;const r=[];return e.forEach(((t,e)=>{0!==e&&(t=>"Color"!==t&&"keyCategory"!==t)(t)&&r.push({data:t,display:t})})),r},getId:t=>t.replace(/ |-|\(|\)/g,"_"),getColorDomainRangeMax(r){const a=t=>r&&r[t],o=Array.isArray(r[e]),n=a(e)?o?Object.values(r[e]):Object.keys(r[e]).map((t=>parseInt(t))):[],l=a(e)?o?[]:Object.values(r[e]):[],s=r[t],i=r.colorMax||d3.max(n);return{colorDomain:n.map((t=>t/i)),colorRange:l&&l.length>0?l:s,colorMax:i}},getUserDefinedKeysColors(t){const e=[],r=[];return t.forEach((t=>{e.push(t.key?t.key:t.keyName),r.push(t.colour)})),{keys:e,colors:r}},getKeysColors({keys:e,userKey:r,option:a}){let o={keys:e};return r.length>=1?o=this.getUserDefinedKeysColors(r):a[t]&&(o.colors=a[t]),o},chartlines:t=>0==t.dropdown.length?t.keys:[t.xColumn,...t.dropdown[0].values.split(",").map((t=>t.trim()))],stackedhorizontal:t=>0==t.dropdown.length?t.keys.filter((e=>e!=t.yColumn)):t.dropdown[0].values.split(",").map((t=>t.trim())),stackedbars:t=>0==t.dropdown.length?t.keys.filter((e=>e!=t.xColumn)):t.dropdown[0].values.split(",").map((t=>t.trim())),smallmultiples:t=>0==t.dropdown.length?t.keys:[t.xColumn,t.groupBy,...t.dropdown[0].values.split(",").map((t=>t.trim()))]};var a={guardian:["#CC0A11","#046DA1","#f28e2c","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab","#000000"],guardian2:["rgb(204, 10, 17)","rgb(4, 109, 161)","#ff7f00","rgb(0, 178, 255)","rgb(245, 189, 44)","rgb(179, 179, 180)","rgb(128, 128, 128)","#000000"],darkmode:["#ffd700","#ea5f94","#13F4EF","#fa8775","#cd34b5","#9d02d7","#0000ff"],"the-crunch":["#ffd700","#ea5f94","#13F4EF","#fa8775","#cd34b5","#9d02d7","#0000ff"]};class o{constructor(t){const e=a.guardian,r="string"==typeof t,o=e=>!t||r?null:t[e],n=t?r?t:t.type:"ordinal",l=o("domain"),s=o("colors");switch(this.divisor=o("divisor"),n){case"linear":this.cScale=d3.scaleLinear().range(e);break;case"threshold":this.cScale=d3.scaleThreshold().range(e);break;case"quantile":this.cScale=d3.scaleQuantile().range(e);break;case"quantize":this.cScale=d3.scaleQuantize().range(e);break;default:this.cScale=d3.scaleOrdinal().range(e)}this.set(l,s)}get(t){const e=this.divisor?t/this.divisor:t;return this.cScale(e)}set(t,e){let r=!1,o=null;"string"==typeof e&&(a[e]?(o=a[e],r=!0):d3[e]?(o=d3[e],r=!0):console.error(`${e} is not part of the color presets or d3 scale chromatic colour scheme`)),Array.isArray(e)&&e.length>0&&(o=e,r=!0),r&&this.cScale.range(o),t&&t.length>0&&this.cScale.domain(t)}}function n(t,e,r,a,o,i=!1){if(t.select(`#${e.id}`).remove(),e.path||"true"==e.path)!function(t,e,r,a,o){const n=r-o.left-o.right,i=a-o.top-o.bottom,c=t.append("g").attr("transform",`translate(${o.left}, ${o.top})`).attr("id",e.id).attr("class","labelWrapper").style("opacity",0);c.append("path").attr("class","labelPath mobHide").attr("fill","none").attr("stroke","black").attr("stroke-width",2).attr("data-id",e.id).attr("d",l(n*e.coords.targetX,i*e.coords.targetY,n*e.coords.centreX,i*e.coords.centreY,n*e.coords.sourceX,i*e.coords.sourceY)),c.append("text").attr("class","labelText mobHide").attr("x",n*e.coords.textX).attr("y",i*e.coords.textY).attr("text-anchor",e.align).attr("data-id",e.id).text(e.text),t.selectAll(`#${e.id} text`).each(s),c.transition().style("opacity",1)}(t,e,r,a,o);else{var c=t.append("g").attr("id",e.id).attr("class","labelWrapper").attr("data-config",JSON.stringify(e)).style("opacity",0),d=function(t,e,r,a,o){console.log("margin",r,"width",a,"height",o),e.largeArcFlag||(e.largeArcFlag=0);e.sweepFlag||(e.sweepFlag=0);e.radius||(e.radius=75);var n=JSON.parse(JSON.stringify(e.coords));if(e.coordType&&("pct"===e.coordType||""===e.coordType)){t.select("g");var l=a-r.left-r.right,s=o-r.top-r.bottom;console.log("svgWidth",l,"svgHeight",s),n.sourceX=e.coords.sourceX*l+r.left,n.targetX=e.coords.targetX*l+r.left,n.sourceY=e.coords.sourceY*s+r.top,n.targetY=e.coords.targetY*s+r.top,n.textX=e.coords.textX*l+r.left,n.textY=e.coords.textY*s+r.top}var i=`M ${n.sourceX}, ${n.sourceY} A ${e.radius}, ${e.radius} 0 ${e.largeArcFlag},${e.sweepFlag} ${n.targetX}, ${n.targetY}`;return{curvePath:i,newCoords:n}}(t,e,o,r,a),p=d.curvePath,g=d.newCoords;if(t.append("svg:defs").append("svg:marker").attr("id","arrow").attr("refX",6).attr("refY",6).attr("markerWidth",30).attr("markerHeight",30).attr("markerUnits","userSpaceOnUse").attr("orient","auto").append("path").attr("d","M 0 0 12 6 0 12 3 6").style("fill","black"),c.append("path").attr("class","labelPath mobHide").attr("fill","none").attr("stroke","black").attr("stroke-width",2).attr("data-id",e.id).attr("marker-end",(()=>e.arrow&&"true"==e.arrow?"url(#arrow)":"none")).attr("d",p),i){var u=t.select(`#${e.id} .labelPath`).node(),h=u.getPointAtLength(u.getTotalLength()/2);c.append("circle").attr("fill","black").attr("stroke","black").attr("class","clickControl").attr("r",5).attr("data-id",e.id).attr("cx",h.x).attr("cy",h.y)}c.append("text").attr("class","labelText mobHide").attr("text-anchor",(()=>e.align?e.align:"start")).attr("x",g.textX).attr("y",g.textY).attr("dy",15).attr("data-id",e.id).attr("dx",0).attr("fill","black").text(e.text),t.selectAll(`#${e.id} text`).each(s),i&&function(t,e,r,a,o){console.log("click");var l=0,s=null,i="svg",c={targetX:0,targetY:0,sourceX:0,sourceY:0,textX:0,textY:0},d=t.selectAll(".clickControl");d.on("click",(function(t){l-=1,s=d3.select(this).attr("data-id"),d3.select(`#${s} .clickControl`).transition().attr("opacity",.2),d3.select(`#${s} .labelPath`).transition().attr("opacity",.2),i="path"}));var p=t.selectAll(".labelText");p.on("click",(function(t){l-=1,s=d3.select(this).attr("data-id"),d3.select(this).transition().attr("opacity",.2),i="label"})),t.on("click",(function(d){console.log("clicktype",i,"clickNo",l),console.log("clickPos",d3.pointer(event)[0],d3.pointer(event)[1],"modifiedPos",d3.pointer(event)[0]-a.left,d3.pointer(event)[1]-a.top),console.log("clickPos",d3.pointer(event)[0],d3.pointer(event)[1],"modifiedPos",d3.pointer(event)[0]-a.left,d3.pointer(event)[1]-a.top);var p=(d3.pointer(event)[0]-a.left)/(e-a.left-a.right),g=(d3.pointer(event)[1]-a.top)/(r-a.top-a.bottom);if(console.log("clickXpct",p,"clickYpct",g),-1==l)l+=1;else if(0==l){if(l+=1,c.targetX=p,c.targetY=g,"label"===i&&null!=s){var u=JSON.parse(t.select(`#${s}`).attr("data-config"));console.log("newConfig",u),s=null,c.textX=p,c.textY=g,u.coords.textX=c.textX,u.coords.textY=c.textY,n(t,u,e,r,a,o),console.log(JSON.stringify(u.coords))}}else if(1===l&&(l=0,null!=s)){u=JSON.parse(t.select(`#${s}`).attr("data-config"));console.log("newConfig",u),s=null,"path"===i&&(c.sourceX=p,c.sourceY=g,u.coords.sourceX=c.sourceX,u.coords.sourceY=c.sourceY,u.coords.targetX=c.targetX,u.coords.targetY=c.targetY),n(t,u,e,r,a,o),console.log(JSON.stringify(u.coords))}}))}(t,r,a,o,i),c.transition().style("opacity",1)}}const l=(t,e,r,a,o,n)=>`M ${t} ${e} Q ${r} ${a} ${o} ${n}`,s=function(){var t=d3.select(this),e=t.text().split("\n");t.text("");for(var r=0;r<e.length;r++){var a=t.append("tspan").text(e[r]);r>0&&a.attr("x",t.attr("x")).attr("dy","15")}};class i{constructor(t){this.settings=t,this.init()}init(){var t,e,r;console.log("enableshowmore",this.settings.enableShowMore),t=this.settings.enableShowMore,e=document.querySelector("#button2"),r=document.querySelector("#outer-wrapper"),t?(console.log("Activate"),e.addEventListener("click",(function(){r.classList.toggle("min"),document.getElementById("showbutton").classList.toggle("hide"),document.getElementById("hidebutton").classList.toggle("hide")})),r.classList.toggle("min")):(console.log("Do not Activate"),null!=e&&e.remove()),this.render()}render(){let{modules:t,type:e,colors:l,height:s,width:i,featuresWidth:c,featuresHeight:d,svgWidth:p,svgHeight:g,isMobile:u,title:h,subtitle:f,source:y,marginleft:m,margintop:x,marginbottom:k,marginright:b,tooltip:v,data:w,datum:C,labels:S,userkey:$,keys:X,rowHeight:Y,enableShowMore:A,colorScheme:F,dropdown:O,groupBy:M,minX:E,maxX:N,xFormat:T,xScale:P,yScale:L,parseTime:J,xAxisLabel:H,hideKey:_,xColumn:D}=this.settings;d3.select("#graphicContainer svg").remove();const K=d3.select("#chartKey");K.html(""),C=JSON.parse(JSON.stringify(w)),l=new o;let W=a.guardian[0];u=Math.max(document.documentElement.clientWidth,window.innerWidth||0)<610;let B=10,z=X.filter((t=>"Color"!=t&&t!=M)),G=[];z.forEach((t=>{G.push({key:t,value:C[0][t]})})),G.sort(((t,e)=>d3.ascending(t.value,e.value))),console.log("keysInOrder",G),z=[],G.forEach((t=>{z.push(t.key)})),console.log("keysToChart",z);const q=r.getKeysColors({keys:z,userKey:$,option:{colorScheme:F}});l.set(q.keys,q.colors),p=document.querySelector("#graphicContainer").getBoundingClientRect().width,g=C.length*Y+x+k,c=p-b-m,d=g-x-k;let I=[];for(var R=0;R<C.length;R++)z.forEach((t=>{I.push(C[R][t])}));C.forEach((function(t){T.date&&z.forEach((e=>{var r,a;r=z,a=e,(Array.isArray(a)?a.some((t=>r.indexOf(t)>-1)):r.indexOf(a)>-1)&&(t[e]=J(t[e]))}))}));let U=d3.extent(I);const j=function(t){let e=d3.extent(t),r=0,a=e[1],o=!1;return e[0]<0&&(e[0]=Math.floor(e[0]),e[1]=Math.ceil(e[1]),a=Math.abs(e[0])>e[1]?Math.abs(e[0]):e[1],r=-a,o=!0),{min:r,max:a,status:o}}(I.map((t=>t)));let Q=function(t,e,r=5){const a=r/100*(e-t);return[t-a,e+a]}(U[0],U[1],2);E=isNaN(E)?+E:Q[0],N=isNaN(N)?+N:Q[1];const V=d3.select("#graphicContainer").append("svg").attr("width",p).attr("height",g).attr("id","svg").attr("overflow","hidden"),Z=V.append("g").attr("transform","translate("+m+","+x+")");var tt=d3[P]();tt.range([0,c]),console.log("yScale",L);var et=d3[L]().range([0,d]).domain(C.map((function(t){return t[M]}))).padding(.9);T.date?tt.domain(d3.extent(I)):tt.domain([E,N]),(j.status||tt(0)>m)&&Z.append("line").style("stroke","#767676").style("stroke-width",1).attr("x1",tt(0)).attr("y1",x/2).attr("x2",tt(0)).attr("y2",g).attr("opacity",.5),Z.selectAll(".barText").data(C).enter().append("text").attr("class","barText").attr("x",(function(t){return tt(t[z[1]])})).attr("text-anchor",(function(t){return tt(t[z[1]])<100?"start":"end"})).attr("y",(function(t){return et(t[M])-Y/3})).text((t=>t[M]));const rt=function(t,e,r){if(t)return 4;let a=Math.round(e[1]-e[0]),o=Math.round(r/100);return o>a?a:o}(u,tt.domain(),c);if(Z.append("g").attr("class","x").attr("transform","translate(0,"+g+")").call((t=>t.attr("transform",`translate(0,${x/2})`).attr("class","axisgroup").call(d3.axisTop(tt).tickSizeOuter(0)).call(d3.axisTop(tt).tickSize(-g,0,0).ticks(rt).tickFormat((t=>T.date?d3.timeFormat("%b %Y")(t):function(t){if(t>0)return t>=1e9?t/1e9%1==0?t/1e9+"bn":(t/1e9).toFixed(1)+"bn":t>=1e6?t/1e6%1==0?t/1e6+"m":(t/1e6).toFixed(1)+"m":t>=1e3?t/1e3%1==0?t/1e3+"k":(t/1e3).toFixed(1)+"k":t;if(t<0){var e=-1*t;return e>=1e9?e/1e9%1==0?"-"+e/1e9+"bn":"-"+(e/1e9).toFixed(1)+"bn":e>=1e6?e/1e6%1==0?"-"+e/1e6+"m":"-"+(e/1e6).toFixed(1)+"m":e>=1e3?e/1e3%1==0?"-"+e/1e3+"k":"-"+(e/1e3).toFixed(1)+"k":"-"+e}return t}(t))).tickPadding(10)))),Z.selectAll(".rangeBars").data(C).enter().append("rect").attr("x",(function(t){return tt(+t[z[0]])})).attr("width",(t=>tt(+t[z[1]])-tt(+t[z[0]]))).attr("y",(function(t){return et(t[M])-5})).attr("height",B).attr("fill",(function(t,e){let r=V.append("defs").append("linearGradient").attr("id",`svgGradient_left_${e}`);return r.append("stop").attr("class","start").attr("offset","0%").attr("stop-color",t.Color?t.Color:W).attr("stop-opacity",0),r.append("stop").attr("class","end").attr("offset","100%").attr("stop-color",t.Color?t.Color:W).attr("stop-opacity",1),`url(#svgGradient_left_${e})`})),Z.selectAll(".rangeBars").data(C).enter().append("rect").attr("x",(function(t){return tt(+t[z[1]])})).attr("width",(t=>tt(+t[z[2]])-tt(+t[z[1]]))).attr("y",(function(t){return et(t[M])-5})).attr("height",B).attr("fill",(function(t,e){console.log(t);let r=V.append("defs").append("linearGradient").attr("id",`svgGradient_right_${e}`);return r.append("stop").attr("class","start").attr("offset","0%").attr("stop-color",t.Color?t.Color:W).attr("stop-opacity",1),r.append("stop").attr("class","end").attr("offset","100%").attr("stop-color",t.Color?t.Color:W).attr("stop-opacity",0),`url(#svgGradient_right_${e})`})),_||z.length>1&&z.forEach(((t,e)=>{const r=K.append("div").attr("class","keyDiv");r.append("span").attr("class","keyCircle").style("background-color",(()=>l.get(t))),r.append("span").attr("class","keyText").text(t)})),H&&V.append("text").attr("x",m).attr("y",x/2).attr("fill","#767676").attr("text-anchor","start").text(H),Z.selectAll(".lolly").data(C).enter().append("circle").attr("cx",(function(t){return tt(+t[z[1]])})).attr("cy",(function(t){return et(t[M])})).attr("r",B).style("fill",((t,e)=>t.Color?t.Color:W)).style("stroke",((t,e)=>t.Color?t.Color:W)),Z.selectAll(".circleText").data(C).enter().append("text").attr("x",(function(t){return tt(+t[z[1]])})).attr("y",(function(t){return et(t[M])+5-2})).style("font-size",B).style("font-weight","bold").style("fill",((t,e)=>"#FFF")).text((t=>t[z[1]])).attr("text-anchor","middle"),S.length>0){const t=!!function(t){var e="";e=top!==self?window.location.search.substring(1).split("&"):window.parent.location.search.substring(1).split("&");for(let r=0;r<e.length;r++){let a=e[r].split("=");if(a[0]==t)return a[1]}return null}("labelling");console.log("clickLoggingOn",t),"string"==typeof S[0].coords&&S.forEach((function(t){t.coords=JSON.parse(t.coords),t.sweepFlag=+t.sweepFlag,t.largeArcFlag=+t.largeArcFlag,t.radius=+t.radius})),console.log("annotations",S),S.forEach((e=>{n(V,e,p,g,{left:m,right:b,top:x,bottom:k},t)}))}}}export{i as default};
=======
const t="colorScheme",e="colorLinearRange",r={getDropdown(t,e){if(t&&t.length>0)return t;const r=[];return e.forEach(((t,e)=>{0!==e&&(t=>"Color"!==t&&"keyCategory"!==t)(t)&&r.push({data:t,display:t})})),r},getId:t=>t.replace(/ |-|\(|\)/g,"_"),getColorDomainRangeMax(r){const a=t=>r&&r[t],o=Array.isArray(r[e]),n=a(e)?o?Object.values(r[e]):Object.keys(r[e]).map((t=>parseInt(t))):[],l=a(e)?o?[]:Object.values(r[e]):[],s=r[t],i=r.colorMax||d3.max(n);return{colorDomain:n.map((t=>t/i)),colorRange:l&&l.length>0?l:s,colorMax:i}},getUserDefinedKeysColors(t){const e=[],r=[];return t.forEach((t=>{e.push(t.key?t.key:t.keyName),r.push(t.colour)})),{keys:e,colors:r}},getKeysColors({keys:e,userKey:r,option:a}){let o={keys:e};return r.length>=1?o=this.getUserDefinedKeysColors(r):a[t]&&(o.colors=a[t]),o},chartlines:t=>0==t.dropdown.length?t.keys:[t.xColumn,...t.dropdown[0].values.split(",").map((t=>t.trim()))],stackedhorizontal:t=>0==t.dropdown.length?t.keys.filter((e=>e!=t.yColumn)):t.dropdown[0].values.split(",").map((t=>t.trim())),stackedbars:t=>0==t.dropdown.length?t.keys.filter((e=>e!=t.xColumn)):t.dropdown[0].values.split(",").map((t=>t.trim())),smallmultiples:t=>0==t.dropdown.length?t.keys:[t.xColumn,t.groupBy,...t.dropdown[0].values.split(",").map((t=>t.trim()))]};var a={guardian:["#CC0A11","#046DA1","#f28e2c","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab","#000000"],guardian2:["rgb(204, 10, 17)","rgb(4, 109, 161)","#ff7f00","rgb(0, 178, 255)","rgb(245, 189, 44)","rgb(179, 179, 180)","rgb(128, 128, 128)","#000000"],darkmode:["#ffd700","#ea5f94","#13F4EF","#fa8775","#cd34b5","#9d02d7","#0000ff"],"the-crunch":["#ffd700","#ea5f94","#13F4EF","#fa8775","#cd34b5","#9d02d7","#0000ff"]};class o{constructor(t){const e=a.guardian,r="string"==typeof t,o=e=>!t||r?null:t[e],n=t?r?t:t.type:"ordinal",l=o("domain"),s=o("colors");switch(this.divisor=o("divisor"),n){case"linear":this.cScale=d3.scaleLinear().range(e);break;case"threshold":this.cScale=d3.scaleThreshold().range(e);break;case"quantile":this.cScale=d3.scaleQuantile().range(e);break;case"quantize":this.cScale=d3.scaleQuantize().range(e);break;default:this.cScale=d3.scaleOrdinal().range(e)}this.set(l,s)}get(t){const e=this.divisor?t/this.divisor:t;return this.cScale(e)}set(t,e){let r=!1,o=null;"string"==typeof e&&(a[e]?(o=a[e],r=!0):d3[e]?(o=d3[e],r=!0):console.error(`${e} is not part of the color presets or d3 scale chromatic colour scheme`)),Array.isArray(e)&&e.length>0&&(o=e,r=!0),r&&this.cScale.range(o),t&&t.length>0&&this.cScale.domain(t)}}function n(t,e,r,a,o,i=!1){if(t.select(`#${e.id}`).remove(),e.path||"true"==e.path)!function(t,e,r,a,o){const n=r-o.left-o.right,i=a-o.top-o.bottom,c=t.append("g").attr("transform",`translate(${o.left}, ${o.top})`).attr("id",e.id).attr("class","labelWrapper").style("opacity",0);c.append("path").attr("class","labelPath mobHide").attr("fill","none").attr("stroke","black").attr("stroke-width",2).attr("data-id",e.id).attr("d",l(n*e.coords.targetX,i*e.coords.targetY,n*e.coords.centreX,i*e.coords.centreY,n*e.coords.sourceX,i*e.coords.sourceY)),c.append("text").attr("class","labelText mobHide").attr("x",n*e.coords.textX).attr("y",i*e.coords.textY).attr("text-anchor",e.align).attr("data-id",e.id).text(e.text),t.selectAll(`#${e.id} text`).each(s),c.transition().style("opacity",1)}(t,e,r,a,o);else{var c=t.append("g").attr("id",e.id).attr("class","labelWrapper").attr("data-config",JSON.stringify(e)).style("opacity",0),d=function(t,e,r,a,o){console.log("margin",r,"width",a,"height",o),e.largeArcFlag||(e.largeArcFlag=0);e.sweepFlag||(e.sweepFlag=0);e.radius||(e.radius=75);var n=JSON.parse(JSON.stringify(e.coords));if(e.coordType&&("pct"===e.coordType||""===e.coordType)){t.select("g");var l=a-r.left-r.right,s=o-r.top-r.bottom;console.log("svgWidth",l,"svgHeight",s),n.sourceX=e.coords.sourceX*l+r.left,n.targetX=e.coords.targetX*l+r.left,n.sourceY=e.coords.sourceY*s+r.top,n.targetY=e.coords.targetY*s+r.top,n.textX=e.coords.textX*l+r.left,n.textY=e.coords.textY*s+r.top}var i=`M ${n.sourceX}, ${n.sourceY} A ${e.radius}, ${e.radius} 0 ${e.largeArcFlag},${e.sweepFlag} ${n.targetX}, ${n.targetY}`;return{curvePath:i,newCoords:n}}(t,e,o,r,a),p=d.curvePath,g=d.newCoords;if(t.append("svg:defs").append("svg:marker").attr("id","arrow").attr("refX",6).attr("refY",6).attr("markerWidth",30).attr("markerHeight",30).attr("markerUnits","userSpaceOnUse").attr("orient","auto").append("path").attr("d","M 0 0 12 6 0 12 3 6").style("fill","black"),c.append("path").attr("class","labelPath mobHide").attr("fill","none").attr("stroke","black").attr("stroke-width",2).attr("data-id",e.id).attr("marker-end",(()=>e.arrow&&"true"==e.arrow?"url(#arrow)":"none")).attr("d",p),i){var u=t.select(`#${e.id} .labelPath`).node(),h=u.getPointAtLength(u.getTotalLength()/2);c.append("circle").attr("fill","black").attr("stroke","black").attr("class","clickControl").attr("r",5).attr("data-id",e.id).attr("cx",h.x).attr("cy",h.y)}c.append("text").attr("class","labelText mobHide").attr("text-anchor",(()=>e.align?e.align:"start")).attr("x",g.textX).attr("y",g.textY).attr("dy",15).attr("data-id",e.id).attr("dx",0).attr("fill","black").text(e.text),t.selectAll(`#${e.id} text`).each(s),i&&function(t,e,r,a,o){console.log("click");var l=0,s=null,i="svg",c={targetX:0,targetY:0,sourceX:0,sourceY:0,textX:0,textY:0},d=t.selectAll(".clickControl");d.on("click",(function(t){l-=1,s=d3.select(this).attr("data-id"),d3.select(`#${s} .clickControl`).transition().attr("opacity",.2),d3.select(`#${s} .labelPath`).transition().attr("opacity",.2),i="path"}));var p=t.selectAll(".labelText");p.on("click",(function(t){l-=1,s=d3.select(this).attr("data-id"),d3.select(this).transition().attr("opacity",.2),i="label"})),t.on("click",(function(d){console.log("clicktype",i,"clickNo",l),console.log("clickPos",d3.pointer(event)[0],d3.pointer(event)[1],"modifiedPos",d3.pointer(event)[0]-a.left,d3.pointer(event)[1]-a.top),console.log("clickPos",d3.pointer(event)[0],d3.pointer(event)[1],"modifiedPos",d3.pointer(event)[0]-a.left,d3.pointer(event)[1]-a.top);var p=(d3.pointer(event)[0]-a.left)/(e-a.left-a.right),g=(d3.pointer(event)[1]-a.top)/(r-a.top-a.bottom);if(console.log("clickXpct",p,"clickYpct",g),-1==l)l+=1;else if(0==l){if(l+=1,c.targetX=p,c.targetY=g,"label"===i&&null!=s){var u=JSON.parse(t.select(`#${s}`).attr("data-config"));console.log("newConfig",u),s=null,c.textX=p,c.textY=g,u.coords.textX=c.textX,u.coords.textY=c.textY,n(t,u,e,r,a,o),console.log(JSON.stringify(u.coords))}}else if(1===l&&(l=0,null!=s)){u=JSON.parse(t.select(`#${s}`).attr("data-config"));console.log("newConfig",u),s=null,"path"===i&&(c.sourceX=p,c.sourceY=g,u.coords.sourceX=c.sourceX,u.coords.sourceY=c.sourceY,u.coords.targetX=c.targetX,u.coords.targetY=c.targetY),n(t,u,e,r,a,o),console.log(JSON.stringify(u.coords))}}))}(t,r,a,o,i),c.transition().style("opacity",1)}}const l=(t,e,r,a,o,n)=>`M ${t} ${e} Q ${r} ${a} ${o} ${n}`,s=function(){var t=d3.select(this),e=t.text().split("\n");t.text("");for(var r=0;r<e.length;r++){var a=t.append("tspan").text(e[r]);r>0&&a.attr("x",t.attr("x")).attr("dy","15")}};class i{constructor(t){this.settings=t,this.init()}init(){var t,e,r;console.log("enableshowmore",this.settings.enableShowMore),t=this.settings.enableShowMore,e=document.querySelector("#button2"),r=document.querySelector("#outer-wrapper"),t?(console.log("Activate"),e.addEventListener("click",(function(){r.classList.toggle("min"),document.getElementById("showbutton").classList.toggle("hide"),document.getElementById("hidebutton").classList.toggle("hide")})),r.classList.toggle("min")):(console.log("Do not Activate"),null!=e&&e.remove()),this.render()}render(){let{modules:t,type:e,colors:l,height:s,width:i,featuresWidth:c,featuresHeight:d,svgWidth:p,svgHeight:g,isMobile:u,title:h,subtitle:f,source:y,marginleft:m,margintop:x,marginbottom:k,marginright:b,tooltip:v,data:w,datum:C,labels:S,userkey:$,keys:X,rowHeight:Y,enableShowMore:A,colorScheme:F,dropdown:O,groupBy:M,minX:E,maxX:N,xFormat:T,xScale:P,yScale:L,parseTime:J,xAxisLabel:H,hideKey:_,xColumn:D}=this.settings;d3.select("#graphicContainer svg").remove();const K=d3.select("#chartKey");K.html(""),C=JSON.parse(JSON.stringify(w)),l=new o;let W=a.guardian[0];u=Math.max(document.documentElement.clientWidth,window.innerWidth||0)<610;let B=10,z=X.filter((t=>"Color"!=t&&t!=M)),G=[];z.forEach((t=>{G.push({key:t,value:C[0][t]})})),G.sort(((t,e)=>d3.ascending(t.value,e.value))),console.log("keysInOrder",G),z=[],G.forEach((t=>{z.push(t.key)})),console.log("keysToChart",z);const q=r.getKeysColors({keys:z,userKey:$,option:{colorScheme:F}});l.set(q.keys,q.colors),p=document.querySelector("#graphicContainer").getBoundingClientRect().width,g=C.length*Y+x+k,c=p-b-m,d=g-x-k;let I=[];for(var R=0;R<C.length;R++)z.forEach((t=>{I.push(C[R][t])}));C.forEach((function(t){T.date&&z.forEach((e=>{var r,a;r=z,a=e,(Array.isArray(a)?a.some((t=>r.indexOf(t)>-1)):r.indexOf(a)>-1)&&(t[e]=J(t[e]))}))}));let U=d3.extent(I);const j=function(t){let e=d3.extent(t),r=0,a=e[1],o=!1;return e[0]<0&&(e[0]=Math.floor(e[0]),e[1]=Math.ceil(e[1]),a=Math.abs(e[0])>e[1]?Math.abs(e[0]):e[1],r=-a,o=!0),{min:r,max:a,status:o}}(I.map((t=>t)));let Q=function(t,e,r=5){return[0==t?t:t-r,0==e?e:e+r]}(U[0],U[1],2);E=isNaN(E)?+E:Q[0],N=isNaN(N)?+N:Q[1];const V=d3.select("#graphicContainer").append("svg").attr("width",p).attr("height",g).attr("id","svg").attr("overflow","hidden"),Z=V.append("g").attr("transform","translate("+m+","+x+")");var tt=d3[P]();tt.range([0,c]),console.log("yScale",L);var et=d3[L]().range([0,d]).domain(C.map((function(t){return t[M]}))).padding(.9);T.date?tt.domain(d3.extent(I)):tt.domain([E,N]),(j.status||tt(0)>m)&&Z.append("line").style("stroke","#767676").style("stroke-width",1).attr("x1",tt(0)).attr("y1",x/2).attr("x2",tt(0)).attr("y2",g).attr("opacity",.5),Z.selectAll(".barText").data(C).enter().append("text").attr("class","barText").attr("x",(function(t){return tt(t[z[1]])})).attr("text-anchor",(function(t){return tt(t[z[1]])<100?"start":"end"})).attr("y",(function(t){return et(t[M])-Y/3})).text((t=>t[M]));const rt=function(t,e,r){if(t)return 4;let a=Math.round(e[1]-e[0]),o=Math.round(r/100);return o>a?a:o}(u,tt.domain(),c);if(Z.append("g").attr("class","x").attr("transform","translate(0,"+g+")").call((t=>t.attr("transform",`translate(0,${x/2})`).attr("class","axisgroup").call(d3.axisTop(tt).tickSizeOuter(0)).call(d3.axisTop(tt).tickSize(-g,0,0).ticks(rt).tickFormat((t=>T.date?d3.timeFormat("%b %Y")(t):function(t){if(t>0)return t>=1e9?t/1e9%1==0?t/1e9+"bn":(t/1e9).toFixed(1)+"bn":t>=1e6?t/1e6%1==0?t/1e6+"m":(t/1e6).toFixed(1)+"m":t>=1e3?t/1e3%1==0?t/1e3+"k":(t/1e3).toFixed(1)+"k":t;if(t<0){var e=-1*t;return e>=1e9?e/1e9%1==0?"-"+e/1e9+"bn":"-"+(e/1e9).toFixed(1)+"bn":e>=1e6?e/1e6%1==0?"-"+e/1e6+"m":"-"+(e/1e6).toFixed(1)+"m":e>=1e3?e/1e3%1==0?"-"+e/1e3+"k":"-"+(e/1e3).toFixed(1)+"k":"-"+e}return t}(t))).tickPadding(10)))),Z.selectAll(".rangeBars").data(C).enter().append("rect").attr("x",(function(t){return tt(+t[z[0]])})).attr("width",(t=>tt(+t[z[1]])-tt(+t[z[0]]))).attr("y",(function(t){return et(t[M])-5})).attr("height",B).attr("fill",(function(t,e){let r=V.append("defs").append("linearGradient").attr("id",`svgGradient_left_${e}`);return r.append("stop").attr("class","start").attr("offset","0%").attr("stop-color",t.Color?t.Color:W).attr("stop-opacity",0),r.append("stop").attr("class","end").attr("offset","100%").attr("stop-color",t.Color?t.Color:W).attr("stop-opacity",1),`url(#svgGradient_left_${e})`})),Z.selectAll(".rangeBars").data(C).enter().append("rect").attr("x",(function(t){return tt(+t[z[1]])})).attr("width",(t=>tt(+t[z[2]])-tt(+t[z[1]]))).attr("y",(function(t){return et(t[M])-5})).attr("height",B).attr("fill",(function(t,e){console.log(t);let r=V.append("defs").append("linearGradient").attr("id",`svgGradient_right_${e}`);return r.append("stop").attr("class","start").attr("offset","0%").attr("stop-color",t.Color?t.Color:W).attr("stop-opacity",1),r.append("stop").attr("class","end").attr("offset","100%").attr("stop-color",t.Color?t.Color:W).attr("stop-opacity",0),`url(#svgGradient_right_${e})`})),_||z.length>1&&z.forEach(((t,e)=>{const r=K.append("div").attr("class","keyDiv");r.append("span").attr("class","keyCircle").style("background-color",(()=>l.get(t))),r.append("span").attr("class","keyText").text(t)})),H&&V.append("text").attr("x",m).attr("y",x/2).attr("fill","#767676").attr("text-anchor","start").text(H),Z.selectAll(".lolly").data(C).enter().append("circle").attr("cx",(function(t){return tt(+t[z[1]])})).attr("cy",(function(t){return et(t[M])})).attr("r",B).style("fill",((t,e)=>t.Color?t.Color:W)).style("stroke",((t,e)=>t.Color?t.Color:W)),Z.selectAll(".circleText").data(C).enter().append("text").attr("x",(function(t){return tt(+t[z[1]])})).attr("y",(function(t){return et(t[M])+5-2})).style("font-size",B).style("font-weight","bold").style("fill",((t,e)=>"#FFF")).text((t=>t[z[1]])).attr("text-anchor","middle"),S.length>0){const t=!!function(t){var e="";e=top!==self?window.location.search.substring(1).split("&"):window.parent.location.search.substring(1).split("&");for(let r=0;r<e.length;r++){let a=e[r].split("=");if(a[0]==t)return a[1]}return null}("labelling");console.log("clickLoggingOn",t),"string"==typeof S[0].coords&&S.forEach((function(t){t.coords=JSON.parse(t.coords),t.sweepFlag=+t.sweepFlag,t.largeArcFlag=+t.largeArcFlag,t.radius=+t.radius})),console.log("annotations",S),S.forEach((e=>{n(V,e,p,g,{left:m,right:b,top:x,bottom:k},t)}))}}}export{i as default};
>>>>>>> 080f0b952a623a770f1eecc5af4e000cbb1701b3
