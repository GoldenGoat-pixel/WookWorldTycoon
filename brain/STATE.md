# Project State

**Written by:** Antonio's Claude

## Right now
Three parallel features from user's "1,3,4" selection are committed and pushed:
1. **Procedural Audio Overhaul** — stage-specific music layers, dynamic crowd ambience, weather sounds, vendor chime
2. **Desire-Driven Attendee AI** — smart wandering, need-based building seeking, stage attraction, social clustering
3. **Between-Festival Prep System** — purchasable prep actions (marketing, VIP packages, weather insurance, staff training, etc.) with bonuses applied to the next festival

## Last session (2026-11-16)
All three features implemented in parallel forks, committed as separate clean commits, pushed to main.

## Next up
- Wire `playVendorSale()` chime into vendor tick events (sound exists but isn't triggered yet)
- Night market / between-festival gameplay beyond the prep board (browsing vendors, campfire scenes)
- Polish: test all three features together on the Retroid, tune audio gain levels, balance prep action costs
- Potential: procedural music could react to time-of-day (softer at night, energetic at noon)

## Blockers
None currently.
