const ADJACENCY_RULES = [
  {
    id: 'bar_stage',
    source: ['bar'],
    neighbor: ['medium_stage', 'main_stage', 'dj_booth', 'acoustic_tent', 'mega_stage'],
    icon: '🍺🎵',
    label: 'Near stage',
    incomeMult: 1.5,
    satisfactionBonus: 2
  },
  {
    id: 'food_camping',
    source: ['food_tent'],
    neighbor: ['tent_small', 'tent_large', 'glamping_tent', 'hammock_grove', 'rv_spot'],
    icon: '🍔⛺',
    label: 'Near camping',
    incomeMult: 1.3,
    satisfactionBonus: 1
  },
  {
    id: 'merch_stage',
    source: ['merch_stand'],
    neighbor: ['medium_stage', 'main_stage', 'dj_booth', 'acoustic_tent', 'mega_stage'],
    icon: '👕🎵',
    label: 'Near stage',
    incomeMult: 1.4,
    satisfactionBonus: 1
  },
  {
    id: 'med_stage',
    source: ['med_tent'],
    neighbor: ['medium_stage', 'main_stage', 'dj_booth', 'mega_stage'],
    icon: '🏥🎵',
    label: 'Near stage',
    satisfactionBonus: 3
  },
  {
    id: 'vip_stage',
    source: ['vip_lounge'],
    neighbor: ['main_stage', 'mega_stage'],
    icon: '🥂🎸',
    label: 'Near main stage',
    incomeMult: 1.6,
    satisfactionBonus: 3
  },
  {
    id: 'toilets_food',
    source: ['toilets'],
    neighbor: ['food_tent', 'bar'],
    icon: '🚻🍔',
    label: 'Near food',
    satisfactionBonus: -2,
    penalty: true
  },
  {
    id: 'campfire_camping',
    source: ['campfire'],
    neighbor: ['tent_small', 'tent_large', 'glamping_tent', 'hammock_grove'],
    icon: '🔥⛺',
    label: 'Near camping',
    satisfactionBonus: 2
  },
  {
    id: 'shower_camping',
    source: ['shower_block'],
    neighbor: ['tent_small', 'tent_large', 'glamping_tent', 'rv_spot'],
    icon: '🚿⛺',
    label: 'Near camping',
    satisfactionBonus: 3
  },
  {
    id: 'fountain_stage',
    source: ['fountain'],
    neighbor: ['medium_stage', 'main_stage', 'dj_booth', 'acoustic_tent', 'mega_stage'],
    icon: '⛲🎵',
    label: 'Near stage',
    satisfactionBonus: 2
  }
];

const ADJACENCY_RANGE = 8;

function dist2D(a, b) {
  const dx = a.gridX - b.gridX;
  const dz = a.gridZ - b.gridZ;
  return Math.sqrt(dx * dx + dz * dz);
}

export function getAdjacencyBonuses(entry, placed) {
  const bonuses = [];
  for (const rule of ADJACENCY_RULES) {
    if (!rule.source.includes(entry.data.id)) continue;
    const hasNeighbor = placed.some(other =>
      other !== entry &&
      rule.neighbor.includes(other.data.id) &&
      dist2D(entry, other) <= ADJACENCY_RANGE
    );
    if (hasNeighbor) {
      bonuses.push(rule);
    }
  }
  return bonuses;
}

export function getAdjacencyIncomeMult(entry, placed) {
  const bonuses = getAdjacencyBonuses(entry, placed);
  let mult = 1;
  for (const b of bonuses) {
    if (b.incomeMult) mult *= b.incomeMult;
  }
  return mult;
}

export function getTotalAdjacencySatisfaction(placed) {
  let total = 0;
  for (const entry of placed) {
    const bonuses = getAdjacencyBonuses(entry, placed);
    for (const b of bonuses) {
      if (b.satisfactionBonus) total += b.satisfactionBonus;
    }
  }
  return total;
}
