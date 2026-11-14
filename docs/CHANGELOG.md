# Changelog

## 2026-11-14

### Tutorial & Visibility Fixes
- Tutorial no longer pops up every session — the HELP button replays it without clearing the "done" flag, so future new games stay tutorial-free
- Switching apps on mobile no longer reloads the game after just 3 seconds; threshold raised to 5 minutes
- Game now auto-saves immediately when the tab/app goes to background, preventing progress loss on reload

## 2026-11-11

### Building Upgrade Tiers
- Buildings can now be upgraded through multiple tiers during planning phase
- Food Tent upgrades to Food Court then Gourmet Kitchen, with visual additions (extra canopy, brick oven, chimney)
- Bar upgrades to Cocktail Lounge then VIP Nightclub (neon signs, bar stools, VIP rope)
- Merch Stand, Toilets, Med Tent, and Campfire each have a second tier
- Each tier boosts income and satisfaction; costs scale with season
- Tier status shown with stars in the info panel, upgrade button during planning

### Seasonal Cost Scaling
- Building placement and tier upgrade costs increase each season
- Costs rise 8% per season, capping at 2x by season 13
- Scaled prices shown in the build menu and tier upgrade buttons

### Day/Night Building Glow
- Buildings now emit colored glow at dusk and night during festivals
- Food tents glow warm orange, bars glow green, campfires glow fire-orange
- VIP lounges, DJ booths, string lights, tree lights, and glamping tents all glow
- Stage spotlights boost intensity during nighttime

### Attendee Variety & Behaviors
- Attendees now vary in size (0.85x to 1.15x scale)
- Random accessories: backpacks (15% chance), glow sticks, hats
- Pants color variety instead of uniform blue
- VIP attendees spawn when a VIP Lounge is placed (10% chance per spawn)
- VIPs wear gold shirts, sunglasses, are slightly larger, stay longer, start happier
- VIP attendees spend 3x more at vendor buildings
- Attendees sit near campfires when tired (new SITTING state), recovering energy and fun
- Sitting attendees visually lower to the ground

### Intoxication & Party Favors
- Attendees now track drinks consumed at bars and VIP lounges
- Three intoxication levels: tipsy (2+ drinks), drunk (3+), wasted (5+)
- Drunk attendees wobble as they walk, move slower, and drift sideways
- Wasted attendees can collapse into a new PASSED_OUT state, lying on the ground
- Passed-out attendees lose satisfaction rapidly and seek the med tent to recover
- Intoxication increases spending (tipsy 1.2x, drunk 1.5x, wasted 2x), stacking with VIP multiplier
- Drunk/wasted attendees have faster bladder decay and energy drain
- Tipsy/drunk attendees gain fun more slowly (they're already having a good time)
- Three party favors acquired randomly while dancing: energized, mellow, trippy
- Energized: faster movement, faster dancing, slower energy drain
- Mellow: prefer sitting at campfires, bonus satisfaction while sitting, calmer movement
- Trippy: colorful glow light, spinning dance, visual trail effect, ignore needs while dancing
- Bubble icons show current state: beer mugs for drunk, dizzy face for wasted, pill for favors
- Party favors wear off after a timer (15-30 seconds)
- Building med tents becomes important for recovering wasted attendees

### Security Guards
- New Security Post building ($2,500) deploys two patrol guards who actively walk the festival grounds
- Guards scan for trouble: dealers are top priority, followed by passed-out and wasted attendees, then party favor users and drunks
- Dealers caught by guards are ejected from the festival and fined $25-50
- Attendees caught with party favors have them confiscated, lose satisfaction, and pay a $10-25 fine
- Wasted attendees are escorted to the nearest med tent to recover
- Drunk attendees get a warning, have one drink removed, and lose some satisfaction
- Entrance gates with security staff now spawn a gate guard who checks arriving attendees for contraband
- 15% of attendees arrive carrying contraband; gate guards intercept and confiscate it with a $5-15 fine
- 12% chance an attendee who acquires party favors becomes a dealer (shown with pill bubble icon)
- Guard state shown with emoji bubbles: magnifying glass (patrolling), siren (chasing), stop sign (confronting)
- Strategic placement matters: security posts cover patrol radius, entrance gates catch contraband at the door

### Janitors & Medics
- Hiring janitor staff on restrooms or shower blocks now spawns an active janitor who patrols the grounds
- Litter (cups, wrappers, scraps) accumulates near food tents, bars, merch stands, and VIP lounges during festivals
- Litter buildup gradually reduces all attendee satisfaction — more litter means unhappier crowds
- Janitors detect nearby litter, walk to it, sweep it up (with a cleaning animation), and resume patrol
- Litter spawns faster with larger crowds, capping at 40 piles on the ground
- Hiring medic staff on med tents now spawns active medics (up to 2 per tent) who patrol for patients
- Medics scan for passed-out attendees (top priority), wasted attendees, and those critically low on energy
- Passed-out and wasted attendees are picked up and escorted back to the med tent for treatment
- Escorted patients get drinks reduced, energy restored, and a satisfaction boost on delivery
- Low-energy attendees get field treatment without needing a trip to the tent
- Janitors wear green uniforms with a broom; medics wear white with a red cross and med bag
- Both show emoji bubbles for their current activity (sweeping, heading to litter, treating, escorting)

### Weather Visual Effects
- Heatwave events now show rising golden heat shimmer particles across the festival grounds
- Strong Wind events now show white wind streaks blowing horizontally through the scene
- Shimmer particles pulse in opacity to simulate heat distortion
- Both effects auto-clean when the event ends

### Choice Events
- ~35% of random events are now interactive decisions with two options
- Fight Breaks Out: send security ($500) for a mood boost, or ignore it and risk satisfaction
- Bad Batch: shut down a food vendor (lose food income) or keep it quiet (risk word spreading)
- Noise Complaint: turn it down (less fun) or crank it up ($2,000 fine but huge mood boost)
- Shady Vendor: take a bribe (+$3,000 but satisfaction dip) or stay legit (small mood boost)
- Medical Emergency: call an ambulance ($1,500 for big satisfaction) or use the med tent (free, smaller boost)
- Rival Festival: run promos ($2,000 for loyalty) or ignore them (some attendees lose interest)
- Porta-Potty Overflow: emergency cleanup ($800) or rope it off (bladder needs spike)
- Each choice has clear trade-offs between money and crowd satisfaction
- Choice popup pauses event timer until you decide

### Festival Star Rating & Reputation Milestones
- Festival results now show a 1-5 star rating based on satisfaction score
- 5 stars at 90%+, 4 at 75%+, 3 at 60%+, 2 at 40%+, 1 at 20%+
- Stars displayed in gold (4-5), pale yellow (2-3), or gray (0-1)
- Five reputation milestones unlock as you grow: Local Buzz (10), Rising Star (25), Festival Legend (50), Cultural Icon (75), Festival Empire (100)
- Each milestone triggers a golden popup notification with title and flavor text
