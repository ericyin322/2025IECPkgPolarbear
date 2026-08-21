# Polar Bear Hunt 🐻‍❄️

A browser-based 3D game built with [Three.js](https://threejs.org/) where a polar bear wanders across the ice. When it encounters a seal, you have a limited time to answer a question correctly to catch it.

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
