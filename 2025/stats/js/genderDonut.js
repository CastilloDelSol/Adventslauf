// finishStatusDonut.js
import { loadRaceStats, getRaceStats } from "./raceStatsLoader.js";

const centerText = {
    id: "centerText",
    afterDraw(chart, args, options) {
        const ctx = chart.ctx;
        const { top, bottom, left, right } = chart.chartArea;

        ctx.save();
        ctx.font = "bold 26px Arial";
        ctx.fillStyle = "#333";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const x = (left + right) / 2;
        const y = (top + bottom) / 2;

        ctx.fillText(options.value, x, y);
        ctx.font = "normal 14px Arial";
        ctx.fillText("Finisher", x, y + 20);

        ctx.restore();
    }
};

export async function renderFinishStatusDonut(raceName, canvasId) {
    await loadRaceStats(raceName);
    const race = getRaceStats(raceName);
    if (!race) return;

    const fin = race.finisher ?? 0;
    const dns = race.dns ?? 0;
    const dnf = race.dnf ?? 0;
    const dsq = race.dsq ?? 0;

    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    new Chart(canvas, {
        type: "doughnut",
        plugins: [centerText],

        data: {
            labels: ["FINISHER", "DNS", "DNF", "DSQ"],
            datasets: [{
                data: [fin, dns, dnf, dsq],
                backgroundColor: [
                    "#52C47A",
                    "#EFA93F",
                    "#D9574A",
                    "#9063CD"
                ],
                borderWidth: 0
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "60%",
            rotation: 0,
            circumference: 360,
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 800
            },

            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        usePointStyle: true,
                        pointStyle: "circle",
                        padding: 16
                    }
                },
                centerText: { value: fin }
            }
        }
    });
}
