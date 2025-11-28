// deficitLineChart.js
import { loadRaceStats, getRaceStats } from "./raceStatsLoader.js";

// ============================================================
// PUBLIC: Render M + W deficit charts
// ============================================================
export async function renderDeficitCharts(raceName, numResults = 6) {

    await loadRaceStats(raceName);
    const race = getRaceStats(raceName);

    if (!race || !race.M || !race.W) {
        console.warn("No race data for:", raceName);
        return;
    }

    const M_top = (race.M.Top10 || []).slice(0, numResults);
    const W_top = (race.W.Top10 || []).slice(0, numResults);

    renderOne("#deficitChartM", M_top);
    renderOne("#deficitChartW", W_top);
}

// ============================================================
// INTERNAL: Render a single deficit chart
// ============================================================
function renderOne(canvasId, runners) {

    if (!Array.isArray(runners) || runners.length === 0) {
        console.warn("No runners for", canvasId);
        return;
    }

    // Filter athletes that have "splits" and at least 1 split
    const filtered = runners.filter(r => Array.isArray(r.splits) && r.splits.length > 0);

    if (filtered.length === 0) {
        console.warn("No split data for", canvasId);
        return;
    }

    runners = filtered;

    // ---------------------------------------------------------
    // Labels = split names  (your JSON always has EXACTLY 1 split)
    // ---------------------------------------------------------
    const labels = runners[0].splits.map(s => s.name);

    // ---------------------------------------------------------
    // Build split-time matrix:
    // timesPerSplit[i] = [runner1_sec, runner2_sec, ...]
    // ---------------------------------------------------------
    const timesPerSplit = labels.map((_, splitIndex) =>
        runners.map(r => r.splits[splitIndex]?.sec ?? null)
    );

    // ---------------------------------------------------------
    // Best time per split = minimum non-null
    // ---------------------------------------------------------
    const best = timesPerSplit.map(times =>
        Math.min(...times.filter(t => t !== null))
    );

    // ---------------------------------------------------------
    // Build Chart.js datasets
    // ---------------------------------------------------------
    const datasets = runners.map((r, rIndex) => {

        const deficits = r.splits.map((s, splitIndex) => {
            if (!s || s.sec == null) return null;
            return s.sec - best[splitIndex];
        });

        return {
            label: r.first_name + " " + r.last_name,
            data: deficits,
            borderWidth: 3,
            tension: 0.33,     // light smoothing
            fill: false
        };
    });

    // ---------------------------------------------------------
    // Render chart
    // ---------------------------------------------------------
    const canvas = document.querySelector(canvasId);
    if (!canvas) {
        console.error("Canvas not found:", canvasId);
        return;
    }

    new Chart(canvas, {
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
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Defizit (Sekunden)"
                    }
                }
            },

            plugins: {
                legend: { position: "bottom" },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const v = ctx.raw;
                            if (v == null) return "Keine Daten";
                            return `${ctx.dataset.label}: ${v.toFixed(1)} s`;
                        }
                    }
                }
            }
        }
    });
}
