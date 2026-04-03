import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { clearCart } from "../redux/cartSlice";

const CheckoutSuccess = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearCart());
  }, [dispatch]);

  return (
    <div style={{ padding: "2rem", maxWidth: 520, margin: "0 auto" }}>
      <h1>Thank you</h1>
      <p>Your payment was successful.</p>
      <p>
        <Link to="/nyc-store">Continue shopping</Link>
      </p>
    </div>
  );
};

export default CheckoutSuccess;
