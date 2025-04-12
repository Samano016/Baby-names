/*
 * names.js
 */

window.onload = function () {
    const BASE_API = "https://api.sheetbest.com/sheets/c1e0ead6-6df0-49f7-ace0-ec90562a8c3f";
    const select = document.getElementById("babyselect");
    const graph = document.getElementById("graph");
    const meaning = document.getElementById("meaning");
    const error = document.getElementById("errors");

    // Load all names on page load
    fetch(BASE_API)
        .then(checkStatus)
        .then(res => res.json())
        .then(data => {
            const nameSet = new Set();
            data.forEach(entry => nameSet.add(entry.name));
            const sortedNames = Array.from(nameSet).sort();

            // Add default option
            const defaultOption = document.createElement("option");
            defaultOption.textContent = "Select a name...";
            defaultOption.value = "";
            select.appendChild(defaultOption);

            // Add name options
            sortedNames.forEach(name => {
                const opt = document.createElement("option");
                opt.value = name;
                opt.textContent = name;
                select.appendChild(opt);
            });

            select.disabled = false;
        })
        .catch(err => showError("Failed to load names: " + err.message));

    // Handle name selection
    select.addEventListener("change", function () {
        clearGraph();
        clearMeaning();
        clearError();

        const selectedName = select.value;
        if (selectedName) {
            const nameUrl = `${BASE_API}/name/${encodeURIComponent(selectedName)}`;

            fetch(nameUrl)
                .then(checkStatus)
                .then(res => res.json())
                .then(data => {
                    if (data.length === 0) {
                        showError("No data found for that name.");
                        return;
                    }

                    drawGraph(data);
                    displayMeaning(data);
                })
                .catch(err => showError(`Error fetching data for ${selectedName}: ${err.message}`));
        }
    });

    function drawGraph(entries) {
        entries.sort((a, b) => parseInt(a.year) - parseInt(b.year));

        entries.forEach((entry, index) => {
            const rank = parseInt(entry.rank || "0");
            const year = entry.year;
            const height = rank === 0 ? 0 : Math.floor((1000 - rank) / 4);
            const x = 10 + index * 60;

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
            if (rank > 0 && rank <= 10) {
                bar.style.color = "red";
            }
            graph.appendChild(bar);
        });
    }

    function displayMeaning(entries) {
        const first = entries[0];
        if (first.meaning && first.meaning.trim() !== "") {
            meaning.textContent = first.meaning;
        } else {
            meaning.textContent = "";
        }
    }

    function checkStatus(response) {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
