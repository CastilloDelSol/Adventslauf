// distanceHistogram.js

import { loadGeoStats } from "./dataLoader.js";

export async function renderDistanceHistogram(canvasId) {
    const geo = await loadGeoStats();

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
