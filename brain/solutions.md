# Solutions Log
<!-- Append-only: non-trivial problems solved, searchable -->

## 2026-11-16: Multiple stages playing same music layer
**Problem:** If a player places two medium_stages, the layer method runs twice, doubling volume.
**Solution:** `_startStageMusicLayers` uses a `seen` Set keyed on stage type id. First instance of each type starts its layer; duplicates are skipped.

## 2026-11-16: Crowd ambience toggling rapidly at threshold
**Problem:** Crowd rumble starts at 200 attendees, but if crowd fluctuates around 200 it toggles on/off rapidly.
**Solution:** Hysteresis — rumble starts at 200+ but only stops when crowd drops below 150.

## 2026-11-16: Committing interleaved changes from parallel forks
**Problem:** Two forks modified `src/main.js` concurrently (audio overhaul + prep system). Needed clean commits.
**Solution:** Committed purely-owned files first (sounds.js, CHANGELOG.md), then committed all remaining integration files together in the second commit, since main.js changes from both features were interleaved and inseparable without a rewrite.
