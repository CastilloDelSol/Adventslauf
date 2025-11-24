import { loadAgeData } from "./dataLoader.js";

const centerTextPlugin = {
  id: 'centerText',
  afterDraw(chart) {
    const {ctx, chartArea: {width, height}} = chart;
    const dataset = chart.data.datasets[0].data;
    const total = dataset[0] + dataset[1];

    ctx.save();
    ctx.font = "bold 22px Arial";
    ctx.fillStyle = "#333";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(total, width / 2, height / 2);
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
        // Nur eine Strecke
        const group = data[sectionName];
        if (!group) return console.error("Section not found:", sectionName);

        group.forEach(e => {
            totalM += e.M;
            totalW += e.W;
        });
    }
    
    new Chart(document.getElementById(canvasId), {
        type: "doughnut",
        data: {
            labels: ["M", "W"],
            datasets: [{
                data: [totalM, totalW],
                backgroundColor: ["#4EA5E9", "#FF6384"]
            }]
        },
        options: {
            responsive: true
        },
        plugins: [centerTextPlugin]
    });

}
