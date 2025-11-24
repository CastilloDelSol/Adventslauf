// -------------------------------
//  CACHE FÜR IMMER
// -------------------------------
let AGE_DATA = null;
let loadPromise = null;

// relativer Pfad aus Sicht von index.html
const URL = "./data/age_buckets_by_distance.json";

export async function loadAgeData() {

    // schon geladen?
    if (AGE_DATA) return AGE_DATA;

    // LÄDT BEREITS? -> gleiche Promise zurückgeben!
    if (loadPromise) return loadPromise;

    console.log("DEBUG: JSON wird jetzt EINMAL geladen...");

    // echte einmalige Ladeoperation
    loadPromise = fetch(URL)
        .then(resp => resp.json())
        .then(json => {
            AGE_DATA = json;     // dauerhaft cachen
            return AGE_DATA;
        })
        .catch(err => {
            console.error("Fehler beim Laden JSON:", err);
            throw err;
        });

    return loadPromise;
}

export function getSection(sectionName) {
    if (!AGE_DATA) {
        throw new Error("AGE_DATA not loaded yet!");
    }
    return AGE_DATA[sectionName];
}
