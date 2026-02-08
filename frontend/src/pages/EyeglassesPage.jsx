import React from 'react';
import { useSelector } from 'react-redux';
import ProductCard from '../common/ProductCard';
import '../styles/EyeglassesPage.css';

const EyeglassesPage = () => {
    const eyeglasses = useSelector((state) => state.products.eyeglasses);

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
        {eyeglasses.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
      </div>
    </div>
  );
};

export default EyeglassesPage;
