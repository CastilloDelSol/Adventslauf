// deficitLineChart.js

import { loadRaceStats, getRaceStats } from "./raceStatsLoader.js";

// ============================================================
//  Render M + W deficit charts
// ============================================================
export async function renderDeficitCharts(raceName) {
    await loadRaceStats(raceName);
    const race = getRaceStats(raceName);

    // Ensure data exists
    if (!race || !race.M || !race.W) {
        console.warn("No race data found for", raceName);
        return;
    }

    // Take only Top 6 (fallback to fewer if not enough data)
    const M_top6 = (race.M.Top10 || []).slice(0, 6);
    const W_top6 = (race.W.Top10 || []).slice(0, 6);

    renderOne("#deficitChartM", M_top6);
    renderOne("#deficitChartW", W_top6);
}

// ============================================================
//  INTERNAL: Render one chart
// ============================================================
function renderOne(canvasId, top6) {

    if (!top6 || !Array.isArray(top6) || top6.length === 0) {
        console.warn("No Top6 data for", canvasId);
        return;
    }

    // And also: prevent crash if a runner has NO splits
    const filtered = top6.filter(r => r.Splits && r.Splits.length > 0);

    if (filtered.length === 0) {
        console.warn("Top6 have no split data:", canvasId);
        return;
    }

    top6 = filtered;

    // -------------------------------------------------------------
    // Collect all split labels from runner 1 (they are identical)
    // -------------------------------------------------------------
    const labels = top6[0].Splits.map(s => s.name);

    // -------------------------------------------------------------
    // Build dataset per athlete
    // -------------------------------------------------------------
    const datasets = [];

    labels.forEach((label, splitIndex) => {
        // For each split → collect times
    });

    // Now create arrays split-wise:
    const splitTimes = labels.map((_, splitIndex) => 
        top6.map(r => r.Splits?.[splitIndex]?.sec ?? null)
    );

    // Find best split (minimum sec)
    const best = splitTimes.map(times => 
        Math.min(...times.filter(x => x !== null))
    );

    // Build one dataset per athlete
    top6.forEach((runner, rIndex) => {

        const deficits = runner.Splits.map((s, splitIdx) => {
            if (!s || s.sec == null) return null;
            return s.sec - best[splitIdx];
        });

        datasets.push({
            label: runner.first_name + " " + runner.last_name,
            data: deficits,
            borderWidth: 3,
            tension: 0.33,
            fill: false
        });
    });

    // -------------------------------------------------------------
    // Create the chart
    // -------------------------------------------------------------
    new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,

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
                        label: ctx => `${ctx.dataset.label}: ${ctx.raw.toFixed(1)} s`
                    }
                }
            }
        }
    });
}
