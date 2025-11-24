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
            labels: ["Männlich", "Weiblich"],
            datasets: [{
                data: [totalM, totalW],
                backgroundColor: ["#4EA5E9", "#FF6384"]
            }]
        },
        options: {
            responsive: true
        }
    });
}
