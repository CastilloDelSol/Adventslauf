// deficitLineChart.js

import { loadRaceStats, getRaceStats } from "./raceStatsLoader.js";

const DEFICIT_CHARTS = { M: null, W: null };

export async function renderDeficitCharts(raceName, numResults = 6) {
    await loadRaceStats(raceName);
    const race = getRaceStats(raceName);
    if (!race || !race.splits) return;

    const splits = race.splits;
    const M = race.M.Top10.slice(0, numResults);
    const W = race.W.Top10.slice(0, numResults);

    renderOne("#deficitChartM", "M", M, splits);
    renderOne("#deficitChartW", "W", W, splits);
}

function renderOne(canvasSelector, key, runners, splits) {

    const canvas = document.querySelector(canvasSelector);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!runners || runners.length === 0) {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        return;
    }

    // km VALUES INCLUDING START
    const kmPoints = [0, ...splits.map(s => s.distance_km)];

    // ABS TIMES PRO RUNNER
    const absTimes = runners.map(r => {
        const arr = [0];
        r.splits.forEach(s => arr.push(s.sec));
        return arr;
    });

    // BEST TIMES (LOWEST)
    const bestTimes = kmPoints.map((_, i) =>
        Math.min(...absTimes.map(row => row[i]))
    );

    // DATASETS WITH (x,y)
    const datasets = runners.map((r, idx) => ({
        label: `${r.first_name} ${r.last_name}`,
        data: kmPoints.map((km, i) => ({
            x: km,
            y: bestTimes[i] - absTimes[idx][i]
        })),
        borderWidth: 3,
        tension: 0.28,
        fill: false
    }));

    if (DEFICIT_CHARTS[key]) DEFICIT_CHARTS[key].destroy();

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

                    // Draw only split ticks
                    afterBuildTicks: axis => {
                        axis.ticks = kmPoints.map(v => ({ value: v }));
                    },

                    ticks: {
                        callback: (value) => value.toFixed(1)
                    },

                    min: 0,
                    max: kmPoints[kmPoints.length - 1] // last split
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
                        title: ctx => {
                            const p = ctx[0].raw;
                            const s = splits.find(s => s.distance_km === p.x);
                            return s ? `${s.name} (${p.x} km)` : `${p.x} km`;
                        },
                        label: ctx => 
                            `${ctx.dataset.label}: ${ctx.raw.y.toFixed(1)} s`
                    }
                }
            }
        }
    });
}
