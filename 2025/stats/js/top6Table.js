// top6Table.js

import { loadRaceStats, getRaceStats } from "./raceStatsLoader.js";

// ======================================================================
// RENDER TABLES (M/W)
// ======================================================================
export function renderTop6Table(containerId, runners, splits) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const split1 = splits[0].distance_km;
    const split2 = splits[splits.length - 1].distance_km;

    let html = `
    <table class="top6-table">
      <thead>
        <tr>
          <th class="col-center">🏆</th>
          <th class="col-center">BIB</th>
          <th class="col-center">AK-🏆</th>
          <th class="col-right">AK</th>
          <th class="col-left">Name</th>
          <th class="col-left">Verein</th>
          <th class="col-right">${split1} km</th>
          <th class="col-right">${split2} km</th>
        </tr>
      </thead>
      <tbody>
    `;

    runners.forEach(r => {
        const fullName =
            `<span class="top6-lastname">${r.last_name}</span>` +
            `<span class="top6-firstname"> ${r.first_name}</span>`;

        html += `
        <tr>
          <td class="col-center">${medalEmoji(r.rank)}</td>
          <td class="col-center">${r.bib}</td>
          <td class="col-center">${medalEmoji(r.rank_ak)}</td>
          <td class="col-right">${r.ak}</td>

          <td class="col-left">${fullName}</td>
          <td class="col-left">${r.club || ""}</td>

          <td class="col-right">${r.splits[0].time}</td>
          <td class="col-right">${r.splits[r.splits.length-1].time}</td>
        </tr>
        `;
    });

    html += "</tbody></table>";
    container.innerHTML = html;
}
