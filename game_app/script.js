/* ------------------------------
   Mind Match: Sigma vs Stress
   Now with higher-contrast cards + real images (SVG data URIs).
   Frontend-only. No deps.
--------------------------------*/
document.addEventListener('DOMContentLoaded', () => {
            
    const GRID_EL = document.getElementById('grid');
    const MENU_EL = document.getElementById('menu');
    const GAME_EL = document.getElementById('game');

    const scoreEl = document.getElementById('score');
    const pairsLeftEl = document.getElementById('pairsLeft');
    const timeEl = document.getElementById('time');

    const startBtn = document.getElementById('startBtn');
    const homeBtn = document.getElementById('homeBtn');
    const restartBtn = document.getElementById('restartBtn');
    const playAgainBtn = document.getElementById('playAgainBtn');

    const resultModal = document.getElementById('resultModal');
    const summaryText = document.getElementById('summaryText');
    const learnedList = document.getElementById('learnedList');
    const bestScoreEl = document.getElementById('bestScore');

    const muteBtn = document.getElementById('muteBtn');
    const shareBtn = document.getElementById('shareBtn');

    const sfxFlip = document.getElementById('sfxFlip');
    const sfxMatch = document.getElementById('sfxMatch');
    const sfxWin = document.getElementById('sfxWin');

        // ---- WebAudio fallback (no external files needed) ----
    let audioCtx, masterGain, audioReady = false;
    function initAudioCtx(){
    if (audioReady) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AC();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.08; // overall volume
    masterGain.connect(audioCtx.destination);
    audioReady = true;
    }
    async function unlockAudioCtx(){
    try {
        initAudioCtx();
        // create & stop a silent osc to satisfy iOS gesture
        const osc = audioCtx.createOscillator(); osc.connect(masterGain);
        osc.frequency.value = 1; osc.start(); osc.stop(audioCtx.currentTime + 0.001);
    } catch {}
    }
    function beep(freq=880, dur=0.08, type='sine', gain=1){
    if (!audioReady || muted) return;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type; osc.frequency.value = freq;
    g.gain.value = 0; g.gain.setValueAtTime(0, audioCtx.currentTime);
    g.gain.linearRampToValueAtTime(0.6*gain, audioCtx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    osc.connect(g); g.connect(masterGain);
    osc.start(); osc.stop(audioCtx.currentTime + dur + 0.02);
    }
    // canned effects
    function fxFlip(){ beep(1200, 0.06, 'triangle'); }
    function fxMatch(){ beep(900, 0.07, 'square'); setTimeout(()=>beep(1200,0.07,'square'),70); }
    function fxWin(){
    const notes = [880, 1108, 1320, 1760]; // A, C#, E, A
    notes.forEach((f,i)=> setTimeout(()=>beep(f, 0.09, 'triangle', 1), i*90));
    }


    // ---- Audio helpers (plays safely on user gesture) ----
    function playSfx(el, vol = 0.6) {
        if (muted || !el) return;
        try {
        const clone = el.cloneNode(true);
        clone.volume = vol;
        clone.play().catch(()=>{});
        } catch {}
    }
    
    // On first Start click, try to "unlock" audio contexts (iOS/Safari)
    let audioUnlocked = false;
    async function unlockAudio() {
        if (audioUnlocked) return;
        try {
        // Attempt a silent play to satisfy gesture requirement
        sfxFlip.volume = 0.001;
        await sfxFlip.play();
        sfxFlip.pause();
        sfxFlip.currentTime = 0;
        } catch {}
        audioUnlocked = true;
    }
    

    let muted = true; // default off for marking environments
    let timer = null;
    let seconds = 0;

    let lockBoard = false;
    let flipped = [];
    let matchedCount = 0;
    let score = 0;
    let pairsLeft = 6;

    let startTime = null;

    // Stress ↔ Coping pairs (Gen Z vibe, but actually helpful)
    const PAIRS = [
    { id: 1, stress: "Exam Arc (No Riz)",           cope: "Hydration + 10-min walk speedrun", sEmoji:"😵‍💫", cEmoji:"💧" },
    { id: 2, stress: "Infinite Scroll Doom",        cope: "Social media detox 30m 📵",         sEmoji:"📱",   cEmoji:"🚫" },
    { id: 3, stress: "Sleep Schedule Cooked 💀",    cope: "Consistent lights-out + melatonin talk", sEmoji:"💀", cEmoji:"😴" },
    { id: 4, stress: "Skibidi Burnout",             cope: "Sunlight buff + 5 deep breaths ☀️", sEmoji:"🌀",   cEmoji:"☀️" },
    { id: 5, stress: "Overthinking .exe",           cope: "Journal 3 bullets + box-breathing", sEmoji:"🤯",   cEmoji:"📝" },
    { id: 6, stress: "Ghosted by Gym Bro 😔",       cope: "Hit a PR / 20-min movement 🏋️",     sEmoji:"😔",   cEmoji:"🏋️" },
    ];

    /* === Image helpers (no external files) ============================ */

    function makeBadgeSVG(emoji, bgTop, bgBot) {
    // Create a rounded square SVG with gradient bg + big emoji center
    const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
    <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${bgTop}"/>
        <stop offset="100%" stop-color="${bgBot}"/>
        </linearGradient>
        <filter id="inner" x="-50%" y="-50%" width="200%" height="200%">
        <feOffset dy="1" />
        <feGaussianBlur stdDeviation="2" result="b"/>
        <feComposite in="SourceGraphic" in2="b" operator="over"/>
        </filter>
    </defs>
    <rect x="16" y="16" width="480" height="480" rx="60" fill="url(#g)" stroke="rgba(255,255,255,0.35)" stroke-width="4"/>
    <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-size="240" filter="url(#inner)">
        ${emoji}
    </text>
    </svg>`;
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
    }

    function stressImg(emoji){
    // hot pink/red gradient
    return makeBadgeSVG(emoji, "#ff6b8b", "#8b1e3f");
    }
    function copeImg(emoji){
    // mint/teal gradient
    return makeBadgeSVG(emoji, "#7ff7c8", "#1e6d57");
    }

    /* === Deck build ==================================================== */

    function buildDeck() {
    const deck = [];
    for (const p of PAIRS) {
        deck.push({ id: p.id, type: 'stress', text: p.stress, img: stressImg(p.sEmoji) });
        deck.push({ id: p.id, type: 'cope',   text: p.cope,   img: copeImg(p.cEmoji)   });
    }
    return shuffle(deck);
    }

    // Fisher–Yates shuffle
    function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
    }

    /* === Render ======================================================== */

    function renderGrid(deck) {
        GRID_EL.innerHTML = '';
        deck.forEach((card, idx) => {
          // guard each card structure
          if (!card || !card.type || !card.text || !card.img) {
            console.warn('Bad card at index', idx, card);
            return;
          }
          const cell = document.createElement('button');
          cell.className = 'card3d';
          cell.setAttribute('role', 'gridcell');
          cell.setAttribute('aria-label', 'Card');
          cell.dataset.id = String(card.id);
          cell.dataset.type = card.type;
          cell.dataset.index = String(idx);
      
          cell.innerHTML = `
            <div class="inner">
              <div class="face front">
                <div class="card-img">
                  <img alt="card back pattern" src="${makeBadgeSVG('🃏','#19233d','#0e1427')}" />
                </div>
                <span class="label">Flip</span>
              </div>
              <div class="face back">
                <span class="badge ${card.type === 'stress' ? 'stress' : ''}">${card.type}</span>
                <div class="card-img">
                  <img alt="${escapeHTML(card.text)}" src="${card.img}" />
                </div>
                <span class="label">${escapeHTML(card.text)}</span>
              </div>
            </div>
          `;
          cell.addEventListener('click', () => flipCard(cell));
          GRID_EL.appendChild(cell);
        });
        // small log so we know grid is drawn
        console.log('Grid rendered with', deck.length, 'cards');
      }

    function escapeHTML(s){
    const p = document.createElement('p'); p.textContent = s; return p.innerHTML;
    }

    /* === Game logic ==================================================== */

    function flipCard(cardBtn) {
    if (lockBoard) return;
    if (cardBtn.classList.contains('flipped')) return;

    cardBtn.classList.add('flipped');
    initAudioCtx(); fxFlip();

    flipped.push(cardBtn);

    if (flipped.length === 2) {
        lockBoard = true;
        setTimeout(checkMatch, 260); // let flip anim show
    }
    }

    function checkMatch() {
        const [a, b] = flipped;
        if (!a || !b) { 
          console.warn('checkMatch called without two cards');
          flipped = [];
          lockBoard = false;
          return;
        }
      
        const sameId = a.dataset.id === b.dataset.id;
        const differentType = a.dataset.type !== b.dataset.type;
      
        if (sameId && differentType) {
          score++;
          matchedCount += 2;
          pairsLeft = (PAIRS.length*2 - matchedCount)/2;
          scoreEl.textContent = String(score);
          pairsLeftEl.textContent = String(pairsLeft);
      
          initAudioCtx(); fxMatch();
      
          a.style.pointerEvents = 'none';
          b.style.pointerEvents = 'none';
          flipped = [];
          lockBoard = false;
      
          if (matchedCount === PAIRS.length * 2) onWin();
        } else {
          setTimeout(() => {
            a.classList.remove('flipped');
            b.classList.remove('flipped');
            flipped = [];
            lockBoard = false;
          }, 650);
        }
      }
      

    function onWin() {
    clearInterval(timer);
    initAudioCtx(); fxWin();

    const learned = PAIRS.map(p => p.cope);
    const t = formatTime(seconds);
    const rizz = rizzRank(seconds);

    summaryText.innerHTML = `You matched all pairs in <b>${t}</b> with a score of <b>${score}</b>. Mental Rizz: <b>${rizz}</b> 🔥`;

    learnedList.innerHTML = '';
    learned.slice(0, 8).forEach(tip => {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.innerHTML = `✅ ${escapeHTML(tip)}`;
        learnedList.appendChild(chip);
    });

    const best = getAndUpdateBest(seconds);
    bestScoreEl.textContent = best ? `${formatTime(best)} (lower is better)` : '—';

    resultModal.showModal();
    }

    /* === Utils ========================================================= */

    function getAndUpdateBest(sec){
    try{
        const key = 'mindmatch_best_time';
        const prev = localStorage.getItem(key);
        if (!prev || sec < Number(prev)) {
        localStorage.setItem(key, String(sec));
        return sec;
        }
        return Number(prev);
    }catch{ return null; }
    }

    function formatTime(s){
    const m = Math.floor(s/60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2,'0')}`;
    }

    function rizzRank(s){
    if (s <= 45) return 'Giga Chad';
    if (s <= 75) return 'Sigma Ascendant';
    if (s <= 120) return 'Based & Focused';
    return 'Recovering NPC';
    }

    function startTimer(){
    seconds = 0;
    timeEl.textContent = '0:00';
    timer = setInterval(()=>{
        seconds++;
        timeEl.textContent = formatTime(seconds);
    },1000);
    }

    function resetState(){
    lockBoard = false;
    flipped = [];
    matchedCount = 0;
    score = 0;
    pairsLeft = PAIRS.length;

    scoreEl.textContent = '0';
    pairsLeftEl.textContent = String(pairsLeft);
    clearInterval(timer);
    seconds = 0; timeEl.textContent = '0:00';
    }

    function goMenu(){
    GAME_EL.classList.add('hidden');
    MENU_EL.classList.remove('hidden');
    clearInterval(timer);
    }

    function goGame(){
        if (!GRID_EL) { console.error('#grid not found'); return; }
        if (!GAME_EL || !MENU_EL) { console.error('screen containers missing'); return; }
      
        MENU_EL.classList.add('hidden');
        GAME_EL.classList.remove('hidden');
      
        resetState();
        const deck = buildDeck();
        if (!Array.isArray(deck) || deck.length === 0) {
          console.error('Deck failed to build');
          return;
        }
        renderGrid(deck);
        startTime = Date.now();
        startTimer();
      }

    /* ---------- Controls ---------- */
    startBtn?.addEventListener('click', async () => { await unlockAudioCtx(); goGame(); });

    homeBtn?.addEventListener('click', goMenu);
    restartBtn?.addEventListener('click', async () => { await unlockAudioCtx(); goGame(); });

    playAgainBtn?.addEventListener('click', () => {
    resultModal.close();
    goGame();
    });

    let shareAvailable = !!navigator.share;
    shareBtn?.addEventListener('click', async ()=>{
    const msg = `I just beat Mind Match: Sigma vs Stress in ${formatTime(seconds)} with Mental Rizz ${rizzRank(seconds)}. Touch grass speedrun complete.`;
    try{
        if (shareAvailable) {
        await navigator.share({ title:'Mind Match', text: msg, url: location.href });
        } else {
        await navigator.clipboard.writeText(msg);
        shareBtn.textContent = 'Copied!';
        setTimeout(()=> shareBtn.textContent = 'Share Score', 1200);
        }
    }catch{}
    });

    muteBtn?.addEventListener('click', ()=>{
    muted = !muted;
    muteBtn.textContent = muted ? '🔇 Sound: Off' : '🔊 Sound: On';
    });

    /* Keyboard flip accessibility */
    GRID_EL.addEventListener('keydown', (e)=>{
    const isAction = (e.key === 'Enter' || e.key === ' ');
    if (!isAction) return;
    const target = e.target;
    if (target && target.classList.contains('card3d')) {
        e.preventDefault();
        target.click();
    }
    });
});