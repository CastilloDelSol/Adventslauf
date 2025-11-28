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

    const splits = race.splits; 
    const M = (race.M.Top10 || []).slice(0, numResults);
    const W = (race.W.Top10 || []).slice(0, numResults);

    renderOne("#deficitChartM", "M", M, splits);
    renderOne("#deficitChartW", "W", W, splits);
}

// ============================================================
// Render ONE chart (either M or W)
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
    // X-POSITIONS (real kilometers)
    // Always add 0 km first
    // ---------------------------------------------------------
    const kmPoints = [0, ...splits.map(s => s.distance_km)];

    // ---------------------------------------------------------
    // Build absolute time arrays
    // ---------------------------------------------------------
    const absTimes = runners.map(r => {
        const arr = [0]; 
        r.splits.forEach(s => arr.push(s.sec));
        return arr;
    });

    // ---------------------------------------------------------
    // Find best time at each split (minimum absolute time)
    // ---------------------------------------------------------
    const bestTimes = kmPoints.map((_, i) =>
        Math.min(...absTimes.map(row => row[i]))
    );

    // ---------------------------------------------------------
    // Build datasets using {x: km, y: deficit}
    // ---------------------------------------------------------
    const datasets = runners.map((r, idx) => {

        const deficits = absTimes[idx].map(
            (t, i) => bestTimes[i] - t
        );

        const points = kmPoints.map((km, i) => ({
            x: km,
            y: deficits[i]
        }));

        return {
            label: `${r.first_name} ${r.last_name}`,
            data: points,
            borderWidth: 3,
            tension: 0.28,
            fill: false
        };
    });

    // Destroy old instance
    if (DEFICIT_CHARTS[key]) DEFICIT_CHARTS[key].destroy();

    // ---------------------------------------------------------
    // Create chart (linear X-axis!)
    // ---------------------------------------------------------
    DEFICIT_CHARTS[key] = new Chart(ctx, {
        type: "line",
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,

            scales: {
                x: {
                    type: "linear",
                    title: { display: true, text: "Distanz (km)" },
                    ticks: {
                        callback: v => v + " km"
                    }
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
                        title: ctx => `${ctx[0].raw.x} km`,
                        label: ctx =>
                            `${ctx.dataset.label}: ${ctx.raw.y.toFixed(1)} s`
                    }
                }
            }
        }
    });
}
