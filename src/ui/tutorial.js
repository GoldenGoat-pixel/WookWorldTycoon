const TUTORIAL_KEY = 'wookworld_tutorial_done';

const STEPS = [
  {
    title: 'Welcome to WookWorld Tycoon!',
    text: 'You\'re a festival promoter building your dream music festival from the ground up. Let\'s walk through everything you need to know.',
    target: null,
    position: 'center'
  },
  {
    title: 'Your Money & Stats',
    text: 'This is your HUD. You start with $50,000. Keep an eye on your money 💰, reputation ⭐, crowd size 👥, and current season 📅.',
    target: '#hud-top',
    position: 'below'
  },
  {
    title: 'The Build Menu',
    text: 'This is where you build your festival. Pick a structure and tap the ground to place it. Each item shows its cost and what it does.',
    target: '#build-menu',
    position: 'right'
  },
  {
    title: 'Building Categories',
    text: 'There are 5 categories:\n\n🎤 Stages — attract crowds and hold performances\n🍔 Facilities — food, bars, restrooms, medical, merch\n⛺ Camping — tents, RVs, campfires, showers\n🎨 Decor — lights, banners, sculptures, fountains\n🏗️ Paths & Fences — walkways, gates, parking',
    target: '#build-categories',
    position: 'right'
  },
  {
    title: 'Stages Are Key',
    text: 'You need at least one stage to host a festival. Each stage type has a different crowd capacity. Bigger stages = more attendees = more revenue.',
    target: null,
    position: 'center'
  },
  {
    title: 'Facilities Matter',
    text: 'Food tents, bars, and merch stands generate vendor income during festivals. Restrooms and medical tents boost crowd satisfaction. A happy crowd = more reputation!',
    target: null,
    position: 'center'
  },
  {
    title: 'The Toolbar',
    text: 'These are your tools:\n\n🔍 Select — tap a building to see its info\n🔨 Build — place new structures\n🗑️ Bulldoze — remove buildings (50% refund)\n🔄 Rotate — spin buildings 90°',
    target: '#toolbar',
    position: 'above'
  },
  {
    title: 'Camera Controls',
    text: 'Move the camera:\n\n🖱️ Desktop: drag to pan, scroll to zoom, R to rotate placement\n📱 Mobile: one finger to pan, pinch to zoom, two fingers to pan\n\nKeyboard: WASD or arrow keys to move, Q/E to rotate view.',
    target: null,
    position: 'center'
  },
  {
    title: 'Plan Your Festival',
    text: 'When you\'ve placed some buildings, tap "Plan Festival" to open the planning panel. This is where the real business happens.',
    target: '#festival-btn',
    position: 'above'
  },
  {
    title: 'Festival Planning',
    text: 'In the planning panel you can:\n\n💵 Set ticket price ($10–$200)\n👥 See expected attendance\n💰 Preview revenue vs. costs\n\nHigher tickets = more money but fewer people. Lower tickets = bigger crowds but less per head.',
    target: null,
    position: 'center'
  },
  {
    title: 'Hosting a Festival',
    text: 'Once you hit "Host Festival", the show begins! The festival runs for 3 days. During this time:\n\n• Crowds appear on your grounds\n• Vendor buildings earn income every few seconds\n• You can\'t build or bulldoze until it\'s over\n• Crowd cheers play periodically',
    target: null,
    position: 'center'
  },
  {
    title: 'Festival Results',
    text: 'After 3 days you get a full report:\n\n📊 Satisfaction grade (F to A+)\n🎫 Ticket revenue\n🍔 Vendor revenue\n💸 Operating costs\n💰 Net profit\n⭐ Reputation earned\n\nSatisfaction depends on food, restrooms, medical, stage variety, camping, decor, and ticket price.',
    target: null,
    position: 'center'
  },
  {
    title: 'Satisfaction Breakdown',
    text: 'To maximize your rating:\n\n• 1 food/bar per 100 attendees\n• 1 restroom per 150 attendees\n• At least 1 medical tent\n• Multiple stage types\n• Camping for your crowd\n• Lots of decorations\n• Don\'t overprice tickets (above $100 hurts satisfaction)',
    target: null,
    position: 'center'
  },
  {
    title: 'Goals & Rewards',
    text: 'Tap "Goals" to see your objectives. Complete them to earn bonus cash. Goals range from hosting your first festival to reaching 1,000 attendees and earning $100k revenue.',
    target: '#objectives-btn',
    position: 'above'
  },
  {
    title: 'Reputation & Unlocks',
    text: 'Reputation ⭐ is earned after each festival based on satisfaction and attendance. As your rep grows, new buildings unlock:\n\n⭐ 5 — Acoustic Tent, Family Tent, Hammock Grove\n⭐ 10 — DJ Booth, Bar, Merch, Light Tree, RV Spot, and more\n⭐ 20 — Medical Tent, Glamping, Fountain\n⭐ 35 — VIP Lounge, Ferris Wheel\n⭐ 50 — Mega Stage',
    target: null,
    position: 'center'
  },
  {
    title: 'Seasons',
    text: 'Each festival is one "season." After the results screen, you advance to the next season. Your buildings stay — keep expanding and improving between festivals.',
    target: '#season-display',
    position: 'below'
  },
  {
    title: 'Auto-Save',
    text: 'Your game auto-saves every 30 seconds to your active save slot. You have 3 save slots total — access them from the main menu\'s SAVES button.',
    target: null,
    position: 'center'
  },
  {
    title: 'Keyboard Shortcuts',
    text: 'Quick keys for power users:\n\n1–4 — Switch tools\nR — Rotate building before placing\nF — Open festival panel\nG — Open goals\nEsc — Close panels / deselect',
    target: null,
    position: 'center'
  },
  {
    title: 'You\'re Ready!',
    text: 'Start by placing a Small Stage and a Food Tent, then host your first festival. Good luck, promoter! 🎪',
    target: null,
    position: 'center'
  }
];

export class Tutorial {
  constructor() {
    this._step = 0;
    this._active = false;
    this._overlay = null;
    this._tooltip = null;
    this._spotlight = null;
  }

  shouldRun() {
    try { return !localStorage.getItem(TUTORIAL_KEY); }
    catch { return true; }
  }

  start() {
    if (!this.shouldRun()) return;
    this._active = true;
    this._step = 0;
    this._createUI();
    this._render();
  }

  skip() {
    this._active = false;
    this._markDone();
    this._removeUI();
  }

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

    this._overlay.addEventListener('click', (e) => {
      if (e.target === this._overlay) this._advance();
    });
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
    this._step++;
    if (this._step >= STEPS.length) {
      this._active = false;
      this._markDone();
      this._removeUI();
      return;
    }
    this._render();
  }

  _render() {
    const step = STEPS[this._step];
    this._titleEl.textContent = step.title;
    this._textEl.textContent = step.text;
    this._counter.textContent = `${this._step + 1} / ${STEPS.length}`;

    this._nextBtn.textContent = this._step === STEPS.length - 1 ? 'Let\'s Go!' : 'Next';
    this._skipBtn.style.display = this._step === STEPS.length - 1 ? 'none' : '';

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
        return;
      }
    }

    this._spotlight.style.display = 'none';
    this._tooltip.style.left = '50%';
    this._tooltip.style.top = '50%';
    this._tooltip.style.transform = 'translate(-50%, -50%)';
    this._tooltip.removeAttribute('data-pos');
  }

  _positionTooltip(rect, position) {
    const tt = this._tooltip;
    const gap = 16;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    tt.style.transform = '';
    tt.setAttribute('data-pos', position);

    if (position === 'below') {
      let left = rect.left + rect.width / 2;
      left = Math.max(200, Math.min(vw - 200, left));
      tt.style.left = left + 'px';
      tt.style.top = (rect.bottom + gap) + 'px';
      tt.style.transform = 'translateX(-50%)';
    } else if (position === 'above') {
      let left = rect.left + rect.width / 2;
      left = Math.max(200, Math.min(vw - 200, left));
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
}
