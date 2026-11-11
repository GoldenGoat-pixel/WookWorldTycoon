# Changelog

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
