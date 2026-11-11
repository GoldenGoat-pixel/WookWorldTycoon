import { CATEGORIES } from '../game/buildings.js';
import { getSeasonCostScale } from '../game/tiers.js';

export class BuildMenu {
  constructor(onSelect, economy) {
    this.onSelect = onSelect;
    this.economy = economy;
    this.festival = null;
    this.selectedItem = null;
    this.activeCategory = 'stages';

    this.panel = document.getElementById('build-menu');
    this.itemsContainer = document.getElementById('build-items');
    this.closeBtn = document.getElementById('close-build');

    this.closeBtn.addEventListener('click', () => this.hide());

    document.querySelectorAll('.cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCategory = btn.dataset.category;
        this._renderItems();
      });
    });

    this._renderItems();
  }

  _renderItems() {
    const cat = CATEGORIES[this.activeCategory];
    if (!cat) return;

    this.itemsContainer.innerHTML = '';
    for (const item of cat.items) {
      const reqRep = item.requiredRep || 0;
      const locked = this.economy && this.economy.reputation < reqRep;
      const el = document.createElement('div');
      el.className = 'build-item' + (this.selectedItem === item ? ' selected' : '') + (locked ? ' locked' : '');

      if (locked) {
        el.innerHTML = `
          <div class="item-icon">${item.icon}</div>
          <div class="item-name">${item.name}</div>
          <div class="item-lock">🔒 ${reqRep} ⭐ rep</div>
        `;
        el.addEventListener('click', () => {});
      } else {
        const season = this.festival ? this.festival.season : 1;
        const scaled = Math.floor(item.cost * getSeasonCostScale(season));
        const costLabel = scaled > item.cost ? `$${scaled.toLocaleString()}` : `$${item.cost.toLocaleString()}`;
        el.innerHTML = `
          <div class="item-icon">${item.icon}</div>
          <div class="item-name">${item.name}</div>
          <div class="item-cost">${costLabel}</div>
        `;
        el.addEventListener('click', () => {
          this.selectedItem = item;
          this._renderItems();
          this.onSelect(item);
        });
      }
      this.itemsContainer.appendChild(el);
    }
  }

  refresh() {
    this._renderItems();
  }

  show() {
    this.panel.classList.remove('hidden');
  }

  hide() {
    this.panel.classList.add('hidden');
  }

  toggle() {
    this.panel.classList.toggle('hidden');
  }

  get isVisible() {
    return !this.panel.classList.contains('hidden');
  }

  clearSelection() {
    this.selectedItem = null;
    this._renderItems();
  }
}
