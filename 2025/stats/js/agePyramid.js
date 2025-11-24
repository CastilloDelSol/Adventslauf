async function renderAgePyramid(sectionName, canvasId, containerId) {
  const resp = await fetch("../data/age_buckets_by_distance.json");
  const data = await resp.json();
  const group = data[sectionName];
  if (!group) return;

  // fixe Zeilenhöhe pro Altersgruppe
  const rows = group.length;
  const rowHeight = 26;
  const topBottomPadding = 90;

  // WICHTIG: Container skalieren, nicht das Canvas
  const box = document.getElementById(containerId);
  box.style.height = (rows * rowHeight + topBottomPadding) + "px";

  const agegroups = group.map(e => e.AG).reverse();
  const males     = group.map(e => -e.M).reverse();
  const females   = group.map(e =>  e.W).reverse();

  let maxValue = Math.max(...males.map(v => Math.abs(v)), ...females);
  maxValue = Math.ceil(maxValue / 10) * 10;

  new Chart(document.getElementById(canvasId), {
    type: "bar",
    data: {
      labels: agegroups,
      datasets: [
        {
          label: "M",
          data: males,
          backgroundColor: "rgba(54, 162, 235, 0.7)",
          barThickness: 20,
          categoryPercentage: 1.0,
          barPercentage: 1.0
        },
        {
          label: "W",
          data: females,
          backgroundColor: "rgba(255, 99, 132, 0.7)",
          barThickness: 20,
          categoryPercentage: 1.0,
          barPercentage: 1.0
        }
      ]
    },
    options: {
      indexAxis: "y",
      maintainAspectRatio: false,
      scales: {
        x: {
          min: -maxValue,
          max:  maxValue,
          ticks: { callback: v => Math.abs(v) }
        },
        y: {
          type: 'category',
          offset: true
        }
      },
      plugins: {
        legend: { display: true },
        tooltip: {
          callbacks: {
            title: () => "",
            label: ctx => `${ctx.dataset.label}${ctx.label}: ${Math.abs(ctx.raw)}`
          }
        }
      }
    }
  });
}
