export const FINANCE_DATA = 'FINANCE_DATA';

export const AGGREGATED_ATEMPORAL = "AGGREGATED_ATEMPORAL";
export const AGGREGATED_TEMPORAL = "AGGREGATED_TEMPORAL";
export const M52_FONCTION_ATEMPORAL = "M52_FONCTION_ATEMPORAL";
export const M52_FONCTION_TEMPORAL = "M52_FONCTION_TEMPORAL";

export const CORRECTIONS_AGGREGATED = "CORRECTIONS_AGGREGATED";

export const INSERTION_PICTO = "INSERTION_PICTO";
export const COLLEGE_PICTO = "COLLEGE_PICTO";
export const ENFANCE_PICTO = "ENFANCE_PICTO";
export const ENVIRONNEMENT_AMENAGEMENT_PICTO = "ENVIRONNEMENT_AMENAGEMENT_PICTO";
export const HANDICAPES_PICTO = "HANDICAPES_PICTO";
export const PATRIMOINE_PICTO = "PATRIMOINE_PICTO";
export const ROUTES_PICTO = "ROUTES_PICTO";
export const SOUTIEN_COMMUNES_PICTO = "SOUTIEN_COMMUNES_PICTO";
export const PERSONNES_AGEES_PICTO = "PERSONNES_AGEES_PICTO";

export const AGENTS_PICTO = 'AGENTS_PICTO';
export const CARBURANT_PICTO = 'CARBURANT_PICTO';
export const ELECTRICITE_PICTO = 'ELECTRICITE_PICTO';

export const CARTE_PRESENCE_HTML = "CARTE_PRESENCE_HTML";

export const ANIMATION_VIDEO = "ANIMATION_VIDEO";

const env = process.env.NODE_ENV;

const GIRONDE_FR_DRUPAL_MEDIA_ID = process.env.GIRONDE_FR_DRUPAL_MEDIA_ID;

export const urls = {
    // finance data
    [FINANCE_DATA]: {
        "production": `/media/${GIRONDE_FR_DRUPAL_MEDIA_ID}/field_dataviz_files/22`,
        "demo": `./build/finances/finance-data.json`,
        "development": `../build/finances/finance-data.json`,
    }[env],

    // texts
    [AGGREGATED_ATEMPORAL]: {
        "production": `/media/${GIRONDE_FR_DRUPAL_MEDIA_ID}/field_dataviz_files/16`,
        "demo": `./data/texts/aggregated-atemporal.csv`,
        "development": `../data/texts/aggregated-atemporal.csv`
    }[env],
    [AGGREGATED_TEMPORAL]: {
        "production": `/media/${GIRONDE_FR_DRUPAL_MEDIA_ID}/field_dataviz_files/15`,
        "demo":  `./data/texts/aggregated-temporal.csv`,
        "development": `../data/texts/aggregated-temporal.csv`
    }[env]
}
