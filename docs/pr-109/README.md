# PR #109 display screenshots

Captured from the production build of `16ce5ea` with deterministic IP fixture data.

- `foldable-open.png`: 673×841 with a vertical display feature at 336 px (book posture)
- `foldable-landscape.png`: 717×512 with a vertical display feature at 360 px (laptop posture)
- `apple-watch-*.png`: 184×224 rectangular viewport, 2.5× pixel density
- `pixel-watch-*.png`: 200×200 round viewport, 2.5× pixel density

The foldable screenshots use Chrome's `Emulation.setDeviceMetricsOverride` with a `displayFeature`; the round-watch screenshots set the `data-display-shape="round"` attribute that `DisplayProfile` publishes on real Wear OS devices.
