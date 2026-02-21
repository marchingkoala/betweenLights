import React from 'react';
import { useSelector } from 'react-redux';
import ProductCard from '../common/ProductCard';
import '../styles/SunglassesPage.css';
import { groupProductsByStyle } from '../utils/utils'

const SunglassesPage = () => {
    const sunglasses = useSelector((state) => state.products.sunglasses);
    const sortedSunglasses = groupProductsByStyle(sunglasses);
 
    return(
        <div className='sunglassesPage'>
            {/* Inner nav bar */}
            <div className="sunglassesSubNav">
                <div className="sunglassesTitle">Sunglasses</div>

                <div className="sunglassesActions">
                <span className="filterLabel">Filter</span>
                <span className="sortLabel">Sort By</span>
                </div>
            </div>
            {/* Products Section */}
        <div className='productPlaceholder'>
            <div className="productGrid">
            {sortedSunglasses.flatMap((product) => {
                const variantsByColor = Object.fromEntries(
                product.variants.map((v) => [v.color, v])
                );
                return product.variants.map((variant) => (
                <ProductCard
                    key={variant.id}
                    category={'sunglasses'}
                    product={variant}
                    colorways={product.colors}
                    variantsByColor={variantsByColor} // ✅ NEW
                />
                ));
            })}
          </div>
        </div>
        </div>
    )
};

export default SunglassesPage;
