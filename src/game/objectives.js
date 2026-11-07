const STAGE_IDS = ['small_stage', 'main_stage', 'dj_booth', 'acoustic_tent', 'mega_stage'];
const CAMPING_IDS = ['tent_small', 'tent_large', 'rv_spot', 'glamping_tent', 'hammock_grove', 'campfire', 'shower_block'];
const DECOR_IDS = ['tree_lights', 'banner', 'art_sculpture', 'ferris_wheel', 'fountain', 'string_lights'];

export const OBJECTIVES = [
  { id: 'first_festival', name: 'First Festival', desc: 'Host your first festival', reward: 5000, icon: '🎪' },
  { id: 'attendance_100', name: 'Getting Started', desc: 'Reach 100 attendees', reward: 3000, icon: '👥' },
  { id: 'attendance_500', name: 'Big Time', desc: 'Reach 500 attendees at one festival', reward: 10000, icon: '🎉' },
  { id: 'attendance_1000', name: 'Mega Festival', desc: 'Reach 1,000 attendees', reward: 20000, icon: '🏟️' },
  { id: 'three_stages', name: 'Stage Manager', desc: 'Build 3 different stage types', reward: 5000, icon: '🎸' },
  { id: 'full_service', name: 'Full Service', desc: 'Have food, bar, restrooms & medical', reward: 4000, icon: '🏥' },
  { id: 'campground_20', name: 'Campground King', desc: 'Place 20 camping structures', reward: 6000, icon: '⛺' },
  { id: 'satisfaction_90', name: 'Crowd Pleaser', desc: 'Achieve 90%+ satisfaction', reward: 8000, icon: '😊' },
  { id: 'profit_50k', name: 'Money Maker', desc: 'Earn $50k profit in one festival', reward: 15000, icon: '💰' },
  { id: 'festivals_5', name: 'Seasoned Pro', desc: 'Host 5 festivals', reward: 8000, icon: '🎪' },
  { id: 'festivals_10', name: 'Festival Empire', desc: 'Host 10 festivals', reward: 25000, icon: '👑' },
  { id: 'vip', name: 'VIP Treatment', desc: 'Build a VIP Lounge', reward: 3000, icon: '🥂' },
  { id: 'decor_10', name: 'Light It Up', desc: 'Place 10 decor items', reward: 2000, icon: '💡' },
  { id: 'rep_50', name: 'Five Star', desc: 'Reach 50 reputation', reward: 10000, icon: '⭐' },
  { id: 'revenue_100k', name: 'Festival Mogul', desc: 'Earn $100k total revenue', reward: 30000, icon: '💎' },
];

export class ObjectiveManager {
  constructor(economy) {
    this.economy = economy;
    this.completed = new Set();
  }

  check(festival, world) {
    const newlyCompleted = [];
    for (const obj of OBJECTIVES) {
      if (this.completed.has(obj.id)) continue;
      let met = false;
      switch (obj.id) {
        case 'first_festival': met = festival.totalFestivalsHosted >= 1; break;
        case 'attendance_100': met = festival.bestAttendance >= 100; break;
        case 'attendance_500': met = festival.bestAttendance >= 500; break;
        case 'attendance_1000': met = festival.bestAttendance >= 1000; break;
        case 'three_stages': {
          const types = new Set();
          for (const e of world.placed) if (STAGE_IDS.includes(e.data.id)) types.add(e.data.id);
          met = types.size >= 3;
          break;
        }
        case 'full_service':
          met = ['food_tent', 'bar', 'toilets', 'med_tent'].every(id => world.placed.some(e => e.data.id === id));
          break;
        case 'campground_20':
          met = world.placed.filter(e => CAMPING_IDS.includes(e.data.id)).length >= 20;
          break;
        case 'satisfaction_90': met = festival.bestSatisfaction >= 90; break;
        case 'profit_50k': met = festival.results && festival.results.netProfit >= 50000; break;
        case 'festivals_5': met = festival.totalFestivalsHosted >= 5; break;
        case 'festivals_10': met = festival.totalFestivalsHosted >= 10; break;
        case 'vip': met = world.placed.some(e => e.data.id === 'vip_lounge'); break;
        case 'decor_10': met = world.placed.filter(e => DECOR_IDS.includes(e.data.id)).length >= 10; break;
        case 'rep_50': met = this.economy.reputation >= 50; break;
        case 'revenue_100k': met = festival.totalRevenue >= 100000; break;
      }
      if (met) {
        this.completed.add(obj.id);
        this.economy.earn(obj.reward);
        newlyCompleted.push(obj);
      }
    }
    return newlyCompleted;
  }

  toJSON() { return [...this.completed]; }

  loadJSON(data) {
    if (Array.isArray(data)) this.completed = new Set(data);
  }
}
