// names.js
// populates a select box, and generates a bar graph and meaning display for selected names.

window.onload = function () {
    const apiBase = "https://api.sheetbest.com/sheets/c1e0ead6-6df0-49f7-ace0-ec90562a8c3f";
    const select = $("babyselect");
    const graph = $("graph");
    const meaning = $("meaning");
    const errorDiv = $("errors");

    // Fetch list of all baby names on load
    new Ajax.Request(apiBase, {
        method: "get",
        onSuccess: function (response) {
            const data = response.responseText.evalJSON(true);
            const names = [...new Set(data.map(entry => entry.name))].sort();

            for (const name of names) {
                const option = document.createElement("option");
                option.value = name;
                option.textContent = name;
                select.appendChild(option);
            }

            select.disabled = false;
        },
        onFailure: function (response) {
            showError("Failed to load names list", response.status);
        }
    });

    // When a name is selected
    select.onchange = function () {
        const selected = this.value;
        if (!selected) return;

        graph.innerHTML = "";
        meaning.innerHTML = "";
        errorDiv.innerHTML = "";

        fetchRankings(selected);
        fetchMeaning(selected);
    };

    // Fetch ranking data
    function fetchRankings(name) {
        new Ajax.Request(`${apiBase}/name/${encodeURIComponent(name)}`, {
            method: "get",
            onSuccess: function (response) {
                const rankings = response.responseText.evalJSON(true);

                if (!rankings.length) {
                    showError("No ranking data found for this name.", 404);
                    return;
                }

                const sorted = rankings
                    .filter(entry => entry.year && entry.year !== "")
                    .sort((a, b) => parseInt(a.year) - parseInt(b.year));

                const barWidth = 50;
                const spacing = 10;
                const maxHeight = 250;

                sorted.forEach((entry, i) => {
                    const year = entry.year;
                    const rank = parseInt(entry.rank);

                    // Create year label
                    const yearLabel = document.createElement("p");
                    yearLabel.className = "year";
                    yearLabel.textContent = year;
                    yearLabel.style.left = `${10 + i * (barWidth + spacing)}px`;
                    graph.appendChild(yearLabel);

                    if (rank === 0 || isNaN(rank)) return;

                    const height = Math.floor((1000 - rank) / 4);
                    const bar = document.createElement("div");
                    bar.className = "ranking";
                    bar.textContent = rank;
                    bar.style.height = `${height}px`;
                    bar.style.left = `${10 + i * (barWidth + spacing)}px`;
                    bar.style.bottom = "0px";

                    if (rank <= 10) {
                        bar.style.color = "red";
                    }

                    graph.appendChild(bar);
                });
            },
            onFailure: function (response) {
                showError("Failed to load ranking data", response.status);
            }
        });
    }

    // Fetch meaning data
    function fetchMeaning(name) {
        new Ajax.Request(`${apiBase}/name/${encodeURIComponent(name)}`, {
            method: "get",
            onSuccess: function (response) {
                const data = response.responseText.evalJSON(true);
                const found = data.find(entry => entry.meaning && entry.meaning.trim() !== "");
                meaning.textContent = found ? found.meaning : "";
            },
            onFailure: function (response) {
                showError("Failed to load meaning data", response.status);
            }
        });
    }

    // Display an error message in the page
    function showError(msg, code) {
        errorDiv.innerHTML = `<p><strong>Error ${code}:</strong> ${msg}</p>`;
    }
};
