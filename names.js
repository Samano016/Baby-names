/*
 * names.js
 */

window.onload = function () {
    const API_URL = "https://api.sheetbest.com/sheets/c1e0ead6-6df0-49f7-ace0-ec90562a8c3f";
    const select = document.getElementById("babyselect");
    const graph = document.getElementById("graph");
    const meaning = document.getElementById("meaning");
    const error = document.getElementById("errors");

    let allData = [];

    // Load initial data
    fetch(API_URL)
        .then(checkStatus)
        .then(response => response.json())
        .then(data => {
            allData = data;
            populateSelect(data);
        })
        .catch(err => showError(`Failed to load data: ${err.message}`));

    select.addEventListener("change", function () {
        clearGraph();
        clearMeaning();
        clearError();

        const name = select.value;
        if (name) {
            const nameData = allData.filter(entry => entry.name.toLowerCase() === name.toLowerCase());
            if (nameData.length > 0) {
                drawGraph(nameData);
                displayMeaning(nameData);
            }
        }
    });

    function populateSelect(data) {
        const nameSet = new Set();
        data.forEach(entry => nameSet.add(entry.name));
        const sortedNames = Array.from(nameSet).sort();

        const defaultOption = document.createElement("option");
        defaultOption.textContent = "Select a name...";
        defaultOption.value = "";
        select.appendChild(defaultOption);

        sortedNames.forEach(name => {
            const option = document.createElement("option");
            option.value = name;
            option.textContent = name;
            select.appendChild(option);
        });

        select.disabled = false;
    }

    function drawGraph(entries) {
        // Sort by year
        entries.sort((a, b) => parseInt(a.year) - parseInt(b.year));

        entries.forEach((entry, index) => {
            const rank = parseInt(entry.rank || "0");
            const year = entry.year;
            const height = rank === 0 ? 0 : Math.floor((1000 - rank) / 4);
            const x = 10 + index * 60;
            const y = 250 - height;

            // Create year label
            const yearLabel = document.createElement("p");
            yearLabel.className = "year";
            yearLabel.style.left = `${x}px`;
            yearLabel.textContent = year;
            graph.appendChild(yearLabel);

            // Create ranking bar
            const bar = document.createElement("div");
            bar.className = "ranking";
            bar.style.left = `${x}px`;
            bar.style.bottom = "0px";
            bar.style.height = `${height}px`;
            bar.textContent = rank === 0 ? "(no data)" : rank;
            bar.style.color = (rank > 0 && rank <= 10) ? "red" : "black";
            graph.appendChild(bar);
        });
    }

    function displayMeaning(entries) {
        const first = entries[0];
        if (first.meaning && first.meaning.trim() !== "") {
            meaning.textContent = first.meaning;
        } else {
            meaning.textContent = ""; // No error, just no meaning
        }
    }

    function checkStatus(response) {
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return response;
    }

    function showError(msg) {
        error.textContent = msg;
    }

    function clearGraph() {
        graph.innerHTML = "";
    }

    function clearMeaning() {
        meaning.textContent = "";
    }

    function clearError() {
        error.textContent = "";
    }
};
