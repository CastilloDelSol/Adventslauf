const URL = "/stats/data/age_buckets_by_distance.json";

let AGE_DATA = null;

export async function loadAgeData() {
    if (AGE_DATA) return AGE_DATA;

    const resp = await fetch(URL);
    AGE_DATA = await resp.json();
    return AGE_DATA;
}

export function getSection(sectionName) {
    if (!AGE_DATA) throw new Error("AGE_DATA not loaded yet");
    return AGE_DATA[sectionName];
}
