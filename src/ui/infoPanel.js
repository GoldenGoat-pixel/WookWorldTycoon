import { getUpgradesForStage, getUpgradeById } from '../game/upgrades.js';
import { getAdjacencyBonuses } from '../game/adjacency.js';

const STAGE_IDS = ['medium_stage', 'main_stage', 'dj_booth', 'acoustic_tent', 'mega_stage'];

export class InfoPanel {
  constructor() {
    this.panel = document.getElementById('info-panel');
    this.nameEl = document.getElementById('info-name');
    this.bodyEl = document.getElementById('info-body');
    this.closeBtn = document.getElementById('close-info');
    this.onUpgrade = null;
    this.onStaffChange = null;
    this.crowd = null;
    this.festival = null;
    this.staff = null;
    this._currentEntry = null;
    this._refreshId = null;

    this.closeBtn.addEventListener('click', () => this.hide());
  }

  setLiveSources(crowd, festival, staff) {
    this.crowd = crowd;
    this.festival = festival;
    this.staff = staff || null;
  }

  setWorld(world) {
    this.world = world;
  }

  show(entry) {
    this._currentEntry = entry;
    this._render(entry);
    this.panel.classList.remove('hidden');
    this._startRefresh();
  }

  _render(entry) {
    const b = entry.data;
    this.nameEl.textContent = `${b.icon} ${b.name}`;
    let html = `<p class="info-desc">${b.description}</p>`;

    if (b.capacity) {
      let totalCap = b.capacity;
      for (const u of entry.upgrades) {
        const upg = getUpgradeById(u.id);
        if (upg) totalCap += upg.capacityBonus;
      }
      html += `<p class="info-stat">Festival capacity: ${totalCap}</p>`;
    }
    if (b.income) html += `<p class="info-stat">Income: $${b.income}/tick</p>`;

    if (this.crowd && this.festival && this.festival.phase === 'hosting') {
      html += this._buildLiveStats(entry);
    }

    if (this.world) {
      html += this._buildAdjacencySection(entry);
    }

    if (this.staff) {
      html += this._buildStaffSection(entry);
    }

    if (STAGE_IDS.includes(b.id)) {
      const available = getUpgradesForStage(b.id);
      const installed = entry.upgrades.map(u => u.id);

      if (installed.length > 0) {
        html += '<div class="upgrade-section"><div class="upgrade-label">Installed</div>';
        for (const uid of installed) {
          const upg = getUpgradeById(uid);
          if (upg) {
            html += `<div class="upgrade-installed">${upg.icon} ${upg.name}</div>`;
          }
        }
        html += '</div>';
      }

      const notInstalled = available.filter(u => !installed.includes(u.id));
      if (notInstalled.length > 0) {
        html += '<div class="upgrade-section"><div class="upgrade-label">Upgrades</div>';
        for (const upg of notInstalled) {
          html += `<button class="upgrade-btn" data-upgrade="${upg.id}">
            <span class="upgrade-btn-left">${upg.icon} ${upg.name}</span>
            <span class="upgrade-btn-cost">$${upg.cost.toLocaleString()}</span>
          </button>`;
        }
        html += '</div>';
      } else if (installed.length === available.length && available.length > 0) {
        html += '<div class="upgrade-section"><div class="upgrade-label upgrade-complete">Fully upgraded</div></div>';
      }
    }

    this.bodyEl.innerHTML = html;

    this.bodyEl.querySelectorAll('.upgrade-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const upgradeId = btn.dataset.upgrade;
        if (this.onUpgrade) this.onUpgrade(entry, upgradeId);
      });
    });

    const hireBtn = this.bodyEl.querySelector('.staff-hire-btn');
    const fireBtn = this.bodyEl.querySelector('.staff-fire-btn');
    if (hireBtn) {
      hireBtn.addEventListener('click', () => {
        if (this.staff && this.festival && this.festival.phase === 'planning') {
          if (this.staff.hire(entry)) {
            if (this.onStaffChange) this.onStaffChange(entry);
            this._render(entry);
          }
        }
      });
    }
    if (fireBtn) {
      fireBtn.addEventListener('click', () => {
        if (this.staff && this.festival && this.festival.phase === 'planning') {
          if (this.staff.fire(entry)) {
            if (this.onStaffChange) this.onStaffChange(entry);
            this._render(entry);
          }
        }
      });
    }
  }

  _buildStaffSection(entry) {
    const type = this.staff.getStaffTypeFor(entry.data.id);
    if (!type) return '';
    const def = this.staff.getStaffDef(type);
    const count = this.staff.getCount(entry);
    const max = this.staff.getMaxStaff();
    const isPlanning = this.festival && this.festival.phase === 'planning';

    let html = '<div class="staff-section">';
    html += `<div class="staff-header">${def.icon} Staff: ${count}/${max}</div>`;
    html += `<div class="staff-type">${def.name} — $${def.salary}/festival</div>`;
    html += `<div class="staff-effect">${def.effect}</div>`;

    if (isPlanning) {
      html += '<div class="staff-controls">';
      html += `<button class="staff-fire-btn"${count <= 0 ? ' disabled' : ''}>- Fire</button>`;
      html += `<button class="staff-hire-btn"${count >= max ? ' disabled' : ''}>+ Hire</button>`;
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  _buildLiveStats(entry) {
    const stats = this.crowd.getBuildingStats(entry);
    const income = this.festival.getBuildingIncome(entry);
    let html = '<div class="info-live-stats">';
    html += `<div class="info-live-row"><span class="info-live-icon">👥</span> ${stats.users}/${stats.maxSlots} using</div>`;
    if (stats.queueLength > 0) {
      html += `<div class="info-live-row"><span class="info-live-icon">🕐</span> ${stats.queueLength} in queue</div>`;
    }
    if (income > 0) {
      html += `<div class="info-live-row"><span class="info-live-icon">💰</span> $${income.toLocaleString()} earned</div>`;
    }
    html += '</div>';
    return html;
  }

  _buildAdjacencySection(entry) {
    const bonuses = getAdjacencyBonuses(entry, this.world.placed);
    if (bonuses.length === 0) return '';
    let html = '<div class="adjacency-section">';
    for (const b of bonuses) {
      const parts = [];
      if (b.incomeMult) parts.push(`+${Math.round((b.incomeMult - 1) * 100)}% income`);
      if (b.satisfactionBonus > 0) parts.push(`+${b.satisfactionBonus} satisfaction`);
      if (b.satisfactionBonus < 0) parts.push(`${b.satisfactionBonus} satisfaction`);
      const cls = b.penalty ? 'adj-penalty' : 'adj-bonus';
      html += `<div class="adj-row ${cls}">${b.icon} ${b.label}: ${parts.join(', ')}</div>`;
    }
    html += '</div>';
    return html;
  }

  _startRefresh() {
    this._stopRefresh();
    this._refreshId = setInterval(() => {
      if (!this._currentEntry || !this.crowd || !this.festival) return;
      if (this.festival.phase !== 'hosting') return;
      const liveEl = this.bodyEl.querySelector('.info-live-stats');
      if (liveEl) {
        const stats = this.crowd.getBuildingStats(this._currentEntry);
        const income = this.festival.getBuildingIncome(this._currentEntry);
        let html = `<div class="info-live-row"><span class="info-live-icon">👥</span> ${stats.users}/${stats.maxSlots} using</div>`;
        if (stats.queueLength > 0) {
          html += `<div class="info-live-row"><span class="info-live-icon">🕐</span> ${stats.queueLength} in queue</div>`;
        }
        if (income > 0) {
          html += `<div class="info-live-row"><span class="info-live-icon">💰</span> $${income.toLocaleString()} earned</div>`;
        }
        liveEl.innerHTML = html;
      } else {
        this._render(this._currentEntry);
      }
    }, 1000);
  }

  _stopRefresh() {
    if (this._refreshId) {
      clearInterval(this._refreshId);
      this._refreshId = null;
    }
  }

  hide() {
    this.panel.classList.add('hidden');
    this._currentEntry = null;
    this._stopRefresh();
  }
}
