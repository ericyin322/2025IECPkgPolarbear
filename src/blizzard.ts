
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
export class Blizzard {
  public renderer: any;
  public scene: any;
  public camera: any;
  public controls: any;
  public clock: any;
  public currentSeal: any;
  public bear: any;
  public penguins: any;
  public santa: any;
  public taryk: any
  public fox: any
  public bird_orange: any
  public oiiaioooooiai_cat: any
  constructor() {
    this.clock = new THREE.Clock();
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.controls = null;

    this.currentSeal = null;
    this.bear = null;
    this.penguins = []
    this.santa = null;
    this.taryk = null;
    this.fox = null;
    this.bird_orange = null;
    this.oiiaioooooiai_cat = null;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);

    // ----- Scene -----

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    document.body.appendChild(this.renderer.domElement);


    this.scene.fog = new THREE.Fog(0x87ceeb, 50, 200);;//new THREE.Fog(0xdaf2ff, 30, 180);
    // Simple skybox tint
    // this.scene.background = new THREE.Color(0xECF5FF);
    this.scene.background = new THREE.Color(0x87ceeb);
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

    for (let i = 0; i < 20; i++) {

      let xx = (Math.random() - 0.5) * 120;
      let zz = (Math.random() - 0.5) * 120;

      this.scene.add(makeIceberg(xx, zz))
    }
    for (let i = 0; i < 30; i++) {

      let xx2 = (Math.random() - 0.5) * 120;
      let zz2 = (Math.random() - 0.5) * 120;
      let CTree = this.makeCTree();
      CTree.position.x = xx2;
      CTree.position.z = zz2;
      this.scene.add(CTree)
    }
    for (let i = 0; i < 250; i++) {
      this.addPenguin();
    }
    this.makeSanta();
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

    function setMode(m: any) { state.mode = m; state.t = 0; }

    function update(dt: any) {
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
  addPenguin() {
    const penguin = this.createPenguin();

    // Random position
    penguin.group.position.x = (Math.random() - 0.5) * 80;
    penguin.group.position.y = 1;
    penguin.group.position.z = (Math.random() - 0.5) * 80;

    // Random direction
    penguin.group.userData.direction = Math.random() * Math.PI * 2;
    penguin.group.rotation.y = penguin.group.userData.direction;

    // Random speed
    penguin.group.userData.speed = 2 + Math.random() * 3;

    this.scene.add(penguin.group);
    this.penguins.push(penguin);


  }

  createPenguin() {
    const penguin = new THREE.Group();

    // Body
    const bodyGeo = new THREE.SphereGeometry(1, 16, 16);
    bodyGeo.scale(1, 1.3, 0.9);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    penguin.add(body);

    // Belly
    const bellyGeo = new THREE.SphereGeometry(0.85, 16, 16);
    bellyGeo.scale(0.9, 1.1, 0.95);
    const bellyMat = new THREE.MeshLambertMaterial({ color: "0x12345678" });
    const belly = new THREE.Mesh(bellyGeo, bellyMat);
    belly.position.z = 0.4;
    belly.castShadow = true;
    penguin.add(belly);

    // Head
    const headGeo = new THREE.SphereGeometry(0.6, 16, 16);
    const headMat = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.4;
    head.castShadow = true;
    penguin.add(head);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const eyeMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.25, 1.5, 0.4);
    penguin.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.25, 1.5, 0.4);
    penguin.add(rightEye);

    // Pupils
    const pupilGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const pupilMat = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-0.25, 1.5, 0.52);
    penguin.add(leftPupil);
    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0.25, 1.5, 0.52);
    penguin.add(rightPupil);

    // Beak
    const beakGeo = new THREE.ConeGeometry(0.15, 0.4, 8);
    const beakMat = new THREE.MeshLambertMaterial({ color: 0xffa500 });
    const beak = new THREE.Mesh(beakGeo, beakMat);
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 1.3, 0.6);
    penguin.add(beak);

    // Wings
    const wingGeo = new THREE.SphereGeometry(0.4, 8, 8);
    wingGeo.scale(0.4, 1.2, 0.3);
    const wingMat = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.position.set(-0.9, 0.3, 0);
    leftWing.rotation.z = -0.3;
    leftWing.castShadow = true;
    penguin.add(leftWing);
    const rightWing = new THREE.Mesh(wingGeo, wingMat);
    rightWing.position.set(0.9, 0.3, 0);
    rightWing.rotation.z = 0.3;
    rightWing.castShadow = true;
    penguin.add(rightWing);

    // Feet
    const footGeo = new THREE.SphereGeometry(0.25, 8, 8);
    footGeo.scale(1.2, 0.4, 1.5);
    const footMat = new THREE.MeshLambertMaterial({ color: 0xffa500 });
    const leftFoot = new THREE.Mesh(footGeo, footMat);
    leftFoot.position.set(-0.4, -1.2, 0.2);
    leftFoot.castShadow = true;
    penguin.add(leftFoot);
    const rightFoot = new THREE.Mesh(footGeo, footMat);
    rightFoot.position.set(0.4, -1.2, 0.2);
    rightFoot.castShadow = true;
    penguin.add(rightFoot);
    // Christmas Hat (random chance)
    if (Math.random() > 0.75) {
      const hatGroup = new THREE.Group();

      // Hat cone
      const hatConeGeo = new THREE.ConeGeometry(0.45, 1.2, 16);
      const hatConeMat = new THREE.MeshLambertMaterial({ color: 0xc41e3a });
      const hatCone = new THREE.Mesh(hatConeGeo, hatConeMat);
      hatCone.position.y = 0.6;
      hatCone.castShadow = true;
      hatGroup.add(hatCone);

      // Hat brim
      const hatBrimGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.15, 16);
      const hatBrimMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
      const hatBrim = new THREE.Mesh(hatBrimGeo, hatBrimMat);
      hatBrim.position.y = 0.075;
      hatBrim.castShadow = true;
      hatGroup.add(hatBrim);

      // Pom pom
      const pomGeo = new THREE.SphereGeometry(0.2, 8, 8);
      const pomMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
      const pom = new THREE.Mesh(pomGeo, pomMat);
      pom.position.y = 1.2;
      pom.castShadow = true;
      hatGroup.add(pom);

      // Rotate hat slightly for fun
      hatGroup.rotation.z = (Math.random() - 0.5) * 0.4;
      hatGroup.position.y = 1.9;

      penguin.add(hatGroup);
      penguin.userData.hat = hatGroup;
    }
    penguin.userData = {
      leftWing, rightWing, leftFoot, rightFoot,
      animOffset: Math.random() * Math.PI * 2
    };


    let self = this;
    function update(delta: any) {
      const time = self.clock.getElapsedTime();
      // Movement
      const speed = penguin.userData.speed;
      penguin.position.x += Math.sin(penguin.userData.direction) * speed * delta;
      penguin.position.z += Math.cos(penguin.userData.direction) * speed * delta;

      // Boundary check and wrap around
      if (penguin.position.x > 100) penguin.position.x = -100;
      if (penguin.position.x < -100) penguin.position.x = 100;
      if (penguin.position.z > 100) penguin.position.z = -100;
      if (penguin.position.z < -100) penguin.position.z = 100;

      // Running animation
      const animTime = time * 8 + penguin.userData.animOffset;

      // Wing flapping
      penguin.userData.leftWing.rotation.z = -0.3 + Math.sin(animTime) * 0.5;
      penguin.userData.rightWing.rotation.z = 0.3 - Math.sin(animTime) * 0.5;

      // Foot stepping
      penguin.userData.leftFoot.position.y = -1.2 + Math.abs(Math.sin(animTime)) * 0.2;
      penguin.userData.rightFoot.position.y = -1.2 + Math.abs(Math.cos(animTime)) * 0.2;

      // Body bobbing
      penguin.position.y = 1 + Math.abs(Math.sin(animTime * 2)) * 0.1;

      // Slight waddle
      penguin.rotation.z = Math.sin(animTime) * 0.1;
    };


    return { group: penguin, update };


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
  makeCTree() {
    // === Tree Group ===
    const tree = new THREE.Group();


    // === Trunk (樹幹) ===
    const trunkGeo = new THREE.CylinderGeometry(0.4, 0.6, 2, 16);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1; // 底部在地面上
    tree.add(trunk);

    // === Foliage (樹葉 / 綠色部分，做幾層圓錐) ===
    const foliageMat = new THREE.MeshStandardMaterial({
      color: 0x0b6623,
      roughness: 0.8
    });

    const levels = 3;  // 圓錐層數
    const H = 4;       // 樹葉總高度
    const R = 2.5;     // 底部半徑

    for (let i = 0; i < levels; i++) {
      const levelHeight = H / levels;
      const levelRadius = R * (1 - i * 0.2); // 上面越來越小
      const geo = new THREE.ConeGeometry(levelRadius, levelHeight, 32, 1);
      const mesh = new THREE.Mesh(geo, foliageMat);

      const baseY = 2 + i * levelHeight * 0.7; // 疊起來，有一點重疊
      mesh.position.y = baseY + levelHeight / 2;
      tree.add(mesh);
    }

    // === Bulbs (燈泡) ===
    const bulbColors = [
      0xff5555, // 紅
      0xffdd55, // 黃
      0x55ff55, // 綠
      0x55aaff, // 藍
      0xff55ff  // 粉
    ];

    const bulbs = [];
    const bulbGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const totalBulbs = 80;

    // 估計樹葉的範圍：從 y = 2 到 y = 2 + H
    const bottomY = 2;
    const topY = bottomY + H;

    for (let i = 0; i < totalBulbs; i++) {
      const t = Math.random();                      // 0..1 沿著高度
      const y = bottomY + t * (topY - bottomY);    // 真實 y
      const localHeight = y - bottomY;             // 0..H

      // 此高度對應的半徑（圓錐側面公式）
      let radiusAtY = R * (1 - localHeight / H);
      // 加一點隨機，讓燈泡不那麼規則
      radiusAtY *= (0.8 + 0.2 * Math.random());

      const angle = Math.random() * Math.PI * 2;
      const x = radiusAtY * Math.cos(angle);
      const z = radiusAtY * Math.sin(angle);

      const color = bulbColors[Math.floor(Math.random() * bulbColors.length)];
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,          // 自發光顏色 = 本身顏色
        emissiveIntensity: 0.5,   // 亮度
        roughness: 0.3,
        metalness: 0.1
      });

      const bulb = new THREE.Mesh(bulbGeo, mat);
      bulb.position.set(x, y, z);
      tree.add(bulb);

      bulbs.push({
        mesh: bulb,
        phase: Math.random() * Math.PI * 2 // 每顆燈不一樣的閃爍位相
      });
    }

    // === Star on top (頂端的星星) ===
    const starGeo = new THREE.OctahedronGeometry(0.4);
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xffffaa,
      emissive: 0xffffaa,
      emissiveIntensity: 1.5,
      metalness: 0.8,
      roughness: 0.2
    });
    const star = new THREE.Mesh(starGeo, starMat);
    star.position.y = topY + 0.4;
    tree.add(star);
    return tree;
  }
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
    function setMode(m: any) { state.mode = m; state.t = 0; }
    function update(dt: any) {
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

  makeSanta() {

    // const clock = new THREE.Clock();
    let self = this
    const loader = new GLTFLoader();

    function loadAnimatedModel(url: string, scale: number, clipIdx: number) {

      return new Promise((resolve, reject) => {

        loader.load(
          url,
          (gltf) => {
            const _model = gltf.scene;

            // 調整位置 / 比例依照你模型的實際狀況微調

            _model.position.set(0, -1000, 0);
            _model.scale.set(scale, scale, scale);

            let _mixer = null;

            // === AnimationMixer 設定 ===
            const clips = gltf.animations;
            if (clips && clips.length > 0) {
              _mixer = new THREE.AnimationMixer(_model);

              // 播放第一個動畫
              const clip = clips[clipIdx];
              const action = _mixer.clipAction(clip);
              action.play();

              console.log('Play animation:', clip.name);
            } else {
              console.warn('No animations found in this glTF.');
            }




            resolve({ model: _model, mixer: _mixer, clips });
          },
          (xhr) => {
            if (xhr.total) {
              console.log(
                `Loading: ${(xhr.loaded / xhr.total * 100).toFixed(1)}%`
              );
            }
          },
          (error) => {
            console.error('Error loading glTF:', error);
            reject(error);
          }
        );
      });
    }
    let dancesanta = `${import.meta.env.BASE_URL}dancesanta/scene.gltf`
    loadAnimatedModel(dancesanta, 3, 0)
      .then((res) => {
        self.santa = res;
        self.scene.add(self.santa.model);   // 在這裡 add 進場景
      })
      .catch((err) => {
        console.error('Failed to load animated model:', err);
      });
    // let taryk = '/taryk/scene.gltf'
    // loadAnimatedModel(taryk,2,0)
    //   .then((res) => {
    //     self.taryk = res;
    //     self.scene.add(self.taryk.model);   // 在這裡 add 進場景
    //   })
    //   .catch((err) => {
    //     console.error('Failed to load animated model:', err);
    //   });

    let fox = `${import.meta.env.BASE_URL}fox/scene.gltf`
    loadAnimatedModel(fox, 0.5, 1)
      .then((res) => {
        self.fox = res;
        // self.fox.model.position.y=2;
        self.scene.add(self.fox.model);   // 在這裡 add 進場景
      })
      .catch((err) => {
        console.error('Failed to load animated model:', err);
      });
    // let bird_orange = '/bird_orange/scene.gltf'
    // loadAnimatedModel(bird_orange,0.5,0)
    //   .then((res) => {
    //     self.bird_orange = res;
    //     self.scene.add(self.bird_orange.model);   // 在這裡 add 進場景
    //   })
    //   .catch((err) => {
    //     console.error('Failed to load animated model:', err);
    //   });
    let oiiaioooooiai_cat = `${import.meta.env.BASE_URL}oiiaioooooiai_cat/scene.gltf`
    loadAnimatedModel(oiiaioooooiai_cat, 4, 0)
      .then((res) => {
        self.oiiaioooooiai_cat = res;
        self.scene.add(self.oiiaioooooiai_cat.model);   // 在這裡 add 進場景
      })
      .catch((err) => {
        console.error('Failed to load animated model:', err);
      });



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