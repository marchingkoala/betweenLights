import React, { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { slugify } from "../utils/utils.jsx"
import '../styles/ProductCard.css';


const ProductCard = ({ product, colorways = [], variantsByColor = {} }) => {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(product);

  useEffect(() => {
   setSelectedProduct(product);
 }, [product]);

  const { name, price, images, color } = selectedProduct;
  const colors = Array.isArray(colorways) && colorways.length > 0 ? colorways : [product.color];
  const visibleColors = colors.slice(0, 3);
  const hasMore = colors.length > 3;

  const [currentView, setCurrentView] = useState('front');
  const frontImage = images?.find((img) => img.view === 'front');
  const sideImage = images?.find((img) => img.view === 'side');
  const activeImage =
    currentView === 'side' && sideImage ? sideImage : frontImage;
  const slug = `${slugify(name)}-${slugify(color)}`;

  const handleToggleView = () => {
    if (!sideImage) return;
    setCurrentView((prev) => (prev === 'front' ? 'side' : 'front'));
  };

  const handleSwatchClick = (clickedColor) => {
    const nextVariant = variantsByColor?.[clickedColor];
    // If we don't have the variant loaded, do nothing
    if (!nextVariant) return;

    setSelectedProduct(nextVariant);
    setCurrentView('front'); // reset to front when switching color
  };

  const colorSwatch = {
    tortoise: '#8a4c1f',
    brown: '#3e2c1f',
    black: 'black',
    crystal: '#d2e3e1',
    silver: '#8b8b8b',
    gold: '#edbb4d'
  }

  const navigateToProduct = () => {
    navigate(`/eyeglasses/product/${slug}`)
  }

   return (
    <div className="productCard" onClick={navigateToProduct}>
        <div className="productMedia">
        {activeImage?.url ? (
          <img
            className="productImage"
            src={`${API_BASE_URL}${activeImage.url}`}
            alt={name}
          />
        ) : (
          <div className="productImagePlaceholder" />
        )}

        {/* Arrow only if side image exists */}
        {sideImage && (
          <button
            className="viewToggleBtn"
            onClick={handleToggleView}
          >
            &gt;
          </button>
        )}
      </div>

      <div className="productInfoContainer">
        <div className="productInfoTop">
          <span className="productName">{name}</span>
          <span className="productPrice">${price}</span>
        </div>

        <div className="productInfoBottom">
          {visibleColors.map((c) => (
            <button
              key={c}
              type="button"
              className={`colorSwatchBtn ${c === color ? 'isActive' : ''}`}
              onClick={() => handleSwatchClick(c)}
              aria-label={`Select color ${c}`}
              title={c}
            >
              <span
                className={`${c} colorSwatch`}
                style={{
                  width: '15px',
                  height: '10px',
                  backgroundColor: colorSwatch[c] ?? '#000',
                  display: 'block',
                }}
              />
            </button>
          ))}
          {hasMore && <span className="moreColors">+ more</span>}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
