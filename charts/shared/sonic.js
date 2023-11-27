import * as tone from './Tone'
// import * as d3 from 'd3' // You can replace with only d3-scale and d3-array if you're not already using d3 for your charts
// import notes from './notes.json';

// No idea why Tone needs to be uppercase T when importing like this
// console.log(Tone)
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

// Sets the note duration to fit an overall duration for playing back a data series

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
      this.currentKeyIndex = 0
      this.duration = {"note":0.2, "audioRendering":"discrete"}
      this.note = 0.2
      this.sonicData = {}
      this.interval = null
      this.timeSettings = null
      this.domainX = null
      this.domainY = null
      this.xVar = null
      this.isPlaying = false
      this.inProgress = false
      this.scale = null
      this.dataKeys = null
  }

  loadSynth(selectedInstrument)  {
    console.log(this.synth)
    let settings = instruments[selectedInstrument]
    console.log("settings",settings)
    let synthType = settings.Synth
    let synthPreset = settings.Presets
    let newSynth = new Tone[synthType](synthPreset).toDestination();
    this.synth = newSynth
    console.log(this.synth)
    let clickSettings = instruments['Click']
    this.click = new Tone['Synth'](clickSettings.Presets).toDestination();

  }
  

  beep(freq) {
    return new Promise( (resolve, reject) => {
      Tone.Transport.stop()
      Tone.Transport.cancel()
      
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



  setupSonicData(data, keys = [], exclude = []) {
    
    let self = this
    self.duration = getDuration(data.length)
    self.note = self.duration.note
    
    const xFormat = this.settings.xFormat
    
    console.log("xFormat", xFormat)
    console.log("note", self.note)

    if (self.duration.audioRendering == "continuous") {
      self.loadSynth('DefaultLine')
    }

    else {
      self.loadSynth('Kalimba')
    }
   
    console.log("note", self.note)
    console.log("data", self.data)
    
    // set up the data structure we need, and the keys of data to be sonified

    let synth = self.synth
    let click = self.click
  
    var hasRun = self.hasRun
    let dataKeys = Object.keys(data[0])

    self.xVar = dataKeys[0]
    if (xFormat.date) {
      self.timeSettings = analyseTime(data, self.settings)
    }
    
    self.interval = getInterval(self.settings, self.xVar, self.timeSettings)
    
    console.log("time settings", self.timeSettings)
    console.log("interval", self.interval)

    let allDataValues = []
    let hideNullValues = false
    
    // Check if chart code set specific keys, otherwise just use the keys from the data

    if (keys.length === 0) {
        keys = dataKeys.slice(1)
    }

    // make keys available to other methods

    self.dataKeys = keys
    
    // Format the data as needed, add to the sonicData dict

    keys.forEach(function(key) {
        self.sonicData[key] = []
        data.forEach((d) => {
        if (d[key] != null) {
            let newData = {}
            newData[self.xVar] = d[self.xVar]
            newData[key] = d[key]
            self.sonicData[key].push(newData)
            allDataValues.push(d[key])
        } else if (!hideNullValues) {
            let newData = {}
            newData[self.xVar] = d[self.xVar]
            newData[key] = d[key]
            self.sonicData[key].push(newData)
        }
        })
    })

    // Setting the scale range for linear scale
    // console.log("allDataValues", allDataValues)
    console.log("sonicData", self.sonicData)
    let range = [130.81,523.25]
    self.domainY = d3.extent(allDataValues)
    self.domainX = d3.extent(data, d => d[self.xVar])
    // Invert if needed
    // ranked charts use inverted scale, eg bird of the year
    // https://interactive.guim.co.uk/embed/superyacht-testing/index.html?key=1WVTOMn-2BPVPUahzMzCM4H1inPM6oCT8w17GE5giDe8&location=docsdata
    if ("invertY" in this.settings) {
      if (this.settings.invertY) {
        range = range.reverse()
      }
    }
    
    console.log("range", range, "domain", self.domainY)
    self.scale = d3.scaleLinear()
      .domain(self.domainY)
      .range(range)

  }
  


 playAudio = (dataKey) => {
    return new Promise((resolve, reject) => {
      let self = this
      let keyIndex = self.dataKeys.indexOf(dataKey)
      console.log(`Setting up the transport for ${dataKey}`)
      // Clear the transport
      Tone.Transport.stop()
      Tone.Transport.cancel()

      // syncs the synth to the transport

      if (self.duration.audioRendering == "discrete") {  
        self.synth.sync()
        self.click.sync()
      }

      self.sonicData[dataKey].forEach(function(d,i) { 
        
        if (self.duration.audioRendering == "discrete") {
          
            if (d[dataKey]) {
              self.synth.triggerAttackRelease(self.scale(d[dataKey]), self.note, self.note * i)
            }
            
            else {
              self.click.triggerAttackRelease(440, self.note, self.note * i)
            }
        }

        else {
          console.log("making continuous noise")
          if (i == 0) { 
            synth.triggerAttackRelease(self.scale(d[key]), self.sonicData[dataKey].length * self.note)
            // animateCont(key)
          }
          else {
              Tone.Transport.schedule(function(){
              self.synth.frequency.rampTo(scale(d[dataKey]), self.note);
              }, i * self.note);
          }
        }
    
    })
      
      // resolve after the last note is played

      Tone.Transport.schedule(function(){
        console.log("the end")
        self.isPlaying = false
        resolve({ status : "success"})
      }, self.sonicData[dataKey].length * self.note);
    
      // set inprogress to false after the last note of the last data series is played

      if (keyIndex === self.dataKeys.length -1) {
        Tone.Transport.schedule(function(){
          console.log("the actual end")
          self.inProgress = false
          }, self.sonicData[dataKey].length * self.note);
      }
  
      Tone.Transport.position = "0:0:0"  
      Tone.Transport.start()
      self.inProgress = true
    });

  }  

 playFurniture = () => { 
    return new Promise((resolve, reject) => {
    let self = this
    async function blah() {
      
      let lowestY = self.domainY[0]
      let highestY = self.domainY[1]
      console.log("scaled", self.scale)
      if ("invertY" in self.settings) {
        if (self.settings.invertY) {
          lowestY = self.domainY[1]
          highestY = self.domainY[0]
        }
      }
  
      let lowestX = self.domainX[0]
      let highestX = self.domainX[1]
  
      if (self.settings.xFormat.date) {
        lowestX = xvarFormatSpeech(self.domainX[0], self.timeSettings.suggestedFormat)
        highestX = xvarFormatSpeech(self.domainX[1], self.timeSettings.suggestedFormat)
      }
  
      console.log("domainY",self.domainY)
      let lowestYStr = lowestY
      let highestYStr = highestY
      if (typeof lowestY == 'number') {
          lowestYStr = numberFormatSpeech(lowestY)
          highestYStr = numberFormatSpeech(highestY)
      }
  
      const text1 = await self.speaker(`The lowest value on the chart is ${lowestYStr}, and it sounds like `)
      const beep1 = await self.beep(self.scale(lowestY))        
  
      await timer(1200);
  
      const text2 = await self.speaker(`The highest value on the chart is ${highestYStr}, and it sounds like `)
  
      const beep2 = await self.beep(self.scale(highestY))
  
      await timer(1200);
  
      const text3 = await self.speaker(`Each note is a ${self.interval}, and the chart goes from ${lowestX} to ${highestX}`)
      resolve({ status : "success"})
    }  

    blah()  
    
  })
}

  async playPause() { 

    let self = this

    if (!self.runOnce) {
      Tone.start()
      self.runOnce = true
      await self.playFurniture()
    }
    
    // it's not playing, and not pause so play it from the start
  
    if (!self.isPlaying && !self.inProgress) {
      console.log("playing")
      self.isPlaying = true
      self.inProgress = true
      console.log("yeh")
      
      for await (const key of this.dataKeys) {
        console.log(key)
        
        let speakKey = await self.speaker(`${key}`)
        
        await self.playAudio(key)

      }
  
    }
  
    // it is playing so pause 
  
    else if (self.isPlaying && self.inProgress) {
      console.log("pause")
      self.isPlaying = false
      Tone.Transport.pause();
    }
  
    // it has been paused, so restart 
  
    else if (!self.isPlaying && self.inProgress) {
      console.log("restart")
      self.isPlaying = true
      Tone.Transport.start();
    }
    
  }	



}
