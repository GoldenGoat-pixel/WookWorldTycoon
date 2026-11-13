import * as THREE from 'three';
import { CameraController } from './game/camera.js';
import { World } from './game/world.js';
import { Economy } from './game/economy.js';
import { AttendeeManager } from './game/attendees.js';
import { DayNightCycle } from './game/daynight.js';
import { FestivalManager } from './game/festival.js';
import { ObjectiveManager, OBJECTIVES } from './game/objectives.js';
import { getBuildingById, CATEGORIES } from './game/buildings.js';
import { saveGame, loadGame, listSlots, deleteSave } from './game/save.js';
import { SoundSystem } from './audio/sounds.js';
import { BuildMenu } from './ui/buildMenu.js';
import { Toolbar } from './ui/toolbar.js';
import { InfoPanel } from './ui/infoPanel.js';
import { Tutorial } from './ui/tutorial.js';
import { getUpgradeById } from './game/upgrades.js';
import { StaffManager } from './game/staff.js';
import { SecurityGuardManager } from './game/security.js';
import { ServiceWorkerManager } from './game/services.js';
import { EventManager } from './game/events.js';
import { getAdjacencyBonuses } from './game/adjacency.js';
import { EffectsManager } from './game/effects.js';
import { getNextTier, getTierById, getSeasonCostScale } from './game/tiers.js';

// --- Renderer ---
const canvas = document.getElementById('game-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.setClearColor(0x87ceeb);

// --- Scene ---
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x87ceeb, 80, 200);

// --- Lights ---
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xfff4e0, 1.0);
sun.position.set(15, 25, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -70;
sun.shadow.camera.right = 70;
sun.shadow.camera.top = 70;
sun.shadow.camera.bottom = -70;
scene.add(sun);

// --- Camera ---
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.5, 500);
const camCtrl = new CameraController(camera, canvas);

// --- Core systems ---
const world = new World(scene);
const economy = new Economy();
const crowd = new AttendeeManager(scene, world, economy);
const dayNight = new DayNightCycle(scene, sun);
const sounds = new SoundSystem();
const infoPanel = new InfoPanel();
infoPanel.onUpgrade = (entry, upgradeId) => {
  const upg = getUpgradeById(upgradeId);
  if (!upg) return;
  if (economy.money < upg.cost) {
    showToast('Not enough money!');
    return;
  }
  if (world.addUpgrade(entry, upg)) {
    economy.spend(upg.cost);
    sounds.playPlace();
    showToast(`${upg.icon} ${upg.name} installed!`);
    infoPanel.show(entry);
  }
};
infoPanel.onTierUpgrade = (entry) => {
  const next = getNextTier(entry.data.id, entry.tier || 1);
  if (!next) return;
  const cost = Math.floor(next.cost * getSeasonCostScale(festival.season));
  if (economy.money < cost) {
    showToast('Not enough money!');
    return;
  }
  economy.spend(cost);
  world.applyTier(entry, next);
  sounds.playPlace();
  showToast(`${next.icon} Upgraded to ${next.name}!`);
  infoPanel.show(entry);
};

const staff = new StaffManager(scene);
const security = new SecurityGuardManager(scene, world);
const services = new ServiceWorkerManager(scene, world);
const events = new EventManager();
const effects = new EffectsManager(scene);
const festival = new FestivalManager(economy, world, dayNight, staff);
infoPanel.setLiveSources(crowd, festival, staff);
infoPanel.setWorld(world);
crowd.setStaff(staff);
crowd.setEvents(events);
crowd.setServices(services);
festival.events = events;
effects.dayNight = dayNight;

events.onEvent = (evt) => {
  showToast(`${evt.icon} ${evt.message}`);
  updateEventBanner();
  effects.setEventVisual(evt.id);
  if (evt.effects.satisfactionFlat) {
    for (const att of crowd.attendees) {
      att.satisfaction = Math.max(0, Math.min(100, att.satisfaction + evt.effects.satisfactionFlat));
    }
  }
};
events.onEventEnd = () => {
  updateEventBanner();
  effects.clearEventVisual();
};

const gameState = {
  getPlacedCount: () => world.placed.length,
  getSelectedBuilding: () => selectedBuilding,
  getFestivalPhase: () => festival.phase
};

const tutorial = new Tutorial();
const objectives = new ObjectiveManager(economy);

// --- Raycaster ---
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const intersectPoint = new THREE.Vector3();

function getGroundPoint(clientX, clientY) {
  pointer.x = (clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  raycaster.ray.intersectPlane(groundPlane, intersectPoint);
  return intersectPoint;
}

// --- State ---
let currentTool = 'build';
let selectedBuilding = null;
let placementRotation = 0;
let selectedEntry = null;
let pointerDownPos = null;
let pointerMoved = false;

// --- UI references ---
const festivalPanel = document.getElementById('festival-panel');
const objectivesPanel = document.getElementById('objectives-panel');
const resultsOverlay = document.getElementById('results-overlay');
const festivalLive = document.getElementById('festival-live');
const festivalControls = document.getElementById('festival-controls');
const toolbarEl = document.getElementById('toolbar');

// --- Build sliders (mobile) ---
const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const buildSliders = document.getElementById('build-sliders');
const sliderX = document.getElementById('slider-x');
const sliderZ = document.getElementById('slider-z');

function showBuildSliders() {
  if (isMobile && selectedBuilding && currentTool === 'build' && festival.phase === 'planning') {
    buildSliders.classList.remove('hidden');
    sliderX.value = 0;
    sliderZ.value = 0;
    updateSliderGhost();
  }
}

function hideBuildSliders() {
  buildSliders.classList.add('hidden');
  world.clearGhost();
}

function getSliderGridPos() {
  const cx = camCtrl.target.x + parseInt(sliderX.value);
  const cz = camCtrl.target.z + parseInt(sliderZ.value);
  return world.snapToGrid(cx, cz);
}

function updateSliderGhost() {
  if (!selectedBuilding) return;
  const [gx, gz] = getSliderGridPos();
  world.showGhost(gx, gz, selectedBuilding, placementRotation);
}

sliderX.addEventListener('input', updateSliderGhost);
sliderZ.addEventListener('input', updateSliderGhost);

document.getElementById('slider-place').addEventListener('click', () => {
  if (!selectedBuilding || festival.phase !== 'planning') return;
  const scaledCost = Math.floor(selectedBuilding.cost * getSeasonCostScale(festival.season));
  if (!economy.canAfford(scaledCost)) {
    sounds.playError();
    showToast('Not enough money!');
    return;
  }
  const [gx, gz] = getSliderGridPos();
  const entry = world.place(gx, gz, selectedBuilding, placementRotation);
  if (entry) {
    economy.spend(scaledCost);
    sounds.playPlace();
    sounds.updateMusicIntensity(economy.crowdSize);
    const adj = getAdjacencyBonuses(entry, world.placed);
    if (adj.length > 0) {
      const names = adj.map(a => a.icon + ' ' + a.label).join(', ');
      showToast(`🔗 ${names}`);
    }
    sliderX.value = 0;
    sliderZ.value = 0;
    updateSliderGhost();
  } else {
    sounds.playError();
    showToast("Can't place here!");
  }
});

document.getElementById('slider-reset').addEventListener('click', () => {
  sliderX.value = 0;
  sliderZ.value = 0;
  updateSliderGhost();
});

// --- UI ---
const buildMenu = new BuildMenu(item => {
  selectedBuilding = item;
  world.clearGhost();
  sounds.playSelect();
  showBuildSliders();
}, economy);
buildMenu.festival = festival;

const toolbar = new Toolbar(tool => {
  if (festival.phase === 'hosting' && (tool === 'build' || tool === 'bulldoze')) return;
  currentTool = tool;
  world.clearGhost();
  hideBuildSliders();
  infoPanel.hide();
  selectedEntry = null;

  if (tool === 'build') {
    buildMenu.show();
  } else {
    buildMenu.hide();
  }
});

buildMenu.show();

// --- Festival UI helpers ---
function updateFestivalPanel() {
  const att = festival.calculateExpectedAttendance();
  const rev = att * festival.ticketPrice;
  const exp = festival.calculateExpenses();
  document.getElementById('price-display').textContent = `$${festival.ticketPrice}`;
  document.getElementById('fest-attendance').textContent = att.toLocaleString();
  document.getElementById('fest-revenue').textContent = `$${rev.toLocaleString()}`;
  const staffCost = staff.getTotalSalary();
  document.getElementById('fest-expenses').textContent = `$${exp.toLocaleString()}${staffCost > 0 ? ` (incl. $${staffCost} staff)` : ''}`;
  const hostBtn = document.getElementById('host-btn');
  const hostHint = document.getElementById('host-hint');
  if (festival.canHostFestival()) {
    hostBtn.disabled = false;
    hostHint.textContent = `Net estimate: $${(rev - exp).toLocaleString()}`;
  } else {
    hostBtn.disabled = true;
    hostHint.textContent = 'Place at least one stage to host';
  }
}

function renderObjectives() {
  const list = document.getElementById('objectives-list');
  list.innerHTML = '';
  for (const obj of OBJECTIVES) {
    const done = objectives.completed.has(obj.id);
    const item = document.createElement('div');
    item.className = 'objective-item' + (done ? ' completed' : '');
    item.innerHTML = `
      <span class="obj-icon">${obj.icon}</span>
      <div class="obj-info">
        <div class="obj-name">${done ? '✅ ' : ''}${obj.name}</div>
        <div class="obj-desc">${obj.desc}</div>
      </div>
      <span class="obj-reward">${done ? 'Done' : `+$${obj.reward.toLocaleString()}`}</span>
    `;
    list.appendChild(item);
  }
}

function showResults(r) {
  document.getElementById('res-season').textContent = r.season;
  document.getElementById('res-grade').textContent = festival.getGrade(r.satisfaction);
  document.getElementById('sat-fill').style.width = r.satisfaction + '%';
  document.getElementById('res-sat-pct').textContent = r.satisfaction + '%';
  document.getElementById('res-attendance').textContent = r.attendance.toLocaleString();
  document.getElementById('res-tickets').textContent = `$${r.ticketRevenue.toLocaleString()}`;
  document.getElementById('res-vendor').textContent = `$${r.vendorRevenue.toLocaleString()}`;
  document.getElementById('res-expenses').textContent = `-$${r.expenses.toLocaleString()}`;
  const profitEl = document.getElementById('res-profit');
  profitEl.textContent = (r.netProfit >= 0 ? '+' : '') + `$${r.netProfit.toLocaleString()}`;
  profitEl.style.color = r.netProfit >= 0 ? 'var(--money)' : 'var(--accent)';
  document.getElementById('res-rep').textContent = `+${r.reputationEarned} ⭐`;

  // Satisfaction breakdown
  const breakdownEl = document.getElementById('res-breakdown');
  breakdownEl.classList.add('hidden');
  if (r.satisfactionBreakdown) {
    document.getElementById('res-structural').textContent = `${r.structuralSatisfaction}%`;
    document.getElementById('res-live').textContent = `${Math.round(r.liveSatisfaction)}%`;
    document.getElementById('res-factors').innerHTML = renderFactors(r.satisfactionBreakdown);
  }

  resultsOverlay.classList.remove('hidden');
}

function renderFactors(factors) {
  return factors.map(f => {
    const maxBar = 15;
    const pct = Math.min(100, Math.abs(f.value) / maxBar * 100);
    const cls = f.value >= 0 ? 'positive' : 'negative';
    const sign = f.value > 0 ? '+' : '';
    return `<div class="breakdown-factor">
      <span class="bf-icon">${f.icon}</span>
      <span class="bf-label">${f.label}</span>
      <div class="bf-bar"><div class="bf-fill ${cls}" style="width:${pct}%"></div></div>
      <span class="bf-value ${cls}">${sign}${f.value}</span>
    </div>`;
  }).join('');
}

function updateEventBanner() {
  const el = document.getElementById('event-banner');
  if (!el) return;
  if (events.active) {
    el.textContent = `${events.active.icon} ${events.active.name} — ${events.active.tip}`;
    el.classList.remove('hidden');
  } else {
    el.classList.add('hidden');
  }
}

function updateLiveHUD() {
  document.getElementById('live-day').textContent = festival.currentFestivalDay;
  document.getElementById('live-total').textContent = festival.festivalDaysTotal;
  document.getElementById('live-vendor').textContent = festival.vendorRevenue.toLocaleString();
  const mood = crowd.getLiveSatisfaction();
  const moodEl = document.getElementById('live-mood');
  if (moodEl) {
    let emoji = '😐';
    if (mood >= 80) emoji = '🤩';
    else if (mood >= 60) emoji = '😊';
    else if (mood >= 40) emoji = '😐';
    else if (mood >= 20) emoji = '😟';
    else emoji = '😡';
    moodEl.textContent = `${emoji} ${mood}%`;
  }
}

function updateSeasonDisplay() {
  const el = document.getElementById('season-display');
  if (el) el.textContent = `📅 Season ${festival.season}`;
}

function checkObjectives() {
  const prevRep = economy.reputation;
  const newlyDone = objectives.check(festival, world);
  for (const obj of newlyDone) {
    sounds.playObjectiveComplete();
    showToast(`🏆 ${obj.name} — +$${obj.reward.toLocaleString()}`);
  }
  if (economy.reputation > prevRep) {
    buildMenu.refresh();
  }
}

let lastUnlockRep = economy.reputation;
function checkUnlocks() {
  const rep = economy.reputation;
  if (rep <= lastUnlockRep) return;
  const allItems = Object.values(CATEGORIES).flatMap(c => c.items);
  const newlyUnlocked = allItems.filter(it =>
    (it.requiredRep || 0) > lastUnlockRep && (it.requiredRep || 0) <= rep
  );
  if (newlyUnlocked.length > 0) {
    const names = newlyUnlocked.slice(0, 3).map(it => it.name).join(', ');
    const extra = newlyUnlocked.length > 3 ? ` +${newlyUnlocked.length - 3} more` : '';
    showToast(`🔓 Unlocked: ${names}${extra}`);
    sounds.playUnlock();
  }
  lastUnlockRep = rep;
}

// --- Festival phase changes ---
festival.onPhaseChange = (phase) => {
  if (phase === 'hosting') {
    festivalPanel.classList.add('hidden');
    festivalControls.classList.add('hidden');
    festivalLive.classList.remove('hidden');
    toolbarEl.classList.add('hosting');
    buildMenu.hide();
    events.reset();
    if (currentTool === 'build' || currentTool === 'bulldoze') {
      currentTool = 'select';
      toolbar.setTool('select');
    }
    effects.setupBuildingEffects(world.placed);
    dayNight.setupBuildingGlow(world.placed);
    security.spawnGuards(staff);
    services.spawnWorkers(staff);
    sounds.stopForestAmbience();
    sounds.startFestivalAmbience();
    sounds.playPlace();
  } else if (phase === 'results') {
    festivalLive.classList.add('hidden');
    document.getElementById('mood-panel').classList.add('hidden');
    const evtBanner = document.getElementById('event-banner');
    if (evtBanner) evtBanner.classList.add('hidden');
    crowd.clear();
    security.clear();
    services.clear();
    effects.dispose();
    dayNight.clearBuildingGlow();
    sounds.stopFestivalAmbience();
    sounds.playVictoryFanfare();
    showResults(festival.results);
    checkObjectives();
  } else if (phase === 'planning') {
    resultsOverlay.classList.add('hidden');
    festivalControls.classList.remove('hidden');
    toolbarEl.classList.remove('hosting');
    festival.liveSatisfaction = null;
    sounds.startForestAmbience();
    updateSeasonDisplay();
    economy.updateHUD();
    checkUnlocks();
    buildMenu.refresh();
  }
};

// --- Festival event listeners ---
document.getElementById('festival-btn').addEventListener('click', () => {
  objectivesPanel.classList.add('hidden');
  festivalPanel.classList.toggle('hidden');
  if (!festivalPanel.classList.contains('hidden')) {
    updateFestivalPanel();
  }
});

document.getElementById('close-festival').addEventListener('click', () => {
  festivalPanel.classList.add('hidden');
});

document.getElementById('price-down').addEventListener('click', () => {
  festival.ticketPrice = Math.max(10, festival.ticketPrice - 10);
  updateFestivalPanel();
  sounds.playSelect();
});

document.getElementById('price-up').addEventListener('click', () => {
  festival.ticketPrice = Math.min(200, festival.ticketPrice + 10);
  updateFestivalPanel();
  sounds.playSelect();
});

document.getElementById('host-btn').addEventListener('click', () => {
  if (festival.startFestival()) {
    festivalPanel.classList.add('hidden');
  }
});

document.getElementById('objectives-btn').addEventListener('click', () => {
  festivalPanel.classList.add('hidden');
  objectivesPanel.classList.toggle('hidden');
  if (!objectivesPanel.classList.contains('hidden')) {
    renderObjectives();
  }
});

document.getElementById('close-objectives').addEventListener('click', () => {
  objectivesPanel.classList.add('hidden');
});

document.getElementById('continue-btn').addEventListener('click', () => {
  festival.continueToPlanning();
});

document.getElementById('res-breakdown-toggle').addEventListener('click', () => {
  document.getElementById('res-breakdown').classList.toggle('hidden');
});

document.getElementById('mood-btn').addEventListener('click', () => {
  const moodPanel = document.getElementById('mood-panel');
  moodPanel.classList.toggle('hidden');
  if (!moodPanel.classList.contains('hidden')) {
    updateMoodPanel();
  }
});

document.getElementById('close-mood').addEventListener('click', () => {
  document.getElementById('mood-panel').classList.add('hidden');
});

function updateMoodPanel() {
  const body = document.getElementById('mood-body');
  if (!body) return;
  const { score, factors } = festival.getSatisfactionBreakdown();
  const liveMood = crowd.getLiveSatisfaction();
  const blended = Math.round(score * 0.4 + liveMood * 0.6);
  body.innerHTML = `
    <div class="breakdown-header">
      <span>Structural: <strong>${score}%</strong></span>
      <span>Live Mood: <strong>${liveMood}%</strong></span>
      <span>Blended: <strong>${blended}%</strong></span>
    </div>
    ${renderFactors(factors)}
    <div style="margin-top:8px;font-size:11px;color:var(--text-dim)">
      Final score = 40% structural + 60% live mood
    </div>
  `;
}

// --- Pointer events ---
canvas.addEventListener('pointerdown', e => {
  if (e.button !== 0 || e.shiftKey) return;
  pointerDownPos = { x: e.clientX, y: e.clientY };
  pointerMoved = false;
});

canvas.addEventListener('pointermove', e => {
  if (pointerDownPos) {
    const dx = e.clientX - pointerDownPos.x;
    const dy = e.clientY - pointerDownPos.y;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) pointerMoved = true;
  }

  if (currentTool === 'build' && selectedBuilding && festival.phase === 'planning' && !camCtrl.didPan) {
    const pt = getGroundPoint(e.clientX, e.clientY);
    const [gx, gz] = world.snapToGrid(pt.x, pt.z);
    world.showGhost(gx, gz, selectedBuilding, placementRotation);
  }
});

canvas.addEventListener('pointerup', e => {
  if (e.button !== 0 || pointerMoved || camCtrl.didPan) {
    pointerDownPos = null;
    return;
  }
  pointerDownPos = null;

  const pt = getGroundPoint(e.clientX, e.clientY);
  const [gx, gz] = world.snapToGrid(pt.x, pt.z);

  if (currentTool === 'build' && selectedBuilding && festival.phase === 'planning') {
    const scaledCost = Math.floor(selectedBuilding.cost * getSeasonCostScale(festival.season));
    if (!economy.canAfford(scaledCost)) {
      sounds.playError();
      showToast('Not enough money!');
      return;
    }
    const entry = world.place(gx, gz, selectedBuilding, placementRotation);
    if (entry) {
      economy.spend(scaledCost);
      sounds.playPlace();
      sounds.updateMusicIntensity(economy.crowdSize);
      const adj = getAdjacencyBonuses(entry, world.placed);
      if (adj.length > 0) {
        const names = adj.map(a => a.icon + ' ' + a.label).join(', ');
        showToast(`🔗 ${names}`);
      }
    } else {
      sounds.playError();
      showToast("Can't place here!");
    }
  } else if (currentTool === 'bulldoze' && festival.phase === 'planning') {
    const entry = world.findAtGrid(gx, gz);
    if (entry) {
      staff.removeBuilding(entry);
      world.remove(entry);
      const refund = Math.floor(entry.data.cost * 0.5);
      economy.earn(refund);
      sounds.playBulldoze();
      showToast(`Refund: $${refund.toLocaleString()}`);
    }
  } else if (currentTool === 'select') {
    const entry = world.findAtGrid(gx, gz);
    if (entry) {
      selectedEntry = entry;
      infoPanel.show(entry);
      sounds.playSelect();
    } else {
      infoPanel.hide();
      selectedEntry = null;
    }
  } else if (currentTool === 'rotate') {
    const entry = world.findAtGrid(gx, gz);
    if (entry) {
      entry.rotation += Math.PI / 2;
      entry.mesh.rotation.y = entry.rotation;
      sounds.playSelect();
    }
  }
});

// --- Keyboard ---
window.addEventListener('keydown', e => {
  if (e.key === 'r' || e.key === 'R') {
    placementRotation += Math.PI / 2;
  } else if (e.key === 'Escape') {
    buildMenu.clearSelection();
    selectedBuilding = null;
    world.clearGhost();
    hideBuildSliders();
    infoPanel.hide();
    festivalPanel.classList.add('hidden');
    objectivesPanel.classList.add('hidden');
  } else if (e.key === '1') toolbar.setTool('select');
  else if (e.key === '2' && festival.phase === 'planning') toolbar.setTool('build');
  else if (e.key === '3' && festival.phase === 'planning') toolbar.setTool('bulldoze');
  else if (e.key === '4') toolbar.setTool('rotate');
  else if (e.key === 'f' || e.key === 'F') {
    if (festival.phase === 'planning') {
      document.getElementById('festival-btn').click();
    }
  } else if (e.key === 'g' || e.key === 'G') {
    document.getElementById('objectives-btn').click();
  }
});

// --- Toast notifications ---
function showToast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, 1500);
}

// --- Timers ---
let lastVendorTick = 0;
const VENDOR_TICK_INTERVAL = 2000;
let lastSave = 0;
const SAVE_INTERVAL = 30000;
let lastTime = 0;
let musicStarted = false;
let lastCheerTime = 0;
let nextCheerDelay = 15000 + Math.random() * 5000;

// --- Save slot system ---
let activeSlot = -1;

function loadSlotData(slot) {
  const saved = loadGame(slot);
  if (saved) {
    economy.loadJSON(saved.economy);
    if (saved.buildings) {
      for (const b of saved.buildings) {
        const building = getBuildingById(b.id);
        if (building) {
          const entry = world.place(b.x, b.z, building, b.rotation || 0);
          if (entry) {
            if (b.upgrades) {
              for (const uid of b.upgrades) {
                const upg = getUpgradeById(uid);
                if (upg) world.addUpgrade(entry, upg);
              }
            }
            if (b.tier && b.tier > 1) {
              for (let t = 2; t <= b.tier; t++) {
                const tierDef = getTierById(b.id, t);
                if (tierDef) world.applyTier(entry, tierDef);
              }
            }
          }
        }
      }
    }
    if (saved.festival) festival.loadJSON(saved.festival);
    if (saved.objectives) objectives.loadJSON(saved.objectives);
    if (saved.staff) staff.loadJSON(saved.staff, world);
    lastUnlockRep = economy.reputation;
    updateSeasonDisplay();
  }
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function renderSaveSlots() {
  const container = document.getElementById('save-slots');
  if (!container) return;
  const slots = listSlots();
  container.innerHTML = '';
  for (const slot of slots) {
    const el = document.createElement('div');
    el.className = 'save-slot ' + (slot.empty ? 'empty' : 'occupied');
    if (slot.empty) {
      el.innerHTML = `
        <div class="slot-num">${slot.index + 1}</div>
        <div class="slot-info">Empty Slot</div>
        <div class="slot-action">New Game</div>
      `;
      el.addEventListener('click', () => startSlot(slot.index, true));
    } else {
      el.innerHTML = `
        <button class="slot-delete" title="Delete save">&times;</button>
        <div class="slot-num">${slot.index + 1}</div>
        <div class="slot-info">
          <div class="slot-title">Season ${slot.season}</div>
          <div class="slot-meta">
            <span class="s-money">$${slot.money.toLocaleString()}</span>
            &nbsp;·&nbsp;
            <span class="s-rep">⭐ ${slot.reputation}</span>
            &nbsp;·&nbsp;
            ${timeAgo(slot.timestamp)}
          </div>
        </div>
        <div class="slot-action">Continue</div>
      `;
      el.addEventListener('click', (e) => {
        if (e.target.classList.contains('slot-delete')) return;
        startSlot(slot.index, false);
      });
      el.querySelector('.slot-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteSave(slot.index);
        renderSaveSlots();
      });
    }
    container.appendChild(el);
  }
}

function startSlot(slot, isNew) {
  activeSlot = slot;
  if (!isNew) loadSlotData(slot);
  economy.updateHUD();
  updateSeasonDisplay();
  dismissLoadingScreen();
  if (isNew && tutorial.shouldRun()) {
    setTimeout(() => tutorial.start(gameState), 900);
  }
}

function dismissLoadingScreen() {
  const saveModal = document.getElementById('save-modal');
  if (saveModal) saveModal.classList.add('hidden');
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.add('fade-out');
    setTimeout(() => { loadingScreen.style.display = 'none'; }, 800);
  }
  sounds.startAmbientMusic(0);
  sounds.startForestAmbience();
  musicStarted = true;
}

// Show main menu when app is reopened (bfcache or PWA resume)
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    window.location.href = window.location.pathname + '?t=' + Date.now();
  }
});
let _lastHidden = 0;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    _lastHidden = Date.now();
  } else if (_lastHidden > 0 && Date.now() - _lastHidden > 3000) {
    window.location.href = window.location.pathname + '?t=' + Date.now();
  }
});

let audioEnabled = true;

// --- Menu sign buttons ---
document.getElementById('menu-play').addEventListener('click', () => {
  const slots = listSlots();
  const occupied = slots.filter(s => !s.empty);
  if (occupied.length === 0) {
    startSlot(0, true);
  } else if (occupied.length === 1) {
    startSlot(occupied[0].index, false);
  } else {
    openSaveModal();
  }
});

document.getElementById('menu-saves').addEventListener('click', () => {
  openSaveModal();
});

document.getElementById('menu-help').addEventListener('click', () => {
  const slots = listSlots();
  const occupied = slots.filter(s => !s.empty);
  if (occupied.length > 0) {
    startSlot(occupied[0].index, false);
  } else {
    startSlot(0, true);
  }
  setTimeout(() => tutorial.restart(gameState), 600);
});

document.getElementById('menu-audio').addEventListener('click', () => {
  audioEnabled = !audioEnabled;
  const btn = document.getElementById('menu-audio');
  if (audioEnabled) {
    btn.textContent = 'AUDIO';
    btn.classList.remove('audio-off');
    sounds.setMasterVolume(1);
  } else {
    btn.textContent = 'MUTED';
    btn.classList.add('audio-off');
    sounds.setMasterVolume(0);
  }
});

// --- Main menu button (in-game) ---
document.getElementById('main-menu-btn').addEventListener('click', () => {
  if (activeSlot >= 0) {
    saveGame(activeSlot, {
      economy: economy.toJSON(),
      buildings: world.toJSON(),
      festival: festival.toJSON(),
      objectives: objectives.toJSON(),
      staff: staff.toJSON()
    });
  }
  window.location.href = window.location.pathname + '?t=' + Date.now();
});

function openSaveModal() {
  renderSaveSlots();
  document.getElementById('save-modal').classList.remove('hidden');
}

document.getElementById('close-saves').addEventListener('click', () => {
  document.getElementById('save-modal').classList.add('hidden');
});

// --- Resize ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Game loop ---
function animate(time) {
  requestAnimationFrame(animate);

  const dt = Math.min((time - lastTime) / 1000, 0.1);
  lastTime = time;

  // Day/night cycle
  dayNight.update(dt);

  // Festival update
  festival.update(dt);

  // Vendor income during hosting
  if (festival.phase === 'hosting' && time - lastVendorTick > VENDOR_TICK_INTERVAL) {
    festival.vendorTick();
    updateLiveHUD();
    updateEventBanner();
    lastVendorTick = time;
  }

  // Events during hosting
  if (festival.phase === 'hosting') {
    events.update(dt);
    security.update(dt, crowd, economy);
    services.update(dt, crowd, economy);
  }

  // Crowd simulation
  let targetNPCs = 0;
  if (festival.phase === 'hosting') {
    targetNPCs = Math.min(Math.floor(festival.festivalAttendance * 0.4), 300);
    festival.liveSatisfaction = crowd.getLiveSatisfaction();
  }
  crowd.update(dt, targetNPCs);

  if (festival.phase === 'hosting') {
    effects.update(dt);
  }

  // Crowd cheers during hosting
  if (festival.phase === 'hosting' && time - lastCheerTime > nextCheerDelay) {
    sounds.playCrowdCheer();
    lastCheerTime = time;
    nextCheerDelay = 15000 + Math.random() * 5000;
  }

  // Start ambient music once buildings exist
  if (!musicStarted && world.placed.length > 0) {
    sounds.startAmbientMusic(economy.crowdSize);
    musicStarted = true;
  }

  // Auto-save to active slot
  if (activeSlot >= 0 && time - lastSave > SAVE_INTERVAL) {
    saveGame(activeSlot, {
      economy: economy.toJSON(),
      buildings: world.toJSON(),
      festival: festival.toJSON(),
      objectives: objectives.toJSON(),
      staff: staff.toJSON()
    });
    lastSave = time;
  }

  renderer.render(scene, camera);
}

requestAnimationFrame(animate);
