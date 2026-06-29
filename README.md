# FormatD.HotspotContent

This package provides an image content element with hotspots. The Neos editor can create and drag
hotspots on the image and provide labels and other descriptions.
It can also be used to place hotspots on any content (not only images) by copying the
`FormatD.HotspotContent:Content.ImageWithHotspots` prototype and replacing `renderer.content` with
another content.


## Compatibility

Versioning scheme:

     1.0.0 
     | | |
     | | Bugfix Releases (non breaking)
     | Neos Compatibility Releases (non breaking)
     Feature Releases (breaking)

Releases and compatibility:

| Package-Version | Neos CMS Version  | Notes                                                                       |
|-----------------|-------------------|-----------------------------------------------------------------------------|
| 3.0.x           | >= 9.0            | Neos 9 compatibility                                                        |
| 2.0.x           | >= 8.3 < 9        | There is no Version 1.0 to be matching with formatd/hotspot-editor versions |

See [CHANGELOG.md](CHANGELOG.md) for breaking changes and upgrade notes.


## Screencast

https://github.com/Format-D/FormatD.HotspotContent/assets/30659291/fb6c3dfc-04e9-406f-a041-e7716b376ce9


## Frontend asset handling

This package is **self-contained**: it has no runtime dependency on any asset bundler. It works in
two modes.

### 1. Standalone ("just install")

Out of the box the package ships pre-built assets in `Resources/Public/HotspotContent/`
(`Main.js`, `Main.css`) and auto-includes them in the page head.

The auto-includes can be toggled via settings (defaults shown):

```yaml
FormatD:
  HotspotContent:
    includeJS: true
    includeCSS: true
```

### 2. With a project asset bundler / FormatD.ComponentLoader

If your project bundles assets itself (e.g. via Vite) and/or uses `formatd/componentloader`
(https://github.com/Format-D/FormatD.ComponentLoader) to load and re-initialize components on
demand, **disable the auto-includes** (see above). This is required: with the auto-includes off the
shipped bundle is not loaded, so its bootstrap never runs and there is no double-initialization.

The controller (`ContentWithHotspots.ts`, default export) exposes `initialize(domSection)` /
`dispose()`. Wrap it in your own component manager and register it for
`FormatD.HotspotContent:Molecule.ContentWithHotspots`.

For on-demand backend reloads, attach the component registration in your project Fusion with an
override:

```
prototype(FormatD.HotspotContent:Molecule.ContentWithHotspots) {
    renderer.@process.augmentWithComponentRegistration {
        expression = FormatD.ComponentLoader:Meta.Processor.Component {
            fusionObjectName = 'FormatD.HotspotContent:Molecule.ContentWithHotspots'
        }
        @position = 'end'
    }
}
```


## Extensibility and Customization

This package is based on `formatd/hotspot-editor`
(https://github.com/Format-D/FormatD.HotspotEditor) and provides a concrete implementation.
Instead of using this package directly, it can also make sense to use it as an example of how to
build your own hotspot elements in Neos.


## Contribution

Please maintain a clean and consistent coding style.

To rebuild the assets (Node >= 24), run:

```bash
cd Resources/Private/Scripts/HotspotContentFrontend && npm install && npm run build
```


## License

See [LICENSE](LICENSE) (MIT)
