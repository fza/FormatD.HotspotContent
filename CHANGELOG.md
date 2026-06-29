# Changelog


## 3.0.0

Neos 9 compatibility, self-contained package. **Breaking.**

- Dropped the dependency on `formatd/componentloader`: removed `ContentWithHotspotsComponentManager`
  and the ComponentLoader Fusion registration; the controller detects the backend on its own.
- Ships pre-built assets (`Resources/Public/HotspotContent/Main.js` / `Main.css`), auto-included by
  default via the `FormatD.HotspotContent.includeJS` / `includeCSS` settings.
- Fixed: `HotspotWithLayer` layer dialog now actually renders (was dead code) — emits extra DOM.
- Fixed: `HotspotWithLayer` `link` property is correctly hidden.

**Upgrade:**

- Standalone: nothing to do, assets auto-load.
- Own bundling / ComponentLoader: set `includeJS` / `includeCSS` to `false`, wrap the exported
  `ContentWithHotspots` controller in your own manager, and re-attach the registration processor in
  your Fusion (see README).
