# Setup (5 Minuten)

## 1. Ordner erstellen

```
Desktop/tombola/
├── index.html
├── config.js          ← Daten hier drin!
├── game.js
├── css/
├── js/
└── assets/
```

## 2. Assets einfügen

```
assets/
├── images/
│   ├── background.png (oder .jpg, .mp4, .webm)
│   ├── frame.png (oder .jpg, .mp4, .webm)
│   ├── animations/
│   │   ├── slot_1.png (oder .mp4, .gif, .webm)
│   │   ├── slot_2.png (oder .mp4, .gif, .webm)
│   │   └── slot_3.png (oder .mp4, .gif, .webm)
│   └── symbols/
│       ├── symbol_1.svg (oder .png, .jpg) → Normal Win
│       ├── symbol_2.svg (oder .png, .jpg) → Normal Win
│       └── symbol_3.svg (oder .png, .jpg) → JACKPOT! (auffälligstes Design)
├── sounds/
│   ├── spin.mp3
│   ├── win.mp3
│   ├── jackpot.mp3
│   └── lose.mp3
└── text/
    ├── idle.svg (oder .png, .jpg)
    ├── win.svg (oder .png, .jpg)
    ├── jackpot.svg (oder .png, .jpg)
    └── lose.svg (oder .png, .jpg)
```

## 3. Gewinn-Daten eintragen

**Wichtig:** Öffne `config.js` und ändere die Daten im `dailyWins` Array:

```javascript
dailyWins: [
    '2025-12-01',
    '2025-12-02',
    '2025-12-03',
    '2025-12-09',
    '2025-12-09',  // 2x am gleichen Tag = 2 Jackpots möglich
    '2025-12-10',
    // ... weitere Daten
]
```

**Tipps:**
- Ein Datum pro Zeile (Format: `YYYY-MM-DD`)
- Gleiches Datum mehrfach = mehrere Jackpots am Tag
- Komma nicht vergessen (ausser bei letztem Eintrag)

## Symbole verstehen

**Wichtig:** Die Symbole haben eine feste Bedeutung!

```
symbol_1.svg → Code '000' → 3x Symbol 1 = Normal Win
symbol_2.svg → Code '111' → 3x Symbol 2 = Normal Win  
symbol_3.svg → Code '222' → 3x Symbol 3 = JACKPOT!
```

**Design-Tipp:** `symbol_3.svg` sollte am auffälligsten/wertvollsten aussehen (z.B. goldener Stern, Diamant, etc.), da es das Jackpot-Symbol ist!

## 4. Starten

**Einfach Doppelklick** auf `index.html` → fertig!

Oder Terminal:
```bash
open index.html
```

## Einstellungen

### Gewinnchance ändern

In `config.js`:
```javascript
winChance: 4,  // 1 von 4 gewinnt (25%)
```

### Jackpot-Zeitfenster ändern

In `config.js` (Zeile ~107):
```javascript
const hour = 8 + Math.floor(Math.random() * 9); // 8-16 Uhr
```

### Auto-Reload-Zeit ändern

In `config.js`:
```javascript
inactivityReload: 300000  // 300000ms = 5 Minuten
```

## Vollbild

**Chrome:** F11  
**Safari:** CMD+CTRL+F

## Autostart (Optional)

**Systemeinstellungen** → Benutzer & Gruppen → Anmeldeobjekte → `index.html` hinzufügen

## Status prüfen

Browser-Console öffnen (CMD+Option+J):
```javascript
showDailyWinStatus()  // Zeigt alle Infos
```

## Reset (Neues Jahr)

Console:
```javascript
resetDailyWins()
```

Oder LocalStorage löschen:
- Chrome: Entwicklertools → Application → Local Storage → löschen

## Troubleshooting

**Symbole laden nicht?**  
→ Pfade in Browser-Console prüfen (CMD+Option+J)

**Videos spielen nicht?**  
→ MP4 mit H.264 Codec verwenden

**Bildschirm dimmt?**  
Terminal:
```bash
caffeinate -d
```

## Nächstes Jahr

1. `config.js` öffnen
2. Jahr ändern: `year: 2026`
3. Neue Daten im `dailyWins` Array eintragen
4. `resetDailyWins()` in Console aufrufen (löscht alte Gewinne)
5. Fertig!
