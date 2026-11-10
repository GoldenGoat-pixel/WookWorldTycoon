import * as THREE from 'three';

export const STAGE_UPGRADES = [
  {
    id: 'speakers',
    name: 'Speaker Stacks',
    icon: '🔊',
    cost: 1500,
    description: 'Tall speaker stacks flanking the stage.',
    satisfaction: 4,
    capacityBonus: 50,
    applies: ['medium_stage', 'dj_booth', 'acoustic_tent'],
    build(entry) {
      const g = new THREE.Group();
      for (const side of [-1, 1]) {
        const sx = side * (entry.sizeX / 2 + 0.3);
        for (let i = 0; i < 3; i++) {
          const box = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.5, 0.5),
            new THREE.MeshLambertMaterial({ color: 0x111111 })
          );
          box.position.set(sx, 0.65 + i * 0.55, entry.sizeZ / 2 - 0.5);
          g.add(box);
        }
      }
      return g;
    }
  },
  {
    id: 'subs',
    name: 'Subwoofers',
    icon: '💥',
    cost: 2500,
    description: 'Heavy bass subs under the stage. You feel it in your chest.',
    satisfaction: 5,
    capacityBonus: 30,
    applies: ['medium_stage', 'main_stage', 'dj_booth', 'mega_stage'],
    build(entry) {
      const g = new THREE.Group();
      const count = entry.sizeX >= 6 ? 4 : 2;
      const spacing = (entry.sizeX - 1) / (count + 1);
      for (let i = 0; i < count; i++) {
        const sub = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.8, 0.8),
          new THREE.MeshLambertMaterial({ color: 0x0a0a0a })
        );
        const cone = new THREE.Mesh(
          new THREE.CircleGeometry(0.25, 8),
          new THREE.MeshLambertMaterial({ color: 0x222222 })
        );
        cone.position.z = 0.41;
        sub.add(cone);
        sub.position.set(
          -entry.sizeX / 2 + spacing * (i + 1),
          0.4,
          entry.sizeZ / 2 + 0.5
        );
        g.add(sub);
      }
      return g;
    }
  },
  {
    id: 'lights',
    name: 'Light Rig',
    icon: '💡',
    cost: 3000,
    description: 'Overhead moving lights on a truss bar.',
    satisfaction: 6,
    capacityBonus: 0,
    applies: ['medium_stage', 'main_stage', 'dj_booth', 'acoustic_tent', 'mega_stage'],
    build(entry) {
      const g = new THREE.Group();
      const w = entry.sizeX;
      const truss = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.8, 0.12, 0.12),
        new THREE.MeshLambertMaterial({ color: 0x888888 })
      );
      const h = entry.sizeX >= 6 ? 6.5 : 4;
      truss.position.set(0, h, 0);
      g.add(truss);
      const lightCount = Math.max(3, Math.floor(w / 1.5));
      const colors = [0xff2222, 0x2222ff, 0x22ff22, 0xff22ff, 0xffff22, 0x22ffff];
      for (let i = 0; i < lightCount; i++) {
        const lx = -w * 0.35 + (w * 0.7 / (lightCount - 1)) * i;
        const housing = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.12, 0.2),
          new THREE.MeshLambertMaterial({ color: 0x333333 })
        );
        housing.position.set(lx, h - 0.2, 0);
        g.add(housing);
        const beam = new THREE.Mesh(
          new THREE.ConeGeometry(0.15, 0.5, 6),
          new THREE.MeshBasicMaterial({
            color: colors[i % colors.length],
            transparent: true,
            opacity: 0.6
          })
        );
        beam.position.set(lx, h - 0.55, 0);
        beam.rotation.x = Math.PI;
        g.add(beam);
      }
      return g;
    }
  },
  {
    id: 'screens',
    name: 'LED Screens',
    icon: '📺',
    cost: 5000,
    description: 'Side LED screens so the back rows can see.',
    satisfaction: 8,
    capacityBonus: 100,
    applies: ['medium_stage', 'dj_booth', 'acoustic_tent'],
    build(entry) {
      const g = new THREE.Group();
      for (const side of [-1, 1]) {
        const sx = side * (entry.sizeX / 2 + 0.8);
        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.06, 0.06, 3.5),
          new THREE.MeshLambertMaterial({ color: 0x666666 })
        );
        pole.position.set(sx, 1.75, -entry.sizeZ / 2 + 0.5);
        g.add(pole);
        const screen = new THREE.Mesh(
          new THREE.BoxGeometry(1.5, 1, 0.05),
          new THREE.MeshBasicMaterial({ color: 0x2244aa })
        );
        screen.position.set(sx, 3.2, -entry.sizeZ / 2 + 0.5);
        g.add(screen);
      }
      return g;
    }
  },
  {
    id: 'pyro',
    name: 'Pyrotechnics',
    icon: '🔥',
    cost: 4000,
    description: 'Flame jets along the stage front. Pure spectacle.',
    satisfaction: 7,
    capacityBonus: 0,
    applies: ['main_stage', 'dj_booth', 'mega_stage'],
    build(entry) {
      const g = new THREE.Group();
      const count = Math.max(3, Math.floor(entry.sizeX / 1.5));
      for (let i = 0; i < count; i++) {
        const px = -entry.sizeX / 2 + 0.5 + (entry.sizeX - 1) / (count - 1) * i;
        const base = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.1, 0.3),
          new THREE.MeshLambertMaterial({ color: 0x444444 })
        );
        base.position.set(px, 0.15, entry.sizeZ / 2 - 0.3);
        g.add(base);
        const flame = new THREE.Mesh(
          new THREE.ConeGeometry(0.08, 0.6, 5),
          new THREE.MeshBasicMaterial({
            color: 0xff4400,
            transparent: true,
            opacity: 0.8
          })
        );
        flame.position.set(px, 0.6, entry.sizeZ / 2 - 0.3);
        g.add(flame);
      }
      return g;
    }
  },
  {
    id: 'lasers',
    name: 'Laser Array',
    icon: '✨',
    cost: 6000,
    description: 'Green and purple laser beams sweeping the crowd.',
    satisfaction: 9,
    capacityBonus: 0,
    applies: ['main_stage', 'dj_booth', 'mega_stage'],
    build(entry) {
      const g = new THREE.Group();
      const h = entry.sizeX >= 6 ? 7 : 4.5;
      const beamMat = (color) => new THREE.MeshBasicMaterial({
        color, transparent: true, opacity: 0.35
      });
      const colors = [0x00ff44, 0x8800ff, 0x00ff44, 0x8800ff];
      for (let i = 0; i < 4; i++) {
        const lx = -entry.sizeX * 0.3 + (entry.sizeX * 0.6 / 3) * i;
        const beam = new THREE.Mesh(
          new THREE.CylinderGeometry(0.01, 0.15, 8, 4),
          beamMat(colors[i])
        );
        beam.position.set(lx, h - 1, -entry.sizeZ / 2 + 0.5);
        beam.rotation.x = 0.3 - i * 0.15;
        beam.rotation.z = 0.2 - i * 0.13;
        g.add(beam);
      }
      return g;
    }
  },
  {
    id: 'fog',
    name: 'Fog Machine',
    icon: '🌫️',
    cost: 800,
    description: 'Low-lying fog across the stage. Sets the atmosphere.',
    satisfaction: 3,
    capacityBonus: 0,
    applies: ['medium_stage', 'main_stage', 'dj_booth', 'acoustic_tent', 'mega_stage'],
    build(entry) {
      const g = new THREE.Group();
      for (let i = 0; i < 6; i++) {
        const puff = new THREE.Mesh(
          new THREE.SphereGeometry(0.3 + Math.random() * 0.3, 6, 5),
          new THREE.MeshLambertMaterial({
            color: 0xcccccc,
            transparent: true,
            opacity: 0.2 + Math.random() * 0.15
          })
        );
        puff.position.set(
          (Math.random() - 0.5) * entry.sizeX,
          0.15 + Math.random() * 0.2,
          (Math.random() - 0.5) * entry.sizeZ * 0.6
        );
        g.add(puff);
      }
      return g;
    }
  }
];

export function getUpgradesForStage(stageId) {
  return STAGE_UPGRADES.filter(u => u.applies.includes(stageId));
}

export function getUpgradeById(id) {
  return STAGE_UPGRADES.find(u => u.id === id);
}
