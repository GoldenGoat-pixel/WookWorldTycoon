export class Economy {
  constructor() {
    this.money = 50000;
    this.reputation = 0;
    this.crowdSize = 0;

    this._moneyEl = document.getElementById('money-display');
    this._repEl = document.getElementById('reputation-display');
    this._crowdEl = document.getElementById('crowd-display');
    this.updateHUD();
  }

  canAfford(cost) {
    return this.money >= cost;
  }

  spend(amount) {
    if (this.money < amount) return false;
    this.money -= amount;
    this.updateHUD();
    return true;
  }

  earn(amount) {
    this.money += amount;
    this.updateHUD();
  }

  updateHUD() {
    if (this._moneyEl) this._moneyEl.textContent = `💰 $${this.money.toLocaleString()}`;
    if (this._repEl) this._repEl.textContent = `⭐ ${this.reputation}`;
    if (this._crowdEl) this._crowdEl.textContent = `👥 ${this.crowdSize.toLocaleString()}`;
  }

  toJSON() {
    return { money: this.money, reputation: this.reputation };
  }

  loadJSON(data) {
    if (!data) return;
    if (data.money !== undefined) this.money = data.money;
    if (data.reputation !== undefined) this.reputation = data.reputation;
    this.updateHUD();
  }
}
