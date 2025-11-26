// distancePercentile.js

import { loadGeoData } from "./dataLoader.js";

export async function renderDistancePercentile(canvasId) {
    const geo = await loadGeoData();

    if (!geo || !geo.percentiles_km) {
        console.error("No percentile data found");
        return;
    }

    // -------------------------------------------------------------
    // 1. Percentiles to arrays (sorted by percentile number)
    // -------------------------------------------------------------
    const entries = Object.entries(geo.percentiles_km)
        .map(([p, val]) => ({
            percentile: parseFloat(p.replace("%", "")),
            value: val
        }))
        .sort((a, b) => a.percentile - b.percentile);

    const labels = entries.map(e => e.percentile + "%");
    const values = entries.map(e => e.value);

    // Canvas element
    const ctx = document.getElementById(canvasId);

    // -------------------------------------------------------------
    // 2. Create Chart.js Percentile Line Chart (without animation)
    // -------------------------------------------------------------
    const chart = new Chart(ctx, {
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

            // Keine Positionsanimation
            animation: false,

            // Entfernt das "fliegen" von 0,0
            animations: {
                numbers: {
                    type: 'number',
                    duration: 0,
                    from: undefined
                }
            },

            // Skalen
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
                    title: {
                        display: true,
                        text: "Entfernung (km, log10)"
                    },
                    type: "logarithmic",
                    min: 0.1,
                    ticks: {
                        callback: (v) => Number(v).toLocaleString() + " km"
                    }
                }
            },

            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) =>
                            `Distanz: ${ctx.raw.toFixed(2)} km`
                    }
                }
            }
        }
    });

    // -------------------------------------------------------------
    // 3. ⭐ Manuelle SANFTE Animation (funktioniert IMMER)
    //    → Einblendung durch borderWidth 0 → 3
    // -------------------------------------------------------------
    // Erst borderWidth auf 0 setzen
    chart.data.datasets[0].borderWidth = 0;
    chart.update();

    // Sanft auf borderWidth 3 animieren
    setTimeout(() => {
        chart.data.datasets[0].borderWidth = 3;
        chart.update({
            duration: 900,
            easing: "easeOutQuad"
        });
    }, 250); // kurze Verzögerung, bis Chart wirklich sichtbar ist
}
