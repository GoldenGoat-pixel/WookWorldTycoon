import { getUpgradesForStage, getUpgradeById } from '../game/upgrades.js';

const STAGE_IDS = ['medium_stage', 'main_stage', 'dj_booth', 'acoustic_tent', 'mega_stage'];

export class InfoPanel {
  constructor() {
    this.panel = document.getElementById('info-panel');
    this.nameEl = document.getElementById('info-name');
    this.bodyEl = document.getElementById('info-body');
    this.closeBtn = document.getElementById('close-info');
    this.onUpgrade = null;

    this.closeBtn.addEventListener('click', () => this.hide());
  }

  show(entry) {
    const b = entry.data;
    this.nameEl.textContent = `${b.icon} ${b.name}`;
    let html = `<p class="info-desc">${b.description}</p>`;
    if (b.capacity) {
      let totalCap = b.capacity;
      for (const u of entry.upgrades) {
        const upg = getUpgradeById(u.id);
        if (upg) totalCap += upg.capacityBonus;
      }
      html += `<p class="info-stat">Capacity: ${totalCap}</p>`;
    }
    if (b.income) html += `<p class="info-stat">Income: $${b.income}/tick</p>`;

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
    this.panel.classList.remove('hidden');

    this.bodyEl.querySelectorAll('.upgrade-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const upgradeId = btn.dataset.upgrade;
        if (this.onUpgrade) this.onUpgrade(entry, upgradeId);
      });
    });
  }

  hide() {
    this.panel.classList.add('hidden');
  }
}
