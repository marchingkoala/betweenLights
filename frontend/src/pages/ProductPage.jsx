import React, { useMemo }  from 'react';
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { groupProductsByStyle, slugify } from "../utils/utils";
import '../styles/ProductPage.css';

const ProductPage = () => {

  const { slug } = useParams();
  const eyeglasses = useSelector((state) => state.products.eyeglasses);

  const sortedEyeglasses = useMemo(
    () => groupProductsByStyle(eyeglasses),
    [eyeglasses]
  );

  const { productGroup, variant } = useMemo(() => {
    for (const p of sortedEyeglasses) {
      for (const v of p.variants) {
        const vSlug = `${slugify(v.name)}-${slugify(v.color)}`;
        if (vSlug === slug) return { productGroup: p, variant: v };
      }
    }
    return { productGroup: null, variant: null };
  }, [sortedEyeglasses, slug]);

  if (!variant) return <div className="productPage_root">Not found</div>;

return (
<div className="productPage_root">
    {/* Product Image (work later) */}
    <div className="productPage_image">
    <div className="productPage_imagePlaceholder" />
    </div>

    {/* Product Detail */}
    <div className="productPage_detail">
    {/* Name + Price */}
    <div className="productDetail_name">
         <h1>{variant.name}</h1>
        <div className="productDetail_price">${variant.price}</div>
    </div>

    {/* Options */}
    <div className="productDetail_options">
        <div className="productDetail_option">
        <div className="productDetail_optionHeader">
            <div className="productDetail_optionLabel">Color</div>
            <div className="productDetail_optionValue">{variant.color}</div>
        </div>

        <div className="productDetail_swatches">
            <button
            type="button"
            className="productDetail_swatch productDetail_swatch--active"
            aria-label="Black swatch"
            />
            <button
            type="button"
            className="productDetail_swatch"
            aria-label="Black swatch"
            />
            <button
            type="button"
            className="productDetail_swatch"
            aria-label="Black swatch"
            />
            <button
            type="button"
            className="productDetail_swatch"
            aria-label="Black swatch"
            />
        </div>
        </div>
    </div>

    {/* Description */}
    <div className="productDetail_description">
        Handcrafted in Italy, these metal-framed sunglasses are classically
        compact and cool in a rounded silhouette ideal for more petite faces or
        those seeking smaller-scale sunglasses. The shape and detailing of the
        layered metal temples are inspired by signature Empire hardware.
        {variant.description}
    </div>

    {/* SKU */}
    <div className="productDetail_sku">SKU: 1234567</div>

    {/* Button */}
    <div className="productDetail_button">
        <button type="button" className="productDetail_addToCart">
        Add to Cart
        </button>
    </div>

    {/* Accordion (later) */}
    <div className="productDetail_accordion">{/* later */}</div>
    </div>
</div>
  );
};

export default ProductPage;