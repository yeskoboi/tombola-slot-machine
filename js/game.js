/**
 * Tombola Slot Machine Game (Vanilla JS - Keine jQuery!)
 */

let timeoutId;
let isPlaying = false;
let slotMachine = null;

/**
 * Initialisierung beim Laden der Seite
 */
document.addEventListener("DOMContentLoaded", function () {
    console.log('🎰 Tombola Game initialized (Vanilla JS Mode)');
    
    // Lade Assets dynamisch
    loadBackground();
    loadFrame();
    loadSlotAnimations();
    loadSymbols();
    
    // Initialisiere Slot Machine
    slotMachine = new SlotMachine();
    
    // Viewport-Width für CSS Custom Properties
    updateViewportWidth();
    window.addEventListener("resize", handleResize);
    
    // Rewind-Animation starten
    window.setTimeout(clearRewind, CONFIG.timing.rewindDuration);
});

/**
 * Lädt Background (Bild oder Video)
 */
function loadBackground() {
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
        const img = document.createElement('img');
        img.src = bgPath;
        img.alt = 'Background';
        container.appendChild(img);
    }
}

/**
 * Lädt Frame (Bild oder Video)
 */
function loadFrame() {
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
        container.classList.add('frame--image');
        container.style.backgroundImage = `url(${framePath})`;
    }
}

/**
 * Lädt Slot-Animationen (Bilder oder Videos)
 */
function loadSlotAnimations() {
    const anims = CONFIG.assets.images.slotAnimations;
    
    [
        { num: 1, path: anims.slot1 },
        { num: 2, path: anims.slot2 },
        { num: 3, path: anims.slot3 }
    ].forEach(({ num, path }) => {
        const container = document.getElementById(`slotAnim${num}`);
        if (!container || !path) return;
        
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
            container.classList.add('animates--rotate');
            container.style.backgroundImage = `url(${path})`;
        }
    });
}

/**
 * Lädt die Symbole dynamisch in die Slots
 */
function loadSymbols() {
    const slots = document.querySelectorAll('.slot');
    
    slots.forEach(slot => {
        slot.innerHTML = '';
        
        // Erstelle genug Symbole für Scroll-Effekt (mehrere Durchläufe)
        for (let i = 0; i < 20; i++) {
            CONFIG.assets.images.symbols.forEach(symbolPath => {
                const li = document.createElement('li');
                li.innerHTML = `<span class="slot-item"><img src="${symbolPath}" alt="Symbol"></span>`;
                slot.appendChild(li);
            });
        }
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
        
        // Animiere jeden Slot
        this.slots.forEach((slot, index) => {
            const delay = index * 100; // Gestaffelter Start
            setTimeout(() => {
                this.animateSlot(slot);
            }, delay);
        });
        
        // Callback nach Spin-Dauer
        setTimeout(() => {
            if (callback) callback();
        }, CONFIG.timing.spinDuration);
    }
    
    /**
     * Animiert einen einzelnen Slot
     */
    animateSlot(slot) {
        // Berechne Item-Höhe dynamisch aus aktueller Slot-Höhe
        const itemHeight = slot.children[0].offsetHeight;
        const totalItems = slot.children.length;
        const scrollDistance = itemHeight * totalItems * 0.8;
        
        // Start-Position
        slot.style.transition = 'none';
        slot.style.transform = 'translateY(0)';
        
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
            const targetSymbol = winArray[index] - 1; // 0-basiert
            // Berechne Item-Höhe dynamisch
            const itemHeight = slot.children[0].offsetHeight;
            
            // Berechne exakte Position für das Zielsymbol
            const targetPosition = targetSymbol * itemHeight;
            
            setTimeout(() => {
                slot.style.transition = 'transform 500ms ease-out';
                slot.style.transform = `translateY(-${targetPosition}px)`;
            }, index * 100);
        });
        
        setTimeout(() => {
            this.isSpinning = false;
        }, 1000);
    }
}

/**
 * Startet das Spiel nach der Rewind-Animation
 */
function clearRewind() {
    const animations = document.getElementById('slotAnimations');
    const stage = document.getElementById('buzzerStage');
    
    if (animations) animations.classList.remove('rewind');
    if (stage) stage.classList.remove('rewind');
    
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
    
    return [
        parseInt(digits[0]) + 1,
        parseInt(digits[1]) + 1,
        parseInt(digits[2]) + 1
    ];
}

/**
 * Behandelt Jackpot-Gewinn
 */
function handleJackpot() {
    clearListeners();
    
    const stage = document.getElementById('buzzerStage');
    const label = document.getElementById('framelabel');
    
    if (stage) stage.classList.add('wiggle');
    if (label) {
        label.style.backgroundImage = `url(${CONFIG.assets.text.jackpot})`;
    }
    
    doSlotWiggle();
    
    setTimeout(() => playSound(CONFIG.assets.sounds.jackpot), 700);
    setTimeout(doInactive, CONFIG.timing.resultDisplayJackpot);
    
    console.log('🎉 JACKPOT!!!');
}

/**
 * Behandelt normalen Gewinn
 */
function handleWin() {
    clearListeners();
    
    const stage = document.getElementById('buzzerStage');
    const label = document.getElementById('framelabel');
    
    if (stage) stage.classList.add('wiggle');
    if (label) {
        label.style.backgroundImage = `url(${CONFIG.assets.text.win})`;
    }
    
    doSlotWiggle();
    
    setTimeout(() => playSound(CONFIG.assets.sounds.win), 700);
    setTimeout(doInactive, CONFIG.timing.resultDisplayWin);
    
    console.log('✨ Winner!');
}

/**
 * Behandelt Verlust
 */
function handleLose() {
    clearListeners();
    
    const label = document.getElementById('framelabel');
    if (label) {
        label.style.backgroundImage = `url(${CONFIG.assets.text.lose})`;
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
function playSound(soundPath) {
    if (typeof Howl === 'undefined') {
        console.warn('Howler.js nicht geladen');
        return;
    }
    
    const sound = new Howl({
        src: [soundPath],
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
