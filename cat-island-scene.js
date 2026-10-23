/**
 * Cat Island 3D Scene Module (cat-island-scene.js)
 * Implements lightweight interactive 3D rendering for VokabelGo Cat Island
 * using local vendored Three.js and GLTFLoader.
 * Includes robust 2D Canvas fallback if WebGL is unavailable.
 */

import * as THREE from 'three';
import { GLTFLoader } from './assets/cat-island/vendor/loaders/GLTFLoader.js';

class CatIslandScene {
  constructor() {
    this.container = null;
    this.canvas3D = null;
    this.canvas2D = null;
    this.ctx2D = null;
    this.badgeEl = null;

    this.is2D = false;
    this.paused = false;
    this.reducedMotion = false;

    // Three.js instances
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Scene Graph References
    this.dioramaGroup = null;
    this.mainBoat = null;
    this.customerBoatsGroup = new THREE.Group();
    this.propsGroup = new THREE.Group();
    this.cosmeticsGroup = new THREE.Group();
    this.particlesGroup = new THREE.Group();

    // Customer boat instances
    // Structure: { id, model, slotIndex, state: 'arriving'|'docked'|'departing', progress: 0, targetPos, startPos, bobOffset, catColor, type }
    this.customerBoats = [];
    this.boatTemplates = {};
    this.itemTemplates = {};

    // Docking stations (relative to market counter at [0.75, 0.7, 0.3])
    this.dockSlots = [
      { pos: new THREE.Vector3(-1.3, 0.05, 1.6), rotY: -0.25, occupied: false, boatId: null },
      { pos: new THREE.Vector3(0.7, 0.05, 2.1),  rotY: 0.10,  occupied: false, boatId: null },
      { pos: new THREE.Vector3(2.5, 0.05, 1.4),  rotY: 0.45,  occupied: false, boatId: null }
    ];

    // Flying package animation
    this.activePackages = [];
    // Floating hearts
    this.activeHearts = [];

    // Helper Cat & Cosmetics
    this.helperCatMesh = null;
    this.helperPawL = null;
    this.helperPawR = null;
    this.helperPackTime = 0;
    this.helperUnlocked = false;
    this.activeCosmetic = 'lantern';

    // Story Event: Chase Boat
    this.chaseBoat = null;
    this.chaseProgress2D = null;

    // Animation & Timing
    this.clock = new THREE.Clock();
    this.lastTime = performance.now();
    this.waterTime = 0;
    this.bobbingObjects = [];

    // Interaction callbacks
    this.onCustomerClick = null;
    this.selectedBoatId = null;

    // Bound handlers
    this.handleResize = this.handleResize.bind(this);
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.renderLoop = this.renderLoop.bind(this);
  }

  init(containerEl, options = {}) {
    this.container = containerEl;
    this.canvas3D = document.getElementById('scene-canvas');
    this.canvas2D = document.getElementById('fallback-canvas');
    this.badgeEl = document.getElementById('scene-status-badge');
    this.onCustomerClick = options.onCustomerClick || null;

    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Detect WebGL capability
    const force2D = new URLSearchParams(location.search).get('graphics') === '2d';
    const webglSupported = !force2D && this.checkWebGLSupport();
    if (!webglSupported) {
      this.init2DFallback('Chế độ tranh vẽ 2D êm ái 🎨');
      return;
    }

    try {
      this.initThreeJS();
      this.loadAssets()
        .then(() => {
          this.updateBadge('Bến chợ đã mở cửa 🛶');
          this.attachEvents();
          this.clock.start();
          requestAnimationFrame(this.renderLoop);
        })
        .catch(err => {
          console.error('[CatIslandScene] Error loading 3D assets:', err);
          this.init2DFallback('Chế độ tranh vẽ 2D êm ái 🎨');
        });
    } catch (e) {
      console.error('[CatIslandScene] Three.js init failed:', e);
      this.init2DFallback('Chế độ tranh vẽ 2D êm ái 🎨');
    }
  }

  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  updateBadge(text) {
    if (this.badgeEl) {
      this.badgeEl.textContent = text;
    }
  }

  initThreeJS() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Scene with mauve studio background matching Blender v03 (#624B69)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x624B69);

    // 2. Camera: Orthographic camera matching Blender v03 orthographic view
    const aspect = width / height;
    const frustumSize = aspect < 1.1 ? 9.8 : 8.8;
    this.camera = new THREE.OrthographicCamera(
      (-frustumSize * aspect) / 2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      -frustumSize / 2,
      0.1,
      100
    );

    // Position matches Blender camera: target (0, 0.1, 0), viewing from front-right
    this.camera.position.set(7.5, 9.2, 9.8);
    this.camera.lookAt(new THREE.Vector3(0.0, 0.1, 0.0));

    // 3. Renderer with capped pixel ratio and proper tone mapping
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas3D,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    // 4. Lighting matching Blender v03 sun and mauve fill
    const sunLight = new THREE.DirectionalLight(0xFFF9E8, 2.6);
    sunLight.position.set(6.0, 12.0, 8.0);
    this.scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xD8CBE6, 1.4);
    fillLight.position.set(-6.0, 6.0, -8.0);
    this.scene.add(fillLight);

    const ambientLight = new THREE.AmbientLight(0x786482, 1.2);
    this.scene.add(ambientLight);

    // Add groups
    this.scene.add(this.customerBoatsGroup);
    this.scene.add(this.propsGroup);
    this.scene.add(this.cosmeticsGroup);
    this.scene.add(this.particlesGroup);
  }

  async loadAssets() {
    this.updateBadge('Đang nạp mô hình chợ nổi v03...');
    const loader = new GLTFLoader();

    // 1. Load Main Diorama
    const dioramaGltf = await loader.loadAsync('./assets/cat-island/cat-island-v03.glb');
    this.dioramaGroup = dioramaGltf.scene;
    this.scene.add(this.dioramaGroup);

    // Locate Main Market Trawler and setup water transparency
    this.dioramaGroup.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = false;
        node.receiveShadow = false;
        // Check if mesh is the translucent water surface
        if (node.name.includes('Water Surface Top') || (node.material && node.material.name.includes('Water turquoise'))) {
          node.material = new THREE.MeshStandardMaterial({
            color: 0x32D2C4,
            transparent: true,
            opacity: 0.45,
            roughness: 0.6,
            metalness: 0.05
          });
          this.waterMesh = node;
        } else if (node.name.includes('Water Cutaway Wall')) {
          node.material = new THREE.MeshStandardMaterial({
            color: 0x20AEA2,
            transparent: true,
            opacity: 0.75,
            roughness: 0.4
          });
        }
      }
    });

    // 2. Load Customer Boats and Props
    const customerGltf = await loader.loadAsync('./assets/cat-island/customer-boats.glb');
    customerGltf.scene.traverse((node) => {
      if (node.isObject3D && (node.name.startsWith('CustomerBoat_') || node.name.startsWith('Item_'))) {
        this.boatTemplates[node.name] = node;
      }
    });

    // Visible compact selling counter, goods crates, fruit, and authentic market signboard
    this.buildMarketProps();

    // Create Helper Cat mesh for the selling counter
    this.buildHelperCat();

    // Build decorative cosmetics
    this.buildCosmetics();
  }

  buildHelperCat() {
    // Helper cat sits next to sales counter (at x=0.72, y=0.72, z=0.08)
    const helperGroup = new THREE.Group();
    helperGroup.position.set(0.72, 0.72, 0.08);
    helperGroup.scale.set(0.75, 0.75, 0.75);

    const headGeo = new THREE.SphereGeometry(0.22, 12, 10);
    const bodyGeo = new THREE.SphereGeometry(0.16, 10, 8);
    const earGeo = new THREE.ConeGeometry(0.08, 0.16, 4);

    const catMat = new THREE.MeshStandardMaterial({ color: 0xFAF5EC, roughness: 0.6 });
    const patchMat = new THREE.MeshStandardMaterial({ color: 0xE87C38, roughness: 0.6 });
    const bandanaMat = new THREE.MeshStandardMaterial({ color: 0x20AEA2, roughness: 0.5 });
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1A1B1D, roughness: 0.1 });
    const pawMat = new THREE.MeshStandardMaterial({ color: 0xFAF5EC, roughness: 0.6 });

    const head = new THREE.Mesh(headGeo, catMat);
    head.position.y = 0.32;
    helperGroup.add(head);

    const earL = new THREE.Mesh(earGeo, patchMat);
    earL.position.set(-0.12, 0.48, 0);
    earL.rotation.z = 0.25;
    helperGroup.add(earL);

    const earR = new THREE.Mesh(earGeo, catMat);
    earR.position.set(0.12, 0.48, 0);
    earR.rotation.z = -0.25;
    helperGroup.add(earR);

    // Eyes
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), eyeMat);
    eyeL.position.set(-0.08, 0.32, 0.19);
    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), eyeMat);
    eyeR.position.set(0.08, 0.32, 0.19);
    helperGroup.add(eyeL, eyeR);

    const body = new THREE.Mesh(bodyGeo, catMat);
    body.position.y = 0.14;
    helperGroup.add(body);

    const bandana = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.06, 8), bandanaMat);
    bandana.position.y = 0.23;
    helperGroup.add(bandana);

    // Paws for visible packaging animation on delivery
    const pawL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), pawMat);
    pawL.position.set(-0.11, 0.12, 0.14);
    const pawR = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), pawMat);
    pawR.position.set(0.11, 0.12, 0.14);
    helperGroup.add(pawL, pawR);
    this.helperPawL = pawL;
    this.helperPawR = pawR;

    this.helperCatMesh = helperGroup;
    this.helperCatMesh.visible = this.helperUnlocked;
    this.scene.add(this.helperCatMesh);
  }

  buildMarketProps() {
    const marketGroup = new THREE.Group();
    marketGroup.name = 'MarketPropsGroup';

    // 1. Wooden Selling Counter Table on hero boat deck [0.72, 0.69, -0.15]
    const counterMat = new THREE.MeshStandardMaterial({ color: 0x8C5A30, roughness: 0.7 });
    const topBoardMat = new THREE.MeshStandardMaterial({ color: 0xB48250, roughness: 0.6 });

    const counterBase = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.38, 0.44), counterMat);
    counterBase.position.set(0.72, 0.69, -0.15);
    marketGroup.add(counterBase);

    const counterTop = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.05, 0.50), topBoardMat);
    counterTop.position.set(0.72, 0.89, -0.15);
    marketGroup.add(counterTop);

    // 2. Mekong Floating Market "Cây Bẹo" (Bamboo pole displaying sample wares)
    const poleMat = new THREE.MeshStandardMaterial({ color: 0xD8B878, roughness: 0.6 });
    const beoPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 2.4, 6), poleMat);
    beoPole.position.set(1.15, 1.70, -0.35);
    beoPole.rotation.z = -0.08;
    marketGroup.add(beoPole);

    // Fruit hanging on Cây Bẹo (authentic floating market custom)
    const fruitColors = [0xE84637, 0xF5A623, 0x20AEA2]; // Watermelon, Mango, Dragonfruit
    for (let i = 0; i < 3; i++) {
      const hungFruit = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.08, 0),
        new THREE.MeshStandardMaterial({ color: fruitColors[i], roughness: 0.5 })
      );
      hungFruit.position.set(1.18 + i * 0.04, 2.45 - i * 0.25, -0.35);
      marketGroup.add(hungFruit);
    }

    // 3. Wooden Produce Crates stacked beside counter
    const crateMat = new THREE.MeshStandardMaterial({ color: 0xAF7A42, roughness: 0.8 });
    const crate1 = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.22, 0.32), crateMat);
    crate1.position.set(0.32, 0.62, 0.05);
    crate1.rotation.y = 0.15;
    marketGroup.add(crate1);

    const crate2 = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.20, 0.30), crateMat);
    crate2.position.set(0.34, 0.82, 0.06);
    crate2.rotation.y = -0.1;
    marketGroup.add(crate2);

    // Fruits inside top crate
    const orangesMat = new THREE.MeshStandardMaterial({ color: 0xF5A623, roughness: 0.5 });
    for (let ox = -0.08; ox <= 0.08; ox += 0.08) {
      for (let oz = -0.06; oz <= 0.06; oz += 0.08) {
        const orange = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), orangesMat);
        orange.position.set(0.34 + ox, 0.94, 0.06 + oz);
        marketGroup.add(orange);
      }
    }

    // 4. Kraft Paper Package Bag & Ceramic Bowl on selling counter
    const bagMat = new THREE.MeshStandardMaterial({ color: 0xC49A58, roughness: 0.7 });
    const kraftBag = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.12), bagMat);
    kraftBag.position.set(0.58, 0.99, -0.15);
    marketGroup.add(kraftBag);

    const bowlMat = new THREE.MeshStandardMaterial({ color: 0xFAF5EC, roughness: 0.4 });
    const ceramicBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.06, 0.07, 8), bowlMat);
    ceramicBowl.position.set(0.86, 0.94, -0.15);
    marketGroup.add(ceramicBowl);

    // 5. Authentic Floating Market Signboard on the boat roof / rail
    const signGroup = new THREE.Group();
    signGroup.position.set(0.65, 1.48, 0.25);
    signGroup.rotation.y = -0.2;

    const boardMat = new THREE.MeshStandardMaterial({ color: 0xFAF3DE, roughness: 0.5 });
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x52293E, roughness: 0.7 });

    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.22, 0.03), boardMat);
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 512; labelCanvas.height = 160;
    const label = labelCanvas.getContext('2d');
    if (label) {
      label.fillStyle = '#FAF3DE'; label.fillRect(0, 0, 512, 160);
      label.fillStyle = '#52293E'; label.font = 'bold 65px system-ui';
      label.textAlign = 'center'; label.textBaseline = 'middle';
      label.fillText('CHỢ MÈO', 256, 86);
      const map = new THREE.CanvasTexture(labelCanvas);
      map.colorSpace = THREE.SRGBColorSpace;
      signBoard.material = new THREE.MeshBasicMaterial({map});
    }
    const signFrame = new THREE.Mesh(new THREE.BoxGeometry(0.81, 0.26, 0.02), frameMat);
    signFrame.position.z = -0.01;

    // Small decorative red accent strip on top of sign
    const accentStrip = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.04, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xE84637 })
    );
    accentStrip.position.y = 0.09;

    signGroup.add(signFrame, signBoard, accentStrip);
    marketGroup.add(signGroup);

    this.propsGroup.add(marketGroup);
  }

  buildCosmetics() {
    this.cosmetics = {};

    // 1. Lantern: Red Hoi An lantern hanging from roof overhang
    const lanternGroup = new THREE.Group();
    lanternGroup.position.set(-0.15, 1.45, -0.75);

    const lanternBody = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 12, 8),
      new THREE.MeshStandardMaterial({ color: 0xE84637, roughness: 0.5 })
    );
    lanternBody.scale.set(1.0, 1.3, 1.0);

    const lanternCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.04, 8),
      new THREE.MeshStandardMaterial({ color: 0xF5B627, roughness: 0.4 })
    );
    lanternCap.position.y = 0.24;

    const lanternTassel = new THREE.Mesh(
      new THREE.ConeGeometry(0.05, 0.18, 6),
      new THREE.MeshStandardMaterial({ color: 0xF5B627, roughness: 0.4 })
    );
    lanternTassel.position.y = -0.32;
    lanternTassel.rotation.x = Math.PI;

    lanternGroup.add(lanternBody, lanternCap, lanternTassel);
    this.cosmetics.lantern = lanternGroup;
    this.cosmeticsGroup.add(lanternGroup);

    // 2. Flags: Pennant bunting across the bow
    const flagsGroup = new THREE.Group();
    flagsGroup.position.set(1.2, 0.9, -0.4);
    const colors = [0xE84637, 0xF5B627, 0x20AEA2, 0xFAF3DE];
    for (let i = 0; i < 4; i++) {
      const flag = new THREE.Mesh(
        new THREE.ConeGeometry(0.09, 0.16, 3),
        new THREE.MeshStandardMaterial({ color: colors[i], roughness: 0.6 })
      );
      flag.position.set(i * 0.18 - 0.27, Math.sin(i * 0.8) * 0.04, 0);
      flag.rotation.z = Math.PI;
      flagsGroup.add(flag);
    }
    this.cosmetics.flags = flagsGroup;
    this.cosmeticsGroup.add(flagsGroup);

    // 3. Lotus: Blooming lotus on a lily pad floating in foreground
    const lotusGroup = new THREE.Group();
    lotusGroup.position.set(0.5, 0.02, 1.2);

    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.02, 12),
      new THREE.MeshStandardMaterial({ color: 0x3E8E41, roughness: 0.7 })
    );

    const flower = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.12),
      new THREE.MeshStandardMaterial({ color: 0xF08C94, roughness: 0.4 })
    );
    flower.position.y = 0.10;

    lotusGroup.add(pad, flower);
    this.cosmetics.lotus = lotusGroup;
    this.cosmeticsGroup.add(lotusGroup);

    this.setCosmetic(this.activeCosmetic);
  }

  setCosmetic(cosmeticId) {
    this.activeCosmetic = cosmeticId;
    if (this.cosmetics) {
      Object.keys(this.cosmetics).forEach((key) => {
        this.cosmetics[key].visible = key === cosmeticId;
      });
    }
  }

  setHelperUnlocked(unlocked) {
    this.helperUnlocked = !!unlocked;
    if (this.helperCatMesh) {
      this.helperCatMesh.visible = this.helperUnlocked;
    }
  }

  getAvailableSlotIndex() {
    return this.dockSlots.findIndex((s) => !s.occupied);
  }

  // --- Customer Boat Management ---
  spawnCustomerBoat(customerData, requestedSlotIndex) {
    // Find an empty slot (use requestedSlotIndex if valid and unoccupied)
    let slotIndex = requestedSlotIndex;
    if (slotIndex === undefined || slotIndex < 0 || slotIndex >= this.dockSlots.length || this.dockSlots[slotIndex].occupied) {
      slotIndex = this.dockSlots.findIndex((s) => !s.occupied);
    }
    if (slotIndex < 0) {
      console.warn('[CatIslandScene] No available dock slot for customer:', customerData.id);
      return null;
    }

    const slot = this.dockSlots[slotIndex];
    slot.occupied = true;
    slot.boatId = customerData.id;

    // Pick boat template based on cat style
    const templateNames = ['CustomerBoat_Ginger', 'CustomerBoat_Calico', 'CustomerBoat_Tuxedo'];
    const chosenTemplateName = templateNames[slotIndex % templateNames.length];
    const template = this.boatTemplates[chosenTemplateName];

    let boatObj;
    if (template) {
      boatObj = template.clone(true);
    } else {
      boatObj = this.createFallbackBoatMesh(slotIndex);
    }

    // Set userData for raycasting identification
    boatObj.userData = {
      isCustomerBoat: true,
      customerId: customerData.id,
      slotIndex: slotIndex
    };
    boatObj.traverse((child) => {
      child.userData = boatObj.userData;
    });

    // Start position: offscreen water to the right
    const startPos = new THREE.Vector3(slot.pos.x + 5.0, slot.pos.y, slot.pos.z + 4.0);
    const targetPos = slot.pos.clone();

    boatObj.position.copy(startPos);
    boatObj.rotation.y = slot.rotY;

    this.customerBoatsGroup.add(boatObj);

    const boatInstance = {
      id: customerData.id,
      model: boatObj,
      slotIndex: slotIndex,
      slot: slot,
      state: 'arriving',
      progress: 0,
      startPos: startPos,
      targetPos: targetPos,
      bobOffset: Math.random() * Math.PI * 2,
      data: customerData
    };

    this.customerBoats.push(boatInstance);
    return boatInstance;
  }

  createFallbackBoatMesh(slotIndex) {
    const group = new THREE.Group();
    const hullMat = new THREE.MeshStandardMaterial({
      color: slotIndex === 0 ? 0x9E6A38 : slotIndex === 1 ? 0x2E7A70 : 0x52293E,
      roughness: 0.7
    });
    const hull = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 0.7), hullMat);
    hull.position.y = 0.15;
    group.add(hull);

    const catMat = new THREE.MeshStandardMaterial({ color: 0xFAF5EC, roughness: 0.6 });
    const catHead = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), catMat);
    catHead.position.set(0, 0.42, 0);
    group.add(catHead);

    return group;
  }

  removeCustomerBoat(customerId) {
    const index = this.customerBoats.findIndex((b) => b.id === customerId);
    if (index >= 0) {
      const boat = this.customerBoats[index];
      boat.state = 'departing';
      boat.startPos = boat.model.position.clone();
      boat.targetPos = new THREE.Vector3(boat.startPos.x - 5.5, boat.startPos.y, boat.startPos.z - 3.5);
      boat.progress = 0;
      boat.slot.occupied = false;
      boat.slot.boatId = null;
      if (this.is2D) {
        this.customerBoatsGroup.remove(boat.model);
        this.customerBoats.splice(index, 1);
      }
    }
  }

  deliverPackage(targetCustomerId, packageType = 'takeaway', onComplete = null) {
    if (this.is2D) {
      if (onComplete) onComplete();
      return;
    }
    const boat = this.customerBoats.find((b) => b.id === targetCustomerId);
    if (!boat) {
      if (onComplete) onComplete();
      return;
    }

    // Counter origin: near the sales counter [0.75, 0.75, -0.2]
    const startPos = new THREE.Vector3(0.75, 0.85, 0.0);
    const endPos = boat.model.position.clone().add(new THREE.Vector3(0, 0.25, 0));

    // Create delivery mesh (Takeaway box or Ceramic plate)
    let packageMesh;
    const templateName = packageType === 'dinein' ? 'Item_DineIn' : 'Item_Takeaway';
    if (this.boatTemplates[templateName]) {
      packageMesh = this.boatTemplates[templateName].clone(true);
    } else {
      const pColor = packageType === 'dinein' ? 0xFAF5EC : 0xC49A58;
      packageMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.25, 0.2),
        new THREE.MeshStandardMaterial({ color: pColor })
      );
    }
    packageMesh.position.copy(startPos);
    this.propsGroup.add(packageMesh);

    // Animate helper cat nodding/packing visibly if unlocked
    if (this.helperCatMesh && this.helperUnlocked) {
      this.helperPackTime = 0.8;
    }

    this.activePackages.push({
      mesh: packageMesh,
      start: startPos,
      end: endPos,
      progress: 0,
      duration: 0.75,
      targetBoat: boat,
      onComplete: onComplete
    });
  }

  triggerHeart(target) {
    if (this.is2D) return;
    let spawnPos;
    if (target && target.isObject3D) {
      spawnPos = target.position.clone().add(new THREE.Vector3(0, 0.7, 0));
    } else {
      const boat = this.customerBoats.find((b) => b.id === target);
      if (!boat) return;
      spawnPos = boat.model.position.clone().add(new THREE.Vector3(0, 0.7, 0));
    }

    // Spawn 2D canvas sprite or simple 3D heart
    const heartMesh = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.12),
      new THREE.MeshStandardMaterial({ color: 0xE84637, roughness: 0.3 })
    );
    heartMesh.position.copy(spawnPos);
    this.particlesGroup.add(heartMesh);

    this.activeHearts.push({
      mesh: heartMesh,
      initialY: spawnPos.y,
      progress: 0,
      duration: 1.2
    });
  }

  // --- Story Event: Chase Boat Simulation ---
  startChase(totalSteps = 2) {
    if (this.is2D) {
      this.chaseProgress2D = 0;
      return;
    }
    this.resetChase();
    const template = this.boatTemplates['CustomerBoat_Calico'] || this.boatTemplates['CustomerBoat_Ginger'];
    let boatMesh;
    if (template) {
      boatMesh = template.clone(true);
    } else {
      boatMesh = this.createFallbackBoatMesh(1);
    }
    const startPos = new THREE.Vector3(4.2, 0.05, 3.2);
    boatMesh.position.copy(startPos);
    boatMesh.rotation.y = -0.6;
    this.customerBoatsGroup.add(boatMesh);

    this.chaseBoat = {
      model: boatMesh,
      startPos: startPos.clone(),
      currentPos: startPos.clone(),
      targetPos: new THREE.Vector3(1.0, 0.05, 1.8),
      bobTime: 0,
      progress: 0,
      goalProgress: 0
    };
  }

  advanceChase(ratio0to1) {
    const ratio = Math.max(0, Math.min(1, typeof ratio0to1 === 'number' ? ratio0to1 : 0.5));
    if (this.is2D) {
      this.chaseProgress2D = ratio;
      return;
    }
    if (!this.chaseBoat) return;
    this.chaseBoat.goalProgress = ratio;
    this.triggerHeart(this.chaseBoat.model);
  }

  endChase(success = false) {
    if (this.is2D) {
      this.chaseProgress2D = null;
      return;
    }
    if (!this.chaseBoat) return;
    if (success) {
      this.chaseBoat.currentPos.copy(this.chaseBoat.targetPos);
      this.triggerHeart(this.chaseBoat.model);
      this.resetChase();
    } else {
      this.resetChase();
    }
  }

  resetChase() {
    this.chaseProgress2D = null;
    if (this.chaseBoat) {
      this.customerBoatsGroup.remove(this.chaseBoat.model);
      this.chaseBoat = null;
    }
  }

  resetRound() {
    this.resetChase();
    this.customerBoats.forEach(b => this.customerBoatsGroup.remove(b.model));
    this.customerBoats = [];
    this.dockSlots.forEach(slot => { slot.occupied = false; slot.boatId = null; });
    this.activePackages.forEach(p => this.propsGroup.remove(p.mesh));
    this.activeHearts.forEach(h => this.particlesGroup.remove(h.mesh));
    this.activePackages = [];
    this.activeHearts = [];
    this.helperPackTime = 0;
  }

  // --- Screen Anchor for Boat UI Indicators ---
  getScreenPosition(worldPos) {
    if (!this.camera || !this.renderer) return { x: 0, y: 0 };
    const vector = worldPos.clone().project(this.camera);
    const hw = this.container.clientWidth / 2;
    const hh = this.container.clientHeight / 2;
    return {
      x: vector.x * hw + hw,
      y: -(vector.y * hh) + hh
    };
  }

  // --- Interaction & Events ---
  attachEvents() {
    window.addEventListener('resize', this.handleResize);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    this.container.addEventListener('pointerdown', this.handlePointerDown);
  }

  destroy() {
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    if (this.container) {
      this.container.removeEventListener('pointerdown', this.handlePointerDown);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  handleResize() {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    if (this.is2D) {
      if (this.canvas2D) {
        this.canvas2D.width = width;
        this.canvas2D.height = height;
      }
      return;
    }

    if (this.camera && this.renderer) {
      const aspect = width / height;
      const frustumSize = aspect < 1.1 ? 9.8 : 8.8;
      this.camera.left = (-frustumSize * aspect) / 2;
      this.camera.right = (frustumSize * aspect) / 2;
      this.camera.top = frustumSize / 2;
      this.camera.bottom = -frustumSize / 2;
      this.camera.lookAt(new THREE.Vector3(0.0, 0.1, 0.0));
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
    }
  }

  handleVisibilityChange() {
    if (document.hidden || window.CatIslandGame?.paused) {
      this.pause();
    } else {
      this.resume();
    }
  }

  pause() {
    this.paused = true;
    if (this.clock) this.clock.stop();
  }

  resume() {
    this.paused = false;
    this.lastTime = performance.now();
    if (this.clock) this.clock.start();
  }

  handlePointerDown(event) {
    if (this.paused) return;
    const rect = this.container.getBoundingClientRect();
    const clientX = event.clientX - rect.left;
    const clientY = event.clientY - rect.top;

    if (this.is2D) {
      this.handle2DClick(clientX, clientY);
      return;
    }

    this.mouse.x = (clientX / rect.width) * 2 - 1;
    this.mouse.y = -(clientY / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.customerBoatsGroup.children, true);

    if (intersects.length > 0) {
      let hitObj = intersects[0].object;
      while (hitObj && !hitObj.userData?.customerId) {
        hitObj = hitObj.parent;
      }
      if (hitObj && hitObj.userData?.customerId) {
        const customerId = hitObj.userData.customerId;
        if (this.onCustomerClick) {
          this.onCustomerClick(customerId);
        }
      }
    }
  }

  // --- Main Animation & Render Loop ---
  renderLoop(now) {
    if (this.paused) {
      requestAnimationFrame(this.renderLoop);
      return;
    }

    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;
    this.waterTime += dt;

    if (this.is2D) {
      this.render2D(dt);
      requestAnimationFrame(this.renderLoop);
      return;
    }

    // 1. Water Bobbing Math (Gentle sine waves)
    const bobFactor = this.reducedMotion ? 0.2 : 1.0;
    this.customerBoats.forEach((b) => {
      if (window.CatIslandGame?.isEventActive) return;
      if (b.state === 'arriving') {
        b.progress += dt * 0.9;
        if (b.progress >= 1.0) {
          b.progress = 1.0;
          b.state = 'docked';
        }
        b.model.position.lerpVectors(b.startPos, b.targetPos, b.progress);
      } else if (b.state === 'departing') {
        b.progress += dt * 0.8;
        b.model.position.lerpVectors(b.startPos, b.targetPos, b.progress);
        if (b.progress >= 1.0) {
          this.customerBoatsGroup.remove(b.model);
          const i = this.customerBoats.indexOf(b);
          if (i >= 0) this.customerBoats.splice(i, 1);
        }
      } else if (b.state === 'docked') {
        // Idle bobbing
        const wave = Math.sin(this.waterTime * 2.2 + b.bobOffset) * 0.035 * bobFactor;
        const roll = Math.sin(this.waterTime * 1.8 + b.bobOffset) * 0.02 * bobFactor;
        b.model.position.y = b.targetPos.y + wave;
        b.model.rotation.z = roll;
      }
    });

    // 2. Animate Flying Delivery Packages
    for (let pIdx = this.activePackages.length - 1; pIdx >= 0; pIdx--) {
      const p = this.activePackages[pIdx];
      p.progress += dt / p.duration;
      if (p.progress >= 1.0) {
        this.propsGroup.remove(p.mesh);
        this.activePackages.splice(pIdx, 1);
        if (p.onComplete) p.onComplete();
      } else {
        // Parabolic arc
        const t = p.progress;
        p.mesh.position.lerpVectors(p.start, p.end, t);
        p.mesh.position.y += Math.sin(t * Math.PI) * 0.9;
        p.mesh.rotation.x += dt * 3;
        p.mesh.rotation.y += dt * 4;
      }
    }

    // 3. Animate Floating Hearts
    for (let hIdx = this.activeHearts.length - 1; hIdx >= 0; hIdx--) {
      const h = this.activeHearts[hIdx];
      h.progress += dt / h.duration;
      if (h.progress >= 1.0) {
        this.particlesGroup.remove(h.mesh);
        this.activeHearts.splice(hIdx, 1);
      } else {
        h.mesh.position.y = h.initialY + h.progress * 0.8;
        const s = Math.sin(h.progress * Math.PI) * 1.2;
        h.mesh.scale.set(s, s, s);
      }
    }

    // 4. Helper Cat Packaging / Nodding Reaction Animation
    if (this.helperCatMesh && this.helperUnlocked && this.helperPackTime > 0) {
      this.helperPackTime -= dt;
      const t = 0.8 - this.helperPackTime;
      this.helperCatMesh.position.y = 0.72 + Math.abs(Math.sin(t * 14)) * 0.08;
      this.helperCatMesh.rotation.y = Math.sin(t * 10) * 0.3;
      if (this.helperPawL && this.helperPawR) {
        this.helperPawL.position.y = 0.12 + Math.sin(t * 18) * 0.08;
        this.helperPawR.position.y = 0.12 - Math.sin(t * 18) * 0.08;
      }
      if (this.helperPackTime <= 0) {
        this.helperCatMesh.position.y = 0.72;
        this.helperCatMesh.rotation.y = 0;
        if (this.helperPawL) this.helperPawL.position.y = 0.12;
        if (this.helperPawR) this.helperPawR.position.y = 0.12;
      }
    }

    // 5. Chase Boat Motion & Bobbing
    if (this.chaseBoat && this.chaseBoat.model) {
      this.chaseBoat.progress += Math.min(this.chaseBoat.goalProgress - this.chaseBoat.progress, dt * 1.5);
      this.chaseBoat.currentPos.lerpVectors(this.chaseBoat.startPos, this.chaseBoat.targetPos, this.chaseBoat.progress);
      this.chaseBoat.bobTime = (this.chaseBoat.bobTime || 0) + dt * 3;
      this.chaseBoat.model.position.y = this.chaseBoat.currentPos.y + Math.sin(this.chaseBoat.bobTime) * 0.04;
      this.chaseBoat.model.position.x = this.chaseBoat.currentPos.x;
      this.chaseBoat.model.position.z = this.chaseBoat.currentPos.z;
      this.chaseBoat.model.rotation.z = Math.sin(this.chaseBoat.bobTime * 0.8) * 0.03;
    }

    // 6. Render 3D Scene
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }

    requestAnimationFrame(this.renderLoop);
  }

  // --- 2D Fallback Implementation ---
  init2DFallback(statusMsg) {
    this.is2D = true;
    if (this.canvas3D) this.canvas3D.style.display = 'none';
    if (this.canvas2D) {
      this.canvas2D.style.display = 'block';
      this.ctx2D = this.canvas2D.getContext('2d');
    }
    this.updateBadge(statusMsg);
    this.attachEvents();
    this.handleResize();
    requestAnimationFrame(this.renderLoop);
  }

  render2D(dt) {
    if (!this.ctx2D || !this.canvas2D) return;
    const ctx = this.ctx2D;
    const width = this.canvas2D.width, height = this.canvas2D.height;
    const scale = Math.min(width / 640, height / 540);
    this.fallbackTransform = {scale, x:(width-640*scale)/2, y:(height-540*scale)/2};
    ctx.fillStyle = '#624B69';
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.translate(this.fallbackTransform.x, this.fallbackTransform.y);
    ctx.scale(scale, scale);
    const w = 640, h = 540;

    // Background gradient (#624B69 Mauve)
    const bgGrad = ctx.createRadialGradient(w / 2, h * 0.4, 40, w / 2, h * 0.4, w * 0.7);
    bgGrad.addColorStop(0, '#765B7E');
    bgGrad.addColorStop(0.6, '#624B69');
    bgGrad.addColorStop(1, '#4E3954');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Diorama Center Anchor
    const cx = w * 0.5;
    const cy = h * 0.55;

    // Faceted Sage Riverbed (#A8C59C)
    ctx.fillStyle = '#A8C59C';
    ctx.beginPath();
    ctx.moveTo(cx - 240, cy + 40);
    ctx.lineTo(cx + 20, cy - 80);
    ctx.lineTo(cx + 240, cy - 20);
    ctx.lineTo(cx + 60, cy + 120);
    ctx.closePath();
    ctx.fill();

    // Translucent Cutaway Water (#20AEA2 / #32D2C4)
    ctx.fillStyle = 'rgba(50, 210, 196, 0.45)';
    ctx.strokeStyle = '#20AEA2';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 250, cy + 30);
    ctx.lineTo(cx + 10, cy - 90);
    ctx.lineTo(cx + 250, cy - 30);
    ctx.lineTo(cx + 50, cy + 110);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Water cutaway vertical wall
    ctx.fillStyle = 'rgba(32, 174, 162, 0.75)';
    ctx.beginPath();
    ctx.moveTo(cx - 250, cy + 30);
    ctx.lineTo(cx + 50, cy + 110);
    ctx.lineTo(cx + 50, cy + 160);
    ctx.lineTo(cx - 250, cy + 80);
    ctx.closePath();
    ctx.fill();

    // Main Market Trawler (Center)
    // Dark Plum Hull (#2E233A), Coral Cabin (#E84637), Cream Roof (#FAF3DE)
    ctx.save();
    ctx.translate(cx - 20, cy - 10);
    // Hull
    ctx.fillStyle = '#2E233A';
    ctx.beginPath();
    ctx.roundRect(-80, -20, 160, 50, 16);
    ctx.fill();
    // Gunwale Golden Trim
    ctx.strokeStyle = '#F5B627';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Cabin
    ctx.fillStyle = '#E84637';
    ctx.fillRect(-45, -65, 80, 50);

    // Roof
    ctx.fillStyle = '#FAF3DE';
    ctx.fillRect(-55, -75, 100, 14);

    // Chimney & Smoke
    ctx.fillStyle = '#382F40';
    ctx.fillRect(-35, -95, 14, 22);
    ctx.fillStyle = '#9992A2';
    ctx.beginPath();
    ctx.arc(-28, -108, 12, 0, Math.PI * 2);
    ctx.arc(-22, -125, 16, 0, Math.PI * 2);
    ctx.fill();

    // Mochi Hero Cat on Roof
    ctx.fillStyle = '#FAF5EC';
    ctx.beginPath();
    ctx.arc(0, -90, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#E84637'; // coral scarf
    ctx.fillRect(-8, -78, 16, 6);

    // Sales Counter on Deck
    ctx.fillStyle = '#B48250';
    ctx.fillRect(36, -20, 36, 24);
    ctx.fillStyle = '#8C5A30';
    ctx.fillRect(34, -22, 40, 5);

    // Produce crate with oranges
    ctx.fillStyle = '#AF7A42';
    ctx.fillRect(14, -14, 18, 16);
    ctx.fillStyle = '#F5A623';
    ctx.beginPath();
    ctx.arc(19, -16, 3.5, 0, Math.PI * 2);
    ctx.arc(26, -16, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Kraft paper bag & bowl
    ctx.fillStyle = '#C49A58';
    ctx.fillRect(40, -30, 10, 10);
    ctx.fillStyle = '#FAF5EC';
    ctx.beginPath();
    ctx.arc(58, -24, 5, 0, Math.PI * 2);
    ctx.fill();

    // Mekong Bamboo "Cây Bẹo" pole with hanging fruit
    ctx.strokeStyle = '#D8B878';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(76, 4);
    ctx.lineTo(76, -65);
    ctx.stroke();
    ctx.fillStyle = '#E84637';
    ctx.beginPath();
    ctx.arc(76, -56, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F5A623';
    ctx.beginPath();
    ctx.arc(76, -45, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Helper Cat if Unlocked
    if (this.helperUnlocked) {
      ctx.fillStyle = '#FAF5EC';
      ctx.beginPath();
      ctx.arc(56, -30, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#20AEA2';
      ctx.fillRect(50, -22, 12, 4);
    }
    ctx.restore();

    // Story Event: Chase Boat in 2D
    if (this.chaseProgress2D !== null && this.chaseProgress2D !== undefined) {
      const startX = cx + 220;
      const startY = cy + 20;
      const endX = cx + 60;
      const endY = cy + 85;
      const chaseX = startX + (endX - startX) * this.chaseProgress2D;
      const chaseY = startY + (endY - startY) * this.chaseProgress2D + Math.sin(this.waterTime * 3) * 5;

      ctx.save();
      ctx.translate(chaseX, chaseY);
      ctx.fillStyle = '#C47C35';
      ctx.beginPath();
      ctx.ellipse(0, 0, 36, 15, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#F5B627';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Chase Cat
      ctx.fillStyle = '#FAF5EC';
      ctx.beginPath();
      ctx.arc(0, -14, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Customer Boats in 2D
    const slotCoords2D = [
      { x: cx - 130, y: cy + 60 },
      { x: cx + 5,   y: cy + 85 },
      { x: cx + 140, y: cy + 45 }
    ];

    this.customerBoats.forEach((b) => {
      const slotCoord = slotCoords2D[b.slotIndex] || { x: cx, y: cy };
      const bob = Math.sin(this.waterTime * 2.2 + b.bobOffset) * 6;
      const bx = slotCoord.x;
      const by = slotCoord.y + bob;

      // Sampan hull
      ctx.save();
      ctx.translate(bx, by);

      ctx.fillStyle = b.slotIndex === 0 ? '#9E6A38' : b.slotIndex === 1 ? '#2E7A70' : '#52293E';
      ctx.beginPath();
      ctx.ellipse(0, 0, 42, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#F5B627';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Customer Cat
      ctx.fillStyle = '#FAF5EC';
      ctx.beginPath();
      ctx.arc(0, -16, 12, 0, Math.PI * 2);
      ctx.fill();

      // Ears
      ctx.fillStyle = b.slotIndex === 0 ? '#E87C38' : b.slotIndex === 1 ? '#FAF5EC' : '#241D2E';
      ctx.beginPath();
      ctx.moveTo(-9, -24); ctx.lineTo(-4, -34); ctx.lineTo(0, -26); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, -26); ctx.lineTo(4, -34); ctx.lineTo(9, -24); ctx.fill();

      // Scarf
      ctx.fillStyle = '#E84637';
      ctx.fillRect(-6, -6, 12, 4);

      // Order Waiting Icon
      ctx.fillStyle = '#FFFDF8';
      ctx.strokeStyle = '#F5B627';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-24, -58, 48, 20, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#2E233A';
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('📦 Đơn', 0, -44);

      ctx.restore();
    });
    ctx.restore();
  }

  handle2DClick(x, y) {
    if (!this.canvas2D) return;
    const t = this.fallbackTransform || {scale:1,x:0,y:0};
    x = (x-t.x)/t.scale; y = (y-t.y)/t.scale;
    const cx = 640 * 0.5;
    const cy = 540 * 0.55;
    const slotCoords2D = [
      { x: cx - 130, y: cy + 60 },
      { x: cx + 5,   y: cy + 85 },
      { x: cx + 140, y: cy + 45 }
    ];

    for (const b of this.customerBoats) {
      const coord = slotCoords2D[b.slotIndex];
      if (coord) {
        const dx = x - coord.x;
        const dy = y - coord.y;
        if (Math.hypot(dx, dy) < 45) {
          if (this.onCustomerClick) {
            this.onCustomerClick(b.id);
          }
          break;
        }
      }
    }
  }
}

// Instantiate and expose globally
const sceneInstance = new CatIslandScene();
window.CatIslandScene = sceneInstance;
export default sceneInstance;
