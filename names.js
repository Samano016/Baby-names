/*
 * names.js
 */

window.onload = function() {
    // REST API
    const API_URL = "https://api.sheetbest.com/sheets/c1e0ead6-6df0-49f7-ace0-ec90562a8c3f";
    const select = document.getElementById("babyselect");
    const graph = document.getElementById("graph");
    const meaning = document.getElementById("meaning");
    const error = document.getElementById("errors");
  
    // Load all baby names
    fetch(API_URL)
      .then(checkStatus)
      .then(response => response.json())
      .then(data => populateSelect(data))
      .catch(err => showError(`Failed to load names: ${err.message}`));
  
    // Name's data
    select.addEventListener("change", onNameChange);
  
    /**
     * Dropdown selection the selected name.
     */
    function onNameChange() {
      clearGraph();
      clearMeaning();
      clearError();
  
      const name = select.value;
      if (!name) return;  // "Select a name..." chosen
  
      // Fetch filtered data
      fetch(`${API_URL}/name/${encodeURIComponent(name)}`)
        .then(checkStatus)
        .then(response => response.json())
        .then(entries => {
          if (entries.length === 0) {
            showError(`No data available for '${name}'.`);
          } else {
            sortByYear(entries);
            drawGraph(entries);
            displayMeaning(entries);
          }
        })
        .catch(err => showError(`Error fetching data for '${name}': ${err.message}`));
    }
  
    /**
     * Dropdown with sorted baby names.
     */
    function populateSelect(data) {
      select.innerHTML = "";  // Clear any existing options
      const defaultOption = document.createElement("option");
      defaultOption.textContent = "Select a name...";
      defaultOption.value = "";
      select.appendChild(defaultOption);
  
      // Extract and sort unique names
      const names = Array.from(new Set(data.map(entry => entry.name))).sort();
      names.forEach(name => {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        select.appendChild(opt);
      });
      select.disabled = false;
    }
  
    /**
     * Sorts entries by their year field (ascending).
     */
    function sortByYear(entries) {
      entries.sort((a, b) => parseInt(a.year) - parseInt(b.year));
    }
  
    /**
     * Draws bars and year labels
     */
    function drawGraph(entries) {
      entries.forEach((entry, i) => {
        const rank = parseInt(entry.rank || "0");
        const x = 10 + i * 60;
        const height = rank === 0 ? 0 : Math.floor((1000 - rank) / 4);
  
        createYearLabel(entry.year, x);
        createRankingBar(rank, x, height);
      });
    }
  
    /**
     * Year label 
     */
    function createYearLabel(year, x) {
      const label = document.createElement("p");
      label.className = "year";
      label.style.left = `${x}px`;
      label.textContent = year;
      graph.appendChild(label);
    }
  
    /**
     * Ranking bar.
     */
    function createRankingBar(rank, x, height) {
      const bar = document.createElement("div");
      bar.className = "ranking";
      bar.style.left = `${x}px`;
      bar.style.height = `${height}px`;
      bar.textContent = rank === 0 ? "(no data)" : rank;
      bar.style.color = (rank > 0 && rank <= 10) ? "red" : "black";
      graph.appendChild(bar);
    }
  
    /**
     * Meaning of the name 
     */
    function displayMeaning(entries) {
      const text = entries[0].meaning?.trim() || "";
      meaning.textContent = text;
    }
  
    /**
     * Checks fetch responses and throws on HTTP errors.
     */
    function checkStatus(response) {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} - ${response.statusText}`);
      }
      return response;
    }
  
    /**
     * Error message.
     */
    function showError(msg) {
      error.textContent = msg;
    }
  
    /** Clear graph area. */
    function clearGraph() { graph.innerHTML = ""; }
    /** Clear the meaning paragraph. */
    function clearMeaning() { meaning.textContent = ""; }
    /** Clear any text error. */
    function clearError() { error.textContent = ""; }
  };
  