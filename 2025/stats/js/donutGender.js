import { loadAgeData, getSection } from "./dataLoader.js";

export async function renderGenderDonut(sectionName, canvasId) {
    await loadAgeData();

    const group = getSection(sectionName);

    let totalM = 0, totalW = 0;

    group.forEach(e => {
        totalM += e.M;
        totalW += e.W;
    });

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
