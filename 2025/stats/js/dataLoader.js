// dataLoader.js

// ============================================================
//  GLOBAL CACHES (all only load ONCE)
// ============================================================
let AGE_DATA = null;
let AGE_PROMISE = null;

let NAT_DATA = null;
let NAT_PROMISE = null;

let GEO_DATA = null;
let GEO_PROMISE = null;

let CHECKPOINT_DATA = null;
let CHECKPOINT_PROMISE = null;

// ============================================================
//  URLS (relative to index.html)
// ============================================================
const AGE_URL = "./data/age_buckets_by_distance.json";
const NAT_URL = "./data/nationality.json";
const GEO_URL = "./data/geo-stats.json";
const CHECKPOINT_URL = "./data/time_buckets.json";

// ============================================================
//  AGE DATA
// ============================================================
export async function loadAgeData() {

    if (AGE_DATA) return AGE_DATA;
    if (AGE_PROMISE) return AGE_PROMISE;

    console.log("Load AGE JSON (once)…");

    AGE_PROMISE = fetch(AGE_URL)
        .then(r => r.json())
        .then(json => {
            AGE_DATA = json;
            return AGE_DATA;
        })
        .catch(err => {
            console.error("Failed to load AGE data", err);
            throw err;
        });

    return AGE_PROMISE;
}

export function getSection(sectionName) {
    if (!AGE_DATA) throw new Error("AGE_DATA not loaded yet");
    return AGE_DATA[sectionName];
}

// ============================================================
//  NATIONALITY DATA
// ============================================================
export async function loadNationalityData() {

    if (NAT_DATA) return NAT_DATA;
    if (NAT_PROMISE) return NAT_PROMISE;

    console.log("Load NATIONALITY JSON (once)…");

    NAT_PROMISE = fetch(NAT_URL)
        .then(r => r.json())
        .then(json => {
            NAT_DATA = json;
            return NAT_DATA;
        })
        .catch(err => {
            console.error("Failed to load NATIONALITY data", err);
            throw err;
        });

    return NAT_PROMISE;
}

export function getNationalityList() {
    if (!NAT_DATA) throw new Error("NATIONALITY data not loaded yet");
    return NAT_DATA;
}


// ============================================================
//  GEO DATA (distance, histogram, percentiles, wind rose, etc.)
// ============================================================
export async function loadGeoData() {

    if (GEO_DATA) return GEO_DATA;
    if (GEO_PROMISE) return GEO_PROMISE;

    console.log("Load GEO JSON (once)…");

    GEO_PROMISE = fetch(GEO_URL)
        .then(r => r.json())
        .then(json => {
            GEO_DATA = json;
            return GEO_DATA;
        })
        .catch(err => {
            console.error("Failed to load GEO data", err);
            throw err;
        });

    return GEO_PROMISE;
}

export function getGeoData() {
    if (!GEO_DATA) throw new Error("GEO_DATA not loaded yet");
    return GEO_DATA;
}


// ============================================================
//  CHECKPOINT DATA (histograms)
// ============================================================
export async function loadCheckpointData() {

    if (CHECKPOINT_DATA) return CHECKPOINT_DATA;
    if (CHECKPOINT_PROMISE) return CHECKPOINT_PROMISE;

    console.log("Load Checkpoint JSON (once)…");

    CHECKPOINT_PROMISE = fetch(CHECKPOINT_URL)
        .then(r => r.json())
        .then(json => {
            CHECKPOINT_DATA = json;
            return CHECKPOINT_DATA;
        })
        .catch(err => {
            console.error("Failed to load CHECKPOINT data", err);
            throw err;
        });

    return CHECKPOINT_PROMISE;
}

export function getCheckpointData() {
    if (!CHECKPOINT_DATA) throw new Error("CHECKPOINT_DATA not loaded yet");
    return CHECKPOINT_DATA;
}
