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
let table, tableHeader, tableBody;
let info1, info2;
let keyword1, keyword2, keyword3;
let negkeyword1, negkeyword2, negkeyword3;
let lastTs = 0;
let itemsDisplayed = 0;
let loadLimit = 2000;
let sortOrder = { 1: "type", 2: "category", 3: "subcategory", 4: "name" };
const typesSet = new Set();
let typesArray, categoriesArray, subcategoriesArray;
const categoriesSet = new Set();
const subcategoriesSet = new Set();

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
  tableHeader = document.createElement("thead");
  tableBody = document.createElement("tbody");
  table.appendChild(tableHeader);
  table.appendChild(tableBody);
  outputElement.appendChild(table);
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

async function loadAllFiles() {
  if (allItems.length == 0) {
    await loadAndAppend("classes.csv", "Class");
    await loadAndAppend("constants.csv", "Constant");
    await loadAndAppend("enums.csv", "Enum");
    await loadAndAppend("functions.csv", "Function");
    info1.innerHTML = `Total items: ${allItems.length}`;
    typesArray = [...typesSet].sort();
    categoriesArray = [...categoriesSet].sort();
    subcategoriesArray = [...subcategoriesSet].sort();
  }
  lastTs = 0;
  tableBody.innerHTML = "";
  tableHeader.innerHTML = "";
  itemsDisplayed = 0;
  indexPosition = 0;
  addHeader();
  sortAllItems();
  loadInPage();

}



async function loadAndAppend(fileInput, type) {
  const request = new Request(fileInput);
  const response = await fetch(request);
  const inputCsv = await response.text();
  const allLines = inputCsv.split(/\r?\n|\r|\n/g);
  for (var line = 1; line < allLines.length; line++) {
    const items = allLines[line].split(",");
    if (items.length > 1) {
      if (items[1].length > 1) {
        allItems.push({ name: items[1], path: items[0], type: type, category: items[2], subcategory: items[3] });
        typesSet.add(type);
        categoriesSet.add(items[2]);
        subcategoriesSet.add(items[3]);
      }
    }
  }
}

function addHeader() {
  const tr = document.createElement("tr");
  tr.appendChild(genHeadElement("th", "Type", sortH1));
  tr.appendChild(genHeadElement("th", "Category", sortH2));
  tr.appendChild(genHeadElement("th", "SubCategory", sortH3));
  tr.appendChild(genHeadElement("th", "Item(Link)", sortH4));
  tr.appendChild(genHeadElement("th", "Word List"));
  tableHeader.appendChild(tr);
}

function sortH1() {
  adjustSort("type");
}

function sortH2() {
  adjustSort("category");
}

function sortH3() {
  adjustSort("subcategory");
}

function sortH4() {
  adjustSort("name");
}

function adjustSort(name) {
  let newSort = { 1: name };
  let ctOrder = 2;
  const sortKeys = Object.keys(sortOrder).sort();
  for (var i = 0; i < sortKeys.length; i++) {
    const h = sortOrder[sortKeys[i]];
    if (h != name) {
      newSort[ctOrder] = h;
      ctOrder++;
    }
  }
  sortOrder = newSort;
  console.log(name);
  for (const p in sortOrder) console.log(p, sortOrder[p]);
  console.log("-");
}


function sortAllItems() {
  allItems.sort((a, b) => {
    let result = 0;
    const sortKeys = Object.keys(sortOrder).sort();
    for (var i = 0; i <= sortKeys.length; i++) {
      const h = sortOrder[sortKeys[i]];
      if (a[h] > b[h]) {
        result = 1;
        break;
      }
      if (a[h] < b[h]) {
        result = -1;
        break;
      }
    }
    return result;
  }
  )
}

function genHeadElement(elementType, textnode, fcn = false) {
  const element = document.createElement(elementType);
  element.appendChild(document.createTextNode(textnode));
  if (fcn) element.addEventListener("click", fcn);
  return element;
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
  for (var i = 0; i < stepSize && indexPosition < allItems.length && itemsDisplayed <= loadLimit; i++) {
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
      const cellType = document.createElement("td");
      const cellCategory = document.createElement("td");
      const cellSubCategory = document.createElement("td");
      const cellItem = document.createElement("td");
      const cellwordlist = document.createElement("td");

      cellType.appendChild(document.createTextNode(item.type));
      row.appendChild(cellType);

      cellCategory.appendChild(document.createTextNode(item.category));
      row.appendChild(cellCategory);

      cellSubCategory.appendChild(document.createTextNode(item.subcategory));
      row.appendChild(cellSubCategory);

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
  if (indexPosition < allItems.length && itemsDisplayed <= loadLimit) {
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
