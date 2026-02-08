import React from 'react';
import '../styles/ProductCard.css';

const ProductCard = ({ product }) => {
  const { name, price, color } = product;

  // assuming `color` might later be an array
  const colors = Array.isArray(color) ? color : [color];
  const visibleColors = colors.slice(0, 3);
  const hasMore = colors.length > 3;

  return (
    <div className="productCard">
      {/* Image placeholder */}
      <div className="productImagePlaceholder" />

      {/* Product info */}
      <div className="productInfoContainer">
        <div className="productInfoTop">
          <span className="productName">{name}</span>
          <span className="productPrice">${price}</span>
        </div>

        <div className="productInfoBottom">
          {visibleColors.map((_, index) => (
            <span key={index} className="colorSwatch" />
          ))}
          {hasMore && <span className="moreColors">+ more</span>}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
