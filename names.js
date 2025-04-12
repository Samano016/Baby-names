/*
 * names.js
 */

window.onload = function () {
    const BASE_URL = "https://api.sheetbest.com/sheets/c1e0ead6-6df0-49f7-ace0-ec90562a8c3f";
    const select = document.getElementById("babyselect");
    const graph = document.getElementById("graph");
    const meaning = document.getElementById("meaning");
    const error = document.getElementById("errors");

    // Fetch initial list of names
    fetch(BASE_URL)
        .then(checkStatus)
        .then(res => res.json())
        .then(data => {
            const nameSet = new Set();
            data.forEach(item => nameSet.add(item.name));
            const sorted = Array.from(nameSet).sort();

            // Default option
            const defaultOption = document.createElement("option");
            defaultOption.textContent = "Select a name...";
            defaultOption.value = "";
            select.appendChild(defaultOption);

            sorted.forEach(name => {
                const opt = document.createElement("option");
                opt.value = name;
                opt.textContent = name;
                select.appendChild(opt);
            });

            select.disabled = false;
        })
        .catch(err => showError(`Failed to load name list: ${err.message}`));

    // On selection
    select.addEventListener("change", function () {
        clearGraph();
        clearMeaning();
        clearError();

        const name = select.value;
        if (!name) return;

        // Fetch ranking data
        const rankUrl = `${BASE_URL}/name/${encodeURIComponent(name)}`;
        fetch(rankUrl)
            .then(checkStatus)
            .then(res => res.json())
            .then(data => {
                if (data.length === 0) {
                    showError("No ranking data found for this name.");
                    return;
                }
                drawGraph(data);
                displayMeaning(data);
            })
            .catch(err => showError(`Failed to fetch ranking data: ${err.message}`));
    });

    function drawGraph(data) {
        data.sort((a, b) => parseInt(a.year) - parseInt(b.year));
        data.forEach((item, index) => {
            const rank = parseInt(item.rank || "0");
            const year = item.year;
            const height = rank === 0 ? 0 : Math.floor((1000 - rank) / 4);
            const x = 10 + index * 60;

            // Year label
            const label = document.createElement("p");
            label.className = "year";
            label.style.left = `${x}px`;
            label.textContent = year;
            graph.appendChild(label);

            // Bar
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

    function displayMeaning(data) {
        const first = data[0];
        if (first.meaning && first.meaning.trim() !== "") {
            meaning.textContent = first.meaning;
        } else {
            meaning.textContent = "";
        }
    }

    function checkStatus(response) {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} - ${response.statusText}`);
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
