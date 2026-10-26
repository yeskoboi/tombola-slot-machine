/**
 * Tombola Konfiguration (Lokal)
 * Keine Datenbank, keine Statistiken - einfach spielen!
 */

const CONFIG = {
    // Jahr (nur für Anzeige)
    year: 2025,
    
    // Spiel-Einstellungen
    game: {
        // Gewinnchance: 1 von X gewinnt (z.B. 4 = 25% Gewinnchance)
        winChance: 4,
        
        // WICHTIG: Codes bestimmen welche Symbole angezeigt werden!
        // Code '222' = 3x Symbol Nr. 3 (symbol_3.svg) = JACKPOT-SYMBOL
        // Code '111' = 3x Symbol Nr. 2 (symbol_2.svg) = Win-Symbol
        // Code '000' = 3x Symbol Nr. 1 (symbol_1.svg) = Win-Symbol
        
        // Slot-Code für Tagesgewinn (Jackpot)
        jackpotCode: '222',  // → zeigt 3x symbol_3.svg
        
        // Slot-Codes für normale Gewinne (drei gleiche)
        winCodes: ['000', '111'],  // → zeigt 3x symbol_1.svg oder 3x symbol_2.svg
        
        // Slot-Codes für Nieten (keine drei gleichen)
        loseCodes: ['012', '021', '102', '120', '201', '210'],
        
        // Tagesgewinne (einfach Daten hier eintragen!)
        dailyWins: [
            '2025-12-01',
            '2025-12-02',
            '2025-12-03',
            '2025-12-04',
            '2025-12-05',
            '2025-12-08',
            '2025-12-09',
            '2025-12-09',
            '2025-12-10',
            '2025-12-11',
            '2025-12-11',
            '2025-12-12',
            '2025-12-15',
            '2025-12-16',
            '2025-12-16',
            '2025-12-17',
            '2025-12-18',
            '2025-12-18',
            '2025-12-19',
            '2025-12-22',
            '2025-12-22',
            '2025-12-23',
            '2025-12-23',
            '2025-12-24'
        ]
    },
    
    // Assets
    assets: {
        // Anzahl Symbole
        symbolCount: 3,
        
        // Layout-Optionen
        layout: {
            fullscreenFrame: true  // true = Frame bildfüllend wie Background, false = Frame kleiner zentriert
        },
        
        // Sounds
        sounds: {
            spin: 'assets/sounds/spin.mp3',
            win: 'assets/sounds/win.mp3',
            jackpot: 'assets/sounds/jackpot.mp3',
            lose: 'assets/sounds/lose.mp3'
        },
        
        // Bilder/Videos (System erkennt Format automatisch)
        images: {
            background: 'assets/images/background.png',  // .png, .jpg, .mp4, .webm möglich
            frame: 'assets/images/frame.png',
            
            // Slot-Animationen (.png, .mp4, .gif, .webm möglich)
            slotAnimations: {
                slot1: 'assets/images/animations/slot_1.png',
                slot2: 'assets/images/animations/slot_2.png',
                slot3: 'assets/images/animations/slot_3.png'
            },
            
            // Symbole (.svg, .png, .jpg möglich)
            // WICHTIG: Reihenfolge bestimmt Codes!
            // symbol_1.svg = Code 0 = Normal Win
            // symbol_2.svg = Code 1 = Normal Win
            // symbol_3.svg = Code 2 = JACKPOT (muss am auffälligsten sein!)
            symbols: [
                'assets/images/symbols/symbol_1.svg',  // Index 0
                'assets/images/symbols/symbol_2.svg',  // Index 1
                'assets/images/symbols/symbol_3.svg'   // Index 2 = JACKPOT!
            ]
        },
        
        // Text-Grafiken (.svg, .png, .jpg möglich)
        text: {
            idle: 'assets/text/idle.svg',
            win: 'assets/text/win.svg',
            jackpot: 'assets/text/jackpot.svg',
            lose: 'assets/text/lose.svg'
        }
    },
    
    // Timeouts
    timing: {
        rewindDuration: 3000,       // ms bis Spiel bereit
        spinDuration: 4000,         // ms bis Ergebnis
        resultDisplayWin: 8000,     // ms Gewinn-Anzeige
        resultDisplayJackpot: 30000,// ms Jackpot-Anzeige
        resultDisplayLose: 9500,    // ms Niete-Anzeige
        inactivityReload: 300000    // ms bis Auto-Reload (5 Minuten)
    }
};

// LocalStorage Keys
const STORAGE_KEY_WON_DATES = 'tombola_won_dates';
const STORAGE_KEY_JACKPOT_TIMES = 'tombola_jackpot_times';

/**
 * Generiert zufälligen Jackpot-Zeitpunkt für heute (8-17 Uhr)
 */
function generateJackpotTime() {
    const today = new Date();
    const hour = 8 + Math.floor(Math.random() * 9); // 8-16 Uhr
    const minute = Math.floor(Math.random() * 60);
    const second = Math.floor(Math.random() * 60);
    
    today.setHours(hour, minute, second, 0);
    return today.getTime(); // Timestamp
}

/**
 * Indizes aller Tagesgewinne von heute (gewonnene und offene)
 */
function getTodayIndices() {
    const today = new Date().toISOString().split('T')[0];
    const indices = [];
    CONFIG.game.dailyWins.forEach((date, index) => {
        if (date === today) indices.push(index);
    });
    return indices;
}

/**
 * Lädt oder generiert die Jackpot-Zeitpunkte für heute.
 * times[k] gehört zu getTodayIndices()[k] und bleibt den ganzen Tag stabil,
 * auch nachdem ein Jackpot gewonnen wurde.
 */
function getJackpotTimes() {
    const today = new Date().toISOString().split('T')[0];
    const count = getTodayIndices().length;
    
    if (count === 0) {
        return []; // Keine Gewinne für heute
    }
    
    const stored = localStorage.getItem(STORAGE_KEY_JACKPOT_TIMES);
    
    if (stored) {
        try {
            const data = JSON.parse(stored);
            if (data.date === today && data.times.length === count) {
                return data.times;
            }
        } catch (e) {
            console.warn('Could not load jackpot times');
        }
    }
    
    // Neuer Tag oder Anzahl geändert → neue Zeitpunkte generieren
    const times = [];
    for (let i = 0; i < count; i++) {
        times.push(generateJackpotTime());
    }
    times.sort((a, b) => a - b);
    
    localStorage.setItem(STORAGE_KEY_JACKPOT_TIMES, JSON.stringify({
        date: today,
        times: times
    }));
    
    console.log(`[JACKPOT] Jackpot-Zeiten heute (${times.length}x):`);
    times.forEach((time, i) => {
        const timeStr = new Date(time).toLocaleTimeString('de-CH', {
            hour: '2-digit',
            minute: '2-digit'
        });
        console.log(`   ${i + 1}. Jackpot: ${timeStr}`);
    });
    
    return times;
}

/**
 * Lädt gewonnene Tagesgewinne aus LocalStorage
 * Format: ['2025-12-01_0', '2025-12-01_1'] (mit Index für mehrfache Gewinne am gleichen Tag)
 */
function loadWonDates() {
    const stored = localStorage.getItem(STORAGE_KEY_WON_DATES);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.warn('Could not load won dates from storage');
            return [];
        }
    }
    return [];
}

/**
 * Speichert gewonnenes Datum mit Index in LocalStorage
 */
function saveWonDate(dateWithIndex) {
    const wonDates = loadWonDates();
    if (!wonDates.includes(dateWithIndex)) {
        wonDates.push(dateWithIndex);
        localStorage.setItem(STORAGE_KEY_WON_DATES, JSON.stringify(wonDates));
    }
}

/**
 * Prüft ob JETZT ein Jackpot fällig ist
 * Unterstützt mehrere Jackpots pro Tag!
 */
function checkDailyWin() {
    const now = Date.now();
    const wonDates = loadWonDates();
    const indices = getTodayIndices();
    const jackpotTimes = getJackpotTimes();
    
    for (let k = 0; k < indices.length; k++) {
        const index = indices[k];
        const key = `${CONFIG.game.dailyWins[index]}_${index}`;
        if (wonDates.includes(key)) continue;
        
        if (now >= jackpotTimes[k]) {
            saveWonDate(key);
            console.log(`[JACKPOT] Jackpot ${k + 1}/${indices.length} gewonnen!`);
            updateJackpotCounter();
            return true;
        }
    }
    
    return false;
}

/**
 * Generiert Spielergebnis
 */
function generateGameResult() {
    // Prüfe Tagesgewinn
    const isDailyWin = checkDailyWin();
    
    if (isDailyWin) {
        return {
            code: CONFIG.game.jackpotCode,
            type: 'jackpot'
        };
    }
    
    // Normale Gewinnchance
    const random = Math.floor(Math.random() * CONFIG.game.winChance) + 1;
    
    if (random === 1) {
        // Gewonnen!
        const winCode = CONFIG.game.winCodes[Math.floor(Math.random() * CONFIG.game.winCodes.length)];
        return {
            code: winCode,
            type: 'win'
        };
    } else {
        // Niete
        const loseCode = CONFIG.game.loseCodes[Math.floor(Math.random() * CONFIG.game.loseCodes.length)];
        return {
            code: loseCode,
            type: 'lose'
        };
    }
}

/**
 * Zeigt Status im Console (für Debugging)
 */
function showDailyWinStatus() {
    const wonDates = loadWonDates();
    const today = new Date().toISOString().split('T')[0];
    const jackpotTimes = getJackpotTimes();
    const now = Date.now();
    
    console.log('=== Tagesgewinn Status ===');
    console.log('Heute:', today);
    
    if (jackpotTimes.length > 0) {
        console.log(`[JACKPOT] Jackpot-Zeiten heute (${jackpotTimes.length}x):`);
        jackpotTimes.forEach((time, i) => {
            const timeStr = new Date(time).toLocaleTimeString('de-CH', {
                hour: '2-digit',
                minute: '2-digit'
            });
            const isPast = now >= time;
            console.log(`   ${i + 1}. ${timeStr} ${isPast ? '[VORBEI]' : '[KOMMT NOCH]'}`);
        });
    } else {
        console.log('[INFO] Keine Jackpots fuer heute');
    }
    
    console.log('Gewonnen:', wonDates.length, 'von', CONFIG.game.dailyWins.length);
    console.log('Noch verfuegbar:', CONFIG.game.dailyWins.length - wonDates.length);
}

/**
 * Aktualisiert den Jackpot Counter im Browser
 */
function updateJackpotCounter() {
    const today = new Date().toISOString().split('T')[0];
    const wonDates = loadWonDates();
    
    // Zähle verfügbare Jackpots für heute
    let availableToday = 0;
    CONFIG.game.dailyWins.forEach((date, index) => {
        if (date === today && !wonDates.includes(`${date}_${index}`)) {
            availableToday++;
        }
    });
    
    // Update UI mit natürlicherem Text
    const counterElement = document.getElementById('jackpotCounter');
    if (counterElement) {
        let text = '';
        if (availableToday === 0) {
            text = 'Heute keine Jackpots mehr 🤷';
        } else if (availableToday === 1) {
            text = 'Noch 1 Jackpot zu gewinnen! 🚨';
        } else {
            text = `Heute noch ${availableToday} Jackpots! 🤯`;
        }
        counterElement.textContent = text;
    }
    
    return availableToday;
}

/**
 * Reset für neue Saison (optional, manuell aufrufen)
 */
function resetDailyWins() {
    localStorage.removeItem(STORAGE_KEY_WON_DATES);
    localStorage.removeItem(STORAGE_KEY_JACKPOT_TIMES);
    console.log('[RESET] All daily wins reset!');
    showDailyWinStatus();
}

// Initialisierung beim Start
(function init() {
    console.log(`[CONFIG] ${CONFIG.game.dailyWins.length} Tagesgewinne konfiguriert`);
    showDailyWinStatus();
    
    // Update Counter wenn DOM bereit ist
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateJackpotCounter);
    } else {
        updateJackpotCounter();
    }
})();