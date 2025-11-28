import { loadRaceStats, getRaceStats } from "./raceStatsLoader.js";

const centerText = {
    id: "centerText",
    afterDraw(chart, args, options) {
        const ctx = chart.ctx;
        const { top, bottom, left, right } = chart.chartArea;

        ctx.save();
        ctx.font = "bold 28px Arial";
        ctx.fillStyle = "#333";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const x = (left + right) / 2;
        const y = (top + bottom) / 2;

        ctx.fillText(options.value, x, y - 14);
        ctx.font = "16px Arial";
        ctx.fillText("Finisher", x, y + 12);

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

    const total = fin + dns + dnf + dsq;

    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    new Chart(canvas, {
        type: "doughnut",
        plugins: [centerText],

        data: {
            labels: ["FIN", "DNS", "DNF", "DSQ"],
            datasets: [{
                data: [fin, dns, dnf, dsq],
                backgroundColor: [
                    "#4EA5E9",
                    "#FFB347",
                    "#FF6384",
                    "#9B59B6"
                ],
                borderWidth: 0
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "60%",

            animation: false,

            plugins: {
                legend: {
                    display: true,
                    position: "bottom",
                    labels: {
                        usePointStyle: true,
                        pointStyle: "circle"
                    }
                },
                centerText: { value: fin }
            }
        }
    });
}
