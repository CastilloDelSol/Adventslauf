import { loadAgeData } from "./dataLoader.js";

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

        ctx.fillText(options.value, x, y);
        ctx.restore();
    }
};

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
        if (!group) return console.error("Section not found:", sectionName);

        group.forEach(e => {
            totalM += e.M;
            totalW += e.W;
        });
    }

    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");

    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width  = rect.width  * ratio;
    canvas.height = rect.height * ratio;
    ctx.scale(ratio, ratio);

    new Chart(ctx, {
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
                }
            }
        }
    });
}
