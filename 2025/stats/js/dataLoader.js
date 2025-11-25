// -------------------------------
//  GLOBAL CACHES
// -------------------------------
let AGE_DATA = null;
let AGE_PROMISE = null;

let NAT_DATA = null;
let NAT_PROMISE = null;

// -------------------------------
//  URLS (RELATIVE TO index.html)
// -------------------------------
const AGE_URL = "./data/age_buckets_by_distance.json";
const NAT_URL = "./data/nationality.json";

// ============================================================
//  AGE DATA
// ============================================================
export async function loadAgeData() {

    if (AGE_DATA) return AGE_DATA;          // already cached
    if (AGE_PROMISE) return AGE_PROMISE;    // already loading

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

    if (NAT_DATA) return NAT_DATA;          // cached
    if (NAT_PROMISE) return NAT_PROMISE;    // loading

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
