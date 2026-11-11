import * as THREE from 'three';

export const BUILDING_TIERS = {
  food_tent: [
    {
      tier: 2, name: 'Food Court', icon: '🍕', cost: 3000,
      incomeBoost: 50, satisfactionBoost: 2,
      description: 'Multiple stalls serving different cuisines.',
      build() {
        const g = new THREE.Group();
        const canopy2 = new THREE.Mesh(
          new THREE.ConeGeometry(1, 1.5, 4),
          new THREE.MeshLambertMaterial({ color: 0x50a050 })
        );
        canopy2.position.set(1.2, 1.5, -0.5);
        canopy2.rotation.y = Math.PI / 4;
        g.add(canopy2);
        const grill = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 0.4, 0.4),
          new THREE.MeshLambertMaterial({ color: 0x333333 })
        );
        grill.position.set(-0.8, 0.5, 0.3);
        g.add(grill);
        const vent = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 0.5),
          new THREE.MeshLambertMaterial({ color: 0x555555 })
        );
        vent.position.set(-0.8, 0.9, 0.3);
        g.add(vent);
        return g;
      }
    },
    {
      tier: 3, name: 'Gourmet Kitchen', icon: '👨‍🍳', cost: 8000,
      incomeBoost: 150, satisfactionBoost: 5,
      description: 'Chef-quality festival food. Premium prices.',
      build() {
        const g = new THREE.Group();
        const oven = new THREE.Mesh(
          new THREE.CylinderGeometry(0.4, 0.5, 0.8, 8),
          new THREE.MeshLambertMaterial({ color: 0x8b4513 })
        );
        oven.position.set(-1, 0.4, -0.5);
        g.add(oven);
        const chimney = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.12, 1),
          new THREE.MeshLambertMaterial({ color: 0x8b4513 })
        );
        chimney.position.set(-1, 1.1, -0.5);
        g.add(chimney);
        const cloth = new THREE.Mesh(
          new THREE.BoxGeometry(1.8, 0.05, 0.5),
          new THREE.MeshLambertMaterial({ color: 0xcc2244 })
        );
        cloth.position.set(0, 0.85, 0.7);
        g.add(cloth);
        const sign = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.5, 0.03),
          new THREE.MeshBasicMaterial({ color: 0xffcc00 })
        );
        sign.position.set(0, 2.2, 0);
        g.add(sign);
        return g;
      }
    }
  ],
  bar: [
    {
      tier: 2, name: 'Cocktail Lounge', icon: '🍸', cost: 5000,
      incomeBoost: 80, satisfactionBoost: 2,
      description: 'Craft cocktails and premium pours.',
      build() {
        const g = new THREE.Group();
        const neon = new THREE.Mesh(
          new THREE.BoxGeometry(2.2, 0.05, 0.05),
          new THREE.MeshBasicMaterial({ color: 0x00ffaa })
        );
        neon.position.set(0, 2.55, 0.9);
        g.add(neon);
        for (let i = 0; i < 3; i++) {
          const seat = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.12, 0.05, 8),
            new THREE.MeshLambertMaterial({ color: 0x222222 })
          );
          seat.position.set(-0.7 + i * 0.7, 0.55, 1.0);
          g.add(seat);
          const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 0.5),
            new THREE.MeshLambertMaterial({ color: 0x888888 })
          );
          leg.position.set(-0.7 + i * 0.7, 0.25, 1.0);
          g.add(leg);
        }
        return g;
      }
    },
    {
      tier: 3, name: 'Premium Bar', icon: '🥃', cost: 12000,
      incomeBoost: 230, satisfactionBoost: 5,
      description: 'Top-shelf spirits, champagne on tap.',
      build() {
        const g = new THREE.Group();
        for (const sx of [-1.4, 1.4]) {
          const post = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 0.7),
            new THREE.MeshLambertMaterial({ color: 0xccaa00 })
          );
          post.position.set(sx, 0.35, 1.3);
          g.add(post);
          const ball = new THREE.Mesh(
            new THREE.SphereGeometry(0.06, 6, 4),
            new THREE.MeshLambertMaterial({ color: 0xddbb00 })
          );
          ball.position.set(sx, 0.72, 1.3);
          g.add(ball);
        }
        const rope = new THREE.Mesh(
          new THREE.CylinderGeometry(0.015, 0.015, 2.6),
          new THREE.MeshLambertMaterial({ color: 0xcc0033 })
        );
        rope.position.set(0, 0.55, 1.3);
        rope.rotation.z = Math.PI / 2;
        g.add(rope);
        const shelf = new THREE.Mesh(
          new THREE.BoxGeometry(2, 0.05, 0.25),
          new THREE.MeshLambertMaterial({ color: 0x5c3a1e })
        );
        shelf.position.set(0, 1.2, -0.5);
        g.add(shelf);
        for (let i = 0; i < 4; i++) {
          const bottle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 0.2),
            new THREE.MeshLambertMaterial({ color: [0x44aa44, 0xaa4444, 0x4444aa, 0xaaaa44][i] })
          );
          bottle.position.set(-0.6 + i * 0.4, 1.35, -0.5);
          g.add(bottle);
        }
        return g;
      }
    }
  ],
  merch_stand: [
    {
      tier: 2, name: 'Merch Megastore', icon: '🏬', cost: 4000,
      incomeBoost: 70, satisfactionBoost: 2,
      description: 'Expanded merch with exclusive gear.',
      build() {
        const g = new THREE.Group();
        const rack = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 1.5, 0.8),
          new THREE.MeshLambertMaterial({ color: 0x666666 })
        );
        rack.position.set(0.9, 0.75, -0.3);
        g.add(rack);
        const banner = new THREE.Mesh(
          new THREE.BoxGeometry(1.5, 0.4, 0.02),
          new THREE.MeshBasicMaterial({ color: 0xff6600 })
        );
        banner.position.set(0, 2.5, 0);
        g.add(banner);
        for (let i = 0; i < 3; i++) {
          const shirt = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, 0.3, 0.02),
            new THREE.MeshLambertMaterial({ color: [0xee3333, 0x3333ee, 0x33ee33][i] })
          );
          shirt.position.set(0.9, 0.3 + i * 0.4, -0.3);
          g.add(shirt);
        }
        return g;
      }
    }
  ],
  toilets: [
    {
      tier: 2, name: 'Deluxe Restrooms', icon: '🚻', cost: 2000,
      incomeBoost: 0, satisfactionBoost: 4,
      description: 'Actual walls and running water.',
      build() {
        const g = new THREE.Group();
        const roof = new THREE.Mesh(
          new THREE.BoxGeometry(2.2, 0.08, 1.2),
          new THREE.MeshLambertMaterial({ color: 0x3377aa })
        );
        roof.position.set(0, 1.75, 0);
        g.add(roof);
        for (const sx of [-0.8, 0.8]) {
          const box = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.15, 0.15),
            new THREE.MeshLambertMaterial({ color: 0x6b3a1e })
          );
          box.position.set(sx, 0.3, 0.35);
          g.add(box);
          const flower = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 5, 4),
            new THREE.MeshLambertMaterial({ color: 0xff66aa })
          );
          flower.position.set(sx, 0.45, 0.35);
          g.add(flower);
        }
        return g;
      }
    }
  ],
  med_tent: [
    {
      tier: 2, name: 'Field Hospital', icon: '🏥', cost: 3000,
      incomeBoost: 0, satisfactionBoost: 4,
      description: 'Full medical station with beds.',
      build() {
        const g = new THREE.Group();
        const ext = new THREE.Mesh(
          new THREE.BoxGeometry(1.2, 1.4, 1.5),
          new THREE.MeshLambertMaterial({ color: 0xeeeeee })
        );
        ext.position.set(1.3, 0.7, 0);
        g.add(ext);
        const cross = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.1, 0.01),
          new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        cross.position.set(1.3, 1.0, 0.76);
        g.add(cross);
        const ant = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 1.5),
          new THREE.MeshLambertMaterial({ color: 0x888888 })
        );
        ant.position.set(1.3, 2.1, 0);
        g.add(ant);
        return g;
      }
    }
  ],
  campfire: [
    {
      tier: 2, name: 'Bonfire Pit', icon: '🔥', cost: 400,
      incomeBoost: 0, satisfactionBoost: 3,
      description: 'Stone benches and a bigger fire.',
      build() {
        const g = new THREE.Group();
        for (let i = 0; i < 3; i++) {
          const angle = (i / 3) * Math.PI * 2;
          const bench = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.2, 0.2),
            new THREE.MeshLambertMaterial({ color: 0x777777 })
          );
          bench.position.set(Math.cos(angle) * 0.6, 0.1, Math.sin(angle) * 0.6);
          bench.rotation.y = -angle;
          g.add(bench);
        }
        const flame = new THREE.Mesh(
          new THREE.ConeGeometry(0.18, 0.7, 5),
          new THREE.MeshBasicMaterial({ color: 0xff4400 })
        );
        flame.position.y = 0.45;
        g.add(flame);
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 1.2),
          new THREE.MeshLambertMaterial({ color: 0x6b3a1e })
        );
        post.position.set(0.5, 0.6, 0.5);
        g.add(post);
        const lantern = new THREE.Mesh(
          new THREE.SphereGeometry(0.06),
          new THREE.MeshBasicMaterial({ color: 0xffdd66 })
        );
        lantern.position.set(0.5, 1.2, 0.5);
        g.add(lantern);
        return g;
      }
    }
  ]
};

export function getNextTier(buildingId, currentTier) {
  const tiers = BUILDING_TIERS[buildingId];
  if (!tiers) return null;
  return tiers.find(t => t.tier === currentTier + 1) || null;
}

export function getTierById(buildingId, tier) {
  const tiers = BUILDING_TIERS[buildingId];
  if (!tiers) return null;
  return tiers.find(t => t.tier === tier) || null;
}

export function getTotalTierIncomeBoost(entry) {
  const tiers = BUILDING_TIERS[entry.data.id];
  if (!tiers) return 0;
  let boost = 0;
  for (const t of tiers) {
    if (t.tier <= (entry.tier || 1)) boost += t.incomeBoost;
  }
  return boost;
}

export function getTotalTierSatisfaction(placed) {
  let sat = 0;
  for (const entry of placed) {
    const tiers = BUILDING_TIERS[entry.data.id];
    if (!tiers) continue;
    for (const t of tiers) {
      if (t.tier <= (entry.tier || 1)) sat += t.satisfactionBoost;
    }
  }
  return sat;
}

export function getSeasonCostScale(season) {
  return Math.min(2.0, 1 + (season - 1) * 0.08);
}
