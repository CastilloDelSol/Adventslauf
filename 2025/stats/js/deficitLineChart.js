// deficitLineChart.js

import { loadRaceStats, getRaceStats } from "./raceStatsLoader.js";

// wir merken uns Charts, damit wir sie beim Streckenwechsel zerstören können
const DEFICIT_CHARTS = {
    M: null,
    W: null
};

// ============================================================
//  Render M + W deficit charts
//  raceName: "hauptlauf" / "kurzstrecke"
//  numResults: wie viele aus Top10 (Default 6)
// ============================================================
export async function renderDeficitCharts(raceName, numResults = 6) {
    await loadRaceStats(raceName);
    const race = getRaceStats(raceName);

    if (!race || !race.M || !race.W) {
        console.warn("No race data found for", raceName);
        return;
    }

    const M_top = (race.M.Top10 || []).slice(0, numResults);
    const W_top = (race.W.Top10 || []).slice(0, numResults);

    renderOne("#deficitChartM", "M", M_top);
    renderOne("#deficitChartW", "W", W_top);
}

// ============================================================
//  INTERNAL: Render one chart (one gender)
// ============================================================
function renderOne(canvasSelector, key, runners) {
    const canvas = document.querySelector(canvasSelector);
    if (!canvas) {
        console.warn("Canvas not found:", canvasSelector);
        return;
    }
    const ctx = canvas.getContext("2d");

    if (!runners || !Array.isArray(runners) || runners.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    // Nur Athleten mit mindestens einem Split
    const filtered = runners.filter(r => Array.isArray(r.splits) && r.splits.length > 0);
    if (filtered.length === 0) {
        console.warn("No split data for", canvasSelector);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }
    runners = filtered;

    // Labels aus den Splits des ersten Athleten (alle haben gleiche Struktur)
    const labels = runners[0].splits.map(s => s.name);

    // Zeiten pro Split einsammeln
    const splitTimes = labels.map((_, splitIdx) =>
        runners.map(r => {
            const s = r.splits[splitIdx];
            return s && typeof s.sec === "number" ? s.sec : null;
        })
    );

    // Bestzeit je Split
    const bestPerSplit = splitTimes.map(times => {
        const valid = times.filter(t => t !== null);
        return valid.length ? Math.min(...valid) : null;
    });

    // Dataset pro Athlet: Defizite = eigene Zeit - Bestzeit
    const datasets = runners.map(runner => {
        const deficits = runner.splits.map((s, splitIdx) => {
            if (!s || bestPerSplit[splitIdx] == null) return null;
            return s.sec - bestPerSplit[splitIdx];
        });

        return {
            label: `${runner.first_name} ${runner.last_name}`,
            data: deficits,
            borderWidth: 3,
            tension: 0.35,
            spanGaps: true,
            fill: false
        };
    });

    // alten Chart zerstören, falls vorhanden
    if (DEFICIT_CHARTS[key]) {
        DEFICIT_CHARTS[key].destroy();
    }

    DEFICIT_CHARTS[key] = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "nearest", intersect: false },
            scales: {
                y: {
                    title: { display: true, text: "Defizit (Sekunden)" },
                    beginAtZero: true
                }
            },
            plugins: {
                legend: { position: "bottom" },
                tooltip: {
                    callbacks: {
                        label: ctx => `${ctx.dataset.label}: ${ctx.raw?.toFixed(1) ?? "0"} s`
                    }
                }
            }
        }
    });
}
