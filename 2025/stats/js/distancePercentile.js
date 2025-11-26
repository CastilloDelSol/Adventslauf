// distancePercentile.js

import { loadGeoData } from "./dataLoader.js";

export async function renderDistancePercentile(canvasId) {
    const geo = await loadGeoData();

    if (!geo || !geo.percentiles_km) {
        console.error("No percentile data found");
        return;
    }

    const entries = Object.entries(geo.percentiles_km)
        .map(([p, val]) => ({
            percentile: parseFloat(p.replace("%", "")),
            value: val
        }))
        .sort((a, b) => a.percentile - b.percentile);

    const labels = entries.map(e => e.percentile + "%");
    const values = entries.map(e => e.value);

    // Y-Max berechnen (zur nächsten 10er-Potenz aufrunden)
    const maxValue = Math.max(...values);
    const yMax = Math.pow(10, Math.ceil(Math.log10(maxValue)));

    // -------------------------------------------------------------
    // LOG-TICKS GENERIEREN (mit minor steps)
    // -------------------------------------------------------------
    const logTicks = [];

    // z.B. 10^-1 bis 10^3 → 0.1 bis 1000
    for (let exp = -1; exp <= 3; exp++) {
        for (let m = 1; m < 10; m++) {
            const val = m * Math.pow(10, exp);
            if (val >= 0.1 && val <= yMax) {
                logTicks.push(val);
            }
        }
    }

    const mainTicks = [0.1, 1, 10, 100, 1000];

    // -------------------------------------------------------------
    // CHART
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
                    }
                },

                y: {
                    type: "logarithmic",
                    min: 0.1,
                    max: yMax,

                    // WICHTIG: wir überschreiben TICK-Werte selbst
                    ticks: {
                        callback: (value) =>
                            mainTicks.includes(value) ? value + " km" : "",
                        values: logTicks  // erzeugt MINOR GRIDLINES
                    },

                    grid: {
                        // ALLE Gridlines zeichnen – auch die Minor
                        drawTicks: true,
                        color: (ctx) => {
                            const v = ctx.tick.value;

                            // Hauptlinie = dunkler
                            if (mainTicks.includes(v)) return "#999";

                            // Minorlinie = sehr hell
                            return "rgba(0,0,0,0.10)";
                        },
                        lineWidth: (ctx) => {
                            const v = ctx.tick.value;
                            return mainTicks.includes(v) ? 1.4 : 0.6;
                        }
                    }
                }
            },

            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `Distanz: ${ctx.raw.toFixed(2)} km`
                    }
                }
            }
        }
    });
}
