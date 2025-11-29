// raceHistogram.js
import { loadRaceStats, getRaceStats } from "./raceStatsLoader.js";

/* -------------------------------------------------------
   Gaussian kernel
------------------------------------------------------- */
function gaussianKernel(x) {
    return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

function computeKDE(buckets, bandwidth = 30) {
    const xs = buckets.map(b => (b.range_start + b.range_end) / 2);
    const counts = buckets.map(b => b.count);

    const kdeValues = xs.map(x0 => {
        let sum = 0;
        for (let i = 0; i < xs.length; i++) {
            const u = (x0 - xs[i]) / bandwidth;
            sum += counts[i] * gaussianKernel(u);
        }
        return sum;
    });

    return kdeValues;
}

/* -------------------------------------------------------
   Determine gender by canvasId ("histM" / "histW")
------------------------------------------------------- */
function getGenderColor(canvasId) {
    if (canvasId.toLowerCase().includes("m")) {
        return "#4EA5E9"; // MEN BLUE
    }
    return "#FF6384"; // WOMEN PINK
}

/* -------------------------------------------------------
   RENDER ONE HISTOGRAM (M or W)
------------------------------------------------------- */
function renderOneHistogram(canvasId, buckets) {

    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    // Detect gender color
    const barColor = getGenderColor(canvasId);

    const labels = buckets.map(b => {
        const m = Math.round(b.range_start / 60);
        const M = Math.round(b.range_end / 60);
        return `${m}–${M} min`;
    });

    const counts = buckets.map(b => b.count);

    // KDE
    const kdeValues = computeKDE(buckets, 45);

    // Scale KDE visually to bar height
    const maxCount = Math.max(...counts);
    const maxKde = Math.max(...kdeValues);
    const scaled = kdeValues.map(v => v * maxCount / maxKde);

    // Destroy existing chart
    if (ctx._chart) ctx._chart.destroy();

    /* -------------------------------------------------------
       Chart.js
       KDE FIRST → BEHIND BARS
    ------------------------------------------------------- */
    ctx._chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [
                // KDE first (background)
                {
                    type: "line",
                    label: "Glättung",
                    data: scaled,
                    borderColor: "#999999",  // light grey
                    backgroundColor: "transparent",
                    borderWidth: 3,
                    tension: 0.25,
                    pointRadius: 0,
                    order: 1   // draw first
                },

                // Gender-colored bars
                {
                    type: "bar",
                    label: "Anzahl",
                    data: counts,
                    backgroundColor: barColor + "CC", // 80% opacity
                    borderWidth: 0,
                    order: 2   // draw above KDE
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: { display: true, text: "Zeitbereich (Minuten)" }
                },
                y: {
                    beginAtZero: true,
                    title: { display: true, text: "Teilnehmer" }
                }
            }
        }
    });
}

/* -------------------------------------------------------
   MAIN EXPORT
------------------------------------------------------- */
export async function renderRaceHistograms(raceName) {
    await loadRaceStats(raceName);
    const race = getRaceStats(raceName);

    if (!race) return;

    if (race.M?.histogram?.buckets)
        renderOneHistogram("histM", race.M.histogram.buckets);

    if (race.W?.histogram?.buckets)
        renderOneHistogram("histW", race.W.histogram.buckets);
}
