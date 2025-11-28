// deficitLineChart.js

import { loadRaceStats, getRaceStats } from "./raceStatsLoader.js";

const DEFICIT_CHARTS = { M: null, W: null };

// ============================================================
// Render Men/Women deficit charts
// ============================================================
export async function renderDeficitCharts(raceName, numResults = 6) {
    await loadRaceStats(raceName);
    const race = getRaceStats(raceName);

    if (!race || !race.splits) {
        console.warn("Race has no split definitions.");
        return;
    }

    const splits = race.splits; // e.g. [ {name:"Rothenhusen", distance_km:12.5}, {name:"Ziel", distance_km:26} ]

    const M = (race.M.Top10 || []).slice(0, numResults);
    const W = (race.W.Top10 || []).slice(0, numResults);

    renderOne("#deficitChartM", "M", M, splits);
    renderOne("#deficitChartW", "W", W, splits);
}

// ============================================================
// Render one chart
// ============================================================
function renderOne(canvasSelector, key, runners, splits) {
    const canvas = document.querySelector(canvasSelector);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!runners || runners.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    // ---------------------------------------------------------
    // X-AXIS = km → always start with 0 km at 0 sec
    // ---------------------------------------------------------
    const kmLabels = [0, ...splits.map(s => s.distance_km)];

    // ---------------------------------------------------------
    // Build absolute times per athlete
    // Format: [0, split1_sec, split2_sec, ...]
    // ---------------------------------------------------------
    const absTimes = runners.map(r => {
        const arr = [0]; // time at start
        r.splits.forEach(s => arr.push(s.sec));
        return arr;
    });

    // ---------------------------------------------------------
    // Compute best (minimum) time at each km point
    // ---------------------------------------------------------
    const bestTimes = kmLabels.map((_, i) =>
        Math.min(...absTimes.map(row => row[i]))
    );

    // ---------------------------------------------------------
    // Convert absolute times → deficits
    // ---------------------------------------------------------
    const datasets = runners.map((r, idx) => {
        const deficits = absTimes[idx].map((t, i) => bestTimes[i] - t);

        return {
            label: `${r.first_name} ${r.last_name}`,
            data: deficits,
            borderWidth: 3,
            tension: 0.35,
            fill: false,
            spanGaps: true
        };
    });

    // Destroy old chart
    if (DEFICIT_CHARTS[key]) DEFICIT_CHARTS[key].destroy();

    // ---------------------------------------------------------
    // Create new chart
    // ---------------------------------------------------------
    DEFICIT_CHARTS[key] = new Chart(ctx, {
        type: "line",
        data: {
            labels: kmLabels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: { display: true, text: "Distanz (km)" }
                },
                y: {
                    beginAtZero: true,
                    title: { display: true, text: "Defizit (Sekunden)" }
                }
            },
            plugins: {
                legend: { position: "bottom" },
                tooltip: {
                    callbacks: {
                        title: ctx => ctx[0].label + " km",
                        label: ctx =>
                            `${ctx.dataset.label}: ${ctx.raw.toFixed(1)} s`
                    }
                }
            }
        }
    });
}
