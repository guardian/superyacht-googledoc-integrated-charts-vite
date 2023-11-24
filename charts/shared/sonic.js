import * as tone from 'tone'
import * as d3 from 'd3' // You can replace with only d3-scale and d3-array if you're not already using d3 for your charts
// import notes from './notes.json';

function numberFormatSpeech(num) {
  if ( num > 0 ) {
      if ( num >= 1000000000 ) { 

          if ((num / 1000000000) % 1 == 0) {
              return ( num / 1000000000 ) + ' billion' 
          }
          else {
              return ( num / 1000000000 ).toFixed(1) + ' billion' 
          }
          
          }
      if ( num >= 1000000 ) { 

          if (( num / 1000000 ) % 1 == 0) {
            return ( num / 1000000 ) + 'm' 
          }  
          else {
            return ( num / 1000000 ).toFixed(1) + ' million' 
          }
          
          }

      if (num % 1 != 0) { 
          return num
        }
      else { return num }
  }
  if ( num < 0 ) {
      var posNum = num * -1;
      if ( posNum >= 1000000000 ) return [ "-" + String(( posNum / 1000000000 ).toFixed(1)) + ' billion'];
      if ( posNum >= 1000000 ) return ["-" + String(( posNum / 1000000 ).toFixed(1)) + ' million'];
      else { return num }
  }
  return num;
}

function xvarFormatSpeech(xVar, format) {
  // check for date objects
  console.log("yeh", xVar, format)
  if (typeof xVar == "object") {
    console.log("yeh2")
    let timeFormatter = d3.timeFormat(format)
    return timeFormatter(xVar)
  }
  
  else {
    return xVar
  }

}


const dateMap = {
  "%Y":"Year",
  "%y":"Year",
  "%B":"Month",
  "%b":"Month",
}

const instruments =  {
  "DefaultLine": {
    "Synth":"Synth",
    "Presets":{
      "envelope": 
      {
        "decay": 0,
        "sustain":1,
        "release":0.5
      },
    "oscillator": 
      {
          "count": 8,
          "spread": 30,
          "type": "sawtooth4"
      }
    }
  },
  "Click": {
    "Synth":"Synth",
    "Presets":{
      "envelope": {
      "attack": 0,
      "decay": 0.1,
      "sustain":0,
      "release":0.1
    },
    "oscillator": 
      {
          "modulationFrequency": 0.2,
          "type": "sine"
      }
   
  }
  },
  "Kalimba":{
  "Synth":"FMSynth",
  "Presets":{
      "harmonicity":8,
      "volume":5,
      "modulationIndex": 2,
      "oscillator" : {
          "type": "sine"
      },
      "envelope": {
          "attack": 0.001,
          "decay": 2,
          "sustain": 0.1,
          "release": 2
      },
      "modulation" : {
          "type" : "square"
      },
      "modulationEnvelope" : {
          "attack": 0.002,
          "decay": 0.2,
          "sustain": 0,
          "release": 0.2
      }
  }
  }
}


function checkNull(obj, key) {
  let result = null
  if (key in obj) {
    if (obj[key] != "") {
      return obj[key]
    }
  }
  return result
}

function getInterval(settings, xVar, timeSettings) {
  
  // default to the x column name

  let result = xVar

  // user has definted the interval, cool!

  if (checkNull(settings, "interval")) {

    console.log("user has defined the interval")
    result = settings.interval
    
  }

  // no defined interval and it's a date  

  else if (timeSettings) {

    return timeSettings.timescale
  }

  return result

}

function analyseTime(data, settings) {
  let results = {}
  results.interval = null
  results.timescale = null
  results.suggestedFormat = null
  let xVar = null 
  let dataKeys = Object.keys(data[0])

  let xColumn = checkNull(settings, 'xColumn')
  if (!xColumn) {
    xVar = dataKeys[0]
  }
  else {
    xVar = xColumn
  }

  let time1 = data[0][xVar]
  let time2 = data[1][xVar]
  console.log(xVar, time1, time2)
  let timeDiff = Math.abs(time2 - time1); // difference in milliseconds
  console.log(timeDiff)
  // Define time constants
  const ONE_HOUR = 1000 * 60 * 60;
  const ONE_DAY = ONE_HOUR * 24;
  const ONE_WEEK = ONE_DAY * 7;
  const ONE_MONTH = ONE_DAY * 28; // approximate
  const ONE_QUARTER = ONE_MONTH * 3; // approximate
  const ONE_YEAR = ONE_DAY * 365;

  // Determine the appropriate time unit and strftime format
  if (timeDiff < ONE_DAY) {
    results.interval = timeDiff / ONE_HOUR;
    results.timescale = 'hour';
    results.suggestedFormat = '%H:%M'; // hours and minutes
  } else if (timeDiff < ONE_WEEK) {
    results.interval = timeDiff / ONE_DAY;
    results.timescale = 'day';
    results.suggestedFormat = '%d %b'; // day and month
  } else if (timeDiff < ONE_MONTH) {
    results.interval = timeDiff / ONE_WEEK;
    results.timescale = 'week';
    results.suggestedFormat = '%d %b'; // week of the year
  } else if (timeDiff < ONE_QUARTER) {
    results.interval = timeDiff / ONE_MONTH;
    results.timescale = 'month';
    results.suggestedFormat = '%B %Y'; // month and year
  } 
  else if (timeDiff < ONE_YEAR) {
    results.interval = timeDiff / ONE_QUARTER;
    results.timescale = 'quarter';
    results.suggestedFormat = '%B %Y'; // month and year
  }
  else {
    results.interval = timeDiff / ONE_YEAR;
    results.timescale = 'year';
    results.suggestedFormat = '%Y'; // year
  }

  return results;


}


function getDuration(dataLength) {
  let targetDuration = 20
  let note = 0.20
  console.log("full length at 0.20", note * dataLength)
  if ((note * dataLength) <=  targetDuration) {
    return {"note":note, "audioRendering":"discrete"}
  }

  if ((note * dataLength) >  targetDuration) {
    note = 0.1
  }

  if ((note * dataLength) <=  targetDuration) {
    return {"note":note, "audioRendering":"discrete"}
  }

  else {
    note =  targetDuration / dataLength
    return {"note":note, "audioRendering":"discrete"}
  }

}

const timer = ms => new Promise(res => setTimeout(res, ms))

// The main function for playing a series of data

export default class sonic {
  
  constructor(settings) {
      this.settings = settings
      this.synth = null
      // this.synth2 = null
      this.isPlaying = false
      this.hasRun = false
  }

  loadSynth(selectedInstrument)  {
    console.log(this.synth)
    let settings = instruments[selectedInstrument]
    console.log("settings",settings)
    let synthType = settings.Synth
    let synthPreset = settings.Presets
    let newSynth = new tone[synthType](synthPreset).toDestination();
    this.synth = newSynth
    console.log(this.synth)

    let clickSettings = instruments['Click']
    this.click = new tone['Synth'](clickSettings.Presets).toDestination();


  }
  

  beep(freq) {
    return new Promise( (resolve, reject) => {
      tone.Transport.stop()
      tone.Transport.cancel()
      
      let synth = this.synth
      
      synth.unsync()
      console.log("freq", freq)
      console.log(synth)
      synth.triggerAttackRelease(freq, 1)
      setTimeout(success, 1000)
  
      function success () {
        resolve({ status : "success"})
      }
  
  
    })
  
  }
  
  speaker(text) {
  
    return new Promise( (resolve, reject) => {
  
    if ('speechSynthesis' in window) {
     
      var msg = new SpeechSynthesisUtterance();
  
      msg.text = text
  
      window.speechSynthesis.speak(msg);
  
      msg.onend = function() {
  
        resolve({ status : "success"})
  
      };
  
    } else {
  
      resolve({ status : "no txt to speach"})
  
    }
  
    }).catch(function(e) {
  
    reject(e);
  
  });
  }

  // Sets the note duration to fit an overall duration for playing back a data series

 

  
  playAudio(data, keys = [], exclude = []) {
    console.log("loaded")
    let self = this
    
    // note duration in seconds
    // 
    // const note = options.duration / data.length
    const duration = getDuration(data.length)
    const note = duration.note
    
    const xFormat = this.settings.xFormat
    let timeseries = false
    if (xFormat.date) {
      timeseries = true
    }
    console.log("xFormat", xFormat)
    console.log("note", note)

    if (duration.audioRendering == "continuous") {
      self.loadSynth('DefaultLine')
    }

    else {
      self.loadSynth('Kalimba')
    }
   
    console.log("note", note)
    console.log("data", data)
    
    // set up the data structure we need, and the keys of data to be sonified

    let sonicData = {}
    let synth = this.synth
    let click = this.click
    // let synth2 = this.synth2
    var hasRun = this.hasRun
    let dataKeys = Object.keys(data[0])

    let xVar = dataKeys[0]
    let timeSettings = null
    if (timeseries) {
      timeSettings = analyseTime(data, this.settings)
    }
    
    let interval = getInterval(this.settings, xVar, timeSettings)
    
    console.log("time settings", timeSettings)
    console.log("interval", interval)

    let allDataValues = []
    let hideNullValues = false
    
    if (keys.length === 0) {
        keys = dataKeys.slice(1)
    }
    keys.forEach(function(key) {
        sonicData[key] = []
        data.forEach((d) => {
        if (d[key] != null) {
            let newData = {}
            newData[xVar] = d[xVar]
            newData[key] = d[key]
            sonicData[key].push(newData)
            allDataValues.push(d[key])
        } else if (!hideNullValues) {
            let newData = {}
            newData[xVar] = d[xVar]
            newData[key] = d[key]
            sonicData[key].push(newData)
        }
        })
    })

    // Setting the scale range for linear scale
    // console.log("allDataValues", allDataValues)
    console.log("sonicData", sonicData)
    let range = [130.81,523.25]
    let domainY = d3.extent(allDataValues)
    let domainX = d3.extent(data, d => d[xVar])
    // Invert if needed

    // if (options.invertAudio) {
    //   range = range.reverse()
    // }
    
    console.log("range", range)
    let scale = d3.scaleLinear()
      .domain(domainY)
      .range(range)

    function makeNoise(noiseKeys) {
        console.log("makeNoise")
        tone.Transport.stop()
        tone.Transport.cancel()
       
        noiseKeys.forEach(function(key) {

            let keyI = keys.indexOf(key)
            console.log(keyI)

            if (duration.audioRendering == "discrete") {
              
              synth.sync()
              click.sync()

            }
            
            sonicData[key].forEach(function(d,i) { 
                
                if (duration.audioRendering == "discrete") {
                  
                    if (d[key]) {
                      synth.triggerAttackRelease(scale(d[key]), note, note * i)
                    }
                    
                    else {
                      click.triggerAttackRelease(440, note, note * i)
                    }
                    
                    // tone.Transport.schedule(function(){
                    //     animateDisc(key, i, sonicData[key].length)
                    // }, i * note);
                }

                else {
                  console.log("making continuous noise")
                  if (i == 0) { 
                    synth.triggerAttackRelease(scale(d[key]), sonicData[key].length * note)
                    // animateCont(key)
                  }
                  else {
                      tone.Transport.schedule(function(){
                      synth.frequency.rampTo(scale(d[key]), note);
                      }, i * note);
                  }
                }

            
              })

        })
        
        tone.Transport.position = "0:0:0"  
        tone.Transport.start()
        
        function clearSynth() {
          tone.Transport.stop()
          tone.Transport.cancel()
        }
    
    } // end makeNoise

    // check if play data series simultaneously or consecutively

    let isPlaying = this.isPlaying

    
    async function noiseLoop() {    

      if (!isPlaying) {

        isPlaying = true

        let lowestY = domainY[0]
        let highestY = domainY[1]

        let lowestX = domainX[0]
        let highestX = domainX[1]
        if (timeseries) {
          lowestX = xvarFormatSpeech(domainX[0], timeSettings.suggestedFormat)
          highestX = xvarFormatSpeech(domainX[1], timeSettings.suggestedFormat)
        }

        console.log("domainY",domainY)
        if (typeof lowestY == 'number') {
            lowestY = numberFormatSpeech(lowestY)
            highestY = numberFormatSpeech(highestY)
        }

        const text1 = await self.speaker(`The lowest value on the chart is ${lowestY}, and it sounds like `)
        const beep1 = await self.beep(scale(domainY[0]))        

        await timer(1200);

        const text2 = await self.speaker(`The highest value on the chart is ${highestY}, and it sounds like `)

        const beep2 = await self.beep(scale(domainY[1]))

        await timer(1200);

        const text3 = await self.speaker(`Each note is a ${interval}, and the chart goes from ${lowestX} to ${highestX}`)
    
        
        // for await (const datastream of self.keyOrder) {

        // //       d3.select("#playHead")
        // //         .attr("cx",self.x(self.sonicData[datastream][0][xVar]) + self.margin.left)
        // //         .attr("cy",self.y(self.sonicData[datastream][0][datastream]) + self.margin.top)

        // //   const category = await speaker(datastream)

        //   makeNoise(xVar, datastream)

        //   await timer(self.sonicData[datastream].length * note * 1000);

        // }

  
   
    async function play() {
        console.log("keys", keys)
        for await (const key of keys) {
            console.log(key)
            
            let speakKey = await self.speaker(`${key}`)
            
            makeNoise([key])
            await timer(sonicData[key].length * note * 1000 + 1000);
        
        }
    }
    
    play()
       
    //   await timer(3000);  
      isPlaying = false

    }

    } // end noiseLoop


    noiseLoop()
   

} // end playAudio

}
