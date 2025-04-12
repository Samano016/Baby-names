// names.js
// Baby Names Assignment using SheetBest API
// Author: [Your Name]
// Description: Fetches name data from REST API, builds ranking graph and meaning display.

"use strict";

const BASE_URL = "https://api.sheetbest.com/sheets/c1e0ead6-6df0-49f7-ace0-ec90562a8c3f";
const select = document.getElementById("babyselect");
const graph = document.getElementById("graph");
const meaningPara = document.getElementById("meaning");

window.addEventListener("load", init);

function init() {
  fetch(BASE_URL)
    .then(res => res.json())
    .then(data => {
      const nameSet = new Set();
      data.forEach(entry => {
        if (entry.name) nameSet.add(entry.name);
      });

      const sortedNames = Array.from(nameSet).sort();
      sortedNames.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
      });

      select.disabled = false;
      select.addEventListener("change", handleSelect);
    })
    .catch(handleError);
}

function handleSelect() {
  const name = select.value;
  if (name === "Select a name..." || !name) {
    clearDisplay();
    return;
  }

  fetch(`${BASE_URL}/name/${encodeURIComponent(name)}`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
      return res.json();
    })
    .then(data => {
      clearDisplay();
      if (data.length === 0) return;

      const sorted = data
        .filter(entry => entry.year && entry.rank && entry.rank !== "0")
        .sort((a, b) => parseInt(a.year) - parseInt(b.year));

      sorted.forEach((entry, index) => {
        const rank = parseInt(entry.rank);
        const year = entry.year;
        const height = Math.floor((1000 - rank) / 4);
        const left = 10 + index * 60;

        // Ranking bar
        const bar = document.createElement("div");
        bar.classList.add("ranking");
        bar.style.height = `${height}px`;
        bar.style.left = `${left}px`;
        bar.style.bottom = "0px";
        bar.textContent = rank;
        if (rank <= 10) {
          bar.style.color = "red";
        }
        graph.appendChild(bar);

        // Year label
        const label = document.createElement("p");
        label.classList.add("year");
        label.style.left = `${left}px`;
        label.textContent = year;
        graph.appendChild(label);
      });

      // Show meaning (first available)
      if (data[0].meaning) {
        meaningPara.textContent = data[0].meaning;
      }
    })
    .catch(handleError);
}

function clearDisplay() {
  graph.innerHTML = "";
  meaningPara.textContent = "";
}

function handleError(err) {
  meaningPara.textContent = `Error: ${err.message}`;
}
