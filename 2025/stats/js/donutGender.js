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

        // Mittelpunkt des Chart-Bereichs (immer korrekt!)
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
        // Nur eine Strecke
        const group = data[sectionName];
        if (!group) return console.error("Section not found:", sectionName);

        group.forEach(e => {
            totalM += e.M;
            totalW += e.W;
        });
    }

    /*
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
  */
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
                  value: totalM + totalW  // <-- wird direkt angezeigt!
              }
          }
      }
  });
}
