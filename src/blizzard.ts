
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
export class Blizzard {
  public renderer: any;
  public scene: any;
  public camera: any;
  public controls: any;

  public currentSeal: any;
  public bear: any;
  constructor() {
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.controls = null;

    this.currentSeal = null;
    this.bear = null;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);

    // ----- Scene -----

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    document.body.appendChild(this.renderer.domElement);


    this.scene.fog = new THREE.Fog(0xdaf2ff, 30, 180);

    this.camera.position.set(0, 6, 16);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.target.set(0, 2, 0);

    this.currentSeal = null;

    const hemi = new THREE.HemisphereLight(0xEFFFFF, 0x88bbee, 1.5);
    this.scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 1.1);
    dir.position.set(10, 20, 10);
    dir.castShadow = true;
    this.scene.add(dir);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Ground (ice)
    const groundGeo = new THREE.PlaneGeometry(600, 600, 1, 1);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xD2E9FF, roughness: 0.7, metalness: 0.0 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Simple skybox tint
    this.scene.background = new THREE.Color(0xECF5FF);

    // ----- Game Objects -----
    this.bear = this.makePolarBear();
    this.bear.group.position.set(0, 0, 0);
    this.bear.group.castShadow = true;
    this.scene.add(this.bear.group);



    // simple iceberg props
    function makeIceberg(x: any, z: any) {
      const g = new THREE.DodecahedronGeometry(THREE.MathUtils.randFloat(1.4, 3.2));
      const m = new THREE.MeshStandardMaterial({ color: 0xf1fbff, roughness: 0.8 });
      const mesh = new THREE.Mesh(g, m);
      mesh.position.set(x, 0.9, z);
      mesh.castShadow = true; mesh.receiveShadow = true;
      return mesh;
    }
    for (let i = 0; i < 12; i++) this.scene.add(makeIceberg((Math.random() - 0.5) * 120, (Math.random() - 0.5) * 120))
    // alert("?")
  }
  init() { }

  makePolarBear() {

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
      ear.castShadow = true;
      return ear;
    }
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

    function setMode(m:any) { state.mode = m; state.t = 0; }

    function update(dt:any) {
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
        head.rotation.z = Math.sin(state.t * 6) * 0.25;
        bear.position.y = THREE.MathUtils.lerp(bear.position.y, -0.5, 0.2);
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

  // private makeSealx() {
  //   const seal = new THREE.Group();


  //   // ===== Materials =====
  //   const bodyMat = new THREE.MeshStandardMaterial({ color: 0x8895a7 });
  //   const bodyMat2 = new THREE.MeshStandardMaterial({ color: 0x93a2b1 });
  //   const headMat = new THREE.MeshStandardMaterial({ color: 0x9aa8b8 });
  //   const darkMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
  //   const finMat = new THREE.MeshStandardMaterial({ color: 0x91a2b3 });
  //   // ===== Body (two capsules) =====
  //   // Rear section
  //   const rear = new THREE.Mesh(new THREE.CapsuleGeometry(0.9, 1.4, 6, 12), bodyMat);
  //   rear.rotation.z = Math.PI / 2; // align along X
  //   rear.position.x = -0.6;
  //   rear.castShadow = rear.receiveShadow = true; seal.add(rear);


  //   // Front section (slightly slimmer, overlaps to form smooth body)
  //   const front = new THREE.Mesh(new THREE.CapsuleGeometry(0.8, 1.2, 6, 12), bodyMat2);
  //   front.rotation.z = Math.PI / 2;
  //   front.position.x = 0.7;
  //   front.castShadow = front.receiveShadow = true; seal.add(front);


  //   // ===== Head =====
  //   const head = new THREE.Mesh(new THREE.SphereGeometry(0.52, 20, 16), headMat);
  //   head.position.set(1.8, 0.2, 0);
  //   head.castShadow = true; seal.add(head);
  //   // Nose (snout tip)
  //   const nose = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), darkMat);
  //   nose.position.set(2.15, 0.18, 0);
  //   nose.castShadow = true; seal.add(nose);


  //   // Eyes
  //   const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), darkMat);
  //   eyeL.position.set(1.95, 0.32, 0.18); seal.add(eyeL);
  //   const eyeR = eyeL.clone(); eyeR.position.z = -0.18; seal.add(eyeR);


  //   // Whiskers (3 per side)
  //   function makeWhisker() {
  //     const g = new THREE.CylinderGeometry(0.01, 0.01, 0.7, 6);
  //     const m = darkMat;
  //     const w = new THREE.Mesh(g, m);
  //     w.rotation.z = Math.PI / 2; // lay along X
  //     w.castShadow = true; return w;
  //   }
  //   const whiskerGroup = new THREE.Group();
  //   const offsets = [-0.08, 0.0, 0.08];
  //   offsets.forEach((dy, i) => {
  //     const wL = makeWhisker();
  //     wL.position.set(2.02, 0.15 + dy, 0.24);
  //     wL.rotation.y = 0.12; whiskerGroup.add(wL);
  //     const wR = makeWhisker();
  //     wR.position.set(2.02, 0.15 + dy, -0.24);
  //     wR.rotation.y = -0.12; whiskerGroup.add(wR);
  //   });
  //   seal.add(whiskerGroup);
  //   // Mouth hint (tiny inverted cone under nose)
  //   const mouth = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.08, 10), darkMat);
  //   mouth.rotation.x = Math.PI; mouth.position.set(2.12, 0.08, 0);
  //   seal.add(mouth);


  //   // ===== Fins =====
  //   const finL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.06, 0.55), finMat);
  //   finL.position.set(0.2, -0.22, 0.55); seal.add(finL);
  //   const finR = finL.clone(); finR.position.z = -0.55; seal.add(finR);


  //   // Tail fins
  //   const tailL = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, 0.28), finMat);
  //   tailL.position.set(-1.6, -0.1, 0.28); tailL.rotation.z = 0.35; seal.add(tailL);
  //   const tailR = tailL.clone(); tailR.position.z = -0.28; tailR.rotation.z = -0.35; seal.add(tailR);
  //   // ===== Simple animation states =====
  //   const state = { mode: 'rest', t: 0 }; // 'alert'|'escape'|'caught'
  //   function setMode(m) { state.mode = m; state.t = 0; }
  //   function update(dt) {
  //     state.t += dt;
  //     if (state.mode === 'rest') {
  //       head.position.y = 0.2 + Math.sin(state.t * 2) * 0.06;
  //       whiskerGroup.rotation.y = Math.sin(state.t * 2) * 0.05;
  //     } else if (state.mode === 'alert') {
  //       head.position.y = THREE.MathUtils.lerp(head.position.y, 0.6, 0.2);
  //       whiskerGroup.rotation.y = THREE.MathUtils.lerp(whiskerGroup.rotation.y, 0, 0.2);
  //     } else if (state.mode === 'escape') {
  //       // wiggle away quickly (X negative direction)
  //       seal.position.x -= dt * 6.0;
  //       head.position.y = 0.4 + Math.sin(state.t * 18) * 0.12;
  //       finL.rotation.x = Math.sin(state.t * 12) * 0.4;
  //       finR.rotation.x = -Math.sin(state.t * 12) * 0.4;
  //     } else if (state.mode === 'caught') {
  //       head.position.y = THREE.MathUtils.lerp(head.position.y, -0.1, 0.15);
  //       seal.rotation.z = THREE.MathUtils.lerp(seal.rotation.z, -0.6, 0.1);
  //     }
  //   }
  //   return { group: seal, setMode, update, state };
  // }

  makeSeal() {
    const seal = new THREE.Group();
    const gray = 0x8895a7;

    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.8, 1.6, 6, 12), new THREE.MeshStandardMaterial({ color: gray, transparent: false, opacity: 0.4 }));
    body.rotation.z = Math.PI / 2; body.castShadow = true;
    seal.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 12), new THREE.MeshStandardMaterial({ color: 0x9aa8b8, transparent: false, opacity: 0.4 }));
    head.position.set(1.2, 0.2, 0); head.castShadow = true;
    seal.add(head);

    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshStandardMaterial({ color: 0x111111 }));
    eyeL.position.set(0.45, 0.32, 0.18);
    head.add(eyeL);

    const eyeR = eyeL.clone();
    eyeR.position.z = -0.18;
    head.add(eyeR);

    const finL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.5), new THREE.MeshStandardMaterial({ color: 0x91a2b3 }));
    finL.position.set(0.2, -0.2, 1);
    seal.add(finL);

    const finR = finL.clone();
    finR.position.z = -1;
    seal.add(finR);

    // tail fins
    const tailL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.25), new THREE.MeshStandardMaterial({ color: 0x91a2b3 }));
    tailL.position.set(-1.5, -0.3, 0.25); 
    tailL.rotation.z = 0.3; 
    seal.add(tailL);
    const tailR = tailL.clone(); 
    tailR.position.z = -0.25; 
    tailR.rotation.z = -0.3; 
    seal.add(tailR);

    const state = { mode: 'rest', t: 0 };// 'alert'|'escape'|'caught'
    function setMode(m:any) { state.mode = m; state.t = 0; }
    function update(dt:any) {
      state.t += dt;
      if (state.mode === 'rest') {
        head.position.y = 0.2 + Math.sin(state.t * 2) * 0.5;
      } else if (state.mode === 'alert') {
        head.position.y = THREE.MathUtils.lerp(head.position.y, 0.6, 0.2);
      } else if (state.mode === 'escape') {
        // wiggle away quickly (X negative direction)
        seal.position.z += dt * 6.0;
        head.position.y = 0.4 + Math.sin(state.t * 18) * 0.12;
        seal.rotation.x -= THREE.MathUtils.lerp(seal.rotation.z, -0.6, 0.1);
      } else if (state.mode === 'caught') {
        // slump
        head.position.y = THREE.MathUtils.lerp(head.position.y, -0.1, 0.15);
        seal.rotation.z = THREE.MathUtils.lerp(seal.rotation.z, -0.6, 0.1);
      }
    }
    return { group: seal, setMode, update, state };
  }
  spawnSealAhead() {
    if (this.currentSeal) { this.scene.remove(this.currentSeal.group); }
    this.currentSeal = this.makeSeal();
    const aheadX = this.bear.group.position.x + 6 + Math.random() * 1.5;
    this.currentSeal.group.position.set(aheadX, 0.6, THREE.MathUtils.randFloatSpread(1.0));
    this.currentSeal.group.rotation.y = 0//-Math.PI; // face bear
    this.scene.add(this.currentSeal.group);
  }
}