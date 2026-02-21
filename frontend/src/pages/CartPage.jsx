import React from 'react';
import "../styles/CartPage.css";

const CartPage = ({ isOpen, onClose }) => {
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
          {/* empty for now */}
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
