// top6Table.js

import { loadRaceStats, getRaceStats } from "./raceStatsLoader.js";

// Emoji medals (WhatsApp style)
function medalEmoji(rank) {
    const n = Number(rank);  // <<< important fix!
    if (n === 1) return "🥇";
    if (n === 2) return "🥈";
    if (n === 3) return "🥉";
    return n; // 4–6 : show number
}

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

    // Name uppercase + ß → ẞ
    const toUppercaseName = (str) =>
        str.replace(/ß/g, "ẞ").toUpperCase();

    // Only distances (e.g. "12.5 km")
    const splitLabels = splitMeta.map(s =>
        `${s.distance_km}km`
    );

    // --------------------------------------------------------
    // BUILD TABLE
    // --------------------------------------------------------
    let html = `
        <table class="top6-table">
            <thead>
                <tr>
                    <th class="col-center">🏆</th>
                    <th class="col-center">🎯</th>
                    <th class="col-right">📊</th>
                    <th class="col-left">🎽</th>
                    <th class="col-left">Name</th>
                    <th class="col-left">Verein</th>
    `;

    splitLabels.forEach(label => {
        html += `<th class="col-right">${label}</th>`;
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
                <td class="col-center">${medalEmoji(r.pos_gender)}</td>
                <td class="col-center">${r.pos_ag}</td>
                <td class="col-right">${r.age_group}</td>
                <td class="col-left">${r.bib}</td>

                <td class="col-left">
                    <span class="top6-lastname">${ln}</span>
                    <span class="top6-firstname">${fn}</span>
                </td>

                <td class="col-left">${r.club ?? ""}</td>
        `;

        splitMeta.forEach((_, idx) => {
            const s = r.splits[idx];
            html += `<td class="col-right">${s ? s.time : "-"}</td>`;
        });

        html += "</tr>";
    });

    html += "</tbody></table>";
    box.innerHTML = html;
}
