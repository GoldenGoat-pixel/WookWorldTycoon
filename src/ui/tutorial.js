const TUTORIAL_KEY = 'wookworld_tutorial_done';

const STEPS = [
  {
    title: 'Welcome to WookWorld Tycoon!',
    text: "You're a festival promoter building your dream music festival from the ground up. This tutorial will walk you through everything — hands on!",
    target: null,
    position: 'center',
    type: 'info'
  },
  {
    title: 'Your Money & Stats',
    text: 'This is your HUD. You start with $50,000.\n\n💰 Money — spend it on buildings\n⭐ Reputation — earned from festivals, unlocks new stuff\n👥 Crowd — how many people at your festival\n📅 Season — each festival is one season',
    target: '#hud-top',
    position: 'below',
    type: 'info'
  },
  {
    title: 'The Build Menu',
    text: "This is where you build your festival. It has 5 categories: Stages, Facilities, Camping, Decor, and Paths & Fences.\n\nLet's start building! Select the Small Stage ($2,000).",
    target: '#build-menu',
    position: 'right',
    type: 'action',
    waitFor: 'select_small_stage'
  },
  {
    title: 'Place Your Stage!',
    text: 'Now tap anywhere on the green field to place your stage. This is where bands will perform!',
    target: '#game-canvas',
    position: 'center',
    type: 'action',
    waitFor: 'place_building'
  },
  {
    title: 'Nice! Now Add Facilities',
    text: "Stages attract crowds, but they need food! Click the \"Facilities\" tab in the Build Menu.",
    target: '#build-categories',
    position: 'right',
    type: 'action',
    waitFor: 'switch_to_facilities'
  },
  {
    title: 'Place a Food Tent',
    text: 'Select the Food Tent ($1,500) and place it near your stage. Food tents generate vendor income during festivals!',
    target: '#build-items',
    position: 'right',
    type: 'action',
    waitFor: 'place_food'
  },
  {
    title: 'The Toolbar',
    text: "These are your tools:\n\n🔍 Select — tap a building to see its info\n🔨 Build — place new structures\n🗑️ Bulldoze — remove buildings (50% refund)\n🔄 Rotate — spin buildings 90°\n\nKeyboard: 1–4 to switch, R to rotate before placing.",
    target: '#toolbar',
    position: 'above',
    type: 'info'
  },
  {
    title: 'Camera Controls',
    text: '🖱️ Desktop: drag to pan, scroll to zoom\n📱 Mobile: one finger to pan, pinch to zoom, two fingers to drag\n⌨️ Keyboard: WASD / arrow keys to move',
    target: null,
    position: 'center',
    type: 'info'
  },
  {
    title: "Time to Host a Festival!",
    text: 'You\'ve got a stage and food — that\'s enough to host! Click "🎪 Plan Festival" to open the planning panel.',
    target: '#festival-btn',
    position: 'below',
    type: 'action',
    waitFor: 'open_festival_panel'
  },
  {
    title: 'Festival Planning',
    text: 'Here you can:\n\n💵 Set ticket price ($10–$200) — higher price = more money but fewer people\n👥 See expected attendance based on your buildings and reputation\n💰 Preview revenue vs. operating costs\n\nWhen you\'re ready, hit "Host Festival"!',
    target: '#festival-panel',
    position: 'left',
    type: 'action',
    waitFor: 'start_festival'
  },
  {
    title: 'Festival in Progress!',
    text: "Your festival is live! Watch the crowd arrive and vendor income roll in. The festival runs for 3 in-game days.\n\nYou can't build or bulldoze during a festival — just sit back and watch the show!",
    target: '#festival-live',
    position: 'below',
    type: 'info'
  },
  {
    title: 'Festival Results',
    text: "After 3 days you'll get a full report with:\n\n📊 Satisfaction grade (F to A+)\n🎫 Ticket & vendor revenue\n💸 Operating costs\n💰 Net profit\n⭐ Reputation earned\n\nSatisfaction depends on food, restrooms, medical tents, stage variety, camping, decor, and ticket price.",
    target: null,
    position: 'center',
    type: 'info'
  },
  {
    title: 'Boost Your Satisfaction',
    text: 'Pro tips for a high rating:\n\n• 1 food or bar per 100 attendees\n• 1 restroom per 150 attendees\n• At least 1 medical tent\n• Build multiple stage types\n• Add camping for your crowd\n• Decorate everywhere\n• Keep tickets under $100',
    target: null,
    position: 'center',
    type: 'info'
  },
  {
    title: 'Goals & Rewards',
    text: 'Click "🏆 Goals" to see your objectives. Complete them to earn bonus cash!\n\nGoals range from hosting your first festival to reaching 1,000 attendees.',
    target: '#objectives-btn',
    position: 'below',
    type: 'action',
    waitFor: 'open_goals'
  },
  {
    title: 'Reputation & Unlocks',
    text: 'Reputation ⭐ unlocks new buildings as you grow:\n\n⭐ 5 — Acoustic Tent, Family Tent, Hammock Grove\n⭐ 10 — DJ Booth, Bar, Merch Stand, RV Spot\n⭐ 20 — Medical Tent, Glamping, Fountain\n⭐ 35 — VIP Lounge, Ferris Wheel\n⭐ 50 — Mega Stage',
    target: null,
    position: 'center',
    type: 'info'
  },
  {
    title: 'Seasons & Saving',
    text: 'Each festival is one "season." Your buildings stay between festivals — keep expanding!\n\nYour game auto-saves every 30 seconds. You have 3 save slots accessible from the main menu.',
    target: null,
    position: 'center',
    type: 'info'
  },
  {
    title: "You're Ready!",
    text: "That's everything! Build stages, add facilities, host festivals, earn reputation, and unlock bigger and better structures.\n\nYou can replay this tutorial anytime from the HELP button on the main menu. Good luck, promoter! 🎪",
    target: null,
    position: 'center',
    type: 'info'
  }
];

export class Tutorial {
  constructor() {
    this._step = 0;
    this._active = false;
    this._overlay = null;
    this._tooltip = null;
    this._spotlight = null;
    this._pollTimer = null;
    this._gameState = null;
  }

  shouldRun() {
    try { return !localStorage.getItem(TUTORIAL_KEY); }
    catch { return true; }
  }

  start(gameState) {
    if (this._active) return;
    this._gameState = gameState || this._gameState;
    this._active = true;
    this._step = 0;
    this._createUI();
    this._render();
  }

  restart(gameState) {
    this.skip();
    try { localStorage.removeItem(TUTORIAL_KEY); } catch {}
    setTimeout(() => this.start(gameState), 100);
  }

  skip() {
    this._active = false;
    this._stopPolling();
    this._markDone();
    this._removeUI();
  }

  isActive() { return this._active; }

  _markDone() {
    try { localStorage.setItem(TUTORIAL_KEY, '1'); } catch {}
  }

  _createUI() {
    this._overlay = document.createElement('div');
    this._overlay.id = 'tutorial-overlay';

    this._spotlight = document.createElement('div');
    this._spotlight.id = 'tutorial-spotlight';

    this._tooltip = document.createElement('div');
    this._tooltip.id = 'tutorial-tooltip';

    const inner = document.createElement('div');
    inner.id = 'tutorial-inner';

    this._titleEl = document.createElement('div');
    this._titleEl.id = 'tutorial-title';

    this._textEl = document.createElement('div');
    this._textEl.id = 'tutorial-text';

    this._counter = document.createElement('div');
    this._counter.id = 'tutorial-counter';

    const btnRow = document.createElement('div');
    btnRow.id = 'tutorial-btns';

    this._skipBtn = document.createElement('button');
    this._skipBtn.id = 'tutorial-skip';
    this._skipBtn.textContent = 'Skip Tutorial';
    this._skipBtn.addEventListener('click', () => this.skip());

    this._nextBtn = document.createElement('button');
    this._nextBtn.id = 'tutorial-next';
    this._nextBtn.textContent = 'Next';
    this._nextBtn.addEventListener('click', () => this._advance());

    btnRow.appendChild(this._skipBtn);
    btnRow.appendChild(this._nextBtn);

    inner.appendChild(this._titleEl);
    inner.appendChild(this._textEl);
    inner.appendChild(this._counter);
    inner.appendChild(btnRow);
    this._tooltip.appendChild(inner);

    document.body.appendChild(this._overlay);
    document.body.appendChild(this._spotlight);
    document.body.appendChild(this._tooltip);
  }

  _removeUI() {
    if (this._overlay) this._overlay.remove();
    if (this._spotlight) this._spotlight.remove();
    if (this._tooltip) this._tooltip.remove();
    this._overlay = null;
    this._spotlight = null;
    this._tooltip = null;
  }

  _advance() {
    this._stopPolling();
    this._step++;
    if (this._step >= STEPS.length) {
      this._active = false;
      this._markDone();
      this._removeUI();
      return;
    }
    this._render();
  }

  _stopPolling() {
    if (this._pollTimer) {
      clearInterval(this._pollTimer);
      this._pollTimer = null;
    }
  }

  _render() {
    const step = STEPS[this._step];
    this._titleEl.textContent = step.title;
    this._textEl.textContent = step.text;
    this._counter.textContent = `${this._step + 1} / ${STEPS.length}`;

    const isLast = this._step === STEPS.length - 1;
    const isAction = step.type === 'action';

    this._nextBtn.textContent = isLast ? "Let's Go!" : 'Next';
    this._nextBtn.style.display = isAction ? 'none' : '';
    this._skipBtn.style.display = isLast ? 'none' : '';

    if (isAction) {
      this._overlay.classList.add('action-mode');
    } else {
      this._overlay.classList.remove('action-mode');
    }

    if (step.target) {
      const el = document.querySelector(step.target);
      if (el) {
        const rect = el.getBoundingClientRect();
        const pad = 8;
        this._spotlight.style.display = 'block';
        this._spotlight.style.left = (rect.left - pad) + 'px';
        this._spotlight.style.top = (rect.top - pad) + 'px';
        this._spotlight.style.width = (rect.width + pad * 2) + 'px';
        this._spotlight.style.height = (rect.height + pad * 2) + 'px';
        this._positionTooltip(rect, step.position);

        if (isAction) {
          this._makeTargetClickable(el, rect, pad);
        }
      } else {
        this._spotlight.style.display = 'none';
        this._centerTooltip();
      }
    } else {
      this._spotlight.style.display = 'none';
      this._centerTooltip();
    }

    if (isAction && step.waitFor) {
      this._startPolling(step.waitFor);
    }
  }

  _makeTargetClickable(el, rect, pad) {
    this._spotlight.style.pointerEvents = 'none';
    this._overlay.style.pointerEvents = 'none';
    this._tooltip.style.pointerEvents = 'auto';

    const cutout = `polygon(
      0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
      ${rect.left - pad}px ${rect.top - pad}px,
      ${rect.right + pad}px ${rect.top - pad}px,
      ${rect.right + pad}px ${rect.bottom + pad}px,
      ${rect.left - pad}px ${rect.bottom + pad}px,
      ${rect.left - pad}px ${rect.top - pad}px
    )`;
    this._overlay.style.clipPath = cutout;
    this._overlay.style.pointerEvents = 'auto';
  }

  _centerTooltip() {
    this._tooltip.style.left = '50%';
    this._tooltip.style.top = '50%';
    this._tooltip.style.transform = 'translate(-50%, -50%)';
    this._tooltip.removeAttribute('data-pos');
    this._overlay.style.clipPath = '';
    this._overlay.style.pointerEvents = '';
  }

  _positionTooltip(rect, position) {
    const tt = this._tooltip;
    const gap = 16;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    tt.style.transform = '';
    tt.setAttribute('data-pos', position);
    this._overlay.style.clipPath = '';
    this._overlay.style.pointerEvents = '';

    if (position === 'center') {
      this._centerTooltip();
      return;
    }

    if (position === 'below') {
      let left = Math.max(200, Math.min(vw - 200, rect.left + rect.width / 2));
      tt.style.left = left + 'px';
      tt.style.top = (rect.bottom + gap) + 'px';
      tt.style.transform = 'translateX(-50%)';
    } else if (position === 'above') {
      let left = Math.max(200, Math.min(vw - 200, rect.left + rect.width / 2));
      tt.style.left = left + 'px';
      tt.style.top = (rect.top - gap) + 'px';
      tt.style.transform = 'translate(-50%, -100%)';
    } else if (position === 'left') {
      tt.style.left = (rect.left - gap) + 'px';
      tt.style.top = Math.min(vh - 100, rect.top + rect.height / 2) + 'px';
      tt.style.transform = 'translate(-100%, -50%)';
    } else if (position === 'right') {
      tt.style.left = (rect.right + gap) + 'px';
      tt.style.top = Math.min(vh - 100, rect.top + rect.height / 2) + 'px';
      tt.style.transform = 'translateY(-50%)';
    }
  }

  _startPolling(waitFor) {
    this._stopPolling();
    const gs = this._gameState;
    if (!gs) return;

    const startPlaced = gs.getPlacedCount();

    this._pollTimer = setInterval(() => {
      let done = false;
      switch (waitFor) {
        case 'select_small_stage':
          done = gs.getSelectedBuilding()?.id === 'small_stage';
          break;
        case 'place_building':
          done = gs.getPlacedCount() > startPlaced;
          break;
        case 'switch_to_facilities': {
          const active = document.querySelector('#build-categories .cat-btn.active');
          done = active?.dataset.category === 'facilities';
          break;
        }
        case 'place_food':
          done = gs.getPlacedCount() > startPlaced;
          break;
        case 'open_festival_panel':
          done = !document.getElementById('festival-panel').classList.contains('hidden');
          break;
        case 'start_festival':
          done = gs.getFestivalPhase() === 'hosting';
          break;
        case 'open_goals':
          done = !document.getElementById('objectives-panel').classList.contains('hidden');
          break;
      }
      if (done) this._advance();
    }, 300);
  }
}
