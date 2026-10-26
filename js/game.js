/**
 * Tombola Slot Machine Game (Vanilla JS - Keine jQuery!)
 */

let timeoutId;
let isPlaying = false;
let slotMachine = null;

/**
 * Initialisierung beim Laden der Seite
 */
document.addEventListener("DOMContentLoaded", async function () {
    console.log('🎰 Tombola Game initialized (Vanilla JS Mode)');
    
    // Setze Layout-Modus
    const stage = document.getElementById('buzzerStage');
    if (stage && CONFIG.assets.layout.fullscreenFrame) {
        stage.classList.add('fullscreen');
        console.log('📺 Fullscreen frame mode enabled');
    }
    
    // Lade Assets dynamisch (async)
    await loadBackground();
    await loadFrame();
    await loadSlotAnimations();
    await loadSymbols();
    
    // Initialisiere Slot Machine
    slotMachine = new SlotMachine();
    
    // Viewport-Width für CSS Custom Properties
    updateViewportWidth();
    window.addEventListener("resize", handleResize);
    
    // Zeige Idle-Text mit Blink-Animation (statt Kassetten-Animation)
    showIdleText();
    
    // Warte bis Animation fertig ist, dann bereit zum Spielen
    window.setTimeout(clearRewind, 2500); // 800ms delay + 1200ms animation + 500ms buffer
});

/**
 * Versucht Asset mit verschiedenen Dateiendungen zu laden
 * Für Audio: Test ob Browser das Format abspielen kann
 */
async function tryLoadAsset(basePath, extensions = ['svg', 'png', 'jpg', 'jpeg']) {
    const basePathWithoutExt = basePath.replace(/\.[^.]+$/, '');
    const isAudio = extensions.some(ext => ['mp3', 'm4a', 'wav', 'ogg', 'webm'].includes(ext));
    
    // Versuche jede Dateiendung
    for (const ext of extensions) {
        const testPath = `${basePathWithoutExt}.${ext}`;
        
        try {
            if (isAudio) {
                // Für Audio: Teste mit Audio-Element ob Browser das Format unterstützt
                await new Promise((resolve, reject) => {
                    const audio = new Audio();
                    audio.oncanplaythrough = resolve;
                    audio.onerror = reject;
                    audio.src = testPath;
                    audio.load();
                });
                
                console.log(`✓ Found audio: ${testPath}`);
                return testPath;
            } else {
                // Für Bilder: Test mit Image-Object
                await new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = testPath;
                });
                
                console.log(`✓ Found asset: ${testPath}`);
                return testPath;
            }
        } catch (e) {
            // Datei existiert nicht oder Format nicht unterstützt, nächste probieren
            console.log(`✗ Not found/supported: ${testPath}`);
        }
    }
    
    // Fallback: originalen Pfad zurückgeben
    console.warn(`⚠ Using fallback path: ${basePath}`);
    return basePath;
}

/**
 * Lädt Background (Bild oder Video)
 */
async function loadBackground() {
    const container = document.getElementById('background');
    if (!container) return;
    
    const bgPath = CONFIG.assets.images.background;
    const isVideo = /\.(mp4|webm|ogg)$/i.test(bgPath);
    
    if (isVideo) {
        const video = document.createElement('video');
        video.src = bgPath;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        container.appendChild(video);
    } else {
        const finalPath = await tryLoadAsset(bgPath, ['png', 'jpg', 'jpeg', 'svg']);
        const img = document.createElement('img');
        img.src = finalPath;
        img.alt = 'Background';
        container.appendChild(img);
    }
}

/**
 * Lädt Frame (Bild oder Video)
 */
async function loadFrame() {
    const container = document.getElementById('frame');
    if (!container) return;
    
    const framePath = CONFIG.assets.images.frame;
    const isVideo = /\.(mp4|webm|ogg)$/i.test(framePath);
    
    if (isVideo) {
        const video = document.createElement('video');
        video.src = framePath;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        container.appendChild(video);
    } else {
        const finalPath = await tryLoadAsset(framePath, ['png', 'jpg', 'jpeg', 'svg']);
        container.classList.add('frame--image');
        container.style.backgroundImage = `url(${finalPath})`;
    }
}

/**
 * Lädt Slot-Animationen (Bilder oder Videos)
 */
async function loadSlotAnimations() {
    const anims = CONFIG.assets.images.slotAnimations;
    
    const animConfigs = [
        { num: 1, path: anims.slot1 },
        { num: 2, path: anims.slot2 },
        { num: 3, path: anims.slot3 }
    ];
    
    for (const { num, path } of animConfigs) {
        const container = document.getElementById(`slotAnim${num}`);
        if (!container || !path) continue;
        
        const isVideo = /\.(mp4|webm|ogg)$/i.test(path);
        
        if (isVideo) {
            const video = document.createElement('video');
            video.src = path;
            video.autoplay = true;
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            container.appendChild(video);
        } else {
            const finalPath = await tryLoadAsset(path, ['png', 'gif', 'jpg', 'jpeg', 'svg']);
            container.classList.add('animates--rotate');
            container.style.backgroundImage = `url(${finalPath})`;
        }
    }
}

/**
 * Lädt die Symbole dynamisch in die Slots
 */
async function loadSymbols() {
    const slots = document.querySelectorAll('.slot');
    
    // Lade alle Symbol-Pfade mit korrekten Endungen
    const symbolPaths = await Promise.all(
        CONFIG.assets.images.symbols.map(path => 
            tryLoadAsset(path, ['svg', 'png', 'jpg', 'jpeg'])
        )
    );
    
    slots.forEach((slot, slotIndex) => {
        slot.innerHTML = '';
        
        // Erstelle genug Symbole für Scroll-Effekt (mehrere Durchläufe)
        for (let i = 0; i < 20; i++) {
            symbolPaths.forEach(symbolPath => {
                const li = document.createElement('li');
                li.innerHTML = `<span class="slot-item"><img src="${symbolPath}" alt="Symbol"></span>`;
                slot.appendChild(li);
            });
        }
        
        // Setze initiale Position: Slot 1 = Symbol 0, Slot 2 = Symbol 1, Slot 3 = Symbol 2
        const itemHeight = slot.children[0].offsetHeight;
        const initialPosition = slotIndex * itemHeight; // 0, 1, 2 * itemHeight
        slot.style.transform = `translateY(-${initialPosition}px)`;
    });
}

/**
 * Slot Machine Klasse (Vanilla JS Implementierung)
 */
class SlotMachine {
    constructor() {
        this.slots = document.querySelectorAll('.slot');
        this.isSpinning = false;
    }
    
    /**
     * Startet die Slot-Animation
     */
    spin(callback) {
        if (this.isSpinning) return;
        this.isSpinning = true;
        
        this.callback = callback;
        
        // Animiere jeden Slot
        this.slots.forEach((slot, index) => {
            const delay = index * 100; // Gestaffelter Start
            setTimeout(() => {
                this.animateSlot(slot);
            }, delay);
        });
        
        // Rufe Callback nach Spin-Dauer auf
        setTimeout(() => {
            if (this.callback) this.callback();
        }, CONFIG.timing.spinDuration);
    }
    
    /**
     * Animiert einen einzelnen Slot
     */
    animateSlot(slot) {
        // Berechne Item-Höhe dynamisch aus aktueller Slot-Höhe
        const itemHeight = slot.children[0].offsetHeight;
        const symbolCount = CONFIG.assets.symbolCount;
        
        // Zufällige Startposition (0-2 Symbole nach unten)
        const randomStart = Math.floor(Math.random() * symbolCount) * itemHeight;
        
        // Scrolle durch mehrere Durchläufe (z.B. 10 volle Durchläufe)
        const fullCycles = 10;
        const scrollDistance = randomStart + (itemHeight * symbolCount * fullCycles);
        
        // Start-Position (zufällig)
        slot.style.transition = 'none';
        slot.style.transform = `translateY(-${randomStart}px)`;
        
        // Erzwinge Reflow
        slot.offsetHeight;
        
        // Animiere nach unten
        slot.style.transition = `transform ${CONFIG.timing.spinDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
        slot.style.transform = `translateY(-${scrollDistance}px)`;
    }
    
    /**
     * Stoppt die Slots auf bestimmten Symbolen
     */
    stop(winArray) {
        this.slots.forEach((slot, index) => {
            const targetSymbol = winArray[index]; // Schon 0-basiert!
            const itemHeight = slot.children[0].offsetHeight;
            const symbolCount = CONFIG.assets.symbolCount;
            
            // Berechne Position: 10 volle Zyklen + das Zielsymbol
            const fullCycles = 10;
            const targetPosition = (symbolCount * fullCycles + targetSymbol) * itemHeight;
            
            setTimeout(() => {
                slot.style.transition = 'transform 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                slot.style.transform = `translateY(-${targetPosition}px)`;
            }, index * 100);
        });
        
        setTimeout(() => {
            this.isSpinning = false;
        }, 1000);
    }
}

/**
 * Zeigt Idle-Text mit Blink-Animation beim Start
 */
async function showIdleText() {
    const label = document.getElementById('framelabel');
    if (!label) return;
    
    const idlePath = await tryLoadAsset(CONFIG.assets.text.idle, ['png', 'svg', 'jpg', 'jpeg']);
    label.style.backgroundImage = `url(${idlePath})`;
    
    // Langsame Scale-Animation mit Verzögerung
    setTimeout(() => {
        label.style.animation = 'idleBlink 1.2s ease-in-out';
        
        // Animation nach Ablauf entfernen
        setTimeout(() => {
            label.style.animation = '';
        }, 1200);
    }, 800); // Verzögerung vor Start der Animation
}

/**
 * Startet das Spiel nach der Rewind-Animation
 */
function clearRewind() {
    // Kein Rewind mehr nötig - nur Event Listener aktivieren
    document.addEventListener('keydown', function(event) {
        if (!isPlaying) {
            event.stopPropagation();
            startSlots();
        }
    }, false);
    
    console.log('✨ Ready to play - press any key');
}

/**
 * Startet die Slot Machine
 */
function startSlots() {
    if (isPlaying) return;
    
    console.log('🎲 Starting slots...');
    isPlaying = true;
    
    document.removeEventListener("keydown", resetTimer);
    
    // Blende Idle-Text aus
    const label = document.getElementById('framelabel');
    if (label) {
        label.style.opacity = '0';
        label.style.transition = 'opacity 0.3s ease';
        // Stelle sicher, dass Transform erhalten bleibt
        label.style.transform = 'translateX(-50%)';
    }
    
    const animations = document.getElementById('slotAnimations');
    if (animations) {
        animations.classList.add('playing');
    }
    
    // Videos schneller abspielen
    document.querySelectorAll('.slot-animation video').forEach(video => {
        video.playbackRate = 2.0;
    });
    
    const fancySlots = document.getElementById('fancySlots');
    if (fancySlots) {
        fancySlots.classList.add('running');
    }
    
    setTimeout(() => playSound(CONFIG.assets.sounds.spin), 700);
    
    // Starte Slot Machine
    setTimeout(() => {
        slotMachine.spin(() => {
            stopSlotMachine();
        });
    }, 1000);
    
    setupTimers();
}

/**
 * Stoppt die Slot Machine und zeigt Ergebnis
 */
function stopSlotMachine() {
    // Generiere Ergebnis lokal
    const result = generateGameResult();
    
    console.log('🎯 Result:', result);
    
    // Stoppe Slots mit dem Code
    const winArray = getSlotWinArray(result.code);
    slotMachine.stop(winArray);
    
    // Zeige entsprechendes Ergebnis nach kurzer Verzögerung
    setTimeout(() => {
        switch(result.type) {
            case 'jackpot':
                handleJackpot();
                break;
            case 'win':
                handleWin();
                break;
            default:
                handleLose();
        }
    }, 1200);
}

/**
 * Konvertiert Slot-Code zu Array für Slots
 */
function getSlotWinArray(codeString) {
    const code = parseInt(codeString);
    let digits;
    
    if (code > 99) {
        digits = codeString.split('');
    } else if (code > 9) {
        digits = ("0" + codeString).split('');
    } else {
        digits = ("00" + codeString).split('');
    }
    
    // Direkte Indices ohne +1, da Symbole 0-basiert sind
    return [
        parseInt(digits[0]),
        parseInt(digits[1]),
        parseInt(digits[2])
    ];
}

/**
 * Behandelt Jackpot-Gewinn
 */
async function handleJackpot() {
    clearListeners();
    
    const label = document.getElementById('framelabel');
    
    if (label) {
        const jackpotPath = await tryLoadAsset(CONFIG.assets.text.jackpot, ['png', 'svg', 'jpg', 'jpeg']);
        label.style.backgroundImage = `url(${jackpotPath})`;
        label.style.opacity = '1';
        label.style.transition = 'opacity 0.5s ease';
        label.style.transform = 'translateX(-50%)';  // Stelle sicher, dass Transform erhalten bleibt
        
        // Pulse-Animation für Jackpot-Text
        label.classList.add('pulse');
    }
    
    doSlotWiggle();
    
    setTimeout(() => playSound(CONFIG.assets.sounds.jackpot), 700);
    setTimeout(doInactive, CONFIG.timing.resultDisplayJackpot);
    
    console.log('🎉 JACKPOT!!!');
}

/**
 * Behandelt normalen Gewinn
 */
async function handleWin() {
    clearListeners();
    
    const label = document.getElementById('framelabel');
    
    // Kein Frame-Wiggle mehr!
    if (label) {
        const winPath = await tryLoadAsset(CONFIG.assets.text.win, ['png', 'svg', 'jpg', 'jpeg']);
        label.style.backgroundImage = `url(${winPath})`;
        label.style.opacity = '1';
        label.style.transition = 'opacity 0.5s ease';
        label.style.transform = 'translateX(-50%)';  // Stelle sicher, dass Transform erhalten bleibt
    }
    
    doSlotWiggle();
    
    setTimeout(() => playSound(CONFIG.assets.sounds.win), 700);
    setTimeout(doInactive, CONFIG.timing.resultDisplayWin);
    
    console.log('✨ Winner!');
}

/**
 * Behandelt Verlust
 */
async function handleLose() {
    clearListeners();
    
    const label = document.getElementById('framelabel');
    if (label) {
        const losePath = await tryLoadAsset(CONFIG.assets.text.lose, ['png', 'svg', 'jpg', 'jpeg']);
        label.style.backgroundImage = `url(${losePath})`;
        label.style.opacity = '1';
        label.style.transition = 'opacity 0.5s ease';
        label.style.transform = 'translateX(-50%)';  // Stelle sicher, dass Transform erhalten bleibt
    }
    
    // KEINE Wiggle-Animation bei Lose!
    
    setTimeout(() => playSound(CONFIG.assets.sounds.lose), 700);
    setTimeout(doInactive, CONFIG.timing.resultDisplayLose);
    
    document.addEventListener("mousedown", doInactive);
    document.addEventListener("keypress", doInactive);
    
    console.log('💔 Try again!');
}

/**
 * Wiggle-Animation für Slot-Symbole
 */
function doSlotWiggle() {
    document.querySelectorAll('.slot-item').forEach(elem => {
        elem.classList.add('wiggle');
    });
}

/**
 * Spielt einen Sound ab
 */
async function playSound(soundPath) {
    if (typeof Howl === 'undefined') {
        console.warn('Howler.js nicht geladen');
        return;
    }
    
    // Versuche verschiedene Audio-Formate zu finden
    const finalPath = await tryLoadAsset(soundPath, ['mp3', 'm4a', 'wav', 'ogg', 'webm']);
    
    const sound = new Howl({
        src: [finalPath],
        html5: true,
        volume: 1.0,
        onload: function() {
            sound.play();
        },
        onloaderror: function(id, error) {
            console.error('Error loading sound:', error);
        }
    });
    
    sound.on('play', function() {
        const fadeoutTime = 2000;
        setTimeout(function() {
            sound.fade(1, 0, fadeoutTime);
        }, (sound.duration() - sound.seek()) * 1000 - fadeoutTime);
    });
}

/**
 * Timer Management
 */
function setupTimers() {
    document.addEventListener("mousemove", resetTimer, false);
    document.addEventListener("mousedown", resetTimer, false);
    document.addEventListener("keypress", resetTimer, false);
    document.addEventListener("keydown", resetTimer, false);
    document.addEventListener("touchmove", resetTimer, false);
    startTimer();
}

function startTimer() {
    timeoutId = window.setTimeout(doInactive, CONFIG.timing.inactivityReload);
}

function resetTimer() {
    window.clearTimeout(timeoutId);
    startTimer();
}

function clearListeners() {
    document.removeEventListener("mousemove", resetTimer);
    document.removeEventListener("mousedown", resetTimer);
    document.removeEventListener("keypress", resetTimer);
    document.removeEventListener("keydown", resetTimer);
    document.removeEventListener("touchmove", resetTimer);
}

function doInactive() {
    location.reload();
}

/**
 * Viewport Width Management
 */
function updateViewportWidth() {
    const vw = document.documentElement.clientWidth;
    document.documentElement.style.setProperty("--vw", `${vw}px`);
}

function handleResize() {
    setTimeout(() => {
        updateViewportWidth();
        location.reload();
    }, 500);
}