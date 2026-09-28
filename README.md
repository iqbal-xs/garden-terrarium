# Garden Terrarium

A small living garden inside VS Code. Butterflies, bees, grasshoppers, caterpillars and ladybugs wander across your status bar, crawl in the empty space beside your code, and flutter around a terrarium in the sidebar, Explorer and bottom panel.

It is meant to be calm. The creatures never move or change your code, they get out of the way while you type, and you can pause or turn off any part of the garden.

## Features

- **Status bar creatures.** Tiny emoji creatures walk in from the edge of the status bar, wander for a while, then leave. Click one to shoo them away.
- **Creatures on your code.** A few creatures crawl in the blank space to the right of your lines. They are editor decorations, so your text is never touched or shifted.
- **Stops while you type.** By default, creatures hide for a moment while you type and come back when you stop.
- **Terrarium views.** An animated garden with fireflies and pollen, available in:
  - its own **Garden** icon in the Activity Bar
  - a **Garden** section in the Explorer
  - a **Garden** tab in the bottom panel

  You can drag any of these into the secondary side bar.
- **Adjustable.** Set how many of each creature appear, the overall speed, and how often each area updates.

## Commands

Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and type **Garden**:

| Command | What it does |
| --- | --- |
| Garden: Pause / Resume All Motion | Freezes or wakes the whole garden. |
| Garden: Release a New Creature | Pick a creature to add everywhere. |
| Garden: Reset Terrarium | Starts the garden over using your current settings. |
| Garden: Shoo the Status Bar Creatures | Clears the status bar strip. |
| Garden: Toggle Status Bar Creatures | Turns the status bar creatures on or off. |
| Garden: Toggle Creatures On My Code | Turns the editor creatures on or off. |

## Settings

### Terrarium views

| Setting | Default | Description |
| --- | --- | --- |
| `gardenTerrarium.butterflies` | `3` | Butterflies in the garden panels (0–12). |
| `gardenTerrarium.grasshoppers` | `2` | Grasshoppers in the garden panels (0–8). |
| `gardenTerrarium.caterpillars` | `2` | Caterpillars in the garden panels (0–8). |
| `gardenTerrarium.ladybugs` | `2` | Ladybugs in the garden panels (0–8). |
| `gardenTerrarium.bees` | `1` | Bees in the garden panels (0–8). |
| `gardenTerrarium.fireflies` | `true` | Show drifting fireflies and pollen. |
| `gardenTerrarium.speed` | `1` | Speed multiplier for everything (0.2–3). |

### Status bar

| Setting | Default | Description |
| --- | --- | --- |
| `gardenTerrarium.statusBar.enabled` | `true` | Show creatures in the status bar. |
| `gardenTerrarium.statusBar.alignment` | `"both"` | Which side they roam: `left`, `right` or `both`. |
| `gardenTerrarium.statusBar.width` | `18` | Width of each strip, in cells (6–60). |
| `gardenTerrarium.statusBar.maxCreatures` | `3` | Most creatures per strip at once (1–8). |
| `gardenTerrarium.statusBar.tickMs` | `140` | Time between animation frames, in ms. Higher is calmer and uses less CPU. |

### Editor

| Setting | Default | Description |
| --- | --- | --- |
| `gardenTerrarium.editor.enabled` | `true` | Show creatures beside your code. |
| `gardenTerrarium.editor.maxCreatures` | `3` | Most creatures per visible editor (1–10). |
| `gardenTerrarium.editor.tickMs` | `200` | Time between animation frames, in ms. |
| `gardenTerrarium.editor.pauseWhileTyping` | `true` | Hide creatures briefly while you type. |

## Performance and privacy

- Terrarium views stop animating when they are hidden.
- Pausing the garden stops all creature movement.
- The extension collects no telemetry and makes no network requests.

## Requirements

VS Code 1.70 or newer. Creatures are emoji, so they look best with a font that supports color emoji, which is the default on Windows, macOS and most Linux desktops.

## Release notes

See the **Changelog** tab on the Marketplace page.

## License

MIT. See the LICENSE file included with the extension.
