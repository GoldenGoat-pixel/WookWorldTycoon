const EVENTS = [
  {
    id: 'rain',
    name: 'Rainstorm',
    icon: '🌧️',
    message: 'A rainstorm hits the festival!',
    weight: 3,
    duration: 30,
    effects: { satisfactionRate: -1.5, needDecayMult: { energy: 1.5, thirst: 0.7 } },
    tip: 'Build more camping and sheltered areas'
  },
  {
    id: 'heatwave',
    name: 'Heatwave',
    icon: '🔥',
    message: 'A heatwave rolls in! Drink sales are booming.',
    weight: 3,
    duration: 35,
    effects: { satisfactionRate: -0.5, needDecayMult: { thirst: 2.0, energy: 1.3 }, incomeMult: { bar: 2 } },
    tip: 'Bars and fountains are extra popular'
  },
  {
    id: 'surprise_guest',
    name: 'Surprise Guest',
    icon: '🌟',
    message: 'A surprise guest artist takes the stage!',
    weight: 2,
    duration: 25,
    effects: { satisfactionRate: 3, needDecayMult: { fun: 0.5 } },
    tip: 'The crowd loves it!'
  },
  {
    id: 'food_rush',
    name: 'Dinner Rush',
    icon: '🍔',
    message: 'Everyone is hungry at once!',
    weight: 2,
    duration: 20,
    effects: { needDecayMult: { hunger: 2.5 }, incomeMult: { food_tent: 1.5 } },
    tip: 'Food tents are swamped'
  },
  {
    id: 'power_outage',
    name: 'Power Outage',
    icon: '⚡',
    message: 'A breaker trips! Stages go dark briefly.',
    weight: 1,
    duration: 15,
    effects: { satisfactionRate: -2, needDecayMult: { fun: 2.0 } },
    tip: 'Get that fixed quick!'
  },
  {
    id: 'golden_hour',
    name: 'Golden Hour',
    icon: '🌅',
    message: 'A beautiful sunset fills the sky.',
    weight: 2,
    duration: 20,
    effects: { satisfactionRate: 2 },
    tip: 'Everyone is vibing'
  },
  {
    id: 'lost_child',
    name: 'Lost Child Found',
    icon: '👶',
    message: 'Security reunites a lost kid with their family!',
    weight: 1,
    duration: 0,
    effects: { satisfactionFlat: 3 },
    tip: 'Good thing you have security'
  },
  {
    id: 'vip_arrival',
    name: 'VIP Arrival',
    icon: '🎩',
    message: 'A celebrity just showed up!',
    weight: 1,
    duration: 25,
    effects: { satisfactionRate: 1.5, incomeMult: { merch_stand: 2, vip_lounge: 2 } },
    tip: 'Merch and VIP sales spike'
  },
  {
    id: 'mud',
    name: 'Mud Pit',
    icon: '💩',
    message: 'The grounds are getting muddy.',
    weight: 2,
    duration: 40,
    effects: { satisfactionRate: -0.8, speedMult: 0.6 },
    tip: 'Paved paths help a lot'
  },
  {
    id: 'wind',
    name: 'Strong Winds',
    icon: '💨',
    message: 'High winds are rattling the tents!',
    weight: 2,
    duration: 20,
    effects: { satisfactionRate: -1.0, needDecayMult: { energy: 1.4 } },
    tip: 'Smaller tents take a beating'
  }
];

const CHOICE_EVENTS = [
  {
    id: 'fight_breaks_out',
    name: 'Fight!',
    icon: '👊',
    message: 'A fight just broke out near the bar!',
    weight: 3,
    choices: [
      {
        label: '🚔 Send Security',
        desc: 'Guards handle it, costs $500',
        cost: 500,
        effects: { satisfactionFlat: 2 },
        result: 'Security broke it up. Crowd feels safe.'
      },
      {
        label: '🤷 Ignore It',
        desc: 'Save money, risk crowd mood',
        cost: 0,
        effects: { satisfactionRate: -2, duration: 15 },
        result: 'The brawl rattled people nearby.'
      }
    ]
  },
  {
    id: 'food_poisoning',
    name: 'Bad Batch',
    icon: '🤢',
    message: 'Reports of food poisoning from a vendor!',
    weight: 2,
    choices: [
      {
        label: '🚫 Shut Vendor Down',
        desc: 'Lose food income, keep trust',
        cost: 0,
        effects: { incomeMult: { food_tent: 0 }, duration: 20 },
        result: 'Vendor shut down. Crowd appreciates the caution.'
      },
      {
        label: '🤫 Keep It Quiet',
        desc: 'Keep profits, risk satisfaction',
        cost: 0,
        effects: { satisfactionRate: -2.5, duration: 25 },
        result: 'Word spreads... people are not happy.'
      }
    ]
  },
  {
    id: 'noise_complaint',
    name: 'Noise Complaint',
    icon: '📢',
    message: 'Neighbors are complaining about the noise!',
    weight: 2,
    choices: [
      {
        label: '🔇 Turn It Down',
        desc: 'Less fun, avoids $2,000 fine',
        cost: 0,
        effects: { needDecayMult: { fun: 1.5 }, duration: 20 },
        result: 'Volume lowered. Crowd misses the bass.'
      },
      {
        label: '🔊 Crank It Up',
        desc: 'Big mood boost, but pay the fine',
        cost: 2000,
        effects: { satisfactionRate: 2.5, needDecayMult: { fun: 0.4 }, duration: 20 },
        result: 'BASS DROP! The crowd goes wild!'
      }
    ]
  },
  {
    id: 'vendor_bribe',
    name: 'Shady Vendor',
    icon: '💰',
    message: 'A vendor wants to sell "premium" goods for a cut.',
    weight: 2,
    choices: [
      {
        label: '🤝 Take the Deal',
        desc: '+$3,000 now, risky for reputation',
        cost: -3000,
        effects: { satisfactionRate: -1, duration: 15 },
        result: 'Pocketed some cash, but quality dipped.'
      },
      {
        label: '👋 Turn Them Away',
        desc: 'Keep it legit, small mood boost',
        cost: 0,
        effects: { satisfactionFlat: 3 },
        result: 'Integrity intact. The crowd notices quality.'
      }
    ]
  },
  {
    id: 'medical_emergency',
    name: 'Medical Emergency',
    icon: '🚑',
    message: 'Someone collapsed near the main stage!',
    weight: 2,
    choices: [
      {
        label: '🏥 Call Ambulance',
        desc: 'Costs $1,500, shows you care',
        cost: 1500,
        effects: { satisfactionFlat: 5 },
        result: 'Quick response! Everyone feels safer.'
      },
      {
        label: '🩹 Use Med Tent',
        desc: 'Free if you have one, less impressive',
        cost: 0,
        effects: { satisfactionFlat: 1 },
        result: 'Med tent handled it. Quietly resolved.'
      }
    ]
  },
  {
    id: 'rival_festival',
    name: 'Rival Festival',
    icon: '🎪',
    message: 'A rival festival is advertising nearby!',
    weight: 1,
    choices: [
      {
        label: '📣 Run Promos',
        desc: 'Spend $2,000 to keep your crowd',
        cost: 2000,
        effects: { satisfactionRate: 1.5, duration: 25 },
        result: 'Great promo! Crowd loyalty boosted.'
      },
      {
        label: '😤 Ignore Them',
        desc: 'Save money, some people leave early',
        cost: 0,
        effects: { satisfactionRate: -1.5, duration: 25 },
        result: 'Some attendees are checking their phones...'
      }
    ]
  },
  {
    id: 'porta_potty_overflow',
    name: 'Overflow!',
    icon: '🚽',
    message: 'The restrooms are... overflowing.',
    weight: 2,
    choices: [
      {
        label: '🧹 Emergency Cleanup',
        desc: 'Costs $800, quick fix',
        cost: 800,
        effects: { satisfactionFlat: 1 },
        result: 'Cleaned up fast. Crisis averted.'
      },
      {
        label: '🚧 Rope It Off',
        desc: 'Free, but bladder needs spike',
        cost: 0,
        effects: { needDecayMult: { bladder: 2.5 }, satisfactionRate: -1.5, duration: 20 },
        result: 'Restrooms blocked off. Lines are brutal.'
      }
    ]
  }
];

export class EventManager {
  constructor() {
    this.active = null;
    this.timer = 0;
    this.cooldown = 0;
    this.history = [];
    this.onEvent = null;
    this.onEventEnd = null;
    this.onChoiceEvent = null;
    this.pendingChoice = null;
    this._choiceEffects = null;
  }

  update(dt) {
    if (this.pendingChoice) return;

    if (this.cooldown > 0) {
      this.cooldown -= dt;
    }

    if (this.active) {
      this.timer -= dt;
      if (this.timer <= 0) {
        const ended = this.active;
        this.active = null;
        this._choiceEffects = null;
        this.cooldown = 15 + Math.random() * 20;
        if (this.onEventEnd) this.onEventEnd(ended);
      }
      return;
    }

    if (this.cooldown <= 0 && Math.random() < dt * 0.02) {
      if (Math.random() < 0.35) {
        this._triggerChoice();
      } else {
        this._triggerRandom();
      }
    }
  }

  _triggerRandom() {
    const totalWeight = EVENTS.reduce((s, e) => s + e.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const evt of EVENTS) {
      roll -= evt.weight;
      if (roll <= 0) {
        this.active = evt;
        this.timer = evt.duration;
        this.history.push(evt.id);
        if (this.onEvent) this.onEvent(evt);
        return;
      }
    }
  }

  _triggerChoice() {
    const totalWeight = CHOICE_EVENTS.reduce((s, e) => s + e.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const evt of CHOICE_EVENTS) {
      roll -= evt.weight;
      if (roll <= 0) {
        this.pendingChoice = evt;
        this.history.push(evt.id);
        if (this.onChoiceEvent) this.onChoiceEvent(evt);
        return;
      }
    }
  }

  resolveChoice(choiceIdx, economy) {
    if (!this.pendingChoice) return null;
    const evt = this.pendingChoice;
    const choice = evt.choices[choiceIdx];
    if (!choice) return null;

    if (choice.cost > 0 && economy) {
      economy.spend(choice.cost);
    } else if (choice.cost < 0 && economy) {
      economy.earn(-choice.cost);
    }

    this.pendingChoice = null;

    if (choice.effects.duration) {
      this.active = {
        id: evt.id + '_result',
        name: evt.name,
        icon: evt.icon,
        message: choice.result,
        effects: choice.effects,
        tip: choice.result
      };
      this.timer = choice.effects.duration;
      this._choiceEffects = choice.effects;
    } else if (choice.effects.satisfactionFlat) {
      this._choiceEffects = choice.effects;
    }

    return choice;
  }

  getActiveSatisfactionRate() {
    return this.active?.effects?.satisfactionRate || 0;
  }

  getActiveSatisfactionFlat() {
    const base = this.active?.effects?.satisfactionFlat || 0;
    const choice = this._choiceEffects?.satisfactionFlat || 0;
    if (this.active) return base;
    return choice;
  }

  getActiveNeedDecayMult(need) {
    return this.active?.effects?.needDecayMult?.[need] || 1;
  }

  getActiveIncomeMult(buildingId) {
    return this.active?.effects?.incomeMult?.[buildingId] || 1;
  }

  getActiveSpeedMult() {
    return this.active?.effects?.speedMult || 1;
  }

  reset() {
    this.active = null;
    this.timer = 0;
    this.cooldown = 20 + Math.random() * 15;
    this.history = [];
    this.pendingChoice = null;
    this._choiceEffects = null;
  }
}
