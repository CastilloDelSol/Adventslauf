// finishStatusDonut.js
import { loadRaceStats, getRaceStats } from "./raceStatsLoader.js";

// ---------------------------------------------------------
// Center text plugin (enhanced version of your gender donut)
// ---------------------------------------------------------
const centerStatusText = {
    id: "centerStatusText",
    afterDraw(chart, args, options) {
        const ctx = chart.ctx;
        const { top, bottom, left, right } = chart.chartArea;

        const x = (left + right) / 2;
        const y = (top + bottom) / 2;

        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#333";

        // Line 1: number
        ctx.font = "bold 28px Arial";
        ctx.fillText(options.value, x, y - 10);

        // Line 2: label
        ctx.font = "16px Arial";
        ctx.fillText(options.label, x, y + 18);

        ctx.restore();
    }
};

// ---------------------------------------------------------
// Render donut
// ---------------------------------------------------------
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

    // Decide label under the number
    let centerLabel = "Teilnehmer";
    // but: if finisher is most important, show “Finisher”
    if (fin > 0) centerLabel = fin === 1 ? "Finisher" : "Finisher";

    new Chart(ctx, {
        type: "doughnut",
        plugins: [centerStatusText],

        data: {
            labels: ["Finisher", "DNS", "DNF", "DSQ"],
            datasets: [{
                data: [fin, dns, dnf, dsq],

                // Harmonized, premium, non-neon palette
                backgroundColor: [
                    "#2ecc71", // Finisher – soft green
                    "#f1c40f", // DNS – warm yellow
                    "#e74c3c", // DNF – deep red
                    "#9b59b6"  // DSQ – elegant purple
                ],

                borderWidth: 2,
                hoverOffset: 6
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "60%", // same as gender donut

            rotation: -90 * (Math.PI / 180),  // START AT TOP → same as gender donut

            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 900,
                easing: "easeOutQuart"
            },

            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        usePointStyle: true,
                        pointStyle: "circle",
                        font: { size: 14 }
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
                },

                centerStatusText: {
                    value: fin,       // big number inside donut
                    label: centerLabel
                }
            }
        }
    });
}
