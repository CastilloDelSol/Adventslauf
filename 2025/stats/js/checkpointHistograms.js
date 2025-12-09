// checkpointHistograms.js
import { loadCheckpointData, getCheckpointData } from "./dataLoader.js";

/* -------------------------------------------------------
   Gaussian KDE
------------------------------------------------------- */
function gaussianKernel(x) {
    return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

function computeKDE(xs, counts, bandwidth = 45) {
    const kdeValues = xs.map(x0 => {
        let sum = 0;
        for (let i = 0; i < xs.length; i++) {
            const u = (x0 - xs[i]) / bandwidth;
            sum += counts[i] * gaussianKernel(u);
        }
        return sum;
    });
    return kdeValues;
}

/* -------------------------------------------------------
   Time formatters
------------------------------------------------------- */
function secToHM(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h}:${m.toString().padStart(2, "0")}`;
}

function isUnixTimestamp(val) {
    return val > 86400;
}

function formatBucketLabel(start, end) {
    if (isUnixTimestamp(start)) {
        const s = new Date(start * 1000);
        const e = new Date(end * 1000);
        const pad = x => x.toString().padStart(2, "0");
        return `${pad(s.getHours())}:${pad(s.getMinutes())}–${pad(e.getHours())}:${pad(e.getMinutes())}`;
    }
    return `${secToHM(start)}–${secToHM(end)}`;
}

/* -------------------------------------------------------
   RENDER stacked histogram for ALL races (filtered)
------------------------------------------------------- */
export async function renderCheckpointHistogram(canvasId, checkpointField, displayKde = false) {
    await loadCheckpointData();
    const data = getCheckpointData();

    const buckets = data[checkpointField];
    if (!buckets || !Array.isArray(buckets)) {
        console.error(`Unknown checkpoint field: ${checkpointField}`);
        return;
    }

    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    // Available race_ids from json
    const raceIds = buckets[0].athlete_counts.map(a => a.race_id);

    // Colors for races
    const raceColors = [
        "rgba(54,162,235,0.75)",   // blue
        "rgba(255,159,64,0.75)",   // orange
        "rgba(153,102,255,0.75)",  // purple
        "rgba(255,205,86,0.75)",   // yellow
        "rgba(75,192,192,0.75)"    // teal
    ];

    const raceColorsSolid = raceColors.map(c => c.replace("0.75", "1.0"));

    // X positions for KDE
    const xs = buckets.map(b => (b.range_start + b.range_end) / 2);

    // Labels for X-axis (formatted times)
    const labels = buckets.map(b =>
        formatBucketLabel(b.range_start, b.range_end)
    );

    /* -------------------------------------------------------
       Build race data → filter out races with total = 0
    ------------------------------------------------------- */
    let raceSeries = raceIds.map(ri => {
        const counts = buckets.map(b => {
            const entry = b.athlete_counts.find(a => a.race_id === ri);
            return entry ? entry.count : 0;
        });

        const total = counts.reduce((a, b) => a + b, 0);

        return { race_id: ri, counts, total };
    });

    // Only include races with non-zero total
    raceSeries = raceSeries.filter(r => r.total > 0);

    /* -------------------------------------------------------
       Create stacked datasets
    ------------------------------------------------------- */
    const datasets = [];

    raceSeries.forEach((r, index) => {
        datasets.push({
            type: "bar",
            label: `Race ${r.race_id}`,
            data: r.counts,
            backgroundColor: raceColors[index % raceColors.length],
            stack: "stack1"
        });
    });

    /* -------------------------------------------------------
       Compute total counts for KDE (only if enabled)
    ------------------------------------------------------- */
    if (displayKde) {
        const totalCounts = buckets.map((b, i) =>
            raceSeries.reduce((sum, r) => sum + r.counts[i], 0)
        );

        // KDE smoothing
        const kdeValues = computeKDE(xs, totalCounts, 45);

        // Scale KDE to max bar height
        const maxCount = Math.max(...totalCounts);
        const maxKde = Math.max(...kdeValues) || 1;
        const scaledKde = kdeValues.map(v => v * maxCount / maxKde);

        datasets.push({
            type: "line",
            label: "KDE (total)",
            data: scaledKde,
            borderColor: raceColorsSolid[0],
            borderWidth: 3,
            tension: 0.25,
            pointRadius: 0
        });
    }

    /* -------------------------------------------------------
       Render chart
    ------------------------------------------------------- */
    if (ctx._chart) ctx._chart.destroy();

    ctx._chart = new Chart(ctx, {
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                    title: { display: true, text: "Zeit" },
                    ticks: { minRotation: 45, maxRotation: 90 }
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

/* -------------------------------------------------------
   Render all checkpoints (stacked) with fixed IDs
------------------------------------------------------- */
export async function renderAllCheckpointHistograms() {
    await loadCheckpointData();

    const mapping = {
        "histStart": "start_histogram_buckets",
        "histRothenhusen": "split_rothenhusen_histogram_buckets",
        "histRegistration": "registration_histogram_buckets",
        "histFinish": "finish_histogram_buckets"
    };

    for (const [canvasId, bucketField] of Object.entries(mapping)) {
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            renderCheckpointHistogram(canvasId, bucketField);
        }
    }
}
