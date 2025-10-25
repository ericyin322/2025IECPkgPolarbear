
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
export class Game {
  constructor() {


    // ----- UI -----
    const scoreEl = document.getElementById('score');
    const statusEl = document.getElementById('status');
    const timeEl = document.getElementById('time');
    const hintEl = document.getElementById('hint');
    const overlayEl = document.getElementById('overlay');
    const startBtn = document.getElementById('startBtn');
    const summaryEl = document.getElementById('summary');

    function setStatus(txt) { statusEl.textContent = txt; }
    function setScore(n) { scoreEl.textContent = String(n); }
    function showHint(show) { hintEl.classList.toggle('show', !!show); }

    // ----- Scene -----
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    document.body.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xdaf2ff, 30, 180);
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
    camera.position.set(0, 6, 16);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 2, 0);

    const hemi = new THREE.HemisphereLight(0xEFFFFF, 0x88bbee, 1.5);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 1.1);
    dir.position.set(10, 20, 10);
    dir.castShadow = true;
    scene.add(dir);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Ground (ice)
    const groundGeo = new THREE.PlaneGeometry(600, 600, 1, 1);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xD2E9FF, roughness: 0.7, metalness: 0.0 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Simple skybox tint
    scene.background = new THREE.Color(0xECF5FF);

    // ----- Helpers to build simple low-poly animals -----
    function makeLeg(color = 0xffffff) {
      const g = new THREE.BoxGeometry(0.6, 1.6, 0.6);
      const m = new THREE.MeshStandardMaterial({ color });
      const leg = new THREE.Mesh(g, m);
      leg.castShadow = true; leg.receiveShadow = true;
      return leg;
    }

    function makeEar(color = 0xffffff) {
      const g = new THREE.CapsuleGeometry(0.25, 0.2, 4, 8);
      const m = new THREE.MeshStandardMaterial({ color });
      const ear = new THREE.Mesh(g, m);
      ear.castShadow = true; return ear;
    }

    function makePolarBear() {
      const bear = new THREE.Group();

      const white = 0xffffff; const noseC = 0x333333; const padC = 0xeeeeee;
      const body = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.8, 2.2), new THREE.MeshStandardMaterial({ color: white }));
      body.position.y = 2.0; body.castShadow = true; body.receiveShadow = true; bear.add(body);

      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.0, 0.8, 10), new THREE.MeshStandardMaterial({ color: white }));
      neck.position.set(1.6, 2.4, 0); neck.rotation.z = -0.3; neck.castShadow = true; bear.add(neck);

      const head = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 1.2), new THREE.MeshStandardMaterial({ color: white }));
      head.position.set(2.5, 2.7, 0); head.castShadow = true; bear.add(head);

      const nose = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.6), new THREE.MeshStandardMaterial({ color: noseC }));
      // nose.position.set(3.1, 2.55, 0); 
      nose.position.set(0.6, -0.15, 0);
      nose.castShadow = true;
      head.add(nose);

      const earL = makeEar(white);
      earL.position.set(-0.3, 0.55, 0.45);
      // earL.position.set(2.2, 3.25, 0.45); 
      head.add(earL);

      const earR = makeEar(white);
      earR.position.set(-0.3, 0.55, -0.45);
      head.add(earR);

      const legFL = makeLeg(padC); legFL.position.set(0.7, 0.8, 0.8); bear.add(legFL);
      const legFR = makeLeg(padC); legFR.position.set(0.7, 0.8, -0.8); bear.add(legFR);
      const legBL = makeLeg(padC); legBL.position.set(-1.3, 0.8, 0.8); bear.add(legBL);
      const legBR = makeLeg(padC); legBR.position.set(-1.3, 0.8, -0.8); bear.add(legBR);

      const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.1, 4, 8), new THREE.MeshStandardMaterial({ color: white }));
      tail.position.set(-1.8, 2.2, 0); bear.add(tail);

      // Animation state
      const state = {
        mode: 'idle', // 'walk'|'ambush'|'success'|'fail'
        speed: 2.5, // forward speed when walking
        t: 0
      };

      function setMode(m) { state.mode = m; state.t = 0; }

      function update(dt) {
        state.t += dt;
        // basic leg swing
        const swing = Math.sin(state.t * 8) * 0.4;
        if (state.mode === 'walk') {
          legFL.rotation.x = swing;
          legBR.rotation.x = swing;
          legFR.rotation.x = -swing;
          legBL.rotation.x = -swing;
          body.position.y = 2.0 + Math.sin(state.t * 8) * 0.05;
        } else {
          legFL.rotation.x = legFR.rotation.x = legBL.rotation.x = legBR.rotation.x = 0;
        }
        if (state.mode === 'ambush') {
          // crouch a bit
          bear.position.y = THREE.MathUtils.lerp(bear.position.y, -0.2, 0.2);
          head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, -0.3, 0.2);
        } else if (state.mode === 'success') {
          // celebratory head nod
          head.rotation.x = Math.sin(state.t * 6) * 0.25;
        } else if (state.mode === 'fail') {
          // disappointed head shake
          head.rotation.y = Math.sin(state.t * 8) * 0.25;
        } else {
          // reset
          bear.position.y = THREE.MathUtils.lerp(bear.position.y, 0, 0.2);
          head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, 0, 0.2);
          head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, 0, 0.2);
        }
      }

      return { group: bear, setMode, update, state };
    }

    function makeSealx() {
      const seal = new THREE.Group();


      // ===== Materials =====
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x8895a7 });
      const bodyMat2 = new THREE.MeshStandardMaterial({ color: 0x93a2b1 });
      const headMat = new THREE.MeshStandardMaterial({ color: 0x9aa8b8 });
      const darkMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
      const finMat = new THREE.MeshStandardMaterial({ color: 0x91a2b3 });
      // ===== Body (two capsules) =====
      // Rear section
      const rear = new THREE.Mesh(new THREE.CapsuleGeometry(0.9, 1.4, 6, 12), bodyMat);
      rear.rotation.z = Math.PI / 2; // align along X
      rear.position.x = -0.6;
      rear.castShadow = rear.receiveShadow = true; seal.add(rear);


      // Front section (slightly slimmer, overlaps to form smooth body)
      const front = new THREE.Mesh(new THREE.CapsuleGeometry(0.8, 1.2, 6, 12), bodyMat2);
      front.rotation.z = Math.PI / 2;
      front.position.x = 0.7;
      front.castShadow = front.receiveShadow = true; seal.add(front);


      // ===== Head =====
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.52, 20, 16), headMat);
      head.position.set(1.8, 0.2, 0);
      head.castShadow = true; seal.add(head);
      // Nose (snout tip)
      const nose = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), darkMat);
      nose.position.set(2.15, 0.18, 0);
      nose.castShadow = true; seal.add(nose);


      // Eyes
      const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), darkMat);
      eyeL.position.set(1.95, 0.32, 0.18); seal.add(eyeL);
      const eyeR = eyeL.clone(); eyeR.position.z = -0.18; seal.add(eyeR);


      // Whiskers (3 per side)
      function makeWhisker() {
        const g = new THREE.CylinderGeometry(0.01, 0.01, 0.7, 6);
        const m = darkMat;
        const w = new THREE.Mesh(g, m);
        w.rotation.z = Math.PI / 2; // lay along X
        w.castShadow = true; return w;
      }
      const whiskerGroup = new THREE.Group();
      const offsets = [-0.08, 0.0, 0.08];
      offsets.forEach((dy, i) => {
        const wL = makeWhisker();
        wL.position.set(2.02, 0.15 + dy, 0.24);
        wL.rotation.y = 0.12; whiskerGroup.add(wL);
        const wR = makeWhisker();
        wR.position.set(2.02, 0.15 + dy, -0.24);
        wR.rotation.y = -0.12; whiskerGroup.add(wR);
      });
      seal.add(whiskerGroup);
      // Mouth hint (tiny inverted cone under nose)
      const mouth = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.08, 10), darkMat);
      mouth.rotation.x = Math.PI; mouth.position.set(2.12, 0.08, 0);
      seal.add(mouth);


      // ===== Fins =====
      const finL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.06, 0.55), finMat);
      finL.position.set(0.2, -0.22, 0.55); seal.add(finL);
      const finR = finL.clone(); finR.position.z = -0.55; seal.add(finR);


      // Tail fins
      const tailL = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, 0.28), finMat);
      tailL.position.set(-1.6, -0.1, 0.28); tailL.rotation.z = 0.35; seal.add(tailL);
      const tailR = tailL.clone(); tailR.position.z = -0.28; tailR.rotation.z = -0.35; seal.add(tailR);
      // ===== Simple animation states =====
      const state = { mode: 'rest', t: 0 }; // 'alert'|'escape'|'caught'
      function setMode(m) { state.mode = m; state.t = 0; }
      function update(dt) {
        state.t += dt;
        if (state.mode === 'rest') {
          head.position.y = 0.2 + Math.sin(state.t * 2) * 0.06;
          whiskerGroup.rotation.y = Math.sin(state.t * 2) * 0.05;
        } else if (state.mode === 'alert') {
          head.position.y = THREE.MathUtils.lerp(head.position.y, 0.6, 0.2);
          whiskerGroup.rotation.y = THREE.MathUtils.lerp(whiskerGroup.rotation.y, 0, 0.2);
        } else if (state.mode === 'escape') {
          // wiggle away quickly (X negative direction)
          seal.position.x -= dt * 6.0;
          head.position.y = 0.4 + Math.sin(state.t * 18) * 0.12;
          finL.rotation.x = Math.sin(state.t * 12) * 0.4;
          finR.rotation.x = -Math.sin(state.t * 12) * 0.4;
        } else if (state.mode === 'caught') {
          head.position.y = THREE.MathUtils.lerp(head.position.y, -0.1, 0.15);
          seal.rotation.z = THREE.MathUtils.lerp(seal.rotation.z, -0.6, 0.1);
        }
      }
      return { group: seal, setMode, update, state };
    }
    function makeSeal() {
      const seal = new THREE.Group();
      const gray = 0x8895a7;

      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.8, 1.6, 6, 12), new THREE.MeshStandardMaterial({ color: gray, transparent: true, opacity: 0.4 }));
      body.rotation.z = Math.PI / 2; body.castShadow = true;
      seal.add(body);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 12), new THREE.MeshStandardMaterial({ color: 0x9aa8b8, transparent: true, opacity: 0.4 }));
      head.position.set(1.2, 0.2, 0); head.castShadow = true;
      seal.add(head);

      const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshStandardMaterial({ color: 0x111111 }));
      eyeL.position.set(0.45, 0.32, 0.18);
      head.add(eyeL);

      const eyeR = eyeL.clone();
      eyeR.position.z = -0.18;
      head.add(eyeR);

      const finL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.5), new THREE.MeshStandardMaterial({ color: 0x91a2b3 }));
      finL.position.set(0.2, -0.2, 0.5);
      seal.add(finL);

      const finR = finL.clone();
      finR.position.z = -0.5;
      seal.add(finR);

      // tail fins
      const tailL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.25), new THREE.MeshStandardMaterial({ color: 0x91a2b3 }));
      tailL.position.set(-1.2, -0.1, 0.25); tailL.rotation.z = 0.3; seal.add(tailL);
      const tailR = tailL.clone(); tailR.position.z = -0.25; tailR.rotation.z = -0.3; seal.add(tailR);

      const state = { mode: 'rest', t: 0 };// 'alert'|'escape'|'caught'
      function setMode(m) { state.mode = m; state.t = 0; }
      function update(dt) {
        state.t += dt;
        if (state.mode === 'rest') {
          head.position.y = 0.2 + Math.sin(state.t * 2) * 0.5;
        } else if (state.mode === 'alert') {
          head.position.y = THREE.MathUtils.lerp(head.position.y, 0.6, 0.2);
        } else if (state.mode === 'escape') {
          // wiggle away quickly (X negative direction)
          seal.position.z += dt * 6.0;
          head.position.y = 0.4 + Math.sin(state.t * 18) * 0.12;
          seal.rotation.x = THREE.MathUtils.lerp(seal.rotation.z, -0.6, 0.1);
        } else if (state.mode === 'caught') {
          // slump
          head.position.y = THREE.MathUtils.lerp(head.position.y, -0.1, 0.15);
          seal.rotation.z = THREE.MathUtils.lerp(seal.rotation.z, -0.6, 0.1);
        }
      }
      return { group: seal, setMode, update, state };
    }

    // ----- Game Objects -----
    const bear = makePolarBear();
    bear.group.position.set(0, 0, 0);
    bear.group.castShadow = true;
    scene.add(bear.group);

    let currentSeal:any = null;

    // simple iceberg props
    function addIceberg(x:any, z:any) {
      const g = new THREE.DodecahedronGeometry(THREE.MathUtils.randFloat(1.4, 3.2));
      const m = new THREE.MeshStandardMaterial({ color: 0xf1fbff, roughness: 0.8 });
      const mesh = new THREE.Mesh(g, m);
      mesh.position.set(x, 0.9, z);
      mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh);
    }
    for (let i = 0; i < 12; i++) addIceberg((Math.random() - 0.5) * 120, (Math.random() - 0.5) * 120);

    // ----- Game State Machine -----
    const Game = {
      state: 'ready', // 'walking'|'encounter'|'window'|'resolve'|'ended'
      score: 0,
      successTarget: 5,
      walkDuration: 3.0,
      windowDuration: 1.0,
      timer: 0,
      totalStart: 0,
      windowOpen: false,
      keyHandled: false,
      lastTime: performance.now()
    };

    function resetGame() {
      Game.state = 'ready';
      Game.score = 0; setScore(Game.score);
      Game.timer = 0; timeEl.textContent = '0.0s';
      Game.windowOpen = false; Game.keyHandled = false;
      showHint(false);
      setStatus('等待開始');
      bear.group.position.set(0, 0, 0);
      bear.group.rotation.set(0, 0, 0);
      bear.setMode('idle');
      if (currentSeal) { scene.remove(currentSeal.group); currentSeal = null; }
      controls.target.set(0, 2, 0);
      controls.update();
    }

    function startGame() {
      summaryEl.style.display = 'none';
      overlayEl.style.display = 'none';
      Game.totalStart = performance.now();
      transitionToWalking();
    }

    function transitionToWalking() {
      Game.state = 'walking'; Game.timer = 0; setStatus('漫步中…');
      bear.setMode('walk');
      // point forward to +X direction always
      bear.group.rotation.y = 0;
    }

    function spawnSealAhead() {
      if (currentSeal) { scene.remove(currentSeal.group); }
      currentSeal = makeSeal();
      const aheadX = bear.group.position.x + 6 + Math.random() * 1.5;
      currentSeal.group.position.set(aheadX, 0.6, THREE.MathUtils.randFloatSpread(1.0));
      currentSeal.group.rotation.y = Math.PI; // face bear
      scene.add(currentSeal.group);
    }

    function openEncounterWindow() {
      Game.state = 'window'; Game.timer = 0; Game.windowOpen = true; Game.keyHandled = false;
      setStatus('遇到海豹！按空白鍵！');
      bear.setMode('ambush');
      currentSeal.setMode('alert');
      showHint(true);
    }

    function resolveEncounter(success:any) {
      Game.state = 'resolve'; Game.timer = 0; Game.windowOpen = false;
      showHint(false);
      if (success) {
        Game.score++; setScore(Game.score);
        setStatus('捕獲成功！');
        bear.setMode('success');
        currentSeal.setMode('caught');
      } else {
        setStatus('失敗！海豹逃走了…');
        bear.setMode('fail');
        currentSeal.setMode('escape');
      }
    }

    function maybeEnd() {
      if (Game.score >= Game.successTarget) {
        Game.state = 'ended';
        const totalMs = performance.now() - Game.totalStart;
        const sec = (totalMs / 1000).toFixed(2);
        overlayEl.style.display = 'flex';
        summaryEl.style.display = 'block';
        summaryEl.textContent = `恭喜！你捕獲了 5 隻海豹。總時間：${sec} 秒。`;
        setStatus('遊戲結束');
        resetGame();
      } else {
        transitionToWalking();
      }
    }

    // Key handling
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        if (Game.windowOpen && !Game.keyHandled) {
          Game.keyHandled = true;
          resolveEncounter(true);
        }
        e.preventDefault();
      }
    }, { passive: false });

    startBtn.addEventListener('click', () => {
      resetGame();
      startGame();
    });

    resetGame();

    // ----- Animation / Game Loop -----
    function animate() {
      requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min(0.033, (now - Game.lastTime) / 1000);
      Game.lastTime = now;

      controls.update();

      // Update animals
      bear.update(dt);
      if (currentSeal) currentSeal.update(dt);

      // Update time display during active play
      if (['walking', 'encounter', 'window', 'resolve'].includes(Game.state)) {
        const elapsed = (now - Game.totalStart) / 1000;
        timeEl.textContent = `${elapsed.toFixed(1)}s`;
      }

      // State machine tick
      Game.timer += dt;
      switch (Game.state) {
        case 'walking': {
          // move bear forward
          const dx = bear.state.speed * dt;
          bear.group.position.x += dx;
          camera.position.x += dx * 1; // follow a bit
          controls.target.x += dx * 1;
          // after walkDuration, spawn a seal and prep encounter
          if (Game.timer >= Game.walkDuration) {
            spawnSealAhead();
            Game.state = 'encounter'; Game.timer = 0; setStatus('靠近目標…');
          }
          break;
        }
        case 'encounter': {
          // walk closer until within range
          const targetX = currentSeal.group.position.x - 2.5;
          const dx = Math.min(bear.state.speed * dt, Math.max(0, targetX - bear.group.position.x));
          bear.group.position.x += dx;
          camera.position.x += dx * 0.6; controls.target.x += dx * 0.6;
          if (Math.abs(bear.group.position.x - targetX) < 0.05) {
            openEncounterWindow();
          }
          break;
        }
        case 'window': {
          // wait for input up to windowDuration
          if (Game.timer >= Game.windowDuration) {
            if (!Game.keyHandled) resolveEncounter(false);
          }
          break;
        }
        case 'resolve': {
          // play out animation for a short time then proceed
          if (Game.timer >= 1.2) {
            if (currentSeal) {
              // remove seal if out of view or caught
              if (currentSeal.state.mode === 'escape' && currentSeal.group.position.x < bear.group.position.x - 4) {
                scene.remove(currentSeal.group);
                currentSeal = null;
              } else if (currentSeal.state.mode === 'caught') {
                scene.remove(currentSeal.group);
                currentSeal = null;
              } else if (currentSeal.state.mode === 'escape') {
                // force remove after 2s
                scene.remove(currentSeal.group); currentSeal = null;
              }
            }
            maybeEnd();
          }
          break;
        }
        case 'ended':
        case 'ready':
        default: break;
      }

      renderer.render(scene, camera);
    }
    animate();

    // Resize handler
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
  init(){
    // alert("?")
  }
}