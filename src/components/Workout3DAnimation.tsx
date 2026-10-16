import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Play,
  Pause,
  RotateCw,
  Eye,
  Activity,
  Flame,
  Gauge,
  Maximize2,
  ZoomIn,
  Compass,
  CheckCircle2,
  Zap,
  Info
} from 'lucide-react';

export type CameraPreset = 'hero' | 'side' | 'front' | 'closeup';

export interface Workout3DAnimationProps {
  exerciseName: string;
  muscleGroup?: string;
  speed?: number;
  isPlaying?: boolean;
  showPressurePoints?: boolean;
  onTensionChange?: (tension: number) => void;
  className?: string;
  topModeSwitcher?: React.ReactNode;
}

export const Workout3DAnimation: React.FC<Workout3DAnimationProps> = ({
  exerciseName = 'Bicep Curl',
  muscleGroup = 'Arms',
  speed = 1,
  isPlaying: controlledPlaying = true,
  showPressurePoints = true,
  onTensionChange,
  className = '',
  topModeSwitcher
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Local state
  const [isPlaying, setIsPlaying] = useState<boolean>(controlledPlaying);
  const [animSpeed, setAnimSpeed] = useState<number>(speed);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('hero');
  const [repCount, setRepCount] = useState<number>(1);
  const [currentTension, setCurrentTension] = useState<number>(50);
  const [currentAngle, setCurrentAngle] = useState<number>(90);
  const [isConcentric, setIsConcentric] = useState<boolean>(true);
  const [highlightPoints, setHighlightPoints] = useState<boolean>(showPressurePoints);

  // References for Three.js scene elements
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Articulated Character Joint References
  const characterRef = useRef<{
    root: THREE.Group;
    torso: THREE.Group;
    head: THREE.Mesh;
    chest: THREE.Mesh;
    leftArmGroup: THREE.Group;
    rightArmGroup: THREE.Group;
    leftForearmGroup: THREE.Group;
    rightForearmGroup: THREE.Group;
    leftBicepMesh: THREE.Mesh;
    rightBicepMesh: THREE.Mesh;
    leftDeltoidMesh: THREE.Mesh;
    rightDeltoidMesh: THREE.Mesh;
    leftPectoralMesh: THREE.Mesh;
    rightPectoralMesh: THREE.Mesh;
    leftQuadMesh: THREE.Mesh;
    rightQuadMesh: THREE.Mesh;
    leftThighGroup: THREE.Group;
    rightThighGroup: THREE.Group;
    leftShinGroup: THREE.Group;
    rightShinGroup: THREE.Group;
    dumbbellLeft: THREE.Group;
    dumbbellRight: THREE.Group;
    barbell: THREE.Group;
    redMuscleMaterials: THREE.MeshStandardMaterial[];
    redLight: THREE.PointLight;
    pressurePointSprites: THREE.Group[];
  } | null>(null);

  const phaseRef = useRef<number>(0);
  const repCountRef = useRef<number>(1);

  // Synchronize props
  useEffect(() => {
    setIsPlaying(controlledPlaying);
  }, [controlledPlaying]);

  useEffect(() => {
    setAnimSpeed(speed);
  }, [speed]);

  // Handle Camera Presets
  const setCameraView = useCallback((preset: CameraPreset) => {
    setCameraPreset(preset);
    if (!cameraRef.current || !controlsRef.current) return;

    const camera = cameraRef.current;
    const controls = controlsRef.current;

    switch (preset) {
      case 'front':
        camera.position.set(0, 1.3, 3.2);
        controls.target.set(0, 1.2, 0);
        break;
      case 'side':
        camera.position.set(3.0, 1.3, 0.4);
        controls.target.set(0, 1.2, 0);
        break;
      case 'closeup':
        camera.position.set(0.9, 1.35, 1.2);
        controls.target.set(0.3, 1.25, 0);
        break;
      case 'hero':
      default:
        camera.position.set(1.8, 1.5, 2.4);
        controls.target.set(0, 1.15, 0);
        break;
    }
    controls.update();
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const width = container.clientWidth || 640;
    const height = container.clientHeight || 420;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0f1d); // Sleek dark slate
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.12);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(1.8, 1.5, 2.4);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Don't go below floor
    controls.minDistance = 1.0;
    controls.maxDistance = 6.5;
    controls.target.set(0, 1.15, 0);
    controlsRef.current = controls;

    // 5. Studio & Rim Lighting
    // Ambient fill
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.2);
    scene.add(ambientLight);

    // Main overhead spot
    const mainSpot = new THREE.SpotLight(0xffffff, 2.8, 12, Math.PI / 4, 0.4, 1.2);
    mainSpot.position.set(1.5, 4.0, 2.0);
    mainSpot.castShadow = true;
    mainSpot.shadow.mapSize.width = 1024;
    mainSpot.shadow.mapSize.height = 1024;
    scene.add(mainSpot);

    // Cool cyan/slate rim light from behind (gives 3D muscle depth)
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
    rimLight.position.set(-2.5, 2.5, -2.5);
    scene.add(rimLight);

    // Warm key fill from opposite side
    const fillLight = new THREE.DirectionalLight(0x94a3b8, 1.0);
    fillLight.position.set(2.5, 1.0, -1.0);
    scene.add(fillLight);

    // Dynamic Red Glow PointLight: Pulses from active muscle
    const redLight = new THREE.PointLight(0xff1133, 0.0, 3.5);
    redLight.position.set(0.3, 1.25, 0.2);
    scene.add(redLight);

    // 6. Gym Floor & Reflective Grid
    const floorGeo = new THREE.PlaneGeometry(16, 16);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x080d1a,
      roughness: 0.6,
      metalness: 0.4
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Floor Grid
    const gridHelper = new THREE.GridHelper(16, 32, 0x10b981, 0x1e293b);
    gridHelper.position.y = 0.002;
    scene.add(gridHelper);

    // Circular Stage Platform with Glowing Edge
    const stageGeo = new THREE.CylinderGeometry(2.0, 2.1, 0.06, 48);
    const stageMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.5,
      metalness: 0.7
    });
    const stage = new THREE.Mesh(stageGeo, stageMat);
    stage.position.y = 0.03;
    stage.receiveShadow = true;
    scene.add(stage);

    const ringGeo = new THREE.RingGeometry(1.95, 2.05, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide
    });
    const stageRing = new THREE.Mesh(ringGeo, ringMat);
    stageRing.rotation.x = -Math.PI / 2;
    stageRing.position.y = 0.062;
    scene.add(stageRing);

    // 7. BUILD ARTICULATED 3D CHARACTER WITH RED TARGET MUSCLES
    const characterRoot = new THREE.Group();
    scene.add(characterRoot);

    // Materials
    // Body neutral material (matte graphite athletic skin)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x222c3c,
      roughness: 0.55,
      metalness: 0.3
    });

    const jointMat = new THREE.MeshStandardMaterial({
      color: 0x18202f,
      roughness: 0.4,
      metalness: 0.6
    });

    const equipmentMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.85
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.2,
      metalness: 0.95
    });

    // RED TARGET MUSCLE MATERIAL (Starts dark red, glows radiant hot crimson during contraction)
    const redMuscleMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xff0033,
      emissiveIntensity: 0.8,
      roughness: 0.35,
      metalness: 0.25
    });

    const redMuscleMaterials: THREE.MeshStandardMaterial[] = [redMuscleMat];

    // Secondary synergist red material (slightly softer)
    const redSynergistMat = new THREE.MeshStandardMaterial({
      color: 0xf87171,
      emissive: 0xdc2626,
      emissiveIntensity: 0.4,
      roughness: 0.4,
      metalness: 0.2
    });
    redMuscleMaterials.push(redSynergistMat);

    // Lower Body / Legs
    const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.16, 16), bodyMat);
    pelvis.position.y = 0.95;
    characterRoot.add(pelvis);

    // Left Thigh Group
    const leftThighGroup = new THREE.Group();
    leftThighGroup.position.set(0.12, 0.92, 0);
    characterRoot.add(leftThighGroup);

    const leftQuadMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.08, 0.42, 16), bodyMat);
    leftQuadMesh.position.y = -0.21;
    leftThighGroup.add(leftQuadMesh);

    const leftShinGroup = new THREE.Group();
    leftShinGroup.position.set(0, -0.42, 0);
    leftThighGroup.add(leftShinGroup);

    const leftShinMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.42, 16), bodyMat);
    leftShinMesh.position.y = -0.21;
    leftShinGroup.add(leftShinMesh);

    const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.22), jointMat);
    leftFoot.position.set(0, -0.44, 0.06);
    leftShinGroup.add(leftFoot);

    // Right Thigh Group
    const rightThighGroup = new THREE.Group();
    rightThighGroup.position.set(-0.12, 0.92, 0);
    characterRoot.add(rightThighGroup);

    const rightQuadMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.08, 0.42, 16), bodyMat);
    rightQuadMesh.position.y = -0.21;
    rightThighGroup.add(rightQuadMesh);

    const rightShinGroup = new THREE.Group();
    rightShinGroup.position.set(0, -0.42, 0);
    rightThighGroup.add(rightShinGroup);

    const rightShinMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.42, 16), bodyMat);
    rightShinMesh.position.y = -0.21;
    rightShinGroup.add(rightShinMesh);

    const rightFoot = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.22), jointMat);
    rightFoot.position.set(0, -0.44, 0.06);
    rightShinGroup.add(rightFoot);

    // Torso Group
    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = 1.02;
    characterRoot.add(torsoGroup);

    // Abdominal Core
    const absMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.16, 0.22, 16), bodyMat);
    absMesh.position.y = 0.11;
    torsoGroup.add(absMesh);

    // Chest / Upper Torso
    const chestMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.26, 16), bodyMat);
    chestMesh.position.y = 0.32;
    torsoGroup.add(chestMesh);

    // Pectorals (Anatomical plates)
    const isChestExercise = exerciseName.toLowerCase().includes('bench') || exerciseName.toLowerCase().includes('push');
    const leftPectoralMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.12, 0.08),
      isChestExercise ? redMuscleMat : bodyMat
    );
    leftPectoralMesh.position.set(0.09, 0.33, 0.12);
    leftPectoralMesh.rotation.y = 0.1;
    torsoGroup.add(leftPectoralMesh);

    const rightPectoralMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.12, 0.08),
      isChestExercise ? redMuscleMat : bodyMat
    );
    rightPectoralMesh.position.set(-0.09, 0.33, 0.12);
    rightPectoralMesh.rotation.y = -0.1;
    torsoGroup.add(rightPectoralMesh);

    // Neck & Head
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.1, 16), jointMat);
    neck.position.y = 0.49;
    torsoGroup.add(neck);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 24), bodyMat);
    head.position.y = 0.61;
    torsoGroup.add(head);

    // ATHLETE UPPER ARMS & BICEPS (THE STAR OF THE SHOW)
    const isArmExercise = exerciseName.toLowerCase().includes('curl') || exerciseName.toLowerCase().includes('bicep') || muscleGroup.toLowerCase().includes('arm');

    // Left Shoulder & Arm Group
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(0.26, 0.42, 0);
    torsoGroup.add(leftArmGroup);

    // Shoulder Deltoid
    const leftDeltoidMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      isArmExercise ? redSynergistMat : bodyMat
    );
    leftArmGroup.add(leftDeltoidMesh);

    // Left Upper Arm Bone
    const leftUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.065, 0.28, 16), bodyMat);
    leftUpperArm.position.y = -0.14;
    leftArmGroup.add(leftUpperArm);

    // Left Biceps Brachii Mesh (VIVID GLOWING RED)
    const leftBicepMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.078, 16, 16),
      isArmExercise ? redMuscleMat : bodyMat
    );
    leftBicepMesh.position.set(0, -0.13, 0.04);
    leftBicepMesh.scale.set(1.0, 1.35, 1.15);
    leftArmGroup.add(leftBicepMesh);

    // Left Forearm Group (Hinged at elbow)
    const leftForearmGroup = new THREE.Group();
    leftForearmGroup.position.set(0, -0.28, 0);
    leftArmGroup.add(leftForearmGroup);

    const leftElbow = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), jointMat);
    leftForearmGroup.add(leftElbow);

    const leftForearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.05, 0.28, 16),
      isArmExercise ? redSynergistMat : bodyMat
    );
    leftForearm.position.y = -0.14;
    leftForearmGroup.add(leftForearm);

    // Left Dumbbell
    const dumbbellLeft = new THREE.Group();
    dumbbellLeft.position.set(0, -0.28, 0);
    leftForearmGroup.add(dumbbellLeft);

    const handleLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.22, 12), chromeMat);
    handleLeft.rotation.z = Math.PI / 2;
    dumbbellLeft.add(handleLeft);

    const weightPlateGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 16);
    const plateL1 = new THREE.Mesh(weightPlateGeo, equipmentMat);
    plateL1.position.x = 0.1;
    plateL1.rotation.z = Math.PI / 2;
    dumbbellLeft.add(plateL1);

    const plateL2 = new THREE.Mesh(weightPlateGeo, equipmentMat);
    plateL2.position.x = -0.1;
    plateL2.rotation.z = Math.PI / 2;
    dumbbellLeft.add(plateL2);

    // Right Shoulder & Arm Group
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(-0.26, 0.42, 0);
    torsoGroup.add(rightArmGroup);

    // Right Shoulder Deltoid
    const rightDeltoidMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      isArmExercise ? redSynergistMat : bodyMat
    );
    rightArmGroup.add(rightDeltoidMesh);

    // Right Upper Arm Bone
    const rightUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.065, 0.28, 16), bodyMat);
    rightUpperArm.position.y = -0.14;
    rightArmGroup.add(rightUpperArm);

    // Right Biceps Brachii Mesh (VIVID GLOWING RED)
    const rightBicepMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.078, 16, 16),
      isArmExercise ? redMuscleMat : bodyMat
    );
    rightBicepMesh.position.set(0, -0.13, 0.04);
    rightBicepMesh.scale.set(1.0, 1.35, 1.15);
    rightArmGroup.add(rightBicepMesh);

    // Right Forearm Group
    const rightForearmGroup = new THREE.Group();
    rightForearmGroup.position.set(0, -0.28, 0);
    rightArmGroup.add(rightForearmGroup);

    const rightElbow = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), jointMat);
    rightForearmGroup.add(rightElbow);

    const rightForearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.05, 0.28, 16),
      isArmExercise ? redSynergistMat : bodyMat
    );
    rightForearm.position.y = -0.14;
    rightForearmGroup.add(rightForearm);

    // Right Dumbbell
    const dumbbellRight = new THREE.Group();
    dumbbellRight.position.set(0, -0.28, 0);
    rightForearmGroup.add(dumbbellRight);

    const handleRight = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.22, 12), chromeMat);
    handleRight.rotation.z = Math.PI / 2;
    dumbbellRight.add(handleRight);

    const plateR1 = new THREE.Mesh(weightPlateGeo, equipmentMat);
    plateR1.position.x = 0.1;
    plateR1.rotation.z = Math.PI / 2;
    dumbbellRight.add(plateR1);

    const plateR2 = new THREE.Mesh(weightPlateGeo, equipmentMat);
    plateR2.position.x = -0.1;
    plateR2.rotation.z = Math.PI / 2;
    dumbbellRight.add(plateR2);

    // Barbell placeholder (hidden unless barbell exercise)
    const barbell = new THREE.Group();
    barbell.visible = false;
    scene.add(barbell);

    // 8. 3D GLOWING RED PRESSURE POINT MARKERS
    const pressurePointSprites: THREE.Group[] = [];

    const createPressureMarker = (parent: THREE.Object3D, offset: THREE.Vector3, label: string) => {
      const markerGroup = new THREE.Group();
      markerGroup.position.copy(offset);

      // Core red jewel
      const jewel = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xff0033 })
      );
      markerGroup.add(jewel);

      // Outer pulsating ring
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.045, 0.06, 24),
        new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide })
      );
      markerGroup.add(ring);

      parent.add(markerGroup);
      pressurePointSprites.push(markerGroup);
      return markerGroup;
    };

    // Add pressure points to Left & Right Bicep Peak and Elbow Joint
    createPressureMarker(leftArmGroup, new THREE.Vector3(0, -0.13, 0.11), 'Bicep Peak');
    createPressureMarker(rightArmGroup, new THREE.Vector3(0, -0.13, 0.11), 'Bicep Peak');
    createPressureMarker(leftForearmGroup, new THREE.Vector3(0, 0, 0), 'Elbow Fulcrum');
    createPressureMarker(rightForearmGroup, new THREE.Vector3(0, 0, 0), 'Elbow Fulcrum');

    characterRef.current = {
      root: characterRoot,
      torso: torsoGroup,
      head,
      chest: chestMesh,
      leftArmGroup,
      rightArmGroup,
      leftForearmGroup,
      rightForearmGroup,
      leftBicepMesh,
      rightBicepMesh,
      leftDeltoidMesh,
      rightDeltoidMesh,
      leftPectoralMesh,
      rightPectoralMesh,
      leftQuadMesh,
      rightQuadMesh,
      leftThighGroup,
      rightThighGroup,
      leftShinGroup,
      rightShinGroup,
      dumbbellLeft,
      dumbbellRight,
      barbell,
      redMuscleMaterials,
      redLight,
      pressurePointSprites
    };

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Initial Camera View
    setCameraView('hero');

    // 9. ANIMATION RENDER LOOP
    let lastTime = performance.now();

    const animate = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      const char = characterRef.current;
      if (char) {
        // Toggle Pressure Points visibility
        char.pressurePointSprites.forEach(sprite => {
          sprite.visible = highlightPoints;
          // Rotate ring towards camera
          if (cameraRef.current) {
            sprite.quaternion.copy(cameraRef.current.quaternion);
          }
        });

        // Update repetition phase when playing
        if (isPlaying) {
          const cycleDuration = 2.6 / animSpeed;
          phaseRef.current = (phaseRef.current + delta / cycleDuration) % 1;

          // Track completed reps
          const prevPhase = phaseRef.current;
          if (prevPhase < delta / cycleDuration) {
            repCountRef.current = (repCountRef.current % 12) + 1;
            setRepCount(repCountRef.current);
          }
        }

        const phase = phaseRef.current;
        const concentric = phase < 0.5;
        setIsConcentric(concentric);

        // Sinusoidal Easing Curve (0 = bottom extension, 1 = peak contraction)
        const eased = 0.5 - 0.5 * Math.cos(phase * Math.PI * 2);
        const tension = Math.round(45 + eased * 53);
        setCurrentTension(tension);
        if (onTensionChange) onTensionChange(tension);

        // Compute real-time elbow angle (160° down to 42° at peak)
        const angle = Math.round(160 - eased * 118);
        setCurrentAngle(angle);

        // --- ARTICULATE JOINTS BASED ON EXERCISE TYPE ---
        const cleanExName = exerciseName.toLowerCase();

        // A. BICEP CURL WORKOUT KINEMATICS (Just like YouTube short!)
        if (cleanExName.includes('curl') || cleanExName.includes('bicep') || muscleGroup.toLowerCase().includes('arm')) {
          // Upper arm stays anchored with subtle 5° forward stabilization
          char.leftArmGroup.rotation.x = -0.08 * eased;
          char.rightArmGroup.rotation.x = -0.08 * eased;

          // Forearm curls up towards shoulder: 0 to ~2.2 radians (~125 degrees flexion)
          const curlAngle = eased * 2.22;
          char.leftForearmGroup.rotation.x = curlAngle;
          char.rightForearmGroup.rotation.x = curlAngle;

          // Supination: turn palms inward-upward for peak bicep squeeze
          char.leftForearmGroup.rotation.z = -0.25 * eased;
          char.rightForearmGroup.rotation.z = 0.25 * eased;

          // PHYSICAL MUSCLE BULGE / FLEXION SWELL
          const muscleSwell = 1.0 + eased * 0.24;
          char.leftBicepMesh.scale.set(muscleSwell, 1.35 * muscleSwell, 1.25 * muscleSwell);
          char.rightBicepMesh.scale.set(muscleSwell, 1.35 * muscleSwell, 1.25 * muscleSwell);

          // SUBTLE TORSO BREATHING STABILIZATION
          char.torso.position.y = 1.02 + eased * 0.015;
          char.torso.rotation.x = -0.02 * eased;
        }
        // B. CHEST BENCH PRESS / PUSH UPS
        else if (cleanExName.includes('bench') || cleanExName.includes('push')) {
          const pressFlex = (1 - eased);
          char.leftArmGroup.rotation.x = -Math.PI / 3 + pressFlex * 0.4;
          char.rightArmGroup.rotation.x = -Math.PI / 3 + pressFlex * 0.4;
          char.leftForearmGroup.rotation.x = 0.3 + pressFlex * 1.4;
          char.rightForearmGroup.rotation.x = 0.3 + pressFlex * 1.4;

          const chestSqueeze = 1.0 + eased * 0.2;
          char.leftPectoralMesh.scale.set(chestSqueeze, chestSqueeze, chestSqueeze);
          char.rightPectoralMesh.scale.set(chestSqueeze, chestSqueeze, chestSqueeze);
        }
        // C. SQUAT / LEGS
        else if (cleanExName.includes('squat') || cleanExName.includes('lunge') || muscleGroup.toLowerCase().includes('leg')) {
          const squatDepth = eased * 0.32;
          char.root.position.y = -squatDepth;
          char.leftThighGroup.rotation.x = -eased * 1.35;
          char.rightThighGroup.rotation.x = -eased * 1.35;
          char.leftShinGroup.rotation.x = eased * 1.5;
          char.rightShinGroup.rotation.x = eased * 1.5;
          char.torso.rotation.x = eased * 0.35;

          const quadSwell = 1.0 + eased * 0.18;
          char.leftQuadMesh.scale.set(quadSwell, 1.0, quadSwell);
          char.rightQuadMesh.scale.set(quadSwell, 1.0, quadSwell);
        }
        // D. DEFAULT COMPOUND MOVEMENT
        else {
          char.leftArmGroup.rotation.x = -eased * 1.4;
          char.rightArmGroup.rotation.x = -eased * 1.4;
        }

        // --- DYNAMIC VIVID RED MUSCLE GLOW & HEAT INTENSITY ---
        // At low tension: subtle deep crimson. At peak squeeze: radiant neon laser red (#ff0033)!
        const emissiveIntensity = 0.5 + eased * 2.6; // Scale up to 3.1x glow
        char.redMuscleMaterials.forEach(mat => {
          mat.emissiveIntensity = emissiveIntensity;
          // Shift color from deep wine red to blistering crimson
          if (eased > 0.6) {
            mat.emissive.setHex(0xff0033);
          } else {
            mat.emissive.setHex(0xb91c1c);
          }
        });

        // Dynamic Red PointLight follows bicep and casts red glow onto athlete
        char.redLight.intensity = eased * 3.8;
        char.redLight.position.set(0.3, 1.25 + eased * 0.1, 0.2);
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (controlsRef.current) controlsRef.current.dispose();
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [exerciseName, muscleGroup, animSpeed, isPlaying, highlightPoints, setCameraView, onTensionChange]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[380px] bg-slate-950 overflow-hidden select-none flex flex-col items-center justify-center ${className}`}
    >
      {/* 1. THREE.JS 3D CANVAS */}
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

      {/* 2. TOP HUD: EXERCISE TITLE, RED MUSCLE SQUEEZE BADGE, AND CAMERA PRESETS */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Left Badge: Mode Switcher + 3D Red Muscle Target */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          {topModeSwitcher}

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-red-500/40 shadow-xl shadow-red-950/20">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
            <span className="text-xs font-black text-white tracking-wide flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-red-500" />
              {exerciseName}
            </span>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-red-950 border border-red-500/60 text-red-300 font-mono">
              3D MUSCLE
            </span>
          </div>
        </div>

        {/* Right Controls: 3D Camera Presets & Pressure Point Toggle */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-800 shadow-xl">
          
          {/* Pressure Points Toggle */}
          <button
            onClick={() => setHighlightPoints(!highlightPoints)}
            className={`px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
              highlightPoints
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30 ring-1 ring-red-400'
                : 'text-slate-400 hover:text-white bg-slate-950/60'
            }`}
            title="Toggle glowing red pressure points"
          >
            <Flame className="w-3 h-3 text-current" />
            <span className="hidden sm:inline">Red Hotspots</span>
          </button>

          {/* Camera Angles */}
          <div className="flex items-center gap-0.5 bg-slate-950/80 p-0.5 rounded-xl border border-slate-800 text-[11px]">
            {(['hero', 'front', 'side', 'closeup'] as CameraPreset[]).map(preset => (
              <button
                key={preset}
                onClick={() => setCameraView(preset)}
                className={`px-2 py-1 rounded-lg font-bold capitalize transition-all ${
                  cameraPreset === preset
                    ? 'bg-emerald-500 text-slate-950 shadow-sm font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* 3. CENTER FLOATING GONIOMETER & MUSCLE ACTIVATION HUD */}
      <div className="absolute top-16 left-3 z-10 hidden sm:flex flex-col gap-2 pointer-events-none">
        
        {/* Real-Time Joint Angle Goniometer */}
        <div className="px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-800 shadow-lg flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-bold block">Elbow Joint Angle</span>
            <span className="text-xs font-black text-cyan-300 font-mono">{currentAngle}°</span>
          </div>
        </div>

        {/* Dynamic Peak Squeeze Callout */}
        <div className="px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-red-500/30 shadow-lg flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-bold block">Peak Squeeze Force</span>
            <span className="text-xs font-black text-red-400 font-mono">{currentTension}% TENSION</span>
          </div>
        </div>

      </div>

      {/* 4. 3D ORBIT INSTRUCTION HINT */}
      <div className="absolute bottom-16 right-3 z-10 pointer-events-none hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/70 border border-slate-800/80 backdrop-blur-xs text-[10px] text-slate-400">
        <RotateCw className="w-3 h-3 text-emerald-400" />
        <span>Drag 3D model to rotate 360° • Scroll to zoom</span>
      </div>

      {/* 5. BOTTOM PLAYBACK SCRUBBER & CADENCE BAR */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-col gap-2 p-3 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-xl">
        
        <div className="flex items-center gap-3">
          
          {/* Play / Pause Toggle */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md font-bold transition-transform active:scale-95"
            title={isPlaying ? 'Pause 3D' : 'Play 3D'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          {/* Rep Counter & Cadence Status */}
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>Rep {repCount} of 12</span>
                <span className="text-slate-400 font-normal">|</span>
                <span className={isConcentric ? 'text-amber-400' : 'text-cyan-400'}>
                  {isConcentric ? 'Concentric / Squeeze ↑' : 'Eccentric / Lower ↓'}
                </span>
              </span>
              <span className="text-red-400 font-mono font-black">
                {currentTension > 85 ? '⚡ PEAK MUSCLE CONTRACTION' : `${currentAngle}° Flexion`}
              </span>
            </div>

            {/* Glowing Red Squeeze Gauge */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500 transition-all duration-75"
                style={{ width: `${currentTension}%` }}
              />
            </div>
          </div>

          {/* Speed Selector */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 shrink-0">
            <span className="text-[10px] text-slate-400 font-extrabold px-1 uppercase tracking-wider">Speed:</span>
            {[0.5, 1, 1.5].map(s => (
              <button
                key={s}
                onClick={() => setAnimSpeed(s)}
                className={`px-2 py-0.5 rounded-lg font-black text-[11px] transition-all ${
                  animSpeed === s ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

        </div>

        {/* Biomechanical Coaching Tip */}
        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80 text-slate-300">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-bold text-slate-400">Pro Form:</span>
            <span>Pin elbows at sides and squeeze the red bicep peak for 1 full second at top.</span>
          </div>
          <span className="hidden md:inline text-[10px] text-red-400 font-bold">
            Interactive 3D Red Muscle Simulation
          </span>
        </div>

      </div>

    </div>
  );
};
