import React from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import '../styles/AboutPage.css';

function Model() {
  const { scene } = useGLTF('/model/brille.glb');
  return <primitive object={scene} scale={0.4} position={[0, 0, 0]} />;
}

const AboutPage = () => {
  return (
    <div className="aboutPage">
      <header className="aboutPage_header">
        <h1 className="aboutPage_title">3D Customization</h1>
      </header>
      <subheader className="aboutPage_subtitle">
        Customize your look—lens type, frame color, and more coming soon.
    </subheader>

      <div className="customizeModelContainer">
        <div className="modelContainer">
          <Canvas
            className="modelContainer_canvas"
            camera={{ position: [0, 0, 3] }}
          >
            <ambientLight intensity={0.5} />
            <Model />
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

export default AboutPage;
