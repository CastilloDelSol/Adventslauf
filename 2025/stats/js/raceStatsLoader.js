// raceStatsLoader.js

// ============================================================
//   GLOBAL CACHE (Lädt JEDE Datei nur 1x)
// ============================================================
const RACE_STATS = {};
const RACE_PROMISES = {};

// ============================================================
//   Pfade (Erwartet Dateien im Verzeichnis ./data/)
// ============================================================
const RACE_FILES = {
    hauptlauf: "./data/hauptlauf_stats.json",
    kurzstrecke: "./data/kurzstrecke_stats.json"
};

// ============================================================
//   Ladefunktion (einmalig je Strecke)
// ============================================================
export async function loadRaceStats(raceName) {

    if (RACE_STATS[raceName]) return RACE_STATS[raceName];
    if (RACE_PROMISES[raceName]) return RACE_PROMISES[raceName];

    const path = RACE_FILES[raceName];
    if (!path) throw new Error("Unknown raceName: " + raceName);

    console.log(`Loading Race Stats (${raceName}) once…`);

    RACE_PROMISES[raceName] = fetch(path)
        .then(r => {
            if (!r.ok) throw new Error("HTTP error " + r.status);
            return r.json();
        })
        .then(json => {
            RACE_STATS[raceName] = json;
            return json;
        })
        .catch(err => {
            console.error(`Failed to load stats for ${raceName}:`, err);
            throw err;
        });

    return RACE_PROMISES[raceName];
}

// ============================================================
//   Getter-Funktion (Nur nach erfolgreichem Laden!)
// ============================================================
export function getRaceStats(raceName) {
    if (!RACE_STATS[raceName]) {
        throw new Error(`Race stats "${raceName}" not loaded yet`);
    }
    return RACE_STATS[raceName];
}

// Short helper if you need available keys
export function listAvailableRaces() {
    return Object.keys(RACE_FILES);
}
