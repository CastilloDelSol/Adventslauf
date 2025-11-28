// finishStatusDonut.js
import { loadRaceStats, getRaceStats } from "./raceStatsLoader.js";

export async function renderFinishStatusDonut(raceName, canvasId) {

    await loadRaceStats(raceName);
    const race = getRaceStats(raceName);

    if (!race) return;

    const fin = race.finisher ?? 0;
    const dns = race.dns ?? 0;
    const dnf = race.dnf ?? 0;
    const dsq = race.dsq ?? 0;
    const total = fin + dns + dnf + dsq;

    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Finisher", "DNS", "DNF", "DSQ"],
            datasets: [{
                data: [fin, dns, dnf, dsq],

                // NEW pleasant palette
                backgroundColor: [
                    "#2ecc71",  // FIN – green
                    "#f39c12",  // DNS – orange
                    "#e74c3c",  // DNF – red
                    "#9b59b6"   // DSQ – purple
                ],

                borderWidth: 2,
                hoverOffset: 8
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "58%",   // nice donut look

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
                            const pct = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${pct}%)`;
                        }
                    }
                }
            }
        }
    });
}
