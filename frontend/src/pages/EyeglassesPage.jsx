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
        <div className="eyeglassesTitle">Eyeglasses</div>

        <div className="eyeglassesActions">
          <span className="filterLabel">Filter</span>
          <span className="sortLabel">Sort By</span>
        </div>
      </div>

      {/* Products Section*/}
      <div className='productPlaceholder'>
        <div className="productGrid">
        {sortedEyeglasses.flatMap((product) => {
            const variantsByColor = Object.fromEntries(
              product.variants.map((v) => [v.color, v])
            );
            return product.variants.map((variant) => (
              <ProductCard
                key={variant.id}
                category={'eyeglasses'}
                product={variant}
                colorways={product.colors}
                variantsByColor={variantsByColor} // ✅ NEW
              />
            ));
          })}
      </div>
      </div>
    </div>
  );
};

export default EyeglassesPage;
