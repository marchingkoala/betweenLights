import React, {useMemo} from 'react';
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom"; 
import { addToCart, removeFromCart } from "../redux/cartSlice";
import { groupProductsByStyle, slugify } from "../utils/utils"; 
import "../styles/CartPage.css";

const CartPage = ({ isOpen, onClose }) => {
  const navigate = useNavigate();  
  const dispatch = useDispatch(); 
  const items = useSelector((state) => state.cart.items);
  const eyeglasses = useSelector((state) => state.products?.eyeglasses || []);
  const sunglasses = useSelector((state) => state.products?.sunglasses || []);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const isEmpty = !items || items.length === 0; 

  const handleVisitStore = () => {                     // ✅ UPDATE
    onClose?.();
    navigate("/nyc-store");
  };

  const variantLookup = useMemo(() => {
    const map = new Map();

    const addCategory = (category, list) => {
      const grouped = groupProductsByStyle(list);
      for (const p of grouped) {
        for (const v of p.variants) {
          map.set(v.id, { variant: v, category });
        }
      }
    };

    addCategory("eyeglasses", eyeglasses);
    addCategory("sunglasses", sunglasses);

    return map;
  }, [eyeglasses, sunglasses]);

  const total = items.reduce((sum, item) => {
  const found = variantLookup.get(item.productId);
  if (!found) return sum;
  return sum + found.variant.price * item.quantity;
}, 0);

  const handleGoToProduct = (category, variant) => {
    const slug = `${slugify(variant.name)}-${slugify(variant.color)}`;
    onClose?.();
    navigate(`/${category}/product/${slug}`);
  };

  const handleDecrease = (productId, currentQty) => {
    if (currentQty <= 1) return; // spec: does nothing at 1
    dispatch(addToCart({ productId, quantity: -1 }));
  };

  const handleIncrease = (productId) => {
    dispatch(addToCart({ productId, quantity: 1 }));
  };

  const handleRemove = (productId) => {
    dispatch(removeFromCart(productId));
  };

      return (
    <div className={`cart_overlay ${isOpen ? "cart_overlay--open" : ""}`}>
      <aside className={`cart_container ${isOpen ? "cart_container--open" : ""}`}>
        <div className="cart_header">
          <div className="cart_headerTitle">Cart</div>

          <button
            type="button"
            className="cart_closeButton"
            aria-label="Close cart"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="cart_content">
           {isEmpty && (
            <div className="empty_cart">
              <p>Your cart is empty.</p>
              <div className="empty_cart_link" onClick={handleVisitStore}>
                Visit our Store
              </div>
            </div>
          )}

          {/* Later: render cart items when not empty */}
          {!isEmpty && (
            <>
              {items.map((item) => {
                const found = variantLookup.get(item.productId);
                if (!found) return null;

                const { variant, category } = found;
                const imgUrl = variant.images?.[0]?.url;

                return (
                  <div key={item.productId} className="cart_item">
                    {/* image link */}
                    <a
                      className="cart_item_imageLink"
                      onClick={(e) => {
                        e.preventDefault();
                        handleGoToProduct(category, variant);
                      }}
                      href={`/${category}/product/${slugify(variant.name)}-${slugify(variant.color)}`}
                    >
                      <div className="cart_item_imageContainer">
                        {imgUrl ? (
                          <img
                            className="cart_item_image"
                            src={`${API_BASE_URL}${imgUrl}`}
                            alt={`${variant.name} ${variant.color}`}
                          />
                        ) : null}
                      </div>
                    </a>

                    {/* description */}
                    <div className="cart_item_description">
                      <a
                        className="cart_item_name"
                        onClick={(e) => {
                          e.preventDefault();
                          handleGoToProduct(category, variant);
                        }}
                        href={`/${category}/product/${slugify(variant.name)}-${slugify(variant.color)}`}
                      >
                        {variant.name}
                      </a>

                      <div className="cart_item_price">${variant.price}</div>
                      <div className="cart_item_color">{variant.color}</div>

                      <div className="cart_item_action">
                        {/* qty controls */}
                        <div className="cart_item_qty">
                          <button
                            type="button"
                            className="cart_item_qtyBtn"
                            onClick={() => handleDecrease(item.productId, item.quantity)}
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>

                          <span className="cart_item_qtyValue">{item.quantity}</span>

                          <button
                            type="button"
                            className="cart_item_qtyBtn"
                            onClick={() => handleIncrease(item.productId)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* remove */}
                        <button
                          type="button"
                          className="cart_item_remove"
                          onClick={() => handleRemove(item.productId)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="cart_footer_container">
              <div className="cart_footer">

                <div className="cart_footer_content">
                  <div>
                    <span>Tax calculated at checkout.</span>
                  </div>

                  <div>
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="cart_footer_action">
                  <button type="button" className="cart_checkout_btn">
                    Checkout
                  </button>
                </div>

              </div>
            </div>
            </>
          )}
        </div>
      </aside>

      {/* click outside to close */}
      <button
        type="button"
        className="cart_backdrop"
        aria-label="Close cart backdrop"
        onClick={onClose}
      />
    </div>
  );
};

export default CartPage;
