// top6Table.js

import { loadRaceStats, getRaceStats } from "./raceStatsLoader.js";

// ======================================================================
//  PUBLIC: Render tables for M + W
// ======================================================================
export async function renderTop6Tables(raceName) {
    await loadRaceStats(raceName);
    const race = getRaceStats(raceName);

    renderOne("top6TableM", race.M.Top10.slice(0, 6), race.splits);
    renderOne("top6TableW", race.W.Top10.slice(0, 6), race.splits);
}

// ======================================================================
//  INTERNAL: Render one table
// ======================================================================
function renderOne(containerId, top6, splitMeta) {
    const box = document.getElementById(containerId);
    if (!box) return;

    if (!top6 || top6.length === 0) {
        box.innerHTML = "<p>Keine Daten verfügbar.</p>";
        return;
    }

    // Extract split labels from race.splits[]
    const splitLabels = splitMeta.map(s => s.name);

    // ------------------------------------------------------------------
    // Build table
    // ------------------------------------------------------------------
    let html = `
        <table class="top6-table">
            <thead>
                <tr>
                    <th>Pl.</th>
                    <th>BIB</th>
                    <th>AK-Pl.</th>
                    <th>AK</th>
                    <th>Name</th>
                    <th>Verein</th>
    `;

    splitLabels.forEach(label => {
        html += `<th>${label}</th>`;
    });

    html += `
            </tr>
        </thead>
        <tbody>
    `;

    top6.forEach(r => {
        html += `
            <tr>
                <td>${r.pos_gender ?? ""}</td>
                <td>${r.bib}</td>
                <td>${r.pos_ag}</td>
                <td>${r.age_group}</td>

                <td>
                    <span class="top6-lastname">${r.last_name}</span>
                    <span class="top6-name">${r.first_name}</span>
                </td>

                <td>${r.club ?? ""}</td>
        `;

        // Add splits
        splitLabels.forEach((_, idx) => {
            const s = r.splits[idx];
            html += `<td>${s ? s.time : "-"}</td>`;
        });

        html += "</tr>";
    });

    html += "</tbody></table>";

    box.innerHTML = html;
}
