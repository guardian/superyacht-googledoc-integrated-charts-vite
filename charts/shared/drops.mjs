import { createElement } from "./toolbelt";

export function addDrops() {

  const comment = createElement("div",{"class":"showing_label"})

  comment.innerHTML = "Currently showing:"

  const dataPicker = createElement("select",{"id":"dataPicker"})

  const label = createElement("label",{"class":"dropdown"}, [comment, dataPicker] )

  const row = createElement("div",{"class":"row"},[label])

  const furniture = document.querySelector('#furniture');

  furniture.parentNode.insertBefore(row, furniture.nextSibling);

  furniture.parentNode.insertBefore(comment, furniture.nextSibling);

}
