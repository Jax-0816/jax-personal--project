import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import type { MotionValue } from 'framer-motion';
import * as THREE from 'three';

interface CarModelViewerProps {
  scrollProgress: MotionValue<number>;
}

/* 车轮组件 */
function Wheel({ position, color = '#1a1a1a' }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.32, 0.32, 0.26, 32]} />
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.4} />
      </mesh>
      {/* 轮毂 */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.14, 0.14, 0.28, 16]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  );
}

/* 默认几何体汽车 — 用户放入 public/models/car.glb 后可替换 */
function GeometricCar({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const progress = scrollProgress.get();
    // 自动缓慢旋转 + 滚动驱动旋转 (约 140° 范围)
    groupRef.current.rotation.y += delta * 0.22;
    groupRef.current.rotation.y += (progress - (groupRef.current.userData.lastProgress ?? progress)) * Math.PI * 1.6;
    groupRef.current.userData.lastProgress = progress;
  });

  return (
    <group ref={groupRef}>
      {/* 车身底盘 */}
      <mesh position={[0, 0.36, 0]}>
        <boxGeometry args={[1.8, 0.32, 3.8]} />
        <meshStandardMaterial color="#c0392b" roughness={0.2} metalness={0.7} />
      </mesh>
      {/* 车身上部 */}
      <mesh position={[0, 0.66, 0.12]}>
        <boxGeometry args={[1.6, 0.36, 3.4]} />
        <meshStandardMaterial color="#d64541" roughness={0.18} metalness={0.75} />
      </mesh>
      {/* 驾驶舱 */}
      <mesh position={[0, 0.92, -0.44]}>
        <boxGeometry args={[1.46, 0.34, 1.6]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.12} metalness={0.3} />
      </mesh>
      {/* 车窗（前后） */}
      <mesh position={[0, 0.9, 1.14]} rotation={[0.38, 0, 0]}>
        <boxGeometry args={[1.48, 0.24, 1.3]} />
        <meshStandardMaterial color="#16213e" roughness={0.08} metalness={0.2} />
      </mesh>
      {/* 前保险杠 */}
      <mesh position={[0, 0.28, 2.04]}>
        <boxGeometry args={[1.72, 0.14, 0.14]} />
        <meshStandardMaterial color="#333" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* 后保险杠 */}
      <mesh position={[0, 0.28, -2.04]}>
        <boxGeometry args={[1.72, 0.14, 0.14]} />
        <meshStandardMaterial color="#333" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* 车轮 */}
      <Wheel position={[0.96, 0.34, 1.42]} />
      <Wheel position={[-0.96, 0.34, 1.42]} />
      <Wheel position={[0.96, 0.34, -1.42]} />
      <Wheel position={[-0.96, 0.34, -1.42]} />
    </group>
  );
}

export default function CarModelViewer({ scrollProgress }: CarModelViewerProps) {
  return (
    <GeometricCar scrollProgress={scrollProgress} />
    /* 加载真实 3D 模型时替换为：
    <Suspense fallback={<GeometricCar scrollProgress={scrollProgress} />}>
      <GLBCar scrollProgress={scrollProgress} />
    </Suspense>
    需要 import { useGLTF } from '@react-three/drei';
    function GLBCar(...) {
      const { scene } = useGLTF('/models/car.glb');
      ...
    }
    */
  );
}

/* 环境光照预设 */
export function CarLighting() {
  return (
    <>
      <ambientLight intensity={1.8} />
      <directionalLight position={[6, 8, 4]} intensity={3.5} />
      <directionalLight position={[-4, 3, -2]} intensity={1.2} />
      <pointLight position={[0, 2, 4]} intensity={2} color="#e8f0ff" />
      <Environment preset="city" />
    </>
  );
}
