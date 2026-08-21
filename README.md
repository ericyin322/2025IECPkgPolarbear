# Polar Bear Hunt 🐻‍❄️

A browser-based 3D game built with [Three.js](https://threejs.org/) where a polar bear wanders across the ice. When it encounters a seal, you have a limited time to answer a question correctly to catch it.

Live at https://ericyin322.github.io/2025IECPkgPolarbear/

## Gameplay

- The bear roams a snowy 3D scene.
- Encountering a seal triggers a question prompt — answer within the time limit to score a catch.
- Score, status, and elapsed time are tracked in the on-screen HUD.
- Supports webcam-based hand gesture input via [MediaPipe Tasks Vision](https://developers.google.com/mediapipe) as an alternative control method.

## Tech Stack

- [Three.js](https://threejs.org/) — 3D rendering
- [Vite](https://vitejs.dev/) — dev server and build tool
- TypeScript
- [MediaPipe Tasks Vision](https://developers.google.com/mediapipe) — gesture recognition

## Getting Started

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser.

### Build

```bash
npm run build
npm run preview
```

## Finding 3D Models

Free/low-cost `.gltf`/`.glb` models with animations work well with this project. Good sources:

- [Sketchfab](https://sketchfab.com/) — search and filter by "Downloadable" + license (CC0/CC-BY are safest); download in **glTF** format.
- [Mixamo](https://www.mixamo.com/) — free rigged/animated humanoid characters and animations (export as FBX, then convert to glTF, e.g. via [Blender](https://www.blender.org/)).
- [Poly Haven](https://polyhaven.com/models) — CC0 models, no attribution required.
- [Kenney Assets](https://kenney.nl/assets) — free low-poly game assets, many already in glTF.

Always check the license before using a model, and credit the author if required (CC-BY).

## How to Import a 3D Model into the Game

The existing character models (`santa`, `fox`, `taryk`, `bird_orange`, `oiiaioooooiai_cat`) show the pattern to follow — see [src/blizzard.ts](src/blizzard.ts) around `makeSanta()`.

1. **Get the model in glTF format.** After downloading/exporting, you should have a folder like `scene.gltf` + `scene.bin` + a `textures/` folder (or a single `.glb` file that bundles everything).

2. **Drop it into `public/`.** Create a folder named after the model, e.g.:
   ```
   public/
     my_model/
       scene.gltf
       scene.bin
       textures/
   ```
   Files in `public/` are served as-is and referenced with an absolute path at runtime.

3. **Load it with `GLTFLoader`.** In [src/blizzard.ts](src/blizzard.ts), `loadAnimatedModel(url, scale, clipIdx)` already handles loading, scaling, and picking an animation clip to play:
   ```ts
   let myModel = `${import.meta.env.BASE_URL}my_model/scene.gltf`
   loadAnimatedModel(myModel, 1, 0) // url, scale factor, animation clip index
     .then((res) => {
       self.myModel = res;
       self.scene.add(res.model); // add to the scene
     })
     .catch((err) => {
       console.error('Failed to load animated model:', err);
     });
   ```
   - `scale` — adjust until the model looks correctly sized next to the bear/seals.
   - `clipIdx` — index into the model's embedded animations (check `console.log`'s "Play animation" output, or inspect `gltf.animations`, to find the one you want).
   - Use `import.meta.env.BASE_URL` (not a hardcoded `/`) so paths resolve correctly in both dev and production builds.

4. **Position and animate it.** `res.model` is a `THREE.Group` you can position/rotate/scale like any other object, and `res.mixer` is a `THREE.AnimationMixer` — make sure it's updated each frame (`mixer.update(delta)`) alongside the other mixers in the render loop for the animation to play.

## Project Structure

```
src/
  main.ts          # entry point
  gameEngine.ts     # core game loop and state
  blizzard.ts       # weather/visual effects
  gesture.ts        # webcam hand gesture recognition
  musicPlayer.ts     # background music/audio handling
  data/questions.ts   # question bank
public/             # static assets (models, audio, images)
```
