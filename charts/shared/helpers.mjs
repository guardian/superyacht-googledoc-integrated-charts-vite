import moment from "./moment.js"

var helpers = {

  decimals: function(items) {
    var nums = items.split(",")
    return parseFloat(this[nums[0]]).toFixed(nums[1]);
  },

  formatDate: function (values="Date,MMM D 'YY", render) {
    let value = values.split(",")
    let date = new Date(this[render(value[0])])
    let format = (value[1]) ? value[1] : "MMM D 'YY"
    return moment(date).format(format);
  },

  monthYear: function (values="Date,MMM D 'YY", render) {
    let value = values.split(",")
    let date = new Date(this[render(value[0])])
    let format = (value[1]) ? value[1] : "MMM 'YY"
    return moment(date).format(format);
  },

  roundZero: function (value, render) {
    return Math.round(render(value));
  },

  numberFormat: function(items) {

    var nums = items.split(",")
    let num = this[nums[0]]

      if ( num > 0 ) {
          if ( num >= 1000000000 ) { 

              if ((num / 1000000000) % 1 == 0) {
                  return ( num / 1000000000 ) + 'bn' 
              }
              else {
                  return ( num / 1000000000 ).toFixed(1) + 'bn' 
              }
              
              }
          if ( num >= 1000000 ) { 

              if (( num / 1000000 ) % 1 == 0) {
                return ( num / 1000000 ) + 'm' 
              }  
              else {
                return ( num / 1000000 ).toFixed(1) + 'm' 
              }
              
              }
          if ( num >= 1000 ) {

              if (( num / 1000 ) % 1 == 0) {
                return ( num / 1000 ) + 'k' 
              }

              else {
                return ( num / 1000 ).toFixed(1) + 'k' 
              }
            }
          if (num % 1 != 0) { 
              return num
            }
          else { return num }
      }
      if ( num < 0 ) {
          var posNum = num * -1;
          if ( posNum >= 1000000000 ) return [ "-" + String(( posNum / 1000000000 ).toFixed(1)) + 'bn'];
          if ( posNum >= 1000000 ) return ["-" + String(( posNum / 1000000 ).toFixed(1)) + 'm'];
          if ( posNum >= 1000 ) return ["-" + String(( posNum / 1000 ).toFixed(1)) + 'k'];
          else { return num }
      }
      return num;
  }

}

export default helpers