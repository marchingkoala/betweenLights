import React, { useState } from 'react';
import '../styles/ProductCard.css';


const ProductCard = ({ product, colorways = [] }) => {
  const { name, price, images, color } = product;
  const colors = Array.isArray(colorways) && colorways.length > 0 ? colorways : [product.color];
  const visibleColors = colors.slice(0, 3);
  const hasMore = colors.length > 3;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [currentView, setCurrentView] = useState('front');
  const frontImage = images?.find((img) => img.view === 'front');
  const sideImage = images?.find((img) => img.view === 'side');
  const activeImage =
    currentView === 'side' && sideImage ? sideImage : frontImage;

  const handleToggleView = () => {
    if (!sideImage) return;
    setCurrentView((prev) => (prev === 'front' ? 'side' : 'front'));
  };


   return (
    <div className="productCard">
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
            <span key={c} className="colorSwatch" />
          ))}
          {hasMore && <span className="moreColors">+ more</span>}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
