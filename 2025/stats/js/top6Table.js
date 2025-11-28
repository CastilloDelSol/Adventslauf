// top6Table.js

import { loadRaceStats, getRaceStats } from "./raceStatsLoader.js";

// ======================================================================
// RENDER TABLES (M/W)
// ======================================================================
export async function renderTop6Tables(raceName) {
    await loadRaceStats(raceName);
    const race = getRaceStats(raceName);

    renderOne("top6TableM", race.M.Top10.slice(0, 6), race.splits);
    renderOne("top6TableW", race.W.Top10.slice(0, 6), race.splits);
}

// ======================================================================
// INTERNAL RENDER FUNCTION
// ======================================================================
function renderOne(containerId, top6, splitMeta) {
    const box = document.getElementById(containerId);
    if (!box) return;

    if (!top6 || top6.length === 0) {
        box.innerHTML = "<p>Keine Daten verfügbar.</p>";
        return;
    }

    // Fix uppercase (ẞ statt ß)
    const toUppercaseName = (str) =>
        str
            .replace(/ß/g, "ẞ")
            .toUpperCase();

    // Final split caption (e.g.: Rothenhusen, 12.5 km)
    const splitLabels = splitMeta.map(s =>
        `${s.name}, ${s.distance_km} km`
    );

    // --------------------------------------------------------
    // BUILD TABLE
    // --------------------------------------------------------
    let html = `
        <table class="top6-table">
            <thead>
                <tr>
                    <th class="top6-col-small">Pl.</th>
                    <th class="top6-col-small">#</th>
                    <th class="top6-col-small">AK-Pl.</th>
                    <th class="top6-col-small">AK</th>
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
        const ln = toUppercaseName(r.last_name || "");
        const fn = r.first_name || "";

        html += `
            <tr>
                <td class="top6-col-small">${r.pos_gender ?? ""}</td>
                <td class="top6-col-small">${r.bib}</td>
               <td class="top6-col-small">${r.pos_ag}</td>
               <td class="top6-col-small">${r.age_group}</td>

                <td>
                    <span class="top6-lastname">${ln}</span>
                    <span class="top6-firstname">${fn}</span>
                </td>

                <td>${r.club ?? ""}</td>
        `;

        // SPLITS
        splitMeta.forEach((_, idx) => {
            const s = r.splits[idx];
            html += `<td>${s ? s.time : "-"}</td>`;
        });

        html += "</tr>";
    });

    html += "</tbody></table>";

    box.innerHTML = html;
}
