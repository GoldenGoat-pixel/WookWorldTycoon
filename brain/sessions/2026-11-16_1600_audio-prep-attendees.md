# Session: Audio Overhaul + Prep System + Attendee AI

**Date:** 2026-11-16
**Written by:** Antonio's Claude
**Goal:** Implement three features selected by user: procedural music/sound overhaul, attendee pathfinding, between-festival prep system

## Changes

### Procedural Audio Overhaul (src/audio/sounds.js, src/main.js)
- 5 stage-type music layers: medium_stage (pentatonic synth), main_stage (sawtooth + kicks), dj_booth (wobble bass + hi-hats), acoustic_tent (sine arpeggios), mega_stage (all layers + sub-bass sweep)
- Dynamic crowd ambience: murmur interval scales with crowd size, rumble layer at 200+ attendees
- Crowd mood: cheers when satisfaction > 70, boos when < 30
- Weather sounds: rain ambience, wind ambience, thunder clap
- Vendor sale chime (added but not yet wired to vendor ticks)
- All procedural WebAudio, no samples

### Between-Festival Prep System (src/game/prep.js, index.html, style.css, plus integration in main.js, festival.js, events.js, attendees.js, staff.js, services.js)
- New PrepManager class with purchasable actions unlocked by reputation
- Actions: Extra Marketing, VIP Packages, Weather Insurance, Extended Hours, Staff Training, Green Initiative, Sound Check, Security Briefing
- Each provides specific bonuses: attendance boost, VIP spawn rate, weather resistance, event immunity, staff speed, litter reduction, stage satisfaction, vendor income
- Prep board UI panel accessible between festivals
- State persists in save files

### Desire-Driven Attendee AI (src/game/attendees.js — committed by other fork)
- Smart target selection based on needs
- Stage attraction and social clustering
- Building visit tracking

## Files Modified
- `src/audio/sounds.js` — major expansion
- `src/main.js` — audio + prep integration
- `src/game/prep.js` — new file
- `src/game/festival.js` — prep bonuses
- `src/game/events.js` — immunity + weather resistance
- `src/game/attendees.js` — VIP spawn/spend from prep + earlier AI changes
- `src/game/staff.js` — prep speed bonus
- `src/game/services.js` — litter spawn multiplier
- `index.html` — prep panel UI
- `style.css` — prep styling
- `docs/CHANGELOG.md` — documented audio overhaul

## Decisions
- Stage music layers kept very quiet (0.03-0.06 gain) so multiple stages blend without clipping
- Mega stage plays all other layers at slightly higher volume plus unique sub-bass sweep
- Crowd rumble uses hysteresis (starts at 200, stops at 150) to prevent toggling
- All weather sounds guard against double-start

## What's Left
- Wire `playVendorSale()` into vendor tick events
- Night market / between-festival exploration beyond the prep board
- Tune audio levels on actual Retroid hardware
- Time-of-day reactive music (potential feature)
