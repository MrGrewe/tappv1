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
    <div style={{ width: '100%', height: 180, marginBottom: 16 }}>
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 2, 2]} intensity={0.7} />
        <DLogoModel />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
      </Canvas>
    </div>
  );
} 