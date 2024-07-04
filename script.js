"use strict";
let outputElement;
const keyExcludeElem = [];
const keyCaseElem = [];
const keyWordsElem = [];
const keyElements = 7;
let allUpperCaseWords = {};
let filterKeys;
let keyWord1Element, keyWord2Element, keyWord3Element;
let negKeyWord1Element, negKeyWord2Element, negKeyWord3Element;
let indexPosition = 0;
let stepSize = 50;
let table, tableBody;
let info1, info2;
let keyword1, keyword2, keyword3;
let negkeyword1, negkeyword2, negkeyword3;
let lastTs = 0;
let itemsDisplayed = 0;

const allItems = [];

window.onload = function () {
  outputElement = document.getElementById("output");
  for (var i = 0; i < keyElements; i++) {
    keyExcludeElem.push(document.getElementById("keyexclude" + (i + 1)));
    keyCaseElem.push(document.getElementById("keycase" + (i + 1)));
    keyWordsElem.push(document.getElementById("keyword" + (i + 1)));

  }
  info1 = document.getElementById("info1");
  info2 = document.getElementById("info2");
  document.getElementById("filter").addEventListener("click", applyFilter);
  table = document.createElement("table");
  tableBody = document.createElement("tbody");
  table.appendChild(tableBody);
  outputElement.appendChild(table);
}

async function loadAllFiles() {
  if (allItems.length == 0) {
    await loadAndAppend("classes.csv", "Class");
    await loadAndAppend("constants.csv", "Constant");
    await loadAndAppend("enums.csv", "Enum");
    await loadAndAppend("functions.csv", "Function");
    info1.innerHTML = `Total items: ${allItems.length}`;
  }
  lastTs = 0;
  tableBody.innerHTML = "";
  itemsDisplayed = 0;
  indexPosition = 0;
  loadInPage();

}

function applyFilter() {
  filterKeys = [];
  allUpperCaseWords = {};
  for (var i = 0; i < keyWordsElem.length; i++) {
    if (keyWordsElem[i].value.trim() != "") {
      const caseSensitive = keyCaseElem[i].checked;
      const word = (caseSensitive) ? keyWordsElem[i].value.trim() : keyWordsElem[i].value.trim().toLowerCase();
      const negative = keyExcludeElem[i].checked;
      filterKeys.push({ key: word, caseSense: caseSensitive, negative: negative });
    }
  }
  loadAllFiles();
}

async function loadAndAppend(fileInput, category) {
  const request = new Request(fileInput);
  const response = await fetch(request);
  const inputCsv = await response.text();
  const allLines = inputCsv.split(/\r?\n|\r|\n/g);
  for (var line = 1; line < allLines.length; line++) {
    const items = allLines[line].split(",");
    if (items.length > 1) {
      if (items[1].length > 1) allItems.push({ name: items[1], path: items[0], category });
    }
  }
  console.log(allLines.length);
}


function loadInPage(ts) {
  if (lastTs == 0) {
    lastTs = ts || 0;
  } else {
    const timeTaken = (ts - lastTs);
    stepSize = Math.max(150, Math.min(2000, stepSize + Math.round(125 - timeTaken)));
    lastTs = ts;
    if (Math.random() < 0.15) console.log(stepSize, timeTaken);
  }
  for (var i = 0; i < stepSize && indexPosition < allItems.length; i++) {
    const item = allItems[indexPosition];
    let passFilter = true;
    for (var j = 0; j < filterKeys.length; j++) {
      let name = item.name;
      if (!filterKeys[j].caseSense) {
        name = name.toLowerCase();
      }
      if ((filterKeys[j].negative == name.includes(filterKeys[j].key))) {
        passFilter = false;
        break;
      }
    }

    if (passFilter) {
      const row = document.createElement("tr");
      const cellCategory = document.createElement("td");
      const cellItem = document.createElement("td");
      const cellwordlist = document.createElement("td");

      cellCategory.appendChild(document.createTextNode(item.category));
      row.appendChild(cellCategory);

      const itemLink = document.createElement('a');
      itemLink.appendChild(document.createTextNode(item.name));
      itemLink.title = item.name;
      itemLink.href = `https://dev.epicgames.com/documentation${item.path}`;
      cellItem.appendChild(itemLink);
      row.appendChild(cellItem);

      cellwordlist.appendChild(document.createTextNode(getCaseWords(item.name).join(", ")));
      row.appendChild(cellwordlist);


      tableBody.appendChild(row);
      itemsDisplayed++;
    }
    indexPosition++;
  };
  info2.innerHTML = `Now displaying: ${itemsDisplayed} items`;
  if (indexPosition < allItems.length) {
    window.requestAnimationFrame(loadInPage);
  }
}

function getCaseWords(text) {
  const words = [];
  let word = "";
  for (var i = 0; i < text.length - 1; i++) {
    const code = text.charCodeAt(i);
    const codeNext = text.charCodeAt(i + 1);
    if (word != "") {
      if (code >= 97 && code <= 122) {
        word += text[i];
      } else {
        words.push(word);
        word = "";
      }
    }
    if (word == "" && code <= 90 && code >= 65 && codeNext >= 97 && codeNext <= 122) word += text[i];
  }
  if (word != "") {
    const code = text.charCodeAt(text.length - 1);
    if (code >= 97 && code <= 122) word += text[text.length - 1];
    words.push(word);
  }
  words.forEach(word => { if (word in allUpperCaseWords) { allUpperCaseWords[word] += 1; } else { allUpperCaseWords[word] = 1; } });
  return words;
}