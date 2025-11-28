// raceHistogram.js
import { loadRaceStats, getRaceStats } from "./raceStatsLoader.js";

/* -------------------------------------------------------
   Gaussian kernel (wie distanceHistogram)
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

    return { xs, kdeValues };
}

/* -------------------------------------------------------
   RENDER FOR M OR W
------------------------------------------------------- */
function renderOneHistogram(canvasId, buckets) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const labels = buckets.map(b => {
        const m = Math.round(b.range_start / 60);
        const M = Math.round(b.range_end / 60);
        return `${m}–${M} min`;
    });

    const counts = buckets.map(b => b.count);

    // KDE smoothing
    const { kdeValues } = computeKDE(buckets, 45);

    // Scale KDE visually
    const maxCount = Math.max(...counts);
    const maxKde = Math.max(...kdeValues);
    const scaled = kdeValues.map(v => v * maxCount / maxKde);

    // Destroy old chart if exists
    if (ctx._chart) ctx._chart.destroy();

    ctx._chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [
                {
                    type: "bar",
                    label: "Anzahl",
                    data: counts,
                    backgroundColor: "rgba(54,162,235,0.75)",
                    borderWidth: 0
                },
                {
                    type: "line",
                    label: "Glättung",
                    data: scaled,
                    borderColor: "rgba(255,99,132,1.0)",
                    borderWidth: 3,
                    tension: 0.3,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Zeitbereich (Minuten)"
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Teilnehmer"
                    }
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
