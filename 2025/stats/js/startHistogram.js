// startHistogram.js
import { loadCheckpointData, getCheckpointData } from "./dataLoader.js";

// format seconds-from-midnight → HH:MM:SS
function secToClock(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    const pad = x => x.toString().padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export async function renderStartHistogram(canvasId = "histStart") {
    await loadCheckpointData();
    const data = getCheckpointData();

    const buckets = data.start_histogram_buckets;
    if (!buckets) {
        console.error("start_histogram_buckets missing");
        return;
    }

    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    // labels based on seconds-from-midnight
    const labels = buckets.map(b => secToClock(b.range_start));

    // collect races
    const raceIds = buckets[0].athlete_counts.map(a => a.race_id);

    let raceSeries = raceIds.map(raceId => {
        const counts = buckets.map(b => {
            const entry = b.athlete_counts.find(a => a.race_id === raceId);
            return entry ? entry.count : 0;
        });
        const sum = counts.reduce((a, b) => a + b, 0);
        return { raceId, counts, sum };
    }).filter(r => r.sum > 0);

    const raceColors = [
        "rgba(54,162,235,0.75)",
        "rgba(255,159,64,0.75)",
        "rgba(153,102,255,0.75)",
        "rgba(255,205,86,0.75)",
        "rgba(75,192,192,0.75)"
    ];

    const datasets = raceSeries.map((r, idx) => ({
        type: "bar",
        label: `Race ${r.raceId}`,
        data: r.counts,
        backgroundColor: raceColors[idx % raceColors.length],
        stack: "stack1"
    }));

    if (ctx._chart) ctx._chart.destroy();

    ctx._chart = new Chart(ctx, {
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                    title: { display: true, text: "Zeit (hh:mm:ss)" },
                    ticks: {
                        autoSkip: false,
                        callback: (value, index) =>
                            index % 15 === 0 ? labels[index] : ""
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: { display: true, text: "Teilnehmer" }
                }
            }
        }
    });
}
