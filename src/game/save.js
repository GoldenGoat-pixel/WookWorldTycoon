const MAX_SLOTS = 3;
const SLOT_PREFIX = 'wookworld_slot_';
const LEGACY_KEY = 'festival_tycoon_save';

export function listSlots() {
  migrateLegacy();
  const slots = [];
  for (let i = 0; i < MAX_SLOTS; i++) {
    try {
      const raw = localStorage.getItem(SLOT_PREFIX + i);
      if (raw) {
        const data = JSON.parse(raw);
        slots.push({
          index: i,
          empty: false,
          timestamp: data.timestamp || 0,
          season: data.festival?.season || 1,
          money: data.economy?.money || 50000,
          reputation: data.economy?.reputation || 0
        });
      } else {
        slots.push({ index: i, empty: true });
      }
    } catch {
      slots.push({ index: i, empty: true });
    }
  }
  return slots;
}

export function saveGame(slot, data) {
  try {
    localStorage.setItem(SLOT_PREFIX + slot, JSON.stringify({
      version: 3,
      timestamp: Date.now(),
      ...data
    }));
    return true;
  } catch {
    return false;
  }
}

export function loadGame(slot) {
  try {
    const raw = localStorage.getItem(SLOT_PREFIX + slot);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function deleteSave(slot) {
  try { localStorage.removeItem(SLOT_PREFIX + slot); } catch {}
}

function migrateLegacy() {
  try {
    const old = localStorage.getItem(LEGACY_KEY);
    if (!old) return;
    if (!localStorage.getItem(SLOT_PREFIX + '0')) {
      localStorage.setItem(SLOT_PREFIX + '0', old);
    }
    localStorage.removeItem(LEGACY_KEY);
  } catch {}
}
