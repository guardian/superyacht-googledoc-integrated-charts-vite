export function drawShowMore(enableShowMore) {

  var button = document.querySelector("#button2")
  var wrapper = document.querySelector("#outer-wrapper")

  if (enableShowMore) {
    console.log("Activate")
    button.addEventListener("click", toggleButton)
    wrapper.classList.toggle("min")
  } else {
    console.log("Do not Activate")
    if (button != null) {
      button.remove()
      //wrapper.classList.toggle("min")
    }
    
  }

  function toggleButton() {
    wrapper.classList.toggle("min")
    document.getElementById("showbutton").classList.toggle("hide")
    document.getElementById("hidebutton").classList.toggle("hide")
  }
}