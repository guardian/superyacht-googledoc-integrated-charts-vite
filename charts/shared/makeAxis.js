// makeTopLinedAxis Makes the axis with verttical lines we use in horizontal bar, grouped bar, lolliops, bubbles etc

export function makeTopLinedAxis(width, height, margintop, marginbottom, xFormat, x, xAxisDateFormat=null) {

    let xTicks = Math.round(width / 60)
    if (xTicks < 2) {
        xTicks = 2
    }
    let xAxis

    // It's a date axis, so do some special stuff

    if (xFormat.date) {
        let tickMod = Math.round(datum.map(d => d[xColumn]).length / xTicks)
        let ticks = xLabel.domain().filter((d, i) => !(i % tickMod) || i === xLabel.domain().length - 1)
    
        xAxis = d3.axisTop(x)
            .ticks(ticks)
            .tickSize(-(  height - margintop - marginbottom), 0, 0)
    
        if (xAxisDateFormat) {
            xAxis.tickValues(ticks).tickFormat(d3.timeFormat(xAxisDateFormat)) 
        } 
        
        else {
            xAxis.tickValues(ticks).tickFormat(d3.timeFormat("%b %Y")) 
        }
          
    }

    // It's a regular axis

    else {
        xAxis = d3.axisTop(x)
        .ticks(xTicks)
        .tickSize(-( height - margintop - marginbottom), 0, 0)
    }
    
   return xAxis
    
}