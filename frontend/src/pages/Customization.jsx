import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
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
        mat.roughness = 0.35;
      }
      if (matName === 'black.001') {
        mat.metalness = 0;
        mat.roughness = 0.35;
        mat.color.set(frameColor);
      }
      if (matName === 'glasses') {
        mat.color.set(glassColor);
        mat.transparent = true;
        mat.opacity = 0.65;
        mat.roughness = 0.2;
        mat.needsUpdate = true;
      }
    });
    });
  }, [model, glassColor, frameColor]);
  return <primitive object={model} scale={0.4} position={[0, 0, 0]} />;
}

const Customization = () => {
  const dispatch = useDispatch();
  const canvasStateRef = useRef(null);

  const [glassColor, setGlassColor] = useState('#4D4D4D');
  const [metalColor, setMetalColor] = useState('#EBEBEB');
  const [frameColor, setFrameColor] = useState('#0D0D0D');
  const [addedToCart, setAddedToCart] = useState(false);

  const colorName = {
    '#0D0D0D': 'Black',
    '#FF1C1C': 'Red',
    '#C0F77E': 'Lime',
    '#FFFFFA': 'Cream',
  }
  const glassColorName = {
    '#4D4D4D': 'Black',
    '#5E3019': 'Brown',
    '#F7FFFF': 'Clear',
  }

  useEffect(() => {
    setAddedToCart(false);
  }, [frameColor, glassColor]);

  const frameLabel = colorName[frameColor] ?? 'Custom';
  const glassLabel = glassColorName[glassColor] ?? 'Custom';
  const selectedColorName = `${frameLabel} / ${glassLabel}`;

  const sku = `SEL-${frameLabel.toUpperCase()}-${glassLabel.toUpperCase()}`.replace(
    /\s+/g,
    '-'
  );

  const productId = `custom:selena:${encodeURIComponent(frameLabel)}:${encodeURIComponent(glassLabel)}`;

  const handleAddToCart = () => {
    let previewImage = null;
    if (canvasStateRef.current) {
      const { gl, scene, camera } = canvasStateRef.current;
      gl.render(scene, camera);
      previewImage = gl.domElement.toDataURL('image/png');
    }

    dispatch(
      addToCart({
        productId,
        quantity: 1,
        name: 'Selena',
        color: selectedColorName,
        price: 128,
        previewImage,
      })
    );
    setAddedToCart(true);
  };
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
            gl={{ toneMappingExposure: 0.6, preserveDrawingBuffer: true }}
            onCreated={(state) => {
              canvasStateRef.current = state;
            }}
          >
            <color attach="background" args={['#ffffff']} />
            <ambientLight intensity={0.55} />
            <directionalLight position={[5, 5, 5]} intensity={1.1} />
            <directionalLight position={[-3, 2, 2]} intensity={0.6} />
            <Environment preset="studio" environmentIntensity={0.45} />
            <Model glassColor={glassColor} frameColor={frameColor} metalColor={metalColor} />
            <OrbitControls />
          </Canvas>
        </div>

        <div className="modelOption">
          <div className="productDetail_name">
           <h1>Selena</h1>
           <div className="productDetail_price">$128.00</div>
          </div>
          <div className="modelOption_header">
            <p className="modelOption_placeholder">
              Frame Color
            </p>
          </div>
          <div className="modelOption_colors">
             <button
            type="button"
            className="modelOption_color"
            style={{ background: '#0D0D0D' }}
            onClick={() => setFrameColor('#0D0D0D')}
            />
            <button
            type="button"
            className="modelOption_color"
            style={{ background: '#FF1C1C' }}
            onClick={() => setFrameColor('#FF1C1C')}
            />
            <button
            type="button"
            className="modelOption_color"
            style={{ background: '#C0F77E' }}
            onClick={() => setFrameColor('#C0F77E')}
            />
             <button
            type="button"
            className="modelOption_color"
            style={{ background: '#FFFFFA', border: '1px solid black' }}
            onClick={() => setFrameColor('#FFFFFA')}
            />
          </div>
          <div className="modelOption_colorName">
            <p>
              {frameLabel}
            </p>
          </div>
          <div className="modelOption_header">
            <p className="modelOption_placeholder">
              Glass Color
            </p>
          </div>
          <div className="modelOption_colors">
             <button
            type="button"
            className="modelOption_color"
            style={{ background: '#4D4D4D' }}
            onClick={() => setGlassColor('#4D4D4D')}
            />
            <button
            type="button"
            className="modelOption_color"
            style={{ background: '#5E3019' }}
            onClick={() => setGlassColor('#5E3019')}
            />
            <button
            type="button"
            className="modelOption_color"
            style={{ background: '#F7FFFF', border: '1px solid black' }}
            onClick={() => setGlassColor('#F7FFFF')}
            />
          </div>
          <div className="modelOption_colorName">
            <p>
              {glassLabel}
            </p>
          </div>

          <div className="productDetail_sku">SKU: {sku}</div>

          <div className="productDetail_button">
            <button
              type="button"
              className="productDetail_addToCart"
              onClick={handleAddToCart}
            >
              {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customization;
