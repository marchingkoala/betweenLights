import React, { useMemo, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import { groupProductsByStyle } from "../utils/utils";
import { fetchEyeglasses, fetchSunglasses } from "../redux/productsSlice";
import "../styles/Checkout.css";

const Checkout = () => {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);
  const eyeglasses = useSelector((state) => state.products?.eyeglasses || []);
  const sunglasses = useSelector((state) => state.products?.sunglasses || []);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [discountInput, setDiscountInput] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountFieldError, setDiscountFieldError] = useState(null);

  useEffect(() => {
    if (eyeglasses.length === 0) dispatch(fetchEyeglasses());
    if (sunglasses.length === 0) dispatch(fetchSunglasses());
  }, [dispatch, eyeglasses.length, sunglasses.length]);

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

  const cartDisplayRows = useMemo(() => {
    const rows = [];
    for (const item of items) {
      const found = variantLookup.get(item.productId);
      if (!found) continue;
      const { variant } = found;
      const lineTotal = Number(variant.price) * item.quantity;
      const imgUrl = variant.images?.[0]?.url;
      rows.push({
        productId: item.productId,
        name: `${variant.name} — ${variant.color}`,
        quantity: item.quantity,
        lineTotal,
        imageUrl: imgUrl ? `${API_BASE_URL}${imgUrl}` : null,
      });
    }
    return rows;
  }, [items, variantLookup, API_BASE_URL]);

  const lineItems = useMemo(() => {
    const out = [];
    for (const item of items) {
      const found = variantLookup.get(item.productId);
      if (!found) continue;
      const { variant } = found;
      const unitAmount = Math.round(Number(variant.price) * 100);
      out.push({
        name: `${variant.name} — ${variant.color}`,
        unitAmount,
        quantity: item.quantity,
      });
    }
    return out;
  }, [items, variantLookup]);

  const subtotal = useMemo(() => {
    return lineItems.reduce(
      (sum, li) => sum + (li.unitAmount * li.quantity) / 100,
      0
    );
  }, [lineItems]);

  const discountAmount = discountApplied ? subtotal * 0.2 : 0;
  const finalTotal = subtotal - discountAmount;

  const handleApplyDiscount = () => {
    const code = discountInput.trim();
    if (code === "DISCOUNT20") {
      setDiscountApplied(true);
      setDiscountFieldError(null);
    } else {
      setDiscountApplied(false);
      setDiscountFieldError(
        "Please enter valid discount code or gift card number."
      );
    }
  };

  const handleDiscountInputChange = (e) => {
    setDiscountInput(e.target.value);
    setDiscountFieldError(null);
    if (discountApplied) setDiscountApplied(false);
  };

  const handlePay = async () => {
    setError(null);
    if (lineItems.length === 0) {
      setError(
        "Your cart is empty or product data is still loading. Try again in a moment."
      );
      return;
    }
    const itemsForStripe = discountApplied
      ? lineItems.map((li) => ({
          ...li,
          unitAmount: Math.round(li.unitAmount * 0.8),
        }))
      : lineItems;

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/stripe/create-checkout-session`,
        { items: itemsForStripe }
      );
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setError("No checkout URL returned.");
    } catch (e) {
      setError(
        e.response?.data?.error || e.message || "Checkout failed."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!items?.length) {
    return (
      <div className="checkout_empty">
        <h1 className="checkout_title">Checkout</h1>
        <p>Your cart is empty.</p>
        <Link to="/nyc-store">Continue shopping</Link>
      </div>
    );
  }

  const productsLoaded = eyeglasses.length > 0 || sunglasses.length > 0;
  const cantResolve =
    productsLoaded && lineItems.length === 0 && items.length > 0;

  const subtotalFormatted = subtotal.toFixed(2);
  const discountFormatted = discountAmount.toFixed(2);
  const totalUsdFormatted = `USD $${finalTotal.toFixed(2)}`;

  return (
    <div className="checkout_root">
      <h1 className="checkout_title">Checkout</h1>

      {cantResolve && (
        <p className="checkout_alert" role="alert">
          Some items in your cart could not be found. Try refreshing the page or
          returning to the store.
        </p>
      )}

      {!productsLoaded && (
        <p className="checkout_loading">Loading product information…</p>
      )}

      <div className="checkoutItemContainer">
        <div className="checkoutItemList" role="list">
          {cartDisplayRows.map((row) => (
            <div
              key={row.productId}
              className="checkoutItemList_item"
              role="listitem"
            >
              <div className="checkoutItemList_imageWrap">
                {row.imageUrl ? (
                  <img
                    className="checkoutItemList_image"
                    src={row.imageUrl}
                    alt=""
                  />
                ) : null}
              </div>
              <div className="checkoutItemList_meta">
                <div className="checkoutItemList_name">{row.name}</div>
                <div className="checkoutItemList_price">
                  ${row.lineTotal.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="checkoutDiscountGift_block">
          <div className="checkoutDiscountGift">
            <input
              type="text"
              className="checkoutDiscountGift_input"
              placeholder="Discount code or gift card -- write 'DISCOUNT20' to test"
              aria-label="Discount code or gift card"
              value={discountInput}
              onChange={handleDiscountInputChange}
            />
            <button
              type="button"
              className="checkoutDiscountGift_apply"
              onClick={handleApplyDiscount}
            >
              {discountApplied ? "Applied" : "Apply"}
            </button>
          </div>
          {discountFieldError && (
            <p className="checkoutDiscountGift_error" role="alert">
              {discountFieldError}
            </p>
          )}
        </div>

        <div className="checkoutTotal">
          <div className="checkoutTotal_line">
            <span>Subtotal</span>
            <span>${subtotalFormatted}</span>
          </div>
          {discountApplied && (
            <div className="checkoutTotal_line">
              <span>Discount</span>
              <span>- ${discountFormatted}</span>
            </div>
          )}
          <div className="checkoutTotal_line">
            <span>Shipping</span>
            <span>Calculated at next step</span>
          </div>
          <div className="checkoutTotal_line checkoutTotal_line--total">
            <span>Total</span>
            <span className="checkoutTotal_amount">{totalUsdFormatted}</span>
          </div>
        </div>
      </div>

      {error && (
        <p className="checkout_alert" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        className="checkout_pay_btn"
        onClick={handlePay}
        disabled={loading || lineItems.length === 0}
      >
        {loading ? "Redirecting…" : "Pay with Stripe"}
      </button>

      <p>
        <Link className="checkout_back_link" to="/cart">
          Back to cart
        </Link>
      </p>
    </div>
  );
};

export default Checkout;
