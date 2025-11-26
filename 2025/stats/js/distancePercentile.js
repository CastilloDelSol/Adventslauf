// distancePercentile.js

import { loadGeoData } from "./dataLoader.js";

export async function renderDistancePercentile(canvasId) {
    const geo = await loadGeoData();

    if (!geo || !geo.percentiles_km) {
        console.error("No percentile data found");
        return;
    }

    // -------------------------------------------------------------
    // 1. Percentiles -> arrays
    // -------------------------------------------------------------
    const entries = Object.entries(geo.percentiles_km)
        .map(([p, val]) => ({
            percentile: parseFloat(p.replace("%", "")),
            value: val
        }))
        .sort((a, b) => a.percentile - b.percentile);

    const labels = entries.map(e => e.percentile + "%");
    const values = entries.map(e => e.value);

    // -------------------------------------------------------------
    // 2. Y-Max automatisch an Daten anpassen (auf nächste 10er-Potenz)
    // -------------------------------------------------------------
    const maxValue = Math.max(...values);
    const yMax = Math.pow(10, Math.ceil(Math.log10(maxValue)));

    // -------------------------------------------------------------
    // 3. Chart.js – Percentile Line Chart
    // -------------------------------------------------------------
    new Chart(document.getElementById(canvasId), {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Entfernung (km)",
                data: values,
                borderColor: "rgba(54, 162, 235, 1.0)",
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderWidth: 3,
                pointRadius: 0,
                tension: 0.25
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Perzentil (%)"
                    },
                    ticks: {
                        maxTicksLimit: 11
                    }
                },

                y: {
                    type: "logarithmic",
                    min: 0.1,
                    max: yMax,

                    title: {
                        display: true,
                        text: "Entfernung (km, log10)"
                    },

                    // --- ONLY show 0.1 / 1 / 10 / 100 / 1000 ---
                    ticks: {
                        callback: (value) => {
                            const allowed = [0.1, 1, 10, 100, 1000];
                            return allowed.includes(value) ? value + " km" : "";
                        }
                    },

                    grid: {
                        drawTicks: true,
                        minorTicks: {
                            display: true
                        }
                    }
                }
            },

            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => `Distanz: ${ctx.raw.toFixed(2)} km`
                    }
                }
            }
        }
    });
}
