import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCw,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Gauge,
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info,
  Flame,
  Target,
  Crosshair,
  Box
} from 'lucide-react';
import { getRealHumanExercise, RealHumanExercise, getExercisePressurePoints, PressurePoint } from '../utils/realHumanExerciseData';
import { Workout3DAnimation } from './Workout3DAnimation';

export type CameraView = 'front' | 'hero' | 'side' | 'back' | 'rotate';
export type AnimationSpeed = 0.25 | 0.5 | 1 | 1.5;
export type DemonstrationMode = '3d' | 'motion' | 'video' | 'breakdown';

export interface ExerciseAnimationProps {
  exerciseName: string;
  muscleGroup?: string;
  cameraView?: CameraView;
  speed?: AnimationSpeed;
  showFormGuides?: boolean;
  isCompact?: boolean;
  isPlaying?: boolean;
  interactiveControls?: boolean;
  videoUrl?: string;
  defaultMode?: DemonstrationMode;
  onViewChange?: (view: CameraView) => void;
  onSpeedChange?: (speed: AnimationSpeed) => void;
}

export const ExerciseAnimation: React.FC<ExerciseAnimationProps> = ({
  exerciseName = 'Push Ups',
  muscleGroup = 'Chest',
  cameraView: _controlledView,
  speed: controlledSpeed,
  showFormGuides = true,
  isCompact = false,
  isPlaying: controlledPlaying = true,
  interactiveControls = true,
  videoUrl: customVideoUrl,
  defaultMode = '3d',
  onSpeedChange
}) => {
  // Display Mode: '3d' (Interactive 3D Red Muscle animation) | 'motion' (Real human pose repetition loop) | 'video' (Trainer video) | 'breakdown' (Step-by-step form)
  const [displayMode, setDisplayMode] = useState<DemonstrationMode>(defaultMode);
  const [internalSpeed, setInternalSpeed] = useState<AnimationSpeed>(1);
  const [internalPlaying, setInternalPlaying] = useState<boolean>(true);
  const [currentPhase, setCurrentPhase] = useState<number>(0); // 0 to 1
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [manualScrubPhase, setManualScrubPhase] = useState<number | null>(null);
  const [showPressurePoints, setShowPressurePoints] = useState<boolean>(true);
  const [activePressurePointId, setActivePressurePointId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  const speed = controlledSpeed ?? internalSpeed;
  const isPlaying = controlledPlaying && internalPlaying && manualScrubPhase === null;

  // Retrieve curated real human exercise data & biomechanical pressure points
  const exerciseData: RealHumanExercise = getRealHumanExercise(exerciseName, muscleGroup);
  const pressurePoints: PressurePoint[] = getExercisePressurePoints(exerciseData);
  const activePoint = pressurePoints.find(p => p.id === activePressurePointId) || null;
  const activeVideoUrl = customVideoUrl || exerciseData.videoUrl;

  // Continuous animation loop for real human motion crossfade
  useEffect(() => {
    if (displayMode === 'video' || displayMode === '3d' || isCompact) return;

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (manualScrubPhase !== null) {
        setCurrentPhase(manualScrubPhase);
      } else if (isPlaying) {
        const cycleDuration = 2.4 / speed;
        setCurrentPhase(prev => (prev + delta / cycleDuration) % 1);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [displayMode, isCompact, isPlaying, manualScrubPhase, speed]);

  // Handle speed changes
  const handleSetSpeed = (s: AnimationSpeed) => {
    setInternalSpeed(s);
    if (onSpeedChange) onSpeedChange(s);
    if (videoRef.current) {
      videoRef.current.playbackRate = s;
    }
  };

  // Video play/pause synchronization
  useEffect(() => {
    if (displayMode === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
      videoRef.current.playbackRate = speed;
    }
  }, [displayMode, isPlaying, speed]);

  // Derived repetition metrics
  const isConcentric = currentPhase < 0.5;
  // Sinusoidal easing for muscle load and image blend
  const eased = 0.5 - 0.5 * Math.cos(currentPhase * Math.PI * 2);
  const tensionPercent = Math.round(45 + eased * 53);

  // Crossfade opacity between real human start pose (0.jpg) and peak pose (1.jpg)
  const peakOpacity = Math.max(0, Math.min(1, (eased - 0.15) / 0.7));

  // COMPACT CARD VIEW (Used in ExerciseVideosView grid cards)
  if (isCompact) {
    return (
      <div className="relative w-full h-full min-h-[160px] bg-slate-950 overflow-hidden flex items-center justify-center select-none group">
        {/* Real Human Athlete Photo Demonstration */}
        <img
          src={exerciseData.heroImage || exerciseData.startImage}
          alt={exerciseData.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Real Human Badge */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-black text-white px-2.5 py-1 rounded-xl bg-slate-950/85 backdrop-blur-xs border border-slate-800">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Real Human Demonstration
          </span>
          <span className="text-slate-400 font-mono">HD</span>
        </div>
      </div>
    );
  }

  // FULL INTERACTIVE WORKOUT PLAYER & MODAL VIEW
  return (
    <div className="relative w-full h-full min-h-[360px] bg-slate-950 flex flex-col items-center justify-center overflow-hidden select-none text-slate-100">
      
      {/* 1. VISUAL DEMONSTRATION STAGE */}
      <div className="relative w-full h-full flex-1 flex items-center justify-center overflow-hidden bg-slate-950">
        
        {/* MODE 3D: INTERACTIVE 3D RED MUSCLE ANIMATION (YouTube Shorts style with Glowing Muscle Squeeze) */}
        {displayMode === '3d' && (
          <Workout3DAnimation
            exerciseName={exerciseName}
            muscleGroup={muscleGroup}
            speed={speed}
            isPlaying={isPlaying}
            showPressurePoints={showPressurePoints}
            topModeSwitcher={
              interactiveControls ? (
                <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800 shrink-0">
                  <button
                    onClick={() => {
                      setDisplayMode('3d');
                      setManualScrubPhase(null);
                    }}
                    className="px-2.5 py-1.5 rounded-lg font-black flex items-center gap-1.5 transition-all text-xs bg-gradient-to-r from-red-600 via-rose-600 to-red-500 text-white shadow-md shadow-red-600/30"
                  >
                    <Flame className="w-3.5 h-3.5 text-white animate-pulse" />
                    <span>3D Red Muscle</span>
                  </button>

                  <button
                    onClick={() => {
                      setDisplayMode('motion');
                      setManualScrubPhase(null);
                    }}
                    className="px-2.5 py-1.5 rounded-lg font-black flex items-center gap-1.5 transition-all text-xs text-slate-400 hover:text-white"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Real Motion</span>
                  </button>

                  <button
                    onClick={() => setDisplayMode('video')}
                    className="px-2.5 py-1.5 rounded-lg font-black flex items-center gap-1.5 transition-all text-xs text-slate-400 hover:text-white"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Trainer Video</span>
                  </button>

                  <button
                    onClick={() => setDisplayMode('breakdown')}
                    className="px-2.5 py-1.5 rounded-lg font-black flex items-center gap-1.5 transition-all text-xs text-slate-400 hover:text-white"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Form Steps</span>
                  </button>
                </div>
              ) : undefined
            }
          />
        )}

        {/* MODE A: REAL HUMAN MOTION LOOP (Start -> Peak Contraction Photo Blend) */}
        {displayMode === 'motion' && (
          <div className="relative w-full h-full flex items-center justify-center">
            
            {/* Ambient Back Glow */}
            <div className="absolute w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

            {/* Base Image: Real Human Starting Position */}
            <img
              src={exerciseData.startImage}
              alt={`${exerciseData.name} Starting Pose`}
              className="absolute max-h-[85%] max-w-[90%] object-contain rounded-2xl shadow-2xl transition-all duration-150 ease-out"
              style={{
                opacity: 1 - peakOpacity * 0.88,
                transform: `scale(${1 + (1 - eased) * 0.02})`
              }}
            />

            {/* Overlay Image: Real Human Peak Contraction */}
            <img
              src={exerciseData.peakImage}
              alt={`${exerciseData.name} Peak Execution`}
              className="absolute max-h-[85%] max-w-[90%] object-contain rounded-2xl shadow-2xl transition-all duration-150 ease-out"
              style={{
                opacity: peakOpacity,
                transform: `scale(${1 + eased * 0.025})`
              }}
            />

            {/* RED PRESSURE POINT & SMOOTH BIOMECHANICAL MOTION OVERLAY */}
            {showPressurePoints && (
              <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                <div className="relative w-full h-full max-h-[85%] max-w-[90%]">
                  
                  {/* SVG Dynamic Tension Vectors & Smooth Motion Arc */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                    <defs>
                      <linearGradient id="redTensionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#b91c1c" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>

                    {/* Dynamic dashed red tension link between prime mover and joint pivots */}
                    {pressurePoints.length > 1 && (
                      <path
                        d={pressurePoints.reduce((acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x}% ${p.y}%`, '')}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth={1.5 + eased * 2}
                        strokeDasharray="5,5"
                        strokeOpacity={0.35 + eased * 0.55}
                        className="transition-all duration-150"
                      />
                    )}

                    {/* Smooth Motion Arc Tracer Bead */}
                    <circle
                      cx="50%"
                      cy={`${36 + (1 - eased) * 22}%`}
                      r={3.5 + eased * 2.5}
                      fill="#ef4444"
                      className="filter drop-shadow-[0_0_12px_#ef4444] transition-all duration-75"
                    />
                  </svg>

                  {/* Red Pressure Point Hotspot Nodes */}
                  {pressurePoints.map((point) => {
                    const pointTension = Math.round(point.maxTension * (0.42 + eased * 0.58));
                    const isPeak = eased > 0.58;
                    const isSelected = activePressurePointId === point.id;

                    return (
                      <div
                        key={point.id}
                        style={{ left: `${point.x}%`, top: `${point.y}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group z-20"
                        onClick={() => setActivePressurePointId(isSelected ? null : point.id)}
                        onMouseEnter={() => setActivePressurePointId(point.id)}
                        onMouseLeave={() => setActivePressurePointId(null)}
                      >
                        {/* Dynamic Red Radar Shockwave Pulse at high tension */}
                        {isPeak && (
                          <>
                            <span className="absolute -inset-3.5 rounded-full border-2 border-red-500 animate-ping opacity-80 pointer-events-none" />
                            <span className="absolute -inset-2 rounded-full bg-red-500/30 animate-pulse pointer-events-none" />
                          </>
                        )}

                        {/* Red Hotspot Jewel */}
                        <div
                          className={`rounded-full transition-all duration-200 flex items-center justify-center ${
                            isPeak
                              ? 'w-6 h-6 bg-red-600 border-2 border-white shadow-[0_0_22px_rgba(239,68,68,1)]'
                              : 'w-4 h-4 bg-red-500/85 border border-red-300/80 shadow-[0_0_10px_rgba(239,68,68,0.7)]'
                          }`}
                        >
                          <span className={`rounded-full bg-white transition-all ${isPeak ? 'w-2 h-2 animate-pulse' : 'w-1.5 h-1.5'}`} />
                        </div>

                        {/* Red Floating Badge (Always visible during peak load or on hover) */}
                        <div
                          className={`absolute left-1/2 -translate-x-1/2 transition-all duration-150 whitespace-nowrap pointer-events-none ${
                            point.y > 55 ? 'bottom-full mb-2' : 'top-full mt-2'
                          } ${
                            isSelected || isPeak
                              ? 'opacity-100 scale-100'
                              : 'opacity-0 sm:group-hover:opacity-100 scale-95 sm:group-hover:scale-100'
                          }`}
                        >
                          <div className="px-2 py-0.5 rounded-lg bg-slate-950/95 border border-red-500/80 shadow-2xl backdrop-blur-md flex items-center gap-1.5 text-[10px] font-black text-red-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
                            <span className="font-extrabold text-white">{point.name}</span>
                            <span className="px-1 py-0.2 rounded bg-red-950 border border-red-500/60 text-red-300 font-mono text-[9px]">
                              {pointTension}% LOAD
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Active Pressure Point Biomechanical Inspection Card */}
                  {activePoint && (
                    <div className="absolute bottom-2 left-2 right-2 sm:left-auto sm:right-2 sm:w-72 z-30 p-3 rounded-2xl bg-slate-950/95 border border-red-500/80 backdrop-blur-xl shadow-2xl animate-fadeIn pointer-events-auto">
                      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-800">
                        <div className="flex items-center gap-1.5 text-xs font-black text-red-400">
                          <Flame className="w-4 h-4 text-red-500 animate-pulse" />
                          <span className="truncate">{activePoint.name}</span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 font-mono text-[10px] font-bold border border-red-500/60 shrink-0">
                          {Math.round(activePoint.maxTension * (0.42 + eased * 0.58))}% Tension
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 mt-1.5 leading-relaxed">
                        <span className="text-slate-400 font-bold">Role: </span>
                        {activePoint.role}
                      </p>
                      <p className="text-[10px] text-emerald-400 mt-1 leading-relaxed">
                        <span className="text-slate-400 font-bold">Form Cue: </span>
                        {activePoint.cue}
                      </p>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* Live Movement Phase Badge Overlay */}
            <div className="absolute top-16 left-4 z-10 flex flex-col gap-1">
              <span className="px-3 py-1 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-xs font-black text-emerald-400 flex items-center gap-1.5 shadow-lg">
                <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                {isConcentric ? 'Concentric / Lifting' : 'Eccentric / Lowering'}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-slate-950/80 text-[10px] font-bold text-slate-300 backdrop-blur-xs border border-slate-800 w-fit">
                {eased > 0.65 ? 'Peak Contraction Squeeze' : eased < 0.35 ? 'Full Range Starting Setup' : 'Mid-Range Dynamic Travel'}
              </span>
            </div>

            {/* Target Muscle Recruited Callout */}
            <div className="absolute top-16 right-4 z-10 hidden sm:flex flex-col items-end gap-1">
              <span className="px-3 py-1 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-xs font-black text-cyan-300 flex items-center gap-1.5 shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                {exerciseData.primaryMuscles[0]}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold px-1">
                Tempo: {exerciseData.tempo}
              </span>
            </div>

          </div>
        )}

        {/* MODE B: REAL HUMAN TRAINER VIDEO DEMONSTRATION */}
        {displayMode === 'video' && (
          <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
            {activeVideoUrl ? (
              <video
                ref={videoRef}
                src={activeVideoUrl}
                poster={exerciseData.heroImage}
                loop
                playsInline
                muted={isMuted}
                autoPlay={isPlaying}
                className="w-full h-full object-contain max-h-[420px]"
              />
            ) : (
              <div className="text-center p-6">
                <p className="text-slate-400 text-sm">Video demonstration loading...</p>
              </div>
            )}

            {/* Video Audio Control */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="absolute bottom-16 right-4 z-10 p-2 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors shadow-lg"
              title={isMuted ? 'Unmute Trainer Audio' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>
        )}

        {/* MODE C: STEP-BY-STEP REAL HUMAN FORM BREAKDOWN */}
        {displayMode === 'breakdown' && (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 max-w-2xl mx-auto">
            <div className="relative w-full aspect-video max-h-[260px] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 mb-3 flex items-center justify-center">
              <img
                src={activeStep === 0 ? exerciseData.startImage : exerciseData.peakImage}
                alt={`${exerciseData.name} Phase ${activeStep + 1}`}
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-slate-950/85 border border-slate-800 text-xs font-black text-emerald-400">
                Phase {activeStep + 1}: {activeStep === 0 ? 'Starting Setup & Form' : 'Peak Depth & Contraction'}
              </div>
            </div>

            {/* Coaching Instruction for Current Step */}
            <div className="w-full p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
              <div className="font-black text-white flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {activeStep === 0 ? 'Step 1: Stance & Gripping Technique' : 'Step 2: Execution & Muscular Squeeze'}
              </div>
              <p>
                {activeStep === 0
                  ? exerciseData.formCheckpoints.start
                  : exerciseData.formCheckpoints.peak}
              </p>
            </div>

            {/* Step Selection Tabs */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setActiveStep(0)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeStep === 0
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                1. Starting Stance
              </button>
              <button
                onClick={() => setActiveStep(1)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeStep === 1
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                2. Peak Execution
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 2. TOP FLOATING CONTROLS: DEMONSTRATION MODE SWITCHER (For Motion, Video, and Breakdown modes) */}
      {interactiveControls && displayMode !== '3d' && (
        <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-xs shadow-xl">
          
          {/* Display Mode Toggles */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                setDisplayMode('3d');
                setManualScrubPhase(null);
              }}
              className="px-3 py-1.5 rounded-lg font-black flex items-center gap-1.5 transition-all text-slate-400 hover:text-white"
            >
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span>3D Red Muscle</span>
            </button>

            <button
              onClick={() => {
                setDisplayMode('motion');
                setManualScrubPhase(null);
              }}
              className={`px-3 py-1.5 rounded-lg font-black flex items-center gap-1.5 transition-all ${
                displayMode === 'motion'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" /> Real Motion Loop
            </button>

            <button
              onClick={() => setDisplayMode('video')}
              className={`px-3 py-1.5 rounded-lg font-black flex items-center gap-1.5 transition-all ${
                displayMode === 'video'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" /> Trainer Video
            </button>

            <button
              onClick={() => setDisplayMode('breakdown')}
              className={`px-3 py-1.5 rounded-lg font-black flex items-center gap-1.5 transition-all ${
                displayMode === 'breakdown'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" /> Form Steps
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-extrabold px-1.5 uppercase tracking-wider flex items-center gap-1">
              <Gauge className="w-3 h-3 text-amber-400" /> Speed:
            </span>
            {[0.5, 1, 1.5].map(s => (
              <button
                key={s}
                onClick={() => handleSetSpeed(s as AnimationSpeed)}
                className={`px-2.5 py-1 rounded-lg font-black text-[11px] transition-all ${
                  speed === s ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Red Pressure Point Highlighting Toggle */}
          <button
            onClick={() => setShowPressurePoints(!showPressurePoints)}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
              showPressurePoints
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-red-600/30 ring-1 ring-red-400'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
            title="Toggle highlighting red at pressure points during workout motion"
          >
            <Flame className={`w-3.5 h-3.5 ${showPressurePoints ? 'text-white animate-pulse' : 'text-slate-500'}`} />
            <span className="font-extrabold">Red Pressure Points</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${showPressurePoints ? 'bg-red-950/90 text-red-200 border border-red-500/40' : 'bg-slate-800 text-slate-400'}`}>
              {showPressurePoints ? 'LIVE ON' : 'OFF'}
            </span>
          </button>

        </div>
      )}

      {/* 3. BOTTOM SCRUBBER & BIOMECHANICS HUD (Full Player / Modal) */}
      {interactiveControls && displayMode === 'motion' && (
        <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-col gap-2 p-3 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-xl">
          
          <div className="flex items-center gap-3">
            {/* Play / Pause */}
            <button
              onClick={() => {
                if (manualScrubPhase !== null) {
                  setManualScrubPhase(null);
                  setInternalPlaying(true);
                } else {
                  setInternalPlaying(!internalPlaying);
                }
              }}
              className="w-8 h-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md font-bold transition-transform active:scale-95"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            {/* Rep Scrubber */}
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  Rep Cadence: {Math.round(currentPhase * 100)}%
                </span>
                <span className="text-slate-300 font-mono">
                  {eased > 0.7 ? 'Lockout / Peak Contraction' : eased < 0.3 ? 'Full Extension Setup' : 'Mid-Travel'}
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(currentPhase * 100)}
                onChange={e => {
                  const val = Number(e.target.value) / 100;
                  setManualScrubPhase(val);
                }}
                className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                title="Drag to inspect human execution frame-by-frame"
              />
            </div>

            {/* Muscular Tension Gauge */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Tension</span>
                <span className="text-xs font-black text-amber-400">{tensionPercent}%</span>
              </div>
              <div className="w-12 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 transition-all duration-150"
                  style={{ width: `${tensionPercent}%` }}
                />
              </div>
            </div>

            {/* Live Max Pressure Point Callout */}
            {showPressurePoints && pressurePoints.length > 0 && (
              <div className="hidden lg:flex items-center gap-2 bg-slate-950/90 px-3 py-1.5 rounded-xl border border-red-900/60 shrink-0 shadow-inner">
                <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse shrink-0" />
                <div className="text-left">
                  <span className="text-[9px] text-slate-400 uppercase font-extrabold block">Pressure Hotspot</span>
                  <span className="text-[11px] font-black text-red-400 truncate max-w-[140px] block">
                    {pressurePoints[0]?.name || 'Agonist Peak'} ({Math.round((pressurePoints[0]?.maxTension || 95) * (0.42 + eased * 0.58))}%)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Real Human Cue Checklist */}
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-slate-400">Key Cue:</span>
              <span className="text-slate-200">{exerciseData.safetyTips[0]}</span>
            </div>
            <div className="hidden md:flex items-center gap-1 text-slate-400 text-[10px]">
              <Info className="w-3 h-3 text-cyan-400" />
              <span>Real human athlete demonstration</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
