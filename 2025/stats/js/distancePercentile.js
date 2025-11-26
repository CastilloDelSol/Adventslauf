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

    // -------------------------------------------------------------
    // 2. Create Chart.js Percentile Line Chart
    // -------------------------------------------------------------
    new Chart(document.getElementById(canvasId), {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Entfernung (km)",
                data: values,
                borderColor: "rgba(54, 162, 235, 1.0)",   // Pyramiden-Blau
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderWidth: 3,
                pointRadius: 0,
                tension: 0.25              // leicht geglättet
            }]
        },

        //here
        options: {
            responsive: true,
            maintainAspectRatio: false,
        
            // ⭐ EMPFOHLENE, KORREKT FIXTE ANIMATION
            animation: {
                duration: 0      // keine Positionsanimation
            },
        
            animations: {
                // verhindert Startposition = (0,0)
                numbers: {
                    type: 'number',
                    duration: 0,
                    from: undefined
                },
        
                // weicher Fade-In (ohne Bewegung!)
                opacity: {
                    duration: 800,
                    easing: "easeOutQuad",
                    from: 0,
                    to: 1
                },
        
                // alles andere aus
                x: false,
                y: false
            },
        
            scales: {
                x: {
                    title: { display: true, text: "Perzentil (%)" },
                    ticks: { maxTicksLimit: 11 }
                },
        
                y: {
                    title: { display: true, text: "Entfernung (km, log10)" },
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
                        label: ctx => `Distanz: ${ctx.raw.toFixed(2)} km`
                    }
                }
            }
        }
    });
}
