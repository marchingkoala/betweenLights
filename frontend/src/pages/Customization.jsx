import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import '../styles/Customization.css';

function Model({ glassColor, frameColor, metalColor }) {
  const { scene } = useGLTF('/model/test.glb');
  const model = React.useMemo(()=> scene.clone(true), [scene])
 React.useEffect(() => {
    model.traverse((child) => {
    if (!child.isMesh || !child.material) return;
    const isSunglasses =
    child.name.startsWith('meshType') ||
    ['frame', 'glasses', 'black.001'].includes(child.material?.name?.toLowerCase());
  child.visible = isSunglasses;
    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];
    materials.forEach((mat) => {
      const matName = mat.name.toLowerCase();
      if (matName === 'frame') {
        mat.color.set(metalColor);
        mat.metalness = 0;
      }
      if(matName === 'black.001'){
        mat.metalness = 0;
        mat.roughness = 0.35;
        mat.color.set(frameColor);
      }
      if (matName === 'glasses') {
        mat.color.set(glassColor);
        mat.transparent = true;
        mat.opacity = 0.6;
        mat.needsUpdate = true;
      }
    });
    });
  }, [model, glassColor, frameColor]);
  return <primitive object={model} scale={0.4} position={[0, 0, 0]} />;
}

const Customization = () => {

  const [glassColor, setGlassColor] = useState('#4D4D4D');
  const [metalColor, setMetalColor] = useState('#EBEBEB');
  const [frameColor, setFrameColor] = useState('#0D0D0D');

  return (
    <div className="customization">
      <header className="customization_header">
        <h1 className="customization_title">3D Customization</h1>
      </header>
      <subheader className="customization_subtitle">
        Customize your look—lens type, frame color, and more coming soon.
      </subheader>

      <div className="customizeModelContainer">
        <div className="modelContainer">
          <Canvas
            className="modelContainer_canvas"
            camera={{ position: [0, 0, 3] }}
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} />
            <directionalLight position={[-3, 2, 2]} intensity={0.6} />
            <Model glassColor={glassColor} frameColor={frameColor} metalColor={metalColor} />
            <OrbitControls />
          </Canvas>
        </div>

        <div className="modelOption">
          <p className="modelOption_placeholder">
            Customize your look—lens type, frame color, and more coming soon.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Customization;
