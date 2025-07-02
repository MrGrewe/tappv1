import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

function DLogoModel(props: any) {
  const group = useRef<any>();
  const { scene } = useGLTF('/dlogo.glb');
  useFrame(() => {
    if (group.current) {
      group.current.rotation.y += 0.01; // langsame Rotation
    }
  });
  return <primitive ref={group} object={scene} {...props} />;
}

export default function Logo3D() {
  return (
    <div style={{ width: '100%', maxWidth: 500, height: 380, margin: '0 auto 24px auto' }}>
      <Canvas camera={{ position: [0, 0, 4.5], fov: 35 }} style={{ borderRadius: 24 }} gl={{ preserveDrawingBuffer: true, alpha: true }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[4, 8, 8]} intensity={1.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <directionalLight position={[-4, -4, 2]} intensity={0.5} />
        <pointLight position={[0, 2, 6]} intensity={0.4} />
        <DLogoModel />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
      </Canvas>
    </div>
  );
} 