import React, { useMemo, useState, useEffect }  from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch  } from "react-redux";
import { groupProductsByStyle, slugify } from "../utils/utils";
import { addToCart } from '../redux/cartSlice'
import '../styles/ProductPage.css';

const accordionArray = [
  { label: "Product Details", description: "Origin: Made in Italy" },
  { label: "Size and Fit", description: "Universal-fitting nosepads for enhanced fit." },
  { label: "Care Instruction", description: "Clean gently with microfiber cleaning cloth" },
  {
    label: "Shipping & Return",
    description:
      "Between Lights offers complimentary standard shipping to (and returns from) addresses within the United States. Items purchased are eligible for return provided that they are returned within 14 days of the item's original ship date in new, unused, unworn, unwashed, unaltered, and undamaged condition, with all original tags attached."
  },
];

const ProductPage = () => {

  const { slug, category } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products?.[category] || []);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [openIndex, setOpenIndex] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const sortedProducts = useMemo(
    () => groupProductsByStyle(products),
    [products]
  );

    const { productGroup, variant } = useMemo(() => {
    for (const p of sortedProducts) {
      for (const v of p.variants) {
        const vSlug = `${slugify(v.name)}-${slugify(v.color)}`;
        if (vSlug === slug) return { productGroup: p, variant: v };
      }
    }
    return { productGroup: null, variant: null };
  }, [sortedProducts, slug]);

  const [selectedVariant, setSelectedVariant] = useState(variant);
  useEffect(() => {
    setSelectedVariant(variant);
  }, [variant]);
  useEffect(() => {
  setAddedToCart(false); // ✅ UPDATE: reset when selected variant changes
}, [selectedVariant?.id]);

const handleAddToCart = () => { // ✅ UPDATE
  if (!selectedVariant?.id) return;

  dispatch(
    addToCart({
      productId: selectedVariant.id, // using variant id as productId
      quantity: 1,
    })
  );

  setAddedToCart(true);
};

  if (!variant) return <div className="productPage_root">Not found</div>;
  if (!selectedVariant) return <div className="productPage_root">Not found</div>;

  const toggleAccordion = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const colorSwatch = {
    tortoise: '#8a4c1f',
    brown: '#3e2c1f',
    black: 'black',
    crystal: '#d2e3e1',
    silver: '#8b8b8b',
    gold: '#edbb4d'
  }
  const variantsByColor = useMemo(() => {
    if (!productGroup?.variants?.length) return {};
    return Object.fromEntries(productGroup.variants.map((v) => [v.color, v]));
  }, [productGroup]);

  const colors = useMemo(() => {
    // prefer productGroup.colors if you have it, otherwise derive from variants
    if (productGroup?.colors?.length) return productGroup.colors;
    return Object.keys(variantsByColor);
  }, [productGroup, variantsByColor]);

  const handleColorSelect = (color) => {
    const nextVariant = variantsByColor[color];
    if (!nextVariant) return;
    setSelectedVariant(nextVariant);

    // (recommended) update URL so refresh/share shows same selected color
    const nextSlug = `${slugify(nextVariant.name)}-${slugify(nextVariant.color)}`;
    navigate(`/${category}/product/${nextSlug}`, { replace: true });
  };

return (
<div className="productPage_root">
    {/* Product Image (work later) */}
    <div className="productPage_image">
    <img className="productImage" src={`${API_BASE_URL}${variant.images[0].url}`}/>
    <img className="productImage" src={`${API_BASE_URL}${variant.images[1].url}`}/>
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
             <div className="productDetail_optionValue">{selectedVariant.color}</div>
        </div>

        <div className="productDetail_swatches">
              {colors.map((color) => {
                const isActive = color === selectedVariant.color;
                const bg = colorSwatch[color?.toLowerCase()] ?? "#000"; // fallback black

                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorSelect(color)}
                    className={
                      isActive
                        ? "productDetail_swatch productDetail_swatch--active"
                        : "productDetail_swatch"
                    }
                    aria-label={`${color} swatch`}
                    title={color}
                    style={{ background: bg }} // ✅ UPDATE: dynamic color
                  />
                );
              })}
            </div>
        </div>
    </div>

    {/* Description */}
    <div className="productDetail_description">
        <p>
            Crafted in Italy, these eyeglasses blend timeless design with refined
            craftsmanship. Featuring a clean, versatile silhouette, they offer a
            sophisticated look that complements both everyday wear and elevated
            occasions. Designed for comfort and durability, this frame delivers
            effortless style with a premium finish.
        </p>
        <p>{selectedVariant.description}</p>
    </div>

    {/* SKU */}
    <div className="productDetail_sku">SKU: 1234567</div>

    {/* Button */}
    <div className="productDetail_button">
        <button type="button" className="productDetail_addToCart" onClick={handleAddToCart}>
        {addedToCart ? "Added to Cart!" : "Add to Cart"}
        </button>
    </div>

    {/* Accordion (later) */}
    <div className="productDetail_accordion">
  {accordionArray.map((item, index) => {
    const isOpen = openIndex === index;

    return (
      <div
        key={item.label}
        className={
          index === 0
            ? "productDetail_accordion_block productDetail_accordion_block--first"
            : "productDetail_accordion_block"
        }
      >
        <label
          className="productDetail_accordion_label"
          onClick={() => toggleAccordion(index)}
        >
          <span className="productDetail_accordion_labelText">
            {item.label}
          </span>
          <span className="productDetail_accordion_icon">
            {isOpen ? "-" : "+"}
          </span>
        </label>

        <div
          className={
            isOpen
              ? "productDetail_accordion_descrb productDetail_accordion_descrb--open"
              : "productDetail_accordion_descrb"
          }
        >
          {item.description}
        </div>
      </div>
    );
  })}
</div>
    </div>
</div>
  );
};

export default ProductPage;