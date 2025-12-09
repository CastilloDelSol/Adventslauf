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
    return val > 10_000_000_000;
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
   RENDER stacked histogram for ALL races
------------------------------------------------------- */
export async function renderCheckpointHistogram(canvasId, checkpointField) {
    await loadCheckpointData();
    const data = getCheckpointData();

    const buckets = data[checkpointField];
    if (!buckets || !Array.isArray(buckets)) {
        console.error(`Unknown checkpoint field: ${checkpointField}`);
        return;
    }

    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    // Determine how many races exist from the JSON
    const raceIds = buckets[0].athlete_counts.map(a => a.race_id);
    const numRaces = raceIds.length;

    // Colors for races
    const raceColors = [
        "rgba(54,162,235,0.75)",
        "rgba(255,159,64,0.75)",
        "rgba(153,102,255,0.75)",
        "rgba(255,205,86,0.75)",
        "rgba(75,192,192,0.75)"
    ];

    const raceColorsSolid = raceColors.map(c =>
        c.replace("0.75", "1.0")
    );

    // X positions (center of bucket)
    const xs = buckets.map(b => (b.range_start + b.range_end) / 2);

    // stacked race datasets + total counts for KDE
    const labels = buckets.map(b => formatBucketLabel(b.range_start, b.range_end));

    // ---- Build datasets ----
    const datasets = [];
    const totalCounts = [];

    for (let ri = 0; ri < numRaces; ri++) {
        const dsCounts = buckets.map(b => {
            const entry = b.athlete_counts.find(a => a.race_id === ri);
            return entry ? entry.count : 0;
        });

        datasets.push({
            type: "bar",
            label: `Race ${ri}`,
            data: dsCounts,
            backgroundColor: raceColors[ri % raceColors.length],
            stack: "stack1"
        });
    }

    // total per bucket for KDE
    for (let i = 0; i < buckets.length; i++) {
        totalCounts[i] = buckets[i].athlete_counts.reduce((sum, a) => sum + a.count, 0);
    }

    // Compute KDE on merged total counts
    const kdeValues = computeKDE(xs, totalCounts, 45);

    // scale KDE to bar height
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

    // ---- Render Chart ----
    if (ctx._chart) ctx._chart.destroy();

    ctx._chart = new Chart(ctx, {
        data: {
            labels,
            datasets
        },
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
