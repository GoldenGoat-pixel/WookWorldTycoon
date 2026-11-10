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

export class EventManager {
  constructor() {
    this.active = null;
    this.timer = 0;
    this.cooldown = 0;
    this.history = [];
    this.onEvent = null;
    this.onEventEnd = null;
  }

  update(dt) {
    if (this.cooldown > 0) {
      this.cooldown -= dt;
    }

    if (this.active) {
      this.timer -= dt;
      if (this.timer <= 0) {
        const ended = this.active;
        this.active = null;
        this.cooldown = 15 + Math.random() * 20;
        if (this.onEventEnd) this.onEventEnd(ended);
      }
      return;
    }

    if (this.cooldown <= 0 && Math.random() < dt * 0.02) {
      this._triggerRandom();
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

  getActiveSatisfactionRate() {
    return this.active?.effects?.satisfactionRate || 0;
  }

  getActiveSatisfactionFlat() {
    return this.active?.effects?.satisfactionFlat || 0;
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
  }
}
