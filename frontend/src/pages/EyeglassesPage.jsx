import React from 'react';
import { useSelector } from 'react-redux';
import ProductCard from '../common/ProductCard';
import '../styles/EyeglassesPage.css';
import { groupProductsByStyle } from '../utils/utils'

const EyeglassesPage = () => {
    const eyeglasses = useSelector((state) => state.products.eyeglasses);
    const sortedEyeglasses = groupProductsByStyle(eyeglasses)

     return (
    <div className="eyeglassesPage">
      {/* Inner nav bar */}
      <div className="eyeglassesSubNav">
        <div className="eyeglassesTitle">Eyewear</div>

        <div className="eyeglassesActions">
          <span className="filterLabel">Filter</span>
          <span className="sortLabel">Sort By</span>
        </div>
      </div>

      {/* Products will go here later */}
      <div className='productPlaceholder'>
        <div className="productGrid">
        {sortedEyeglasses.flatMap((product) =>
          product.variants.map((variant) => (
            <ProductCard
              key={variant.id}
              product={variant}
              colorways={product.colors}   // ✅ pass all colors for this style
            />
          ))
        )}
      </div>
      </div>
    </div>
  );
};

export default EyeglassesPage;
