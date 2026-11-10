import * as THREE from 'three';

export const CATEGORIES = {
  stages: {
    label: 'Stages',
    items: [
      {
        id: 'medium_stage',
        name: 'Medium Stage',
        icon: '🎤',
        cost: 4000,
        requiredRep: 0,
        size: [5, 4],
        capacity: 250,
        description: 'A solid mid-size stage with room for a full band and gear.',
        build(x, z) {
          const group = new THREE.Group();
          const platform = new THREE.Mesh(
            new THREE.BoxGeometry(5, 0.5, 4),
            new THREE.MeshLambertMaterial({ color: 0x5c3a1e })
          );
          platform.position.y = 0.25;
          group.add(platform);
          const back = new THREE.Mesh(
            new THREE.BoxGeometry(5, 3.5, 0.18),
            new THREE.MeshLambertMaterial({ color: 0x2a2a3e })
          );
          back.position.set(0, 2, -1.8);
          group.add(back);
          for (const side of [-1, 1]) {
            const pillar = new THREE.Mesh(
              new THREE.BoxGeometry(0.15, 4.5, 0.15),
              new THREE.MeshLambertMaterial({ color: 0x888888 })
            );
            pillar.position.set(side * 2.2, 2.25, -1.7);
            group.add(pillar);
          }
          const truss = new THREE.Mesh(
            new THREE.BoxGeometry(4.6, 0.15, 0.15),
            new THREE.MeshLambertMaterial({ color: 0x888888 })
          );
          truss.position.set(0, 4.5, -1.7);
          group.add(truss);
          for (const side of [-1, 1]) {
            for (let i = 0; i < 2; i++) {
              const speaker = new THREE.Mesh(
                new THREE.BoxGeometry(0.6, 0.6, 0.5),
                new THREE.MeshLambertMaterial({ color: 0x1a1a1a })
              );
              speaker.position.set(side * 2, 0.8 + i * 0.65, 1.6);
              group.add(speaker);
            }
          }
          group.position.set(x, 0, z);
          return group;
        }
      },
      {
        id: 'main_stage',
        name: 'Main Stage',
        icon: '🎸',
        cost: 15000,
        requiredRep: 20,
        size: [6, 5],
        capacity: 500,
        description: 'The big stage. LED screens, light rigs, the works.',
        build(x, z) {
          const group = new THREE.Group();
          // Platform
          const platform = new THREE.Mesh(
            new THREE.BoxGeometry(6, 0.6, 5),
            new THREE.MeshLambertMaterial({ color: 0x4a2a10 })
          );
          platform.position.y = 0.3;
          group.add(platform);
          // Back structure
          const back = new THREE.Mesh(
            new THREE.BoxGeometry(6, 5, 0.2),
            new THREE.MeshLambertMaterial({ color: 0x1e1e30 })
          );
          back.position.set(0, 2.8, -2.3);
          group.add(back);
          // LED screen
          const screen = new THREE.Mesh(
            new THREE.BoxGeometry(4, 2.5, 0.05),
            new THREE.MeshBasicMaterial({ color: 0x3344aa })
          );
          screen.position.set(0, 3.5, -2.15);
          group.add(screen);
          // Truss pillars
          for (const side of [-1, 1]) {
            const pillar = new THREE.Mesh(
              new THREE.BoxGeometry(0.2, 6, 0.2),
              new THREE.MeshLambertMaterial({ color: 0x888888 })
            );
            pillar.position.set(side * 2.8, 3, -2.2);
            group.add(pillar);
          }
          // Overhead truss
          const truss = new THREE.Mesh(
            new THREE.BoxGeometry(6, 0.2, 0.2),
            new THREE.MeshLambertMaterial({ color: 0x888888 })
          );
          truss.position.set(0, 6, -2.2);
          group.add(truss);
          // Speaker stacks
          for (const side of [-1, 1]) {
            for (let i = 0; i < 3; i++) {
              const speaker = new THREE.Mesh(
                new THREE.BoxGeometry(0.8, 0.6, 0.6),
                new THREE.MeshLambertMaterial({ color: 0x111111 })
              );
              speaker.position.set(side * 2.5, 0.9 + i * 0.65, 2.0);
              group.add(speaker);
            }
          }
          group.position.set(x, 0, z);
          return group;
        }
      },
      {
        id: 'dj_booth',
        name: 'DJ Booth',
        icon: '🎧',
        cost: 5000,
        requiredRep: 10,
        size: [2, 2],
        capacity: 200,
        description: 'Turntables, a light show, and heavy bass.',
        build(x, z) {
          const group = new THREE.Group();
          const platform = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.3, 2),
            new THREE.MeshLambertMaterial({ color: 0x2a1a3e })
          );
          platform.position.y = 0.15;
          group.add(platform);
          const desk = new THREE.Mesh(
            new THREE.BoxGeometry(1.6, 0.8, 0.5),
            new THREE.MeshLambertMaterial({ color: 0x1a1a2a })
          );
          desk.position.set(0, 0.7, 0);
          group.add(desk);
          const glow = new THREE.Mesh(
            new THREE.BoxGeometry(1.6, 0.05, 0.52),
            new THREE.MeshBasicMaterial({ color: 0xff00ff })
          );
          glow.position.set(0, 0.35, 0);
          group.add(glow);
          const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 3),
            new THREE.MeshLambertMaterial({ color: 0x666666 })
          );
          pole.position.set(0, 1.8, -0.8);
          group.add(pole);
          group.position.set(x, 0, z);
          return group;
        }
      },
      {
        id: 'acoustic_tent',
        name: 'Acoustic Tent',
        icon: '🎵',
        cost: 3500,
        requiredRep: 5,
        size: [3, 3],
        capacity: 80,
        description: 'A chill tent for acoustic sets and spoken word.',
        build(x, z) {
          const group = new THREE.Group();
          const canopy = new THREE.Mesh(
            new THREE.ConeGeometry(2, 2.5, 6),
            new THREE.MeshLambertMaterial({ color: 0xd4a574, side: THREE.DoubleSide })
          );
          canopy.position.y = 2.5;
          group.add(canopy);
          const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 3.8),
            new THREE.MeshLambertMaterial({ color: 0x8b6b3e })
          );
          pole.position.y = 1.9;
          group.add(pole);
          const rug = new THREE.Mesh(
            new THREE.CircleGeometry(1.5, 8),
            new THREE.MeshLambertMaterial({ color: 0x884422 })
          );
          rug.rotation.x = -Math.PI / 2;
          rug.position.y = 0.01;
          group.add(rug);
          group.position.set(x, 0, z);
          return group;
        }
      },
      {
        id: 'mega_stage',
        name: 'Mega Stage',
        icon: '🏟️',
        cost: 40000,
        requiredRep: 50,
        size: [8, 6],
        capacity: 2000,
        description: 'The headliner stage. Pyrotechnics, dual screens, massive sound.',
        build(x, z) {
          const group = new THREE.Group();
          const platform = new THREE.Mesh(
            new THREE.BoxGeometry(8, 0.8, 6),
            new THREE.MeshLambertMaterial({ color: 0x3a1a08 })
          );
          platform.position.y = 0.4;
          group.add(platform);
          const back = new THREE.Mesh(
            new THREE.BoxGeometry(8, 7, 0.3),
            new THREE.MeshLambertMaterial({ color: 0x111122 })
          );
          back.position.set(0, 3.9, -2.7);
          group.add(back);
          for (const sx of [-1.5, 1.5]) {
            const screen = new THREE.Mesh(
              new THREE.BoxGeometry(2.5, 2, 0.05),
              new THREE.MeshBasicMaterial({ color: 0x2244cc })
            );
            screen.position.set(sx, 5, -2.5);
            group.add(screen);
          }
          for (const sx of [-3.5, 3.5]) {
            const pillar = new THREE.Mesh(
              new THREE.BoxGeometry(0.25, 8, 0.25),
              new THREE.MeshLambertMaterial({ color: 0x777777 })
            );
            pillar.position.set(sx, 4, -2.6);
            group.add(pillar);
          }
          const topTruss = new THREE.Mesh(
            new THREE.BoxGeometry(8, 0.25, 0.25),
            new THREE.MeshLambertMaterial({ color: 0x777777 })
          );
          topTruss.position.set(0, 8, -2.6);
          group.add(topTruss);
          for (const sx of [-3, 3]) {
            for (let i = 0; i < 4; i++) {
              const speaker = new THREE.Mesh(
                new THREE.BoxGeometry(1, 0.7, 0.7),
                new THREE.MeshLambertMaterial({ color: 0x0a0a0a })
              );
              speaker.position.set(sx, 1.2 + i * 0.75, 2.5);
              group.add(speaker);
            }
          }
          for (let i = 0; i < 5; i++) {
            const pyro = new THREE.Mesh(
              new THREE.CylinderGeometry(0.08, 0.08, 0.5),
              new THREE.MeshLambertMaterial({ color: 0xcc4400 })
            );
            pyro.position.set(-3 + i * 1.5, 0.85, -2);
            group.add(pyro);
          }
          group.position.set(x, 0, z);
          return group;
        }
      }
    ]
  },
  facilities: {
    label: 'Facilities',
    items: [
      {
        id: 'food_tent',
        name: 'Food Tent',
        icon: '🍔',
        cost: 1500,
        requiredRep: 0,
        size: [2, 2],
        income: 50,
        description: 'Burgers, fries, and festival vibes. Generates income.',
        build(x, z) {
          const group = new THREE.Group();
          // Tent
          const tent = new THREE.Mesh(
            new THREE.ConeGeometry(1.4, 2, 4),
            new THREE.MeshLambertMaterial({ color: 0xe05050 })
          );
          tent.position.y = 1.8;
          tent.rotation.y = Math.PI / 4;
          group.add(tent);
          // Counter
          const counter = new THREE.Mesh(
            new THREE.BoxGeometry(1.6, 0.8, 0.4),
            new THREE.MeshLambertMaterial({ color: 0x8b6b3e })
          );
          counter.position.set(0, 0.4, 0.7);
          group.add(counter);
          group.position.set(x, 0, z);
          return group;
        }
      },
      {
        id: 'bar',
        name: 'Bar',
        icon: '🍺',
        cost: 3000,
        requiredRep: 10,
        size: [3, 2],
        income: 120,
        description: 'Drinks flowing, tips coming. High income generator.',
        build(x, z) {
          const group = new THREE.Group();
          // Canopy
          const canopy = new THREE.Mesh(
            new THREE.BoxGeometry(3, 0.1, 2),
            new THREE.MeshLambertMaterial({ color: 0x3a6e3a })
          );
          canopy.position.y = 2.5;
          group.add(canopy);
          // Poles
          for (const sx of [-1, 1]) {
            for (const sz of [-1, 1]) {
              const pole = new THREE.Mesh(
                new THREE.CylinderGeometry(0.04, 0.04, 2.5),
                new THREE.MeshLambertMaterial({ color: 0x888888 })
              );
              pole.position.set(sx * 1.3, 1.25, sz * 0.8);
              group.add(pole);
            }
          }
          // Bar counter (L-shape)
          const bar = new THREE.Mesh(
            new THREE.BoxGeometry(2.4, 1, 0.3),
            new THREE.MeshLambertMaterial({ color: 0x5c3a1e })
          );
          bar.position.set(0, 0.5, 0.6);
          group.add(bar);
          group.position.set(x, 0, z);
          return group;
        }
      },
      {
        id: 'toilets',
        name: 'Restrooms',
        icon: '🚻',
        cost: 800,
        requiredRep: 0,
        size: [2, 1],
        description: 'Nobody likes them, everybody needs them.',
        build(x, z) {
          const group = new THREE.Group();
          for (let i = 0; i < 3; i++) {
            const unit = new THREE.Mesh(
              new THREE.BoxGeometry(0.55, 1.6, 0.55),
              new THREE.MeshLambertMaterial({ color: 0x4488bb })
            );
            unit.position.set(-0.6 + i * 0.6, 0.8, 0);
            group.add(unit);
          }
          group.position.set(x, 0, z);
          return group;
        }
      },
      {
        id: 'merch_stand',
        name: 'Merch Stand',
        icon: '👕',
        cost: 2000,
        requiredRep: 10,
        size: [2, 2],
        income: 80,
        description: 'T-shirts, posters, and overpriced hoodies.',
        build(x, z) {
          const group = new THREE.Group();
          const canopy = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.08, 2),
            new THREE.MeshLambertMaterial({ color: 0x8844aa })
          );
          canopy.position.y = 2.2;
          group.add(canopy);
          for (const sx of [-0.8, 0.8]) {
            const pole = new THREE.Mesh(
              new THREE.CylinderGeometry(0.04, 0.04, 2.2),
              new THREE.MeshLambertMaterial({ color: 0x888888 })
            );
            pole.position.set(sx, 1.1, 0.8);
            group.add(pole);
          }
          const counter = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 0.9, 0.3),
            new THREE.MeshLambertMaterial({ color: 0x5c3a1e })
          );
          counter.position.set(0, 0.45, 0.7);
          group.add(counter);
          const backRack = new THREE.Mesh(
            new THREE.BoxGeometry(1.6, 1.5, 0.1),
            new THREE.MeshLambertMaterial({ color: 0x666666 })
          );
          backRack.position.set(0, 1.0, -0.7);
          group.add(backRack);
          group.position.set(x, 0, z);
          return group;
        }
      },
      {
        id: 'med_tent',
        name: 'Medical Tent',
        icon: '🏥',
        cost: 1200,
        requiredRep: 20,
        size: [2, 2],
        description: 'First aid station. Keeps your crowd safe.',
        build(x, z) {
          const group = new THREE.Group();
          const tent = new THREE.Mesh(
            new THREE.BoxGeometry(2, 1.8, 2),
            new THREE.MeshLambertMaterial({ color: 0xeeeeee })
          );
          tent.position.y = 0.9;
          group.add(tent);
          const cross = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.15, 0.01),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
          );
          cross.position.set(0, 1.4, 1.01);
          group.add(cross);
          const crossV = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.6, 0.01),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
          );
          crossV.position.set(0, 1.4, 1.01);
          group.add(crossV);
          group.position.set(x, 0, z);
          return group;
        }
      },
      {
        id: 'vip_lounge',
        name: 'VIP Lounge',
        icon: '🥂',
        cost: 8000,
        requiredRep: 35,
        size: [4, 3],
        income: 300,
        capacity: 50,
        description: 'Exclusive area with premium drinks. Big money maker.',
        build(x, z) {
          const group = new THREE.Group();
          const floor = new THREE.Mesh(
            new THREE.BoxGeometry(4, 0.15, 3),
            new THREE.MeshLambertMaterial({ color: 0x2a1a3e })
          );
          floor.position.y = 0.075;
          group.add(floor);
          for (const sx of [-1.8, 1.8]) {
            for (const sz of [-1.2, 1.2]) {
              const pole = new THREE.Mesh(
                new THREE.CylinderGeometry(0.04, 0.04, 2.5),
                new THREE.MeshLambertMaterial({ color: 0xccaa00 })
              );
              pole.position.set(sx, 1.25, sz);
              group.add(pole);
            }
          }
          const canopy = new THREE.Mesh(
            new THREE.BoxGeometry(4, 0.05, 3),
            new THREE.MeshLambertMaterial({ color: 0x1a1a2e })
          );
          canopy.position.y = 2.5;
          group.add(canopy);
          for (let i = 0; i < 3; i++) {
            const couch = new THREE.Mesh(
              new THREE.BoxGeometry(1, 0.4, 0.6),
              new THREE.MeshLambertMaterial({ color: 0x663399 })
            );
            couch.position.set(-1.2 + i * 1.2, 0.35, -0.5);
            group.add(couch);
          }
          const glow = new THREE.Mesh(
            new THREE.BoxGeometry(3.8, 0.03, 0.01),
            new THREE.MeshBasicMaterial({ color: 0xff00ff })
          );
          glow.position.set(0, 0.15, 1.49);
          group.add(glow);
          group.position.set(x, 0, z);
          return group;
        }
      }
    ]
  },
  decor: {
    label: 'Decor',
    items: [
      {
        id: 'tree_lights',
        name: 'Light Tree',
        icon: '🌲',
        cost: 300,
        requiredRep: 10,
        size: [1, 1],
        description: 'A tree wrapped in fairy lights.',
        build(x, z) {
          const group = new THREE.Group();
          // Trunk
          const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.12, 1.2),
            new THREE.MeshLambertMaterial({ color: 0x6b3a1e })
          );
          trunk.position.y = 0.6;
          group.add(trunk);
          // Foliage
          const foliage = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 8, 6),
            new THREE.MeshLambertMaterial({ color: 0x2d6b30 })
          );
          foliage.position.y = 1.5;
          group.add(foliage);
          // Lights (tiny spheres)
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const light = new THREE.Mesh(
              new THREE.SphereGeometry(0.04),
              new THREE.MeshBasicMaterial({ color: [0xffff44, 0xff4444, 0x44ff44, 0x4444ff, 0xff44ff, 0x44ffff][i] })
            );
            light.position.set(Math.cos(angle) * 0.4, 1.4 + Math.sin(angle * 2) * 0.2, Math.sin(angle) * 0.4);
            group.add(light);
          }
          group.position.set(x, 0, z);
          return group;
        }
      },
      {
        id: 'banner',
        name: 'Festival Banner',
        icon: '🚩',
        cost: 200,
        requiredRep: 0,
        size: [1, 1],
        description: 'Colorful flags on a pole. Sets the mood.',
        build(x, z) {
          const group = new THREE.Group();
          const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 3.5),
            new THREE.MeshLambertMaterial({ color: 0x888888 })
          );
          pole.position.y = 1.75;
          group.add(pole);
          // Triangle flags
          const colors = [0xe05050, 0xe0e050, 0x50e050, 0x5050e0, 0xe050e0];
          for (let i = 0; i < 5; i++) {
            const flag = new THREE.Mesh(
              new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0.3, -0.1, 0),
                new THREE.Vector3(0.1, -0.35, 0)
              ]).setIndex([0, 1, 2]),
              new THREE.MeshBasicMaterial({ color: colors[i], side: THREE.DoubleSide })
            );
            flag.position.set(0.03, 3.2 - i * 0.4, 0);
            group.add(flag);
          }
          group.position.set(x, 0, z);
          return group;
        }
      },
      {
        id: 'art_sculpture',
        name: 'Art Installation',
        icon: '🎨',
        cost: 2500,
        requiredRep: 10,
        size: [2, 2],
        description: 'A towering abstract sculpture. Festival landmark.',
        build(x, z) {
          const group = new THREE.Group();
          const base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.6, 0.8, 0.4, 6),
            new THREE.MeshLambertMaterial({ color: 0x888888 })
          );
          base.position.y = 0.2;
          group.add(base);
          const mid = new THREE.Mesh(
            new THREE.TorusGeometry(0.5, 0.12, 8, 12),
            new THREE.MeshLambertMaterial({ color: 0xcc4488 })
          );
          mid.position.y = 2;
          mid.rotation.x = Math.PI / 3;
          group.add(mid);
          const top = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.4),
            new THREE.MeshLambertMaterial({ color: 0x44aacc })
          );
          top.position.y = 3.2;
          group.add(top);
          const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.06, 3),
            new THREE.MeshLambertMaterial({ color: 0x666666 })
          );
          pole.position.y = 1.7;
          group.add(pole);
          group.position.set(x, 0, z);
          return group;
        }
      },
      {
        id: 'ferris_wheel',
        name: 'Ferris Wheel',
        icon: '🎡',
        cost: 12000,
        requiredRep: 35,
        size: [3, 3],
        capacity: 40,
        description: 'A festival icon. Visible from anywhere on the grounds.',
        build(x, z) {
          const group = new THREE.Group();
          for (const sx of [-0.3, 0.3]) {
            const leg = new THREE.Mesh(
              new THREE.BoxGeometry(0.1, 5, 0.1),
              new THREE.MeshLambertMaterial({ color: 0xcc4444 })
            );
            leg.position.set(sx, 2.5, 0);
            leg.rotation.z = sx > 0 ? -0.15 : 0.15;
            group.add(leg);
          }
          const rim = new THREE.Mesh(
            new THREE.TorusGeometry(2, 0.06, 8, 24),
            new THREE.MeshLambertMaterial({ color: 0xcc4444 })
          );
          rim.position.y = 4.5;
          group.add(rim);
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const spoke = new THREE.Mesh(
              new THREE.CylinderGeometry(0.02, 0.02, 2),
              new THREE.MeshLambertMaterial({ color: 0xdddddd })
            );
            spoke.position.set(Math.cos(angle), 4.5 + Math.sin(angle), 0);
            spoke.rotation.z = angle;
            group.add(spoke);
            const car = new THREE.Mesh(
              new THREE.BoxGeometry(0.3, 0.3, 0.2),
              new THREE.MeshLambertMaterial({ color: [0x4488ff, 0xff8844, 0x44ff88, 0xff44ff, 0xffff44, 0x44ffff, 0xff4444, 0x88ff44][i] })
            );
            car.position.set(Math.cos(angle) * 2, 4.5 + Math.sin(angle) * 2, 0);
            group.add(car);
          }
          group.position.set(x, 0, z);
          return group;
        }
      },
      {
        id: 'fountain',
        name: 'Water Fountain',
        icon: '⛲',
        cost: 1800,
        requiredRep: 20,
        size: [2, 2],
        description: 'A refreshing centerpiece. Crowds gather around it.',
        build(x, z) {
          const group = new THREE.Group();
          const basin = new THREE.Mesh(
            new THREE.CylinderGeometry(0.9, 1, 0.4, 12),
            new THREE.MeshLambertMaterial({ color: 0x888888 })
          );
          basin.position.y = 0.2;
          group.add(basin);
          const water = new THREE.Mesh(
            new THREE.CylinderGeometry(0.85, 0.85, 0.1, 12),
            new THREE.MeshLambertMaterial({ color: 0x4488cc, transparent: true, opacity: 0.6 })
          );
          water.position.y = 0.35;
          group.add(water);
          const center = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.2, 1),
            new THREE.MeshLambertMaterial({ color: 0x999999 })
          );
          center.position.y = 0.7;
          group.add(center);
          const spout = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.08, 0.5),
            new THREE.MeshLambertMaterial({ color: 0x66aaee, transparent: true, opacity: 0.5 })
          );
          spout.position.y = 1.4;
          group.add(spout);
          group.position.set(x, 0, z);
          return group;
        }
      },
      {
        id: 'string_lights',
        name: 'String Lights',
        icon: '💡',
        cost: 150,
        requiredRep: 0,
        size: [1, 1],
        description: 'Warm string lights on posts. Beautiful at night.',
        build(x, z) {
          const group = new THREE.Group();
          const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 2.5),
            new THREE.MeshLambertMaterial({ color: 0x666666 })
          );
          pole.position.y = 1.25;
          group.add(pole);
          const crossbar = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.03, 0.03),
            new THREE.MeshLambertMaterial({ color: 0x666666 })
          );
          crossbar.position.y = 2.4;
          group.add(crossbar);
          for (let i = 0; i < 5; i++) {
            const bulb = new THREE.Mesh(
              new THREE.SphereGeometry(0.03),
              new THREE.MeshBasicMaterial({ color: 0xffdd66 })
            );
            bulb.position.set(-0.3 + i * 0.15, 2.3 - Math.abs(i - 2) * 0.08, 0);
            group.add(bulb);
          }
          group.position.set(x, 0, z);
          return group;
        }
      }
    ]
  },
  camping: {
    label: 'Camping',
    items: [
      {
        id: 'tent_small',
        name: 'Camping Tent',
        icon: '⛺',
        cost: 200,
        requiredRep: 0,
        size: [1, 1],
        capacity: 2,
        description: 'A basic 2-person tent. The festival essentials.',
        build(x, z) {
          const group = new THREE.Group();
          const colors = [0x4488cc, 0xcc6644, 0x44aa44, 0xcccc44, 0xaa44aa, 0x44cccc];
          const color = colors[Math.floor(Math.random() * colors.length)];
          const tent = new THREE.Mesh(
            new THREE.ConeGeometry(0.45, 0.7, 4),
            new THREE.MeshLambertMaterial({ color })
          );
          tent.position.y = 0.35;
          tent.rotation.y = Math.PI / 4;
          group.add(tent);
          group.position.set(x, 0, z);
          return group;
        }
      },
      {
        id: 'tent_large',
        name: 'Family Tent',
        icon: '🏕️',
        cost: 500,
        requiredRep: 5,
        size: [2, 2],
        capacity: 6,
        description: 'A big dome tent with room for the whole crew.',
        build(x, z) {
          const group = new THREE.Group();
          const colors = [0x336699, 0x996633, 0x669933, 0x993366];
          const color = colors[Math.floor(Math.random() * colors.length)];
          const tent = new THREE.Mesh(
            new THREE.SphereGeometry(0.8, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2),
            new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide })
          );
          tent.position.y = 0;
          group.add(tent);
          const floor = new THREE.Mesh(
            new THREE.CircleGeometry(0.8, 8),
            new THREE.MeshLambertMaterial({ color: 0x555555 })
          );
          floor.rotation.x = -Math.PI / 2;
          floor.position.y = 0.01;
          group.add(floor);
          group.position.set(x, 0, z);
          return group;
        }
      },
      {
        id: 'rv_spot',
        name: 'RV Spot',
        icon: '🚐',
        cost: 1000,
        requiredRep: 10,
        size: [3, 2],
        capacity: 4,
        income: 30,
        description: 'Hookup pad for RVs and campervans. Premium camping.',
        build(x, z) {
          const group = new THREE.Group();
          const pad = new THREE.Mesh(
            new THREE.BoxGeometry(3, 0.03, 2),
            new THREE.MeshLambertMaterial({ color: 0x777777 })
          );
          pad.position.y = 0.015;
          group.add(pad);
          const rv = new THREE.Mesh(
            new THREE.BoxGeometry(2.2, 1.2, 1.2),
            new THREE.MeshLambertMaterial({ color: 0xddddcc })
          );
          rv.position.set(0, 0.65, 0);
          group.add(rv);
          const roof = new THREE.Mesh(
            new THREE.BoxGeometry(2.2, 0.08, 1.2),
            new THREE.MeshLambertMaterial({ color: 0xccccbb })
          );
          roof.position.set(0, 1.29, 0);
          group.add(roof);
          for (const wx of [-0.6, 0.2, 0.8]) {
            const win = new THREE.Mesh(
              new THREE.BoxGeometry(0.3, 0.25, 0.01),
              new THREE.MeshBasicMaterial({ color: 0x88bbdd })
            );
            win.position.set(wx, 0.8, 0.61);
            group.add(win);
          }
          const stripe = new THREE.Mesh(
            new THREE.BoxGeometry(2.22, 0.12, 0.01),
            new THREE.MeshBasicMaterial({ color: 0xcc6633 })
          );
          stripe.position.set(0, 0.5, 0.61);
          group.add(stripe);
          group.position.set(x, 0, z);
          return group;
        }
      },
      {
        id: 'campfire',
        name: 'Campfire Ring',
        icon: '🔥',
        cost: 150,
        requiredRep: 0,
        size: [1, 1],
        description: 'A stone fire ring. Where festival stories are told.',
        build(x, z) {
          const group = new THREE.Group();
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.35, 0.08, 6, 12),
            new THREE.MeshLambertMaterial({ color: 0x666666 })
          );
          ring.rotation.x = -Math.PI / 2;
          ring.position.y = 0.08;
          group.add(ring);
          const flame = new THREE.Mesh(
            new THREE.ConeGeometry(0.12, 0.4, 5),
            new THREE.MeshBasicMaterial({ color: 0xff6600 })
          );
          flame.position.y = 0.25;
          group.add(flame);
          const flame2 = new THREE.Mesh(
            new THREE.ConeGeometry(0.08, 0.3, 4),
            new THREE.MeshBasicMaterial({ color: 0xffcc00 })
          );
          flame2.position.set(0.05, 0.2, 0.03);
          group.add(flame2);
          for (let i = 0; i < 3; i++) {
            const log = new THREE.Mesh(
              new THREE.CylinderGeometry(0.04, 0.04, 0.4),
              new THREE.MeshLambertMaterial({ color: 0x5c3a1e })
            );
            log.rotation.z = Math.PI / 2;
            log.rotation.y = (i / 3) * Math.PI;
            log.position.y = 0.06;
            group.add(log);
          }
          group.position.set(x, 0, z);
          return group;
        }
      },
      {
        id: 'shower_block',
        name: 'Shower Block',
        icon: '🚿',
        cost: 1500,
        requiredRep: 10,
        size: [3, 2],
        description: 'Hot showers. A luxury at any festival campground.',
        build(x, z) {
          const group = new THREE.Group();
          const building = new THREE.Mesh(
            new THREE.BoxGeometry(3, 2, 2),
            new THREE.MeshLambertMaterial({ color: 0x77aacc })
          );
          building.position.y = 1;
          group.add(building);
          const roof = new THREE.Mesh(
            new THREE.BoxGeometry(3.2, 0.15, 2.2),
            new THREE.MeshLambertMaterial({ color: 0x5588aa })
          );
          roof.position.y = 2.05;
          group.add(roof);
          const sign = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.3, 0.01),
            new THREE.MeshBasicMaterial({ color: 0x44aaff })
          );
          sign.position.set(0, 1.6, 1.01);
          group.add(sign);
          for (let i = 0; i < 3; i++) {
            const door = new THREE.Mesh(
              new THREE.BoxGeometry(0.6, 1.4, 0.02),
              new THREE.MeshLambertMaterial({ color: 0x5599bb })
            );
            door.position.set(-0.8 + i * 0.8, 0.7, 1.01);
            group.add(door);
          }
          group.position.set(x, 0, z);
          return group;
        }
      },
      {
        id: 'glamping_tent',
        name: 'Glamping Tent',
        icon: '🛖',
        cost: 2500,
        requiredRep: 20,
        size: [2, 2],
        capacity: 2,
        income: 60,
        description: 'Luxury camping. Bed, lights, and a rug. Premium income.',
        build(x, z) {
          const group = new THREE.Group();
          const tent = new THREE.Mesh(
            new THREE.ConeGeometry(1.1, 1.8, 6),
            new THREE.MeshLambertMaterial({ color: 0xddccaa })
          );
          tent.position.y = 0.9;
          tent.rotation.y = Math.PI / 6;
          group.add(tent);
          const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 2),
            new THREE.MeshLambertMaterial({ color: 0x8b6b3e })
          );
          pole.position.y = 1;
          group.add(pole);
          const flag = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.15, 0.01),
            new THREE.MeshBasicMaterial({ color: 0xff8844 })
          );
          flag.position.set(0.15, 1.95, 0);
          group.add(flag);
          const rug = new THREE.Mesh(
            new THREE.CircleGeometry(1.2, 6),
            new THREE.MeshLambertMaterial({ color: 0x886644 })
          );
          rug.rotation.x = -Math.PI / 2;
          rug.position.y = 0.005;
          group.add(rug);
          const glow = new THREE.Mesh(
            new THREE.SphereGeometry(0.05),
            new THREE.MeshBasicMaterial({ color: 0xffdd66 })
          );
          glow.position.set(0.4, 0.3, 0.6);
          group.add(glow);
          group.position.set(x, 0, z);
          return group;
        }
      },
      {
        id: 'hammock_grove',
        name: 'Hammock Grove',
        icon: '🌿',
        cost: 800,
        requiredRep: 5,
        size: [2, 1],
        capacity: 4,
        description: 'Hammocks strung between posts. Perfect chill zone.',
        build(x, z) {
          const group = new THREE.Group();
          for (const sx of [-0.7, 0.7]) {
            const post = new THREE.Mesh(
              new THREE.CylinderGeometry(0.05, 0.06, 2),
              new THREE.MeshLambertMaterial({ color: 0x6b3a1e })
            );
            post.position.set(sx, 1, 0);
            group.add(post);
          }
          const hammock = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.03, 0.5),
            new THREE.MeshLambertMaterial({ color: 0xdd8844 })
          );
          hammock.position.set(0, 0.8, 0);
          hammock.rotation.z = 0.08;
          group.add(hammock);
          group.position.set(x, 0, z);
          return group;
        }
      }
    ]
  },
  infrastructure: {
    label: 'Paths & Fences',
    items: [
      {
        id: 'path',
        name: 'Dirt Path',
        icon: '🟫',
        cost: 50,
        requiredRep: 0,
        size: [1, 1],
        description: 'A simple walkway. Helps crowds move around.',
        build(x, z) {
          const group = new THREE.Group();
          const path = new THREE.Mesh(
            new THREE.BoxGeometry(1, 0.02, 1),
            new THREE.MeshLambertMaterial({ color: 0x9b7b4a })
          );
          path.position.y = 0.01;
          group.add(path);
          group.position.set(x, 0, z);
          return group;
        }
      },
      {
        id: 'fence',
        name: 'Fence Section',
        icon: '🏗️',
        cost: 100,
        requiredRep: 0,
        size: [1, 1],
        description: 'Metal crowd barrier. Controls the flow.',
        build(x, z) {
          const group = new THREE.Group();
          for (const s of [-0.4, 0.4]) {
            const post = new THREE.Mesh(
              new THREE.CylinderGeometry(0.03, 0.03, 1),
              new THREE.MeshLambertMaterial({ color: 0x999999 })
            );
            post.position.set(s, 0.5, 0);
            group.add(post);
          }
          for (const h of [0.35, 0.7]) {
            const rail = new THREE.Mesh(
              new THREE.BoxGeometry(0.8, 0.03, 0.03),
              new THREE.MeshLambertMaterial({ color: 0xaaaaaa })
            );
            rail.position.y = h;
            group.add(rail);
          }
          group.position.set(x, 0, z);
          return group;
        }
      },
      {
        id: 'paved_path',
        name: 'Paved Path',
        icon: '⬜',
        cost: 120,
        requiredRep: 0,
        size: [1, 1],
        description: 'A clean paved walkway. Looks more professional.',
        build(x, z) {
          const group = new THREE.Group();
          const path = new THREE.Mesh(
            new THREE.BoxGeometry(1, 0.03, 1),
            new THREE.MeshLambertMaterial({ color: 0x777777 })
          );
          path.position.y = 0.015;
          group.add(path);
          group.position.set(x, 0, z);
          return group;
        }
      },
      {
        id: 'entrance_gate',
        name: 'Entrance Gate',
        icon: '🚪',
        cost: 3000,
        requiredRep: 10,
        size: [3, 1],
        description: 'The main entrance. Every festival needs one.',
        build(x, z) {
          const group = new THREE.Group();
          for (const sx of [-1.2, 1.2]) {
            const pillar = new THREE.Mesh(
              new THREE.BoxGeometry(0.3, 3.5, 0.3),
              new THREE.MeshLambertMaterial({ color: 0x555555 })
            );
            pillar.position.set(sx, 1.75, 0);
            group.add(pillar);
          }
          const arch = new THREE.Mesh(
            new THREE.BoxGeometry(2.7, 0.4, 0.3),
            new THREE.MeshLambertMaterial({ color: 0x555555 })
          );
          arch.position.set(0, 3.3, 0);
          group.add(arch);
          const sign = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.6, 0.05),
            new THREE.MeshBasicMaterial({ color: 0xffcc00 })
          );
          sign.position.set(0, 3.8, 0);
          group.add(sign);
          group.position.set(x, 0, z);
          return group;
        }
      },
      {
        id: 'parking',
        name: 'Parking Area',
        icon: '🅿️',
        cost: 500,
        requiredRep: 5,
        size: [3, 2],
        description: 'Gravel lot for attendee parking.',
        build(x, z) {
          const group = new THREE.Group();
          const lot = new THREE.Mesh(
            new THREE.BoxGeometry(3, 0.02, 2),
            new THREE.MeshLambertMaterial({ color: 0x666666 })
          );
          lot.position.y = 0.01;
          group.add(lot);
          for (let i = 0; i < 4; i++) {
            const line = new THREE.Mesh(
              new THREE.BoxGeometry(0.05, 0.005, 1.6),
              new THREE.MeshBasicMaterial({ color: 0xffffff })
            );
            line.position.set(-1 + i * 0.7, 0.025, 0);
            group.add(line);
          }
          group.position.set(x, 0, z);
          return group;
        }
      }
    ]
  }
};

export function getBuildingById(id) {
  for (const cat of Object.values(CATEGORIES)) {
    const found = cat.items.find(item => item.id === id);
    if (found) return found;
  }
  return null;
}
