// top6Table.js

import { loadRaceStats, getRaceStats } from "./raceStatsLoader.js";

// ============================================================
//  Render BOTH tables (M + W) for a given race
// ============================================================
export async function renderTop6Tables(raceName) {
    await loadRaceStats(raceName);
    const race = getRaceStats(raceName);

    buildTable("#top6TableM", race.M.Top10);
    buildTable("#top6TableW", race.W.Top10);
}

// ============================================================
//  INTERNAL: Build <tbody> rows
// ============================================================
function buildTable(selector, top10) {

    const table = document.querySelector(selector);
    if (!table) {
        console.error("Top6 Table element not found:", selector);
        return;
    }

    const tbody = table.querySelector("tbody") || table.appendChild(document.createElement("tbody"));
    tbody.innerHTML = ""; 

    const top6 = (top10 || []).slice(0, 6);

    top6.forEach(row => {
        const tr = document.createElement("tr");

        const cells = [
            row.pos_gender,
            row.bib,
            row.first_name + " " + row.last_name,
            row.age_group,
            row.finish_time,
            row.Splits?.[0]?.time ?? "–"
        ];

        cells.forEach(val => {
            const td = document.createElement("td");
            td.textContent = val;
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });
}
