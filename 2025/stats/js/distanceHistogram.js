// distanceHistogram.js
/*
import { loadGeoData } from "./dataLoader.js";

export async function renderDistanceHistogram(canvasId) {
    const geo = await loadGeoData();

    if (!geo || !geo.distance_histogram) {
        console.error("No histogram data found");
        return;
    }

    // 1. ONLY USE BUCKETS max ≤ 200
    const buckets = geo.distance_histogram.filter(b => b.max <= 200);

    // 2. Build labels like "0–10", "10–20", …
    const labels = buckets.map(b => `${b.min}–${b.max}`);

    // 3. Extract counts
    const counts = buckets.map(b => b.count);

    // 4. Create chart
    new Chart(document.getElementById(canvasId), {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Teilnehmer",
                data: counts,
                backgroundColor: "rgba(54, 162, 235, 0.8)",
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,

            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Entfernung (km)"
                    },
                    ticks: {
                        maxRotation: 80,
                        minRotation: 40
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Teilnehmerzahl"
                    }
                }
            },

            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: ctx => `Distanz: ${ctx[0].label} km`,
                        label: ctx => `Teilnehmer: ${ctx.raw}`
                    }
                }
            }
        }
    });
}
*/

// distanceHistogram.js

import { loadGeoData } from "./dataLoader.js";

// --------------------------------------------------------
// Simple Gaussian KDE for histogram smoothing
// --------------------------------------------------------
function gaussianKernel(x) {
    return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

function computeKDE(buckets, bandwidth = 10) {
    // Prepare sample points (bucket midpoints)
    const xs = buckets.map(b => (b.min + b.max) / 2);
    const counts = buckets.map(b => b.count);

    // KDE curve will be drawn on same x positions
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

// --------------------------------------------------------
// Render Smoothed Histogram + KDE Line
// --------------------------------------------------------
export async function renderDistanceHistogram(canvasId) {
    const geo = await loadGeoData();

    if (!geo || !geo.distance_histogram) {
        console.error("No histogram data found");
        return;
    }

    // 1) BUCKET LIMIT: Only ≤200 km
    const buckets = geo.distance_histogram.filter(b => b.max <= 200);

    // 2) Labels
    const labels = buckets.map(b => `${b.min}–${b.max}`);

    // 3) Counts
    const counts = buckets.map(b => b.count);

    // 4) KDE smoothing
    const { xs, kdeValues } = computeKDE(buckets, 8);  // bandwidth 8 = good look

    // Normalize KDE to match histogram height visually
    const maxCount = Math.max(...counts);
    const maxKde = Math.max(...kdeValues);
    const scaleFactor = maxCount / maxKde;
    const scaledKde = kdeValues.map(v => v * scaleFactor);

    // --------------------------------------------------------
    // Create the chart
    // --------------------------------------------------------
    new Chart(document.getElementById(canvasId), {
        data: {
            labels: labels,
            datasets: [
                // Histogram bars
                {
                    type: "bar",
                    label: "Anzahl",
                    data: counts,
                    backgroundColor: "rgba(54, 162, 235, 0.75)",   // pyramid blue
                    borderWidth: 0
                },

                // KDE line
                {
                    type: "line",
                    label: "Geglättete Verteilung",
                    data: scaledKde,
                    borderColor: "rgba(255, 99, 132, 1.0)",         // pyramid red
                    borderWidth: 3,
                    pointRadius: 0,
                    tension: 0.35,
                }
            ]
        },

        options: {
            maintainAspectRatio: false,
            responsive: true,

            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Entfernung (km)"
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Teilnehmer"
                    }
                }
            },

            plugins: {
                tooltip: {
                    callbacks: {
                        label: ctx => {
                            if (ctx.dataset.type === "bar") {
                                return `${ctx.raw} Teilnehmer`;
                            } else {
                                return `Glättung: ${ctx.raw.toFixed(0)}`;
                            }
                        }
                    }
                }
            }
        }
    });
}
