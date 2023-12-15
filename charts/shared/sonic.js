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
            return ( num / 1000000 ) + ' million' 
          }  
          else {
            return ( num / 1000000 ).toFixed(1) + ' million' 
          }
          
          }

      if (num % 1 != 0) { 
          return num.toFixed(2)
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

function yearText(year) {

	if (year.length !=4) {
		console.log("Error, not a year string")
		return year
	} 

	else {
		let partOne = year.slice(0,2)
		let partTwo = year.slice(2,4)
		let checkZero = year.slice(2,3)

		if (year != "2000" && partTwo == "00") {
			
			partTwo = "hundred"
		}

		else if (year == "2000") {
			partOne = "two thousand"
			partTwo  = ""
		}

		else if (checkZero == "0") {

			let lastNum = year.slice(3,4)
			partTwo = "oh " + lastNum
		}

		return `${partOne} ${partTwo}`
	}	
	
}

function xvarFormatSpeech(xVar, format) {
  // check for date objects
  console.log(xVar, format)
  if (typeof xVar == "object") {
    
    let timeFormatter = d3.timeFormat(format)
    let result = timeFormatter(xVar)
    if (format == "%Y") {
      result = yearText(result)
    }
    return result
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

// Set defaults based on the dataset and chart type



// Sets the note duration to fit an overall duration for playing back a data series

function getDuration(dataLength) {

  let targetDuration = 20
  let note = 0.20
  console.log("full length at 0.20", note * dataLength)
  if ((note * dataLength) <=  targetDuration) {
    // return {"note":note, "audioRendering":"discrete"}
    return note
  }

  if ((note * dataLength) > targetDuration) {
    note = 0.1
  }

  if ((note * dataLength) <=  targetDuration) {
    // return {"note":note, "audioRendering":"discrete"}
    return note
  }

  else {
    note = targetDuration / dataLength
    // TBC: set audioRendering to continuous for very long datasets. requires testing
    // return {"note":note, "audioRendering":"discrete"}
    return note
  }

}

const timer = ms => new Promise(res => setTimeout(res, ms))

// The main function for playing a series of data

export default class sonic {
  
  constructor(settings, x, y, colors) {
      this.settings = settings
      this.x = x
      this.y = y
      this.colors = colors
      this.synth = null
      // this.synth2 = null
      this.isPlaying = false
      this.hasRun = false
      this.currentKey = null
      this.currentIndex = 0
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
      this.speech = window.speechSynthesis
      this.furniturePlaying = false
      this.usedCursor = false
      this.audioRendering = 'discrete'

      let xBand = checkNull(this.x, 'bandwidth')
      if (xBand) {
        xBand = xBand()
      }

      let yBand = checkNull(this.y, 'bandwidth')
      if (yBand) {
        yBand = yBand()
      }

      this.xBand = xBand
      this.yBand = yBand

      console.log("xBand", xBand, "yBand", yBand)
  }

  loadSynth(selectedInstrument)  {
    let settings = instruments[selectedInstrument]
    console.log("settings",settings)
    let synthType = settings.Synth
    let synthPreset = settings.Presets
    let newSynth = new Tone[synthType](synthPreset).toDestination();
    this.synth = newSynth
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
      synth.triggerAttackRelease(freq, 0.5)
      setTimeout(success, 500)
  
      function success () {
        resolve({ status : "success"})
      }
  
  
    })
  
  }
  
  speaker(text) {
  
    return new Promise( (resolve, reject) => {
    let self = this
    if ('speechSynthesis' in window) {
      // clear any current speech
      var msg = new SpeechSynthesisUtterance();
  
      msg.text = text
      msg.lang = 'en-GB'
      // msg.rate = 0.8
      self.speech.speak(msg);
  
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
    self.note = getDuration(data.length)
    
    const xFormat = this.settings.xFormat

    if (self.settings.audioRendering) {
      self.audioRendering = self.settings.audioRendering
    }

    console.log("audioRendering", self.audioRendering)

    if (self.audioRendering == "continuous") {
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
    self.currentKey = keys[0]
    
    // To store the highest and lowest data objects
    console.log("data", data)
    let xVar = self.xVar
    self.lowestVal = {"key":keys[0], "value":data[0][keys[0]], [xVar]:data[0][self.xVar]}
    self.highestVal = {"key":keys[0], "value":data[0][keys[0]], [xVar]:data[0][self.xVar]}


    // Format the data as needed, add to the sonicData dict
    keys.forEach(function(key) {
        self.sonicData[key] = []
        data.forEach((d, i) => {
        if (d[key] != null) {

            let newData = {}
            newData[self.xVar] = d[self.xVar]
            newData[key] = d[key]
            newData.sonic_index = i
            self.sonicData[key].push(newData)
            allDataValues.push(d[key])

            if (newData[key] > self.highestVal.value) {
              self.highestVal['key'] = key
              self.highestVal['value'] = d[key]
              self.highestVal[xVar] = d[self.xVar]
            }

            if (newData[key] < self.lowestVal.value) {
              self.lowestVal['key'] = key
              self.lowestVal['value'] = d[key]
              self.lowestVal[xVar] = d[self.xVar]
            }
           
        } else if (!hideNullValues) {
            let newData = {}
            newData[self.xVar] = d[self.xVar]
            newData[key] = d[key]
            newData.sonic_index  = i
            self.sonicData[key].push(newData)
        }
        })
    })

    // Setting the scale range for linear scale
    // console.log("allDataValues", allDataValues)
    console.log("sonicData", self.sonicData)
    console.log("highestVal", self.highestVal)
    console.log("lowestVal", self.lowestVal)
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
    return new Promise(async (resolve, reject) => {
      let self = this
      let keyIndex = self.dataKeys.indexOf(dataKey)
      // let halfway = self.sonicData[dataKey]
      console.log(`Setting up the transport for ${dataKey}`)
      // Clear the transport
      Tone.Transport.stop()
      Tone.Transport.cancel()

      
      // syncs the synth to the transport

      if (self.audioRendering == "discrete") {  
        self.synth.sync()
        self.click.sync()
      }

      let data = self.sonicData[dataKey]

      // Check if the cursor has been used, slice to the current position
      console.log("current index",self.currentIndex)
      if (self.currentIndex != 0) {
        data = data.slice(self.currentIndex)
        // console.log(data)
      }

      for (let i = 0; i < data.length; i++) {
        const d = data[i];
        self.currentKey = dataKey
        
        if (self.audioRendering == "discrete") {
          
            if (d[dataKey]) {
              self.synth.triggerAttackRelease(self.scale(d[dataKey]), self.note, self.note * i)
            }
            
            else {
              self.click.triggerAttackRelease(440, self.note, self.note * i)
            }

            Tone.Transport.schedule(function(){
              self.currentIndex = d.sonic_index
              if (d[dataKey]) {
                self.animateCursor(dataKey,i, null)
              }
              // console.log(self.currentIndex)
              }, i * self.note);
        } // end discrete

        else if (self.audioRendering == "continuous") {
          console.log("making continuous noise")
          if (i == 0) { 
            synth.triggerAttackRelease(self.scale(d[key]), data[dataKey].length * self.note)
            // animateCont(key)
          }
          else {
              Tone.Transport.schedule(function(){
              self.synth.frequency.rampTo(scale(d[dataKey]), self.note);
              }, i * self.note);
          }
        }  


        else if (self.audioRendering == "categorical") {
            console.log("categorical")
            
            await self.speaker(d[self.xVar])
            
            self.animateCursor(dataKey,i, null)
            let thing2 = await self.beep(self.scale(d[dataKey]))
        }
    
    }

    // Reads out the middle X value halfway through the series

    // let halfway = Math.floor(data.length / 2)
    // Tone.Transport.schedule(function(){
    //   console.log("the start")
    //   self.speaker(xvarFormatSpeech(data[halfway][self.xVar], self.timeSettings.suggestedFormat))
    // }, halfway * self.note);


      // resolve after the last note is played

      Tone.Transport.schedule(function(){
        console.log("the end")
        // self.speaker(xvarFormatSpeech(data[data.length - 1][self.xVar], self.timeSettings.suggestedFormat))
        self.currentIndex = 0
        self.isPlaying = false
        resolve({ status : "success"})
      }, data.length * self.note);
    
      // set inprogress to false after the last note of the last data series is played

      if (keyIndex === self.dataKeys.length -1) {
        Tone.Transport.schedule(function(){
          console.log("the actual end")
          self.inProgress = false
          self.usedCursor = false
          }, data.length * self.note);
      }
  
      Tone.Transport.position = "0:0:0"  
      Tone.Transport.start()
      self.inProgress = true
      self.isPlaying = true
    });

  }  

 playFurniture = () => { 
    return new Promise((resolve, reject) => {
    let self = this
    async function blah() {

      // uncomment to make testing synth / audio context faster  
      // await self.beep(440)    
      
      let lowestY = self.domainY[0]
      let highestY = self.domainY[1]

      if ("invertY" in self.settings) {
        if (self.settings.invertY) {
          lowestY = self.domainY[1]
          highestY = self.domainY[0]
        }
      }
  
      let lowestX = self.domainX[0]
      let highestX = self.domainX[1]

      let lowestXStr = lowestX
      let highestXStr = highestX
      if (self.settings.xFormat.date) {
        lowestXStr = xvarFormatSpeech(self.domainX[0], self.timeSettings.suggestedFormat)
        highestXStr = xvarFormatSpeech(self.domainX[1], self.timeSettings.suggestedFormat)
      }
  
      let lowestYStr = lowestY
      let highestYStr = highestY
      if (typeof lowestY == 'number') {
          lowestYStr = numberFormatSpeech(lowestY)
          highestYStr = numberFormatSpeech(highestY)
      }
      self.furniturePlaying = true
      const text1 = await self.speaker(`The lowest value on the chart is ${lowestYStr}, and it sounds like `)
      self.animateCircle(self.lowestVal[self.xVar],self.lowestVal.value, self.lowestVal.key)
      const beep1 = await self.beep(self.scale(lowestY))        
  
      await timer(1200);
  
      const text2 = await self.speaker(`The highest value on the chart is ${highestYStr}, and it sounds like `)
      self.animateCircle(self.highestVal[self.xVar],self.highestVal.value, self.highestVal.key)
      const beep2 = await self.beep(self.scale(highestY))
  
      await timer(1200);
  
      if (self.audioRendering == "discrete" || self.audioRendering == "continuous") {
        const text3 = await self.speaker(`Each note is a ${self.interval}, and the chart goes from ${lowestXStr} to ${highestXStr}`)
      }  
      
      self.furniturePlaying = false
      resolve({ status : "success"})
    }  

    blah()  
    
  })
}

  async playPause() { 

    let self = this
    console.log("playing", self.isPlaying, "progress", self.inProgress, "cursor", self.usedCursor)
    
    if (!self.runOnce && !self.inProgress) {
      console.log("playing furniture")
      Tone.start()
      self.synth.context.resume();
      self.runOnce = true
      // self.inProgress = true
      await self.playFurniture()
    }
    
    // Pausing and resuming speech needs work

    // if (self.furniturePlaying) {
    //   self.speech.pause()
    //   self.furniturePlaying = false
    // }

    // else if (!self.furniturePlaying) {
    //   self.speech.resume()
    //   self.furniturePlaying = true
    // }

    // it's not playing, and not pause so play it from the start
  
    if (!self.isPlaying && !self.inProgress && !self.usedCursor) {
      console.log("playing")
      // self.isPlaying = true
      // self.inProgress = true
      
      for await (const key of this.dataKeys) {
        console.log(key)
        
        let speakKey = await self.speaker(`${key}`)
        
        await self.playAudio(key)


      }
  
    }
  
    // Function to resume after using the cursor here

    else if (!self.isPlaying && self.inProgress && self.usedCursor) {
      console.log("playing from cursor")
      // self.isPlaying = true
      // self.inProgress = true
      console.log("yeh")
      
      let currentKeyIndex = self.dataKeys.indexOf(self.currentKey)

      for (let i = currentKeyIndex; i < self.dataKeys.length; i++) {
        self.currentKey = self.dataKeys[i]
        let speakKey = await self.speaker(`${self.currentKey}`)
        await self.playAudio(self.currentKey)
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
      // self.isPlaying = true
      Tone.Transport.start();
    }
    
  }	

  async moveCursor(direction) {

    // increment the position of the current data index up by one, then play the datapoint
    let self = this
    self.usedCursor = true
    self.isPlaying = false
    self.inProgress = true

    console.log("Move cursor", direction)
    
    Tone.Transport.pause();

    self.currentIndex = self.currentIndex + direction
   
    if (self.currentIndex >= self.sonicData[self.currentKey].length) {
      self.currentIndex = 0
    }

    if (self.currentIndex < 0) {
      self.currentIndex = self.sonicData[self.currentKey].length - 1
    }

    let currentData = self.sonicData[self.currentKey][self.currentIndex]
    console.log("currentData", currentData)
    let currentX = currentData[self.xVar]
    let currentY = currentData[self.currentKey]

    // self.speech.cancel()
    self.speaker(xvarFormatSpeech(currentX, self.timeSettings.suggestedFormat))
    self.speaker(numberFormatSpeech(currentY))
    self.animateCursor(self.currentKey,self.currentIndex, null)
    self.beep(self.scale(currentY))

  }

  moveSeries(direction) {
    let self = this
    self.usedCursor = true
    self.isPlaying = false
    self.inProgress = true
    
    console.log("Move series", direction)
    
    Tone.Transport.pause();

    let currentKeyIndex = self.dataKeys.indexOf(self.currentKey)
    console.log("Old key", self.currentKey, "old key index", currentKeyIndex)
    currentKeyIndex = currentKeyIndex + direction

    if (currentKeyIndex >= self.dataKeys.length) {
      currentKeyIndex = 0
    }

    if (currentKeyIndex < 0) {
      currentKeyIndex = self.dataKeys.length - 1
    }

    self.currentKey = self.dataKeys[currentKeyIndex]
    let currentData = self.sonicData[self.currentKey][self.currentIndex]
    console.log("currentData", currentData)
    let currentX = currentData[self.xVar]
    let currentY = currentData[self.currentKey]

    console.log("New key", self.currentKey, "new key index", currentKeyIndex)
    self.speaker(self.currentKey)
    self.speaker(numberFormatSpeech(currentY))
    self.animateCursor(self.currentKey,self.currentIndex, null)
    self.beep(self.scale(currentY))
  }

  addInteraction() {
    let self = this
    let ele = document.getElementById("app");
    let btn = document.getElementById("playChart");
    ele.addEventListener('keypress', (e) => {
      console.log(e.code)
      if (e.code === "Space") {
        this.playPause()
      }

      if (e.code === "KeyD") {
        console.log("keyd")
        self.moveCursor(1)
      }

      if (e.code === "KeyA") {
        self.moveCursor(-1)
      }

      if (e.code === "KeyW") {
        self.moveSeries(1)
      }

      if (e.code === "KeyS") {
        self.moveSeries(-1)
      }
    });

    btn.addEventListener('keyup', (e) => {

      if (e.code === "Space") {
        e.preventDefault();
      }

      

    })
  }

  animateCursor(key, i, len) {

    let self = this
    let data = self.sonicData[key]
    let chartType = self.settings.type
    // console.log(self.x)

    let y = self.y(data[i][key])
    let x = self.x(data[i][self.xVar])

    if (chartType == 'horizontalbar') {
      y = self.y(data[i][self.xVar])
      x = self.x(data[i][key])
    }
    
    d3.select("#features")
        .append("circle")
        .attr("cy", y + self.yBand / 2)
        .attr("fill", self.colors.get(key))
        .attr("cx", x + self.xBand / 2)
        .attr("r", 0)
        .style("opacity", 1)
        .transition()
        .duration(300)
        .attr("r",40)
        .style("opacity",0)
        .remove()
  

  }

  animateCircle(cx, cy, key=null) {
    console.log("cx", cx, "cy", cy)
    let self = this
    let chartType = self.settings.type
    if (!key) {
      key = self.currentKey
    }

    let y = cy
    let x = cx

    if (chartType == 'horizontalbar') {
      y = cx
      x = cy
    }

    d3.select("#features")
        .append("circle")
        .attr("cy", self.y(y) + self.yBand / 2)
        .attr("fill", self.colors.get(key))
        .attr("cx", self.x(x) + self.xBand / 2)
        .attr("r", 0)
        .style("opacity", 1)
        .transition()
        .duration(300)
        .attr("r",40)
        .style("opacity",0)
        .remove()
  

  }


}
