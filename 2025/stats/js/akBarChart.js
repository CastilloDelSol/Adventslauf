// akBarChart.js

import { loadRaceStats, getRaceStats } from "./raceStatsLoader.js";

let chartM = null;
let chartW = null;

// ------------------------------------------------------------
// Format seconds → HH:MM:SS
// ------------------------------------------------------------
function secToHMS(sec) {
    if (sec == null) return "";
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
}

// ------------------------------------------------------------
// Build a sorted AG list; identical to your Python sorting
// ------------------------------------------------------------
function sortAgeGroups(statsObj) {
    const keys = Object.keys(statsObj);

    return keys.sort((a, b) => {

        const isAoverall = a === "Overall";
        const isBoverall = b === "Overall";
        if (isAoverall && !isBoverall) return -1;
        if (!isAoverall && isBoverall) return 1;

        const isAju = a.startsWith("JU");
        const isBju = b.startsWith("JU");
        if (isAju && !isBju) return -1;
        if (!isAju && isBju) return 1;

        if (isAju && isBju) return parseInt(a.slice(2)) - parseInt(b.slice(2));

        const na = parseInt(a);
        const nb = parseInt(b);

        if (!isNaN(na) && !isNaN(nb)) return na - nb;

        return a.localeCompare(b);
    });
}

// ------------------------------------------------------------
// Render one bar chart (M or W)
// ------------------------------------------------------------
function renderOne(canvasId, stats, dataKey, gender) {
    const ctx = document.getElementById(canvasId);

    if (!ctx) return;

    // Determine chart reference
    let chartRef = (gender === "M" ? chartM : chartW);
    if (chartRef) chartRef.destroy();

    // Sort Age Groups
    const groups = sortAgeGroups(stats);

    // Build chart data
    const labels = [];
    const values = [];
    const hmsLabels = [];

    groups.forEach(ag => {
        const row = stats[ag];
        const sec = row[dataKey]?.sec ?? null;
        if (sec !== null) {
            labels.push(ag);
            values.push(sec);
            hmsLabels.push(secToHMS(sec));
        }
    });

    // Colors for bars
    const barColor = gender === "M"
        ? "rgba(54, 162, 235, 0.75)"   // blue
        : "rgba(255, 99, 132, 0.75)";  // red

    const borderColor = gender === "M"
        ? "rgba(54, 162, 235, 1.0)"
        : "rgba(255, 99, 132, 1.0)";

    const newChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: dataKey,
                data: values,
                backgroundColor: barColor,
                borderColor: borderColor,
                borderWidth: 2
            }]
        },

        options: {
            maintainAspectRatio: false,
            responsive: true,

            scales: {
                x: {
                    title: { display: true, text: "Altersklasse" },
                    ticks: { maxRotation: 90, minRotation: 45 }
                },
                y: {
                    beginAtZero: false,
                    title: { display: true, text: "Zeit (Sekunden)" },
                    ticks: {
                        callback: secToHMS
                    }
                }
            },

            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const sec = ctx.raw;
                            return secToHMS(sec);
                        }
                    }
                },
                legend: { display: false }
            }
        }
    });

    if (gender === "M") chartM = newChart;
    else chartW = newChart;
}

// ------------------------------------------------------------
// Exported main function
// ------------------------------------------------------------
export async function renderAKCharts(raceName, typeKey) {

    await loadRaceStats(raceName);
    const race = getRaceStats(raceName);

    if (!race || !race.M || !race.W) {
        console.error("Missing race stats:", raceName);
        return;
    }

    renderOne("akBarsM", race.M.statistics, typeKey, "M");
    renderOne("akBarsW", race.W.statistics, typeKey, "W");
}
