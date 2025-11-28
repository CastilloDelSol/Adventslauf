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
        ctx.fillText("Finisher", x, y + 28);
        ctx.restore();
    }
};

// KEY FIX: Disable tiny-arc collapsing
const stableDonut = {
    id: "stableDonut",
    beforeDatasetUpdate(chart, args, opts) {
        chart.getDatasetMeta(0).data.forEach(arc => {
            arc.circumference = arc.circumference; // freeze natural size
            arc.startAngle = arc.startAngle;
            arc.endAngle = arc.endAngle;
        });
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
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    new Chart(ctx, {
        type: "doughnut",
        plugins: [centerText, stableDonut],

        data: {
            labels: ["Finisher", "DNS", "DNF", "DSQ"],
            datasets: [{
                data: [fin, dns, dnf, dsq],
                backgroundColor: [
                    "#52C47A",
                    "#EFA93F",
                    "#D9574A",
                    "#9063CD"
                ],
                borderWidth: 1
            }]
        },

        options: {
            maintainAspectRatio: false,
            cutout: "60%",
            rotation: -90 * (Math.PI / 180),

            animation: {
                animateRotate: false,
                animateScale: true,
                duration: 500
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
