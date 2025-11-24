const centerText = {
    id: "centerText",
    afterDraw(chart, args, opts) {
        const { ctx, chartArea } = chart;
        if (!chartArea) return;

        const x = chartArea.left + chartArea.width / 2;
        const y = chartArea.top + chartArea.height / 2;

        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#333";

        // Dynamisch skalierte Fontgröße
        const fontSize = Math.max(Math.floor(chartArea.width / 10), 14);
        ctx.font = `bold ${fontSize}px Arial`;

        ctx.fillText(opts.value, x, y);
        ctx.restore();
    }
};

import { loadAgeData } from "./dataLoader.js";

export async function renderGenderDonut(sectionName, canvasId) {
    const data = await loadAgeData();

    let totalM = 0, totalW = 0;

    if (sectionName === "TOTAL") {
        for (const key of Object.keys(data)) {
            data[key].forEach(e => {
                totalM += e.M;
                totalW += e.W;
            });
        }
    } else {
        const group = data[sectionName];
        group.forEach(e => {
            totalM += e.M;
            totalW += e.W;
        });
    }

    new Chart(document.getElementById(canvasId), {
        type: "doughnut",
        plugins: [centerText],
        data: {
            labels: ["M", "W"],
            datasets: [{
                data: [totalM, totalW],
                backgroundColor: ["#4EA5E9", "#FF6384"]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "60%",
            plugins: {
                centerText: {
                    value: totalM + totalW
                },
                legend: { position: "top" }
            }
        }
    });
}
