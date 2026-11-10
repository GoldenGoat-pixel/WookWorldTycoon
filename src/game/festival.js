import { getUpgradeById } from './upgrades.js';

const STAGE_IDS = ['medium_stage', 'main_stage', 'dj_booth', 'acoustic_tent', 'mega_stage'];
const CAMPING_IDS = ['tent_small', 'tent_large', 'rv_spot', 'glamping_tent', 'hammock_grove'];
const DECOR_IDS = ['tree_lights', 'banner', 'art_sculpture', 'ferris_wheel', 'fountain', 'string_lights'];

export class FestivalManager {
  constructor(economy, world, dayNight) {
    this.economy = economy;
    this.world = world;
    this.dayNight = dayNight;
    this.phase = 'planning';
    this.season = 1;
    this.ticketPrice = 50;
    this.festivalTimeElapsed = 0;
    this.festivalDaysTotal = 3;
    this.festivalAttendance = 0;
    this.ticketRevenue = 0;
    this.vendorRevenue = 0;
    this.expenses = 0;
    this.results = null;
    this.totalFestivalsHosted = 0;
    this.totalRevenue = 0;
    this.bestAttendance = 0;
    this.bestSatisfaction = 0;
    this.onPhaseChange = null;
  }

  get dayDuration() {
    return 1.0 / this.dayNight.speed;
  }

  get currentFestivalDay() {
    return Math.min(this.festivalDaysTotal, Math.floor(this.festivalTimeElapsed / this.dayDuration) + 1);
  }

  canHostFestival() {
    return this.world.placed.some(e => STAGE_IDS.includes(e.data.id));
  }

  getMaxCapacity() {
    let cap = 0;
    for (const e of this.world.placed) {
      if (e.data.capacity) cap += e.data.capacity;
      for (const u of e.upgrades) {
        const upg = getUpgradeById(u.id);
        if (upg) cap += upg.capacityBonus;
      }
    }
    return cap;
  }

  calculateExpectedAttendance() {
    const cap = this.getMaxCapacity();
    const repMult = 0.5 + Math.min(this.economy.reputation, 100) / 100;
    const priceMult = Math.max(0.2, 1.4 - this.ticketPrice / 150);
    return Math.floor(cap * repMult * priceMult);
  }

  calculateExpenses() {
    let cost = 0;
    let totalValue = 0;
    for (const e of this.world.placed) {
      cost += 50;
      totalValue += e.data.cost;
    }
    return cost + Math.floor(totalValue * 0.02);
  }

  startFestival() {
    if (this.phase !== 'planning' || !this.canHostFestival()) return false;
    this.phase = 'hosting';
    this.festivalTimeElapsed = 0;
    this.festivalAttendance = this.calculateExpectedAttendance();
    this.ticketRevenue = this.festivalAttendance * this.ticketPrice;
    this.vendorRevenue = 0;
    this.expenses = this.calculateExpenses();
    this.economy.money += this.ticketRevenue - this.expenses;
    this.economy.crowdSize = this.festivalAttendance;
    this.economy.updateHUD();
    this.dayNight.unlockCycle();
    if (this.onPhaseChange) this.onPhaseChange('hosting');
    return true;
  }

  vendorTick() {
    if (this.phase !== 'hosting') return 0;
    let income = 0;
    for (const e of this.world.placed) {
      switch (e.data.id) {
        case 'food_tent': income += 5; break;
        case 'bar': income += 12; break;
        case 'merch_stand': income += 8; break;
        case 'vip_lounge': income += 30; break;
        case 'rv_spot': income += 3; break;
        case 'glamping_tent': income += 6; break;
      }
    }
    const cap = this.getMaxCapacity();
    if (cap > 0) income = Math.floor(income * Math.min(1, this.festivalAttendance / cap));
    this.vendorRevenue += income;
    this.economy.earn(income);
    return income;
  }

  calculateSatisfaction() {
    const att = this.festivalAttendance;
    if (att === 0) return 0;
    let sat = 50;
    let food = 0, bar = 0, restroom = 0, medical = 0;
    const stageTypes = new Set();
    let camping = 0, decor = 0;
    for (const e of this.world.placed) {
      const id = e.data.id;
      if (id === 'food_tent') food++;
      else if (id === 'bar') bar++;
      else if (id === 'toilets') restroom++;
      else if (id === 'med_tent') medical++;
      if (STAGE_IDS.includes(id)) stageTypes.add(id);
      if (CAMPING_IDS.includes(id)) camping++;
      if (DECOR_IDS.includes(id)) decor++;
    }
    sat += Math.min(1, (food + bar) / Math.max(1, Math.ceil(att / 100))) * 15;
    sat += Math.min(1, restroom / Math.max(1, Math.ceil(att / 150))) * 10;
    if (medical > 0) sat += 5;
    sat += Math.min(15, stageTypes.size * 5);
    sat += Math.min(1, camping / Math.max(1, Math.ceil(att / 50))) * 10;
    sat += Math.min(10, decor * 2);
    let upgradeSat = 0;
    for (const e of this.world.placed) {
      for (const u of e.upgrades) {
        const upg = getUpgradeById(u.id);
        if (upg) upgradeSat += upg.satisfaction;
      }
    }
    sat += Math.min(25, upgradeSat);
    if (this.ticketPrice > 100) sat -= (this.ticketPrice - 100) * 0.1;
    return Math.max(0, Math.min(100, Math.round(sat)));
  }

  update(dt) {
    if (this.phase !== 'hosting') return;
    this.festivalTimeElapsed += dt;
    if (this.festivalTimeElapsed >= this.festivalDaysTotal * this.dayDuration) {
      this._endFestival();
    }
  }

  _endFestival() {
    const satisfaction = this.calculateSatisfaction();
    const netProfit = this.ticketRevenue + this.vendorRevenue - this.expenses;
    const repEarned = Math.floor(satisfaction * 0.3 + this.festivalAttendance * 0.01);
    this.economy.reputation += repEarned;
    this.totalFestivalsHosted++;
    this.totalRevenue += Math.max(0, netProfit);
    if (this.festivalAttendance > this.bestAttendance) this.bestAttendance = this.festivalAttendance;
    if (satisfaction > this.bestSatisfaction) this.bestSatisfaction = satisfaction;
    this.results = {
      season: this.season,
      attendance: this.festivalAttendance,
      maxCapacity: this.getMaxCapacity(),
      ticketPrice: this.ticketPrice,
      ticketRevenue: this.ticketRevenue,
      vendorRevenue: this.vendorRevenue,
      expenses: this.expenses,
      netProfit,
      satisfaction,
      reputationEarned: repEarned,
      totalReputation: this.economy.reputation
    };
    this.phase = 'results';
    this.dayNight.paused = true;
    this.dayNight.lockToDay();
    if (this.onPhaseChange) this.onPhaseChange('results');
  }

  continueToPlanning() {
    this.phase = 'planning';
    this.season++;
    this.results = null;
    this.economy.crowdSize = 0;
    this.dayNight.paused = false;
    this.dayNight.lockToDay();
    this.economy.updateHUD();
    if (this.onPhaseChange) this.onPhaseChange('planning');
  }

  getGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }

  toJSON() {
    return {
      season: this.season,
      ticketPrice: this.ticketPrice,
      totalFestivalsHosted: this.totalFestivalsHosted,
      totalRevenue: this.totalRevenue,
      bestAttendance: this.bestAttendance,
      bestSatisfaction: this.bestSatisfaction
    };
  }

  loadJSON(d) {
    if (!d) return;
    this.season = d.season || 1;
    this.ticketPrice = d.ticketPrice || 50;
    this.totalFestivalsHosted = d.totalFestivalsHosted || 0;
    this.totalRevenue = d.totalRevenue || 0;
    this.bestAttendance = d.bestAttendance || 0;
    this.bestSatisfaction = d.bestSatisfaction || 0;
    this.phase = 'planning';
  }
}
