const PREP_ACTIONS = [
  {
    id: 'flyer_campaign',
    name: 'Flyer Campaign',
    icon: '📰',
    cost: 500,
    cooldownSeasons: 0,
    desc: 'Distribute flyers around town.',
    effect: '+15% attendance this festival',
    apply(ctx) { ctx.attendanceBonus += 0.15; },
    requiredRep: 0
  },
  {
    id: 'social_media_blitz',
    name: 'Social Media Blitz',
    icon: '📱',
    cost: 1200,
    cooldownSeasons: 0,
    desc: 'Run targeted ads and influencer posts.',
    effect: '+25% attendance this festival',
    apply(ctx) { ctx.attendanceBonus += 0.25; },
    requiredRep: 10
  },
  {
    id: 'vendor_scouting',
    name: 'Scout Vendors',
    icon: '🔍',
    cost: 800,
    cooldownSeasons: 2,
    desc: 'Find better food and drink suppliers.',
    effect: '+30% vendor income this festival',
    apply(ctx) { ctx.vendorIncomeBonus += 0.3; },
    requiredRep: 0
  },
  {
    id: 'staff_training',
    name: 'Staff Training',
    icon: '📋',
    cost: 1000,
    cooldownSeasons: 3,
    desc: 'Run a workshop for all hired staff.',
    effect: '+50% staff service speed this festival',
    apply(ctx) { ctx.staffSpeedBonus += 0.5; },
    requiredRep: 5
  },
  {
    id: 'sound_check',
    name: 'Sound Check',
    icon: '🔊',
    cost: 600,
    cooldownSeasons: 0,
    desc: 'Hire an audio engineer for pre-festival tuning.',
    effect: '+8 satisfaction from stages',
    apply(ctx) { ctx.stageSatisfactionBonus += 8; },
    requiredRep: 0
  },
  {
    id: 'safety_inspection',
    name: 'Safety Inspection',
    icon: '🦺',
    cost: 700,
    cooldownSeasons: 2,
    desc: 'Pre-inspect all facilities and fix hazards.',
    effect: 'Prevents negative events for first day',
    apply(ctx) { ctx.eventImmunityDays = 1; },
    requiredRep: 10
  },
  {
    id: 'weather_forecast',
    name: 'Weather Forecast',
    icon: '🌤️',
    cost: 300,
    cooldownSeasons: 0,
    desc: 'Check the forecast and prepare for bad weather.',
    effect: 'Halves weather event penalties',
    apply(ctx) { ctx.weatherResistance = 0.5; },
    requiredRep: 0
  },
  {
    id: 'vip_outreach',
    name: 'VIP Outreach',
    icon: '💎',
    cost: 2000,
    cooldownSeasons: 2,
    desc: 'Send personal invites to high-rollers.',
    effect: 'Double VIP spawn rate, VIPs spend +50%',
    apply(ctx) { ctx.vipSpawnMult = 2; ctx.vipSpendBonus += 0.5; },
    requiredRep: 20
  },
  {
    id: 'community_cleanup',
    name: 'Community Cleanup',
    icon: '🧹',
    cost: 400,
    cooldownSeasons: 1,
    desc: 'Organize volunteers to clean the grounds.',
    effect: 'Start with zero litter, slower litter spawn',
    apply(ctx) { ctx.litterSpawnMult = 0.5; },
    requiredRep: 0
  },
  {
    id: 'headline_act',
    name: 'Book Headline Act',
    icon: '🌟',
    cost: 5000,
    cooldownSeasons: 3,
    desc: 'Sign a famous band for the festival.',
    effect: '+40% attendance, +15 satisfaction',
    apply(ctx) { ctx.attendanceBonus += 0.4; ctx.stageSatisfactionBonus += 15; },
    requiredRep: 35
  },
  {
    id: 'sponsor_deal',
    name: 'Sponsor Deal',
    icon: '🤝',
    cost: 0,
    cooldownSeasons: 4,
    desc: 'Sign a corporate sponsor for the festival.',
    effect: 'Earn $3,000 upfront, -5 satisfaction (ads everywhere)',
    apply(ctx) { ctx.sponsorCash = 3000; ctx.stageSatisfactionBonus -= 5; },
    requiredRep: 15
  }
];

export class PrepManager {
  constructor() {
    this.purchased = [];
    this._cooldowns = new Map();
    this._bonuses = null;
  }

  getAvailableActions(reputation, money) {
    return PREP_ACTIONS.filter(a => {
      if (a.requiredRep > reputation) return false;
      const cd = this._cooldowns.get(a.id) || 0;
      if (cd > 0) return false;
      return true;
    }).map(a => ({
      ...a,
      affordable: money >= a.cost,
      alreadyBought: this.purchased.includes(a.id)
    }));
  }

  purchase(actionId, economy) {
    const action = PREP_ACTIONS.find(a => a.id === actionId);
    if (!action) return null;
    if (economy.money < action.cost) return null;
    if (this.purchased.includes(actionId)) return null;
    const cd = this._cooldowns.get(actionId) || 0;
    if (cd > 0) return null;

    economy.spend(action.cost);
    this.purchased.push(actionId);
    return action;
  }

  getBonuses() {
    if (this._bonuses) return this._bonuses;
    const ctx = {
      attendanceBonus: 0,
      vendorIncomeBonus: 0,
      staffSpeedBonus: 0,
      stageSatisfactionBonus: 0,
      eventImmunityDays: 0,
      weatherResistance: 0,
      vipSpawnMult: 1,
      vipSpendBonus: 0,
      litterSpawnMult: 1,
      sponsorCash: 0
    };
    for (const id of this.purchased) {
      const action = PREP_ACTIONS.find(a => a.id === id);
      if (action) action.apply(ctx);
    }
    this._bonuses = ctx;
    return ctx;
  }

  applyPreFestival(economy) {
    const b = this.getBonuses();
    if (b.sponsorCash > 0) {
      economy.earn(b.sponsorCash);
    }
  }

  advanceSeason() {
    for (const id of this.purchased) {
      const action = PREP_ACTIONS.find(a => a.id === id);
      if (action && action.cooldownSeasons > 0) {
        this._cooldowns.set(id, action.cooldownSeasons);
      }
    }
    this.purchased = [];
    this._bonuses = null;

    for (const [id, cd] of this._cooldowns) {
      if (cd <= 1) this._cooldowns.delete(id);
      else this._cooldowns.set(id, cd - 1);
    }
  }

  toJSON() {
    const cooldowns = {};
    for (const [id, cd] of this._cooldowns) {
      cooldowns[id] = cd;
    }
    return { purchased: this.purchased, cooldowns };
  }

  loadJSON(data) {
    if (!data) return;
    this.purchased = data.purchased || [];
    this._cooldowns.clear();
    if (data.cooldowns) {
      for (const [id, cd] of Object.entries(data.cooldowns)) {
        this._cooldowns.set(id, cd);
      }
    }
    this._bonuses = null;
  }
}
