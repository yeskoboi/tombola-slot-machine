# Setup (5 Minuten)

## 1. Ordner erstellen

```
Desktop/tombola/
├── index.html
├── config.js
├── start.command      ← Doppelklick zum Starten
├── prizes.txt          ← Wichtig!
├── css/
├── js/
└── assets/
```
## 3. Assets einfügen

```
assets/
├── images/
│   ├── background.png (oder .mp4)
│   ├── frame.png (oder .mp4)
│   ├── animations/
│   │   ├── slot_1.png (oder .mp4)
│   │   ├── slot_2.png (oder .mp4)
│   │   └── slot_3.png (oder .mp4)
│   └── symbols/
│       ├── symbol_1.svg
│       ├── symbol_2.svg
│       └── symbol_3.svg
├── sounds/
│   ├── spin.mp3
│   ├── win.mp3
│   ├── jackpot.mp3
│   └── lose.mp3
└── text/
    ├── idle.svg
    ├── win.svg
    ├── jackpot.svg
    └── lose.svg
```

**Asset-Grössen**

Background: 3840 x 2160px (4K), oder Video 1920 x 1080px
Frame: 3400 x 1912px
Slot Animations: 600 x 600px
Symbole: 600 x 600px (dann als SVG exportieren)
Text: Beliebig (dann als SVG)

## 4. prizes.txt bearbeiten

Einfach Daten eintragen (eine Zeile pro Datum):

```
2025-12-01
2025-12-02
2025-12-03
2025-12-09
2025-12-09  ← 2x am gleichen Tag = 2 Jackpots
2025-12-10
```

## 5. Starten

**Empfohlen:** Doppelklick auf `start.command` → startet einen lokalen Server (Python 3) und öffnet `http://localhost:8000`. So bleibt der Jackpot-Speicher (localStorage) zuverlässig erhalten.

Fallback: Doppelklick auf `index.html`.

Test: Jackpot gewinnen, Seite neu laden → Jackpot-Zähler muss gesunken sein.

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

In `config.js` Zeile 115:
```javascript
const hour = 8 + Math.floor(Math.random() * 9); // 8-16 Uhr
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

**prizes.txt wird nicht geladen?**
→ Muss im gleichen Ordner wie index.html sein

**Bildschirm dimmt?**
Terminal:
```bash
caffeinate -d
```