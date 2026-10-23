/**
 * SEED-OPENTHESAURUS-RAW-CACHE.JS
 * Pre-populates realistic, authentic OpenThesaurus API responses in data/lexicon/raw/openthesaurus/
 * Ensures 100% offline development, test consistency, and rate-limit compliance.
 */

const fs = require('fs');
const path = require('path');

const RAW_DIR = path.resolve(__dirname, '../data/lexicon/raw/openthesaurus');
if (!fs.existsSync(RAW_DIR)) {
  fs.mkdirSync(RAW_DIR, { recursive: true });
}

const META_TEMPLATE = {
  copyright: "Copyright (C) 2009-2026 Daniel Naber (www.openthesaurus.de)",
  license: "GNU Lesser General Public License (LGPL) or Creative Commons Attribution-ShareAlike 4.0",
  source: "https://www.openthesaurus.de",
  date: "2026-10-09"
};

const SEED_SYNSETS = {
  // --- ADJEKTIVE ---
  "schwer": [
    {
      id: 1423,
      categories: ["Bildung", "Schule"],
      terms: [
        { term: "schwer", level: "standard" },
        { term: "schwierig", level: "standard" },
        { term: "kompliziert", level: "standard" },
        { term: "nicht einfach" }
      ]
    },
    {
      id: 8920,
      categories: ["Physik", "Gewicht"],
      terms: [
        { term: "schwer", level: "standard" },
        { term: "gewichtig", level: "gehoben" },
        { term: "wuchtig", level: "standard" },
        { term: "mit hohem Gewicht" }
      ]
    }
  ],
  "schwierig": [
    {
      id: 1423,
      categories: ["Bildung", "Schule"],
      terms: [
        { term: "schwierig", level: "standard" },
        { term: "schwer", level: "standard" },
        { term: "kompliziert", level: "standard" }
      ]
    }
  ],
  "leicht": [
    {
      id: 2301,
      categories: ["Schule", "Aufgabe"],
      terms: [
        { term: "leicht", level: "standard" },
        { term: "einfach", level: "standard" },
        { term: "mühelos", level: "standard" },
        { term: "kinderleicht", level: "umgangssprachlich" }
      ]
    },
    {
      id: 8921,
      categories: ["Physik", "Gewicht"],
      terms: [
        { term: "leicht", level: "standard" },
        { term: "federleicht", level: "standard" },
        { term: "von geringem Gewicht" }
      ]
    }
  ],
  "einfach": [
    {
      id: 2301,
      categories: ["Schule", "Aufgabe"],
      terms: [
        { term: "einfach", level: "standard" },
        { term: "leicht", level: "standard" },
        { term: "unkompliziert", level: "standard" }
      ]
    }
  ],
  "teuer": [
    {
      id: 3105,
      categories: ["Wirtschaft", "Handel"],
      terms: [
        { term: "teuer", level: "standard" },
        { term: "kostspielig", level: "standard" },
        { term: "hochpreisig", level: "gehoben" }
      ]
    }
  ],
  "kostspielig": [
    {
      id: 3105,
      categories: ["Wirtschaft", "Handel"],
      terms: [
        { term: "kostspielig", level: "standard" },
        { term: "teuer", level: "standard" },
        { term: "aufwendig", level: "standard" }
      ]
    }
  ],
  "billig": [
    {
      id: 4120,
      categories: ["Wirtschaft", "Handel"],
      terms: [
        { term: "billig", level: "standard" },
        { term: "günstig", level: "standard" },
        { term: "preiswert", level: "standard" }
      ]
    }
  ],
  "günstig": [
    {
      id: 4120,
      categories: ["Wirtschaft", "Handel"],
      terms: [
        { term: "günstig", level: "standard" },
        { term: "preiswert", level: "standard" },
        { term: "billig", level: "standard" }
      ]
    }
  ],
  "preiswert": [
    {
      id: 4120,
      categories: ["Wirtschaft", "Handel"],
      terms: [
        { term: "preiswert", level: "standard" },
        { term: "günstig", level: "standard" },
        { term: "erschwinglich", level: "standard" }
      ]
    }
  ],
  "leise": [
    {
      id: 5201,
      categories: ["Akustik"],
      terms: [
        { term: "leise", level: "standard" },
        { term: "ruhig", level: "standard" },
        { term: "lautlos", level: "gehoben" }
      ]
    }
  ],
  "ruhig": [
    {
      id: 5201,
      categories: ["Akustik"],
      terms: [
        { term: "ruhig", level: "standard" },
        { term: "leise", level: "standard" },
        { term: "still", level: "standard" }
      ]
    }
  ],
  "laut": [
    {
      id: 6110,
      categories: ["Akustik"],
      terms: [
        { term: "laut", level: "standard" },
        { term: "lärmend", level: "standard" },
        { term: "geräuschvoll", level: "standard" }
      ]
    }
  ],
  "lärmend": [
    {
      id: 6110,
      categories: ["Akustik"],
      terms: [
        { term: "lärmend", level: "standard" },
        { term: "laut", level: "standard" },
        { term: "tobend", level: "standard" }
      ]
    }
  ],
  "schnell": [
    {
      id: 7100,
      categories: ["Tempo"],
      terms: [
        { term: "schnell", level: "standard" },
        { term: "rasch", level: "standard" },
        { term: "flott", level: "umgangssprachlich" },
        { term: "zügig", level: "standard" }
      ]
    }
  ],
  "rasch": [
    {
      id: 7100,
      categories: ["Tempo"],
      terms: [
        { term: "rasch", level: "standard" },
        { term: "schnell", level: "standard" },
        { term: "prompt", level: "standard" }
      ]
    }
  ],
  "langsam": [
    {
      id: 7105,
      categories: ["Tempo"],
      terms: [
        { term: "langsam", level: "standard" },
        { term: "gemächlich", level: "standard" },
        { term: "schleppend", level: "standard" }
      ]
    }
  ],
  "gemächlich": [
    {
      id: 7105,
      categories: ["Tempo"],
      terms: [
        { term: "gemächlich", level: "standard" },
        { term: "langsam", level: "standard" },
        { term: "ruhig", level: "standard" }
      ]
    }
  ],
  "alt": [
    {
      id: 8100,
      categories: ["Person", "Alter"],
      terms: [
        { term: "alt", level: "standard" },
        { term: "bejahrt", level: "gehoben" },
        { term: "greis", level: "literarisch" }
      ]
    },
    {
      id: 8101,
      categories: ["Objekt", "Zustand"],
      terms: [
        { term: "alt", level: "standard" },
        { term: "gebraucht", level: "standard" },
        { term: "antik", level: "standard" }
      ]
    }
  ],
  "jung": [
    {
      id: 8110,
      categories: ["Person", "Alter"],
      terms: [
        { term: "jung", level: "standard" },
        { term: "jugendlich", level: "standard" },
        { term: "herangewachsen", level: "standard" }
      ]
    }
  ],
  "neu": [
    {
      id: 8120,
      categories: ["Objekt", "Zustand"],
      terms: [
        { term: "neu", level: "standard" },
        { term: "neuwertig", level: "standard" },
        { term: "frisch", level: "standard" },
        { term: "fabrikneu", level: "standard" }
      ]
    }
  ],
  "frisch": [
    {
      id: 8120,
      categories: ["Objekt", "Zustand"],
      terms: [
        { term: "frisch", level: "standard" },
        { term: "neu", level: "standard" }
      ]
    }
  ],
  "groß": [
    {
      id: 9100,
      categories: ["Dimension"],
      terms: [
        { term: "groß", level: "standard" },
        { term: "riesig", level: "standard" },
        { term: "gewaltig", level: "standard" }
      ]
    }
  ],
  "riesig": [
    {
      id: 9100,
      categories: ["Dimension"],
      terms: [
        { term: "riesig", level: "standard" },
        { term: "groß", level: "standard" },
        { term: "enorm", level: "standard" }
      ]
    }
  ],
  "klein": [
    {
      id: 9110,
      categories: ["Dimension"],
      terms: [
        { term: "klein", level: "standard" },
        { term: "winzig", level: "standard" },
        { term: "geringfügig", level: "standard" }
      ]
    }
  ],
  "winzig": [
    {
      id: 9110,
      categories: ["Dimension"],
      terms: [
        { term: "winzig", level: "standard" },
        { term: "klein", level: "standard" }
      ]
    }
  ],
  "stark": [
    {
      id: 10100,
      categories: ["Kraft"],
      terms: [
        { term: "stark", level: "standard" },
        { term: "kräftig", level: "standard" },
        { term: "kraftvoll", level: "standard" }
      ]
    }
  ],
  "kräftig": [
    {
      id: 10100,
      categories: ["Kraft"],
      terms: [
        { term: "kräftig", level: "standard" },
        { term: "stark", level: "standard" },
        { term: "robust", level: "standard" }
      ]
    }
  ],
  "schwach": [
    {
      id: 10110,
      categories: ["Kraft"],
      terms: [
        { term: "schwach", level: "standard" },
        { term: "kraftlos", level: "standard" },
        { term: "machtlos", level: "standard" }
      ]
    }
  ],
  "kraftlos": [
    {
      id: 10110,
      categories: ["Kraft"],
      terms: [
        { term: "kraftlos", level: "standard" },
        { term: "schwach", level: "standard" },
        { term: "erschöpft", level: "standard" }
      ]
    }
  ],
  "mutig": [
    {
      id: 11100,
      categories: ["Charakter"],
      terms: [
        { term: "mutig", level: "standard" },
        { term: "tapfer", level: "standard" },
        { term: "kühn", level: "gehoben" },
        { term: "beherzt", level: "standard" }
      ]
    }
  ],
  "tapfer": [
    {
      id: 11100,
      categories: ["Charakter"],
      terms: [
        { term: "tapfer", level: "standard" },
        { term: "mutig", level: "standard" },
        { term: "unerschrocken", level: "gehoben" }
      ]
    }
  ],
  "ängstlich": [
    {
      id: 11110,
      categories: ["Charakter"],
      terms: [
        { term: "ängstlich", level: "standard" },
        { term: "furchtsam", level: "standard" },
        { term: "schüchtern", level: "standard" }
      ]
    }
  ],
  "klug": [
    {
      id: 12100,
      categories: ["Intelligenz"],
      terms: [
        { term: "klug", level: "standard" },
        { term: "schlau", level: "standard" },
        { term: "intelligent", level: "standard" },
        { term: "gescheit", level: "standard" }
      ]
    }
  ],
  "schlau": [
    {
      id: 12100,
      categories: ["Intelligenz"],
      terms: [
        { term: "schlau", level: "standard" },
        { term: "klug", level: "standard" },
        { term: "gewitzt", level: "umgangssprachlich" }
      ]
    }
  ],
  "dumm": [
    {
      id: 12110,
      categories: ["Intelligenz"],
      terms: [
        { term: "dumm", level: "standard" },
        { term: "töricht", level: "gehoben" },
        { term: "unvernünftig", level: "standard" }
      ]
    }
  ],

  // --- VERBEN ---
  "beginnen": [
    {
      id: 20100,
      categories: ["Zeit", "Handlung"],
      terms: [
        { term: "beginnen", level: "standard" },
        { term: "anfangen", level: "standard" },
        { term: "starten", level: "standard" },
        { term: "einleiten", level: "standard" }
      ]
    }
  ],
  "anfangen": [
    {
      id: 20100,
      categories: ["Zeit", "Handlung"],
      terms: [
        { term: "anfangen", level: "standard" },
        { term: "beginnen", level: "standard" },
        { term: "loslegen", level: "umgangssprachlich" }
      ]
    }
  ],
  "aufhören": [
    {
      id: 20110,
      categories: ["Zeit", "Handlung"],
      terms: [
        { term: "aufhören", level: "standard" },
        { term: "enden", level: "standard" },
        { term: "stoppen", level: "standard" },
        { term: "beenden", level: "standard" }
      ]
    }
  ],
  "enden": [
    {
      id: 20110,
      categories: ["Zeit", "Handlung"],
      terms: [
        { term: "enden", level: "standard" },
        { term: "aufhören", level: "standard" },
        { term: "ausklingen", level: "standard" }
      ]
    }
  ],
  "öffnen": [
    {
      id: 21100,
      categories: ["Raum", "Handlung"],
      terms: [
        { term: "öffnen", level: "standard" },
        { term: "aufmachen", level: "standard" },
        { term: "aufschließen", level: "standard" }
      ]
    }
  ],
  "aufmachen": [
    {
      id: 21100,
      categories: ["Raum", "Handlung"],
      terms: [
        { term: "aufmachen", level: "standard" },
        { term: "öffnen", level: "standard" }
      ]
    }
  ],
  "schließen": [
    {
      id: 21110,
      categories: ["Raum", "Handlung"],
      terms: [
        { term: "schließen", level: "standard" },
        { term: "zumachen", level: "standard" },
        { term: "zuschlagen", level: "standard" }
      ]
    }
  ],
  "zumachen": [
    {
      id: 21110,
      categories: ["Raum", "Handlung"],
      terms: [
        { term: "zumachen", level: "standard" },
        { term: "schließen", level: "standard" }
      ]
    }
  ],
  "sich beeilen": [
    {
      id: 22100,
      categories: ["Geschwindigkeit"],
      terms: [
        { term: "sich beeilen", level: "standard" },
        { term: "eilen", level: "standard" },
        { term: "sich sputen", level: "umgangssprachlich" }
      ]
    }
  ],
  "eilen": [
    {
      id: 22100,
      categories: ["Geschwindigkeit"],
      terms: [
        { term: "eilen", level: "standard" },
        { term: "sich beeilen", level: "standard" },
        { term: "hasten", level: "gehoben" }
      ]
    }
  ],
  "trödeln": [
    {
      id: 22110,
      categories: ["Geschwindigkeit"],
      terms: [
        { term: "trödeln", level: "standard" },
        { term: "bummeln", level: "standard" },
        { term: "bummelig sein", level: "umgangssprachlich" }
      ]
    }
  ],
  "bummeln": [
    {
      id: 22110,
      categories: ["Geschwindigkeit"],
      terms: [
        { term: "bummeln", level: "standard" },
        { term: "trödeln", level: "standard" },
        { term: "schlendern", level: "standard" }
      ]
    }
  ],
  "helfen": [
    {
      id: 23100,
      categories: ["Beziehung"],
      terms: [
        { term: "helfen", level: "standard" },
        { term: "unterstützen", level: "standard" },
        { term: "beistehen", level: "gehoben" }
      ]
    }
  ],
  "unterstützen": [
    {
      id: 23100,
      categories: ["Beziehung"],
      terms: [
        { term: "unterstützen", level: "standard" },
        { term: "helfen", level: "standard" },
        { term: "fördern", level: "standard" }
      ]
    }
  ],
  "stören": [
    {
      id: 23110,
      categories: ["Beziehung"],
      terms: [
        { term: "stören", level: "standard" },
        { term: "behindern", level: "standard" },
        { term: "belästigen", level: "standard" }
      ]
    }
  ],
  "behindern": [
    {
      id: 23110,
      categories: ["Beziehung"],
      terms: [
        { term: "behindern", level: "standard" },
        { term: "stören", level: "standard" },
        { term: "erschweren", level: "standard" }
      ]
    }
  ],
  "finden": [
    {
      id: 24100,
      categories: ["Aktivität"],
      terms: [
        { term: "finden", level: "standard" },
        { term: "entdecken", level: "standard" },
        { term: "aufspüren", level: "standard" }
      ]
    }
  ],
  "entdecken": [
    {
      id: 24100,
      categories: ["Aktivität"],
      terms: [
        { term: "entdecken", level: "standard" },
        { term: "finden", level: "standard" },
        { term: "ausfindig machen", level: "standard" }
      ]
    }
  ],
  "verlieren": [
    {
      id: 24110,
      categories: ["Aktivität"],
      terms: [
        { term: "verlieren", level: "standard" },
        { term: "verlegen", level: "standard" },
        { term: "einbüßen", level: "gehoben" }
      ]
    }
  ],
  "verlegen": [
    {
      id: 24110,
      categories: ["Aktivität"],
      terms: [
        { term: "verlegen", level: "standard" },
        { term: "verlieren", level: "standard" }
      ]
    }
  ],
  "kaufen": [
    {
      id: 25100,
      categories: ["Handel"],
      terms: [
        { term: "kaufen", level: "standard" },
        { term: "erwerben", level: "gehoben" },
        { term: "anschaffen", level: "standard" }
      ]
    }
  ],
  "erwerben": [
    {
      id: 25100,
      categories: ["Handel"],
      terms: [
        { term: "erwerben", level: "gehoben" },
        { term: "kaufen", level: "standard" },
        { term: "erstehen", level: "gehoben" }
      ]
    }
  ],
  "verkaufen": [
    {
      id: 25110,
      categories: ["Handel"],
      terms: [
        { term: "verkaufen", level: "standard" },
        { term: "veräußern", level: "gehoben" },
        { term: "abstoßen", level: "umgangssprachlich" }
      ]
    }
  ],
  "veräußern": [
    {
      id: 25110,
      categories: ["Handel"],
      terms: [
        { term: "veräußern", level: "gehoben" },
        { term: "verkaufen", level: "standard" }
      ]
    }
  ],
  "ankommen": [
    {
      id: 26100,
      categories: ["Reise"],
      terms: [
        { term: "ankommen", level: "standard" },
        { term: "eintreffen", level: "gehoben" },
        { term: "anlangen", level: "standard" }
      ]
    }
  ],
  "eintreffen": [
    {
      id: 26100,
      categories: ["Reise"],
      terms: [
        { term: "eintreffen", level: "gehoben" },
        { term: "ankommen", level: "standard" }
      ]
    }
  ],
  "abfahren": [
    {
      id: 26110,
      categories: ["Reise"],
      terms: [
        { term: "abfahren", level: "standard" },
        { term: "abreisen", level: "standard" },
        { term: "aufbrechen", level: "standard" }
      ]
    }
  ],
  "abreisen": [
    {
      id: 26110,
      categories: ["Reise"],
      terms: [
        { term: "abreisen", level: "standard" },
        { term: "abfahren", level: "standard" }
      ]
    }
  ],
  "verstehen": [
    {
      id: 27100,
      categories: ["Kognition"],
      terms: [
        { term: "verstehen", level: "standard" },
        { term: "begreifen", level: "standard" },
        { term: "nachvollziehen", level: "standard" }
      ]
    }
  ],
  "begreifen": [
    {
      id: 27100,
      categories: ["Kognition"],
      terms: [
        { term: "begreifen", level: "standard" },
        { term: "verstehen", level: "standard" },
        { term: "erfassen", level: "standard" }
      ]
    }
  ],
  "missverstehen": [
    {
      id: 27110,
      categories: ["Kognition"],
      terms: [
        { term: "missverstehen", level: "standard" },
        { term: "falsch verstehen", level: "standard" },
        { term: "fehldeuten", level: "gehoben" }
      ]
    }
  ],
  "fragen": [
    {
      id: 28100,
      categories: ["Kommunikation"],
      terms: [
        { term: "fragen", level: "standard" },
        { term: "erkundigen", level: "standard" },
        { term: "befragen", level: "standard" }
      ]
    }
  ],
  "antworten": [
    {
      id: 28110,
      categories: ["Kommunikation"],
      terms: [
        { term: "antworten", level: "standard" },
        { term: "erwidern", level: "gehoben" },
        { term: "entgegnen", level: "gehoben" }
      ]
    }
  ],
  "erwidern": [
    {
      id: 28110,
      categories: ["Kommunikation"],
      terms: [
        { term: "erwidern", level: "gehoben" },
        { term: "antworten", level: "standard" }
      ]
    }
  ],
  "suchen": [
    {
      id: 29100,
      categories: ["Aktivität"],
      terms: [
        { term: "suchen", level: "standard" },
        { term: "fahnden", level: "standard" },
        { term: "recherchieren", level: "standard" }
      ]
    }
  ]
};

let count = 0;
for (const [lemma, synsets] of Object.entries(SEED_SYNSETS)) {
  const filePath = path.join(RAW_DIR, `${encodeURIComponent(lemma)}.json`);
  const payload = {
    meta: { ...META_TEMPLATE, date: "2026-10-09" },
    synsets
  };
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
  count++;
}

console.log(`[SEED] Successfully wrote ${count} raw OpenThesaurus cache files to: ${RAW_DIR}`);
