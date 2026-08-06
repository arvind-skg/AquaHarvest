import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, MeshWobbleMaterial, Float } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

// Animated Rain Drop
function RainDrop({ position }) {
  const ref = useRef();
  const speed = useMemo(() => 0.04 + Math.random() * 0.04, []);
  const initY = useMemo(() => position[1], [position]);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.y -= speed;
    if (ref.current.position.y < -2) {
      ref.current.position.y = initY;
    }
    ref.current.material.opacity = Math.max(0, Math.min(1,
      (ref.current.position.y - (-2)) / (initY - (-2))
    ));
  });

  return (
    <mesh ref={ref} position={position}>
      <cylinderGeometry args={[0.02, 0.01, 0.3, 4]} />
      <meshStandardMaterial color="#67e8f9" transparent opacity={0.7} />
    </mesh>
  );
}

// Rain system
function Rain() {
  const drops = useMemo(() =>
    Array.from({ length: 28 }, (_, i) => [
      (Math.random() - 0.5) * 5,
      2 + Math.random() * 3,
      (Math.random() - 0.5) * 3,
    ]), []
  );
  return <>{drops.map((pos, i) => <RainDrop key={i} position={pos} />)}</>;
}

// Animated pipe flow particle
function FlowParticle({ from, to, color }) {
  const ref = useRef();
  const t = useRef(Math.random());

  useFrame((_, delta) => {
    if (!ref.current) return;
    t.current = (t.current + delta * 0.6) % 1;
    const pos = new THREE.Vector3().lerpVectors(
      new THREE.Vector3(...from),
      new THREE.Vector3(...to),
      t.current
    );
    ref.current.position.copy(pos);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.07, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
    </mesh>
  );
}

// Pipe
function Pipe({ from, to, color = '#0f766e' }) {
  const dir = new THREE.Vector3(...to).sub(new THREE.Vector3(...from));
  const length = dir.length();
  const mid = new THREE.Vector3(...from).lerp(new THREE.Vector3(...to), 0.5);
  dir.normalize();

  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

  return (
    <group position={[mid.x, mid.y, mid.z]} quaternion={quaternion}>
      <mesh>
        <cylinderGeometry args={[0.06, 0.06, length, 8]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}

// Scene components
function Roof({ position = [0, 1.4, 0] }) {
  return (
    <Float speed={0.8} rotationIntensity={0} floatIntensity={0.15}>
      <mesh position={position} castShadow>
        <boxGeometry args={[3.5, 0.15, 2.5]} />
        <meshStandardMaterial color="#1e3a5f" metalness={0.3} roughness={0.6} />
      </mesh>
      {/* Roof edge gutter */}
      <mesh position={[0, position[1] - 0.12, -1.35]}>
        <boxGeometry args={[3.6, 0.08, 0.12]} />
        <meshStandardMaterial color="#0f766e" metalness={0.6} roughness={0.3} />
      </mesh>
    </Float>
  );
}

function Filter({ position }) {
  return (
    <mesh position={position} castShadow>
      <cylinderGeometry args={[0.22, 0.22, 0.5, 12]} />
      <meshStandardMaterial color="#fbbf24" metalness={0.4} roughness={0.4} />
    </mesh>
  );
}

function StorageTank({ position, label = 'Tank' }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.05;
  });
  return (
    <group ref={ref} position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.55, 0.55, 1.2, 16]} />
        <meshStandardMaterial color="#0891b2" metalness={0.3} roughness={0.4} transparent opacity={0.85} />
      </mesh>
      {/* Water inside */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.7, 16]} />
        <meshStandardMaterial color="#22d3ee" transparent opacity={0.5} />
      </mesh>
      <Text position={[0, 0.9, 0]} fontSize={0.18} color="#22d3ee" anchorX="center">
        {label}
      </Text>
    </group>
  );
}

function RechargePit({ position }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[1.2, 0.6, 1.2]} />
        <meshStandardMaterial color="#15803d" metalness={0.1} roughness={0.7} />
      </mesh>
      {/* Gravel fill */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[1.1, 0.4, 1.1]} />
        <meshStandardMaterial color="#a3a3a3" roughness={1} />
      </mesh>
      <Text position={[0, 0.55, 0]} fontSize={0.16} color="#4ade80" anchorX="center">
        Recharge Pit
      </Text>
    </group>
  );
}

function RechargeWell({ position }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.35, 0.35, 1.6, 16]} />
        <meshStandardMaterial color="#92400e" metalness={0.2} roughness={0.6} />
      </mesh>
      {/* Casing */}
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.12, 16]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      <Text position={[0, 1.1, 0]} fontSize={0.16} color="#fbbf24" anchorX="center">
        Recharge Well
      </Text>
    </group>
  );
}

function RechargeTrench({ position }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[2.4, 0.4, 0.7]} />
        <meshStandardMaterial color="#1a4731" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[2.3, 0.3, 0.6]} />
        <meshStandardMaterial color="#6b7280" roughness={1} />
      </mesh>
      <Text position={[0, 0.45, 0]} fontSize={0.15} color="#86efac" anchorX="center">
        Recharge Trench
      </Text>
    </group>
  );
}

function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
      <planeGeometry args={[12, 10]} />
      <meshStandardMaterial color="#0a1628" roughness={1} />
    </mesh>
  );
}

function SceneContent({ recommendation }) {
  const showTank = recommendation === 'Storage Tank' || recommendation === 'Storage Tank + Recharge Pit';
  const showPit  = recommendation === 'Recharge Pit' || recommendation === 'Storage Tank + Recharge Pit';
  const showWell = recommendation === 'Recharge Well';
  const showTrench = recommendation === 'Recharge Trench';

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-3, 5, -3]} color="#0891b2" intensity={0.8} />
      <pointLight position={[3, 3, 3]}  color="#0d9488" intensity={0.5} />

      <Rain />
      <Roof position={[0, 1.5, 0]} />
      <Filter position={[0, 0.6, -1.2]} />

      {/* Roof → Filter pipe */}
      <Pipe from={[0, 1.3, -1.1]} to={[0, 0.85, -1.2]} color="#0f766e" />
      <FlowParticle from={[0, 1.3, -1.1]} to={[0, 0.85, -1.2]} color="#22d3ee" />

      {showTank && (
        <>
          <StorageTank position={showPit ? [-1.3, -0.2, 0] : [0, -0.2, 0]} label="Storage" />
          <Pipe from={[0, 0.35, -1.2]} to={showPit ? [-1.3, 0.35, 0] : [0, 0.35, 0]} color="#0f766e" />
          <FlowParticle from={[0, 0.35, -1.2]} to={showPit ? [-1.3, 0.35, 0] : [0, 0.35, 0]} color="#22d3ee" />
        </>
      )}

      {showPit && (
        <>
          <RechargePit position={[1.1, -0.9, 0]} />
          {showTank ? (
            <>
              <Pipe from={[-0.75, -0.2, 0]} to={[1.1, -0.2, 0]} color="#059669" />
              <Pipe from={[1.1, -0.2, 0]} to={[1.1, -0.6, 0]} color="#059669" />
              <FlowParticle from={[-0.75, -0.2, 0]} to={[1.1, -0.6, 0]} color="#4ade80" />
            </>
          ) : (
            <>
              <Pipe from={[0, 0.35, -1.2]} to={[1.1, -0.6, 0]} color="#059669" />
              <FlowParticle from={[0, 0.35, -1.2]} to={[1.1, -0.6, 0]} color="#4ade80" />
            </>
          )}
        </>
      )}

      {showWell && (
        <>
          <RechargeWell position={[0, -0.6, 0]} />
          <Pipe from={[0, 0.35, -1.2]} to={[0, 0.05, 0]} color="#92400e" />
          <FlowParticle from={[0, 0.35, -1.2]} to={[0, 0.05, 0]} color="#fbbf24" />
        </>
      )}

      {showTrench && (
        <>
          <RechargeTrench position={[0, -0.9, 0.6]} />
          <Pipe from={[0, 0.35, -1.2]} to={[0, -0.7, 0.6]} color="#15803d" />
          <FlowParticle from={[0, 0.35, -1.2]} to={[0, -0.7, 0.6]} color="#86efac" />
        </>
      )}

      {/* Groundwater layer */}
      <mesh position={[0, -1.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 4]} />
        <meshStandardMaterial color="#0369a1" transparent opacity={0.25} />
      </mesh>

      <GroundPlane />

      {/* Title label */}
      <Text
        position={[0, 2.3, 0]}
        fontSize={0.22}
        color="#22d3ee"
        anchorX="center"
        maxWidth={4}
      >
        {recommendation || 'Select a method'}
      </Text>

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 1.8}
        minDistance={4}
        maxDistance={12}
        autoRotate
        autoRotateSpeed={0.8}
      />
    </>
  );
}

export default function ThreeDViewer({ recommendation }) {
  return (
    <div className="h-[380px] rounded-2xl overflow-hidden border border-white/[0.08] bg-[#020610] relative">
      {/* Corner labels */}
      <div className="absolute top-3 left-3 z-10 text-[10px] font-mono text-slate-500 bg-black/40 px-2 py-1 rounded-lg">
        3D FLOW PREVIEW
      </div>
      <div className="absolute top-3 right-3 z-10 text-[10px] font-mono text-aqua-500 bg-black/40 px-2 py-1 rounded-lg">
        DRAG TO ROTATE
      </div>

      <Canvas
        camera={{ position: [4, 3, 7], fov: 45 }}
        shadows
        dpr={[1, 2]}
      >
        <fog attach="fog" args={['#020610', 10, 20]} />
        <SceneContent recommendation={recommendation} />
      </Canvas>
    </div>
  );
}
