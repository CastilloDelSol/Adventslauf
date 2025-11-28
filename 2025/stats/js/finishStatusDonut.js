// finishStatusDonut.js

import { loadRaceStats, getRaceStats } from "./raceStatsLoader.js";

// ------------------------------------------------------------
// Renders a donut for a given race (hauptlauf / kurzstrecke)
// ------------------------------------------------------------
export async function renderFinishStatusDonut(raceName, canvasId) {

    await loadRaceStats(raceName);
    const race = getRaceStats(raceName);

    if (!race) {
        console.warn("No race data for", raceName);
        return;
    }

    const fin = race.finisher ?? 0;
    const dns = race.dns ?? 0;
    const dnf = race.dnf ?? 0;
    const dsq = race.dsq ?? 0;

    const total = fin + dns + dnf + dsq;
    if (total === 0) {
        console.warn("Race has no status data:", raceName);
        return;
    }

    const ctx = document.getElementById(canvasId);
    if (!ctx) {
        console.error("Canvas not found:", canvasId);
        return;
    }

    new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Finisher", "DNS", "DNF", "DSQ"],
            datasets: [{
                data: [fin, dns, dnf, dsq],
                backgroundColor: [
                    "rgba(54, 162, 235, 0.85)",  // FIN – blue
                    "#cccccc",                    // DNS – grey
                    "rgba(255, 99, 132, 0.85)",   // DNF – red
                    "rgba(255, 159, 64, 0.85)"    // DSQ – orange
                ],
                borderWidth: 2
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            cutout: "60%",  // nice donut look

            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        usePointStyle: true,
                        pointStyle: "circle"
                    }
                },
                tooltip: {
                    callbacks: {
                        label: ctx => {
                            const label = ctx.label;
                            const value = ctx.raw;
                            const pct = (value / total * 100).toFixed(1);
                            return `${label}: ${value} (${pct}%)`;
                        }
                    }
                }
            }
        }
    });
}
