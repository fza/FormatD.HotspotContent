# Changelog


## 3.0.0

Neos 9 compatibility. **Breaking.**

- Dropped the dependency on `formatd/componentloader`: removed ComponentLoader Fusion registration
- Fixed: `HotspotWithLayer` layer dialog now actually renders (was dead code) — emits extra DOM.
- Fixed: `HotspotWithLayer` `link` property is correctly hidden.
- Restructured the typescript and scss files
- Keyboard accessibility: Escape closes open layer; Tab is trapped inside open layer
- Layer lifecycle extension points: `ContentWithHotspots` exposes overrideable `onBeforeLayerShown()`, `onLayerDidOpen()`, `onBeforeLayerHidden()`, `onLayerDidClose()` for subclasses
- Layer portal rendering: layers are moved off-DOM into a portal wrapper for correct z-index stacking
- German translations added for both node types
- `ImageWithHotspots` node type now extends `FormatD.HotspotEditor:Mixin.HotspotCollection`

**Breaking changes:**

- CSS custom properties renamed: all variables are now prefixed with `--hotspot-layer-` — update any custom CSS targeting old variable names
- Layer visibility now uses the `[hidden]` attribute instead of CSS animations — custom CSS targeting animation states or `display`-based selectors must be adapted

**Upgrade:**

- Please verify that custom styling still works.
