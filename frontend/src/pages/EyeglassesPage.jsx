import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import ProductCard from "../common/ProductCard";
import "../styles/CartPage.css";
import "../styles/ProductPage.css";
import "../styles/EyeglassesPage.css";
import { groupProductsByStyle } from "../utils/utils";
import {
  FILTER_COLORS,
  FILTER_SHAPES,
  groupMatchesAppliedFilters,
  norm,
} from "../utils/productFilterUtils";

const EyeglassesPage = () => {
  const eyeglasses = useSelector((state) => state.products.eyeglasses);
  const sortedEyeglasses = useMemo(
    () => groupProductsByStyle(eyeglasses),
    [eyeglasses]
  );

  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const actionsRef = useRef(null);

  const [filterOpen, setFilterOpen] = useState(false);
  const [colorAccordionOpen, setColorAccordionOpen] = useState(false);
  const [shapeAccordionOpen, setShapeAccordionOpen] = useState(false);
  const [selectedColors, setSelectedColors] = useState(() => new Set());
  const [selectedShapes, setSelectedShapes] = useState(() => new Set());
  const [appliedColors, setAppliedColors] = useState(() => new Set());
  const [appliedShapes, setAppliedShapes] = useState(() => new Set());

  const filteredEyeglasses = useMemo(
    () =>
      sortedEyeglasses.filter((group) =>
        groupMatchesAppliedFilters(group, appliedColors, appliedShapes)
      ),
    [sortedEyeglasses, appliedColors, appliedShapes]
  );

  /** null = default data order; 'asc' = low→high; 'desc' = high→low */
  const [priceSort, setPriceSort] = useState(null);

  const displayCards = useMemo(() => {
    const rows = [];
    for (const product of filteredEyeglasses) {
      const variantsByColor = Object.fromEntries(
        product.variants.map((v) => [v.color, v])
      );
      const variantsToShow =
        appliedColors.size > 0
          ? product.variants.filter((v) =>
              [...appliedColors].some((c) => norm(c) === norm(v.color))
            )
          : product.variants;
      for (const variant of variantsToShow) {
        rows.push({ product, variant, variantsByColor });
      }
    }
    if (priceSort === "asc") {
      rows.sort(
        (a, b) =>
          Number(a.variant.price) - Number(b.variant.price)
      );
    } else if (priceSort === "desc") {
      rows.sort(
        (a, b) =>
          Number(b.variant.price) - Number(a.variant.price)
      );
    }
    return rows;
  }, [filteredEyeglasses, appliedColors, priceSort]);

  const toggleColor = (color) => {
    setSelectedColors((prev) => {
      const next = new Set(prev);
      if (next.has(color)) next.delete(color);
      else next.add(color);
      return next;
    });
  };

  const toggleShape = (shape) => {
    setSelectedShapes((prev) => {
      const next = new Set(prev);
      if (next.has(shape)) next.delete(shape);
      else next.add(shape);
      return next;
    });
  };

  const handleClearAllFilters = () => {
    setSelectedColors(new Set());
    setSelectedShapes(new Set());
  };

  const handleSelectFilter = () => {
    setAppliedColors(new Set(selectedColors));
    setAppliedShapes(new Set(selectedShapes));
    setFilterOpen(false);
  };

  const filtersAreApplied =
    appliedColors.size > 0 || appliedShapes.size > 0;
  const noFilterMatches =
    filtersAreApplied && displayCards.length === 0;

  const handleClearFilterOptions = () => {
    setAppliedColors(new Set());
    setAppliedShapes(new Set());
    setSelectedColors(new Set());
    setSelectedShapes(new Set());
    setPriceSort(null);
  };

  useEffect(() => {
    if (!sortMenuOpen) return;
    const handlePointerDown = (e) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target)) {
        setSortMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [sortMenuOpen]);

  return (
    <div className="eyeglassesPage">
      <div
        className={`cart_overlay ${filterOpen ? "cart_overlay--open" : ""}`}
      >
        <aside
          className={`cart_container eyeglassesFilter_panel ${
            filterOpen ? "cart_container--open" : ""
          }`}
        >
          <div className="cart_header">
            <div className="cart_headerTitle">Filter</div>
            <button
              type="button"
              className="cart_closeButton"
              aria-label="Close filter"
              onClick={() => setFilterOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="cart_content eyeglassesFilter_content">
            <div className="productDetail_accordion eyeglassesFilter_accordion">
              <div className="productDetail_accordion_block productDetail_accordion_block--first">
                <button
                  type="button"
                  className="productDetail_accordion_label"
                  onClick={() =>
                    setColorAccordionOpen((open) => !open)
                  }
                >
                  <span className="productDetail_accordion_labelText">
                    Color
                  </span>
                  <span className="productDetail_accordion_icon">
                    {colorAccordionOpen ? "-" : "+"}
                  </span>
                </button>
                <div
                  className={
                    colorAccordionOpen
                      ? "productDetail_accordion_descrb productDetail_accordion_descrb--open"
                      : "productDetail_accordion_descrb"
                  }
                >
                  {FILTER_COLORS.map((color) => (
                    <label key={color} className="filterColorItem">
                      <input
                        type="checkbox"
                        name="filter-color"
                        checked={selectedColors.has(color)}
                        onChange={() => toggleColor(color)}
                      />
                      <span>{color}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="productDetail_accordion_block">
                <button
                  type="button"
                  className="productDetail_accordion_label"
                  onClick={() =>
                    setShapeAccordionOpen((open) => !open)
                  }
                >
                  <span className="productDetail_accordion_labelText">
                    Shape
                  </span>
                  <span className="productDetail_accordion_icon">
                    {shapeAccordionOpen ? "-" : "+"}
                  </span>
                </button>
                <div
                  className={
                    shapeAccordionOpen
                      ? "productDetail_accordion_descrb productDetail_accordion_descrb--open"
                      : "productDetail_accordion_descrb"
                  }
                >
                  {FILTER_SHAPES.map((shape) => (
                    <label key={shape} className="filterShapeItem">
                      <input
                        type="checkbox"
                        name="filter-shape"
                        checked={selectedShapes.has(shape)}
                        onChange={() => toggleShape(shape)}
                      />
                      <span>{shape}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="filterPanel_actions">
            <button
              type="button"
              className="filterPanel_btnClear"
              onClick={handleClearAllFilters}
            >
              Clear All
            </button>
            <button
              type="button"
              className="filterPanel_btnApply"
              onClick={handleSelectFilter}
            >
              Select Filter
            </button>
          </div>
        </aside>

        <button
          type="button"
          className="cart_backdrop"
          aria-label="Close filter backdrop"
          onClick={() => setFilterOpen(false)}
        />
      </div>

      <div className="eyeglassesSubNav">
        <div className="eyeglassesTitle">Eyeglasses</div>

        <div className="eyeglassesActions" ref={actionsRef}>
          <button
            type="button"
            className="filterLabel"
            onClick={() => setFilterOpen(true)}
          >
            Filter
          </button>
          <button
            type="button"
            className="sortLabel"
            aria-expanded={sortMenuOpen}
            aria-haspopup="listbox"
            onClick={() => setSortMenuOpen((open) => !open)}
          >
            Sort By
          </button>
          {sortMenuOpen && (
            <div className="eyeglassesSortMenu" role="listbox">
              <button
                type="button"
                className="eyeglassesSortOption"
                role="option"
                onClick={() => {
                  setPriceSort("asc");
                  setSortMenuOpen(false);
                }}
              >
                Price, low to high
              </button>
              <button
                type="button"
                className="eyeglassesSortOption"
                role="option"
                onClick={() => {
                  setPriceSort("desc");
                  setSortMenuOpen(false);
                }}
              >
                Price, high to low
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="productPlaceholder">
        {noFilterMatches ? (
          <div className="eyeglassesNoResults">
            <p className="eyeglassesNoResults_text">
              Sorry, we could not find any product that matches the description
            </p>
            <button
              type="button"
              className="eyeglassesNoResults_clearBtn"
              onClick={handleClearFilterOptions}
            >
              Clear filter options
            </button>
          </div>
        ) : (
          <div className="productGrid">
            {displayCards.map(({ product, variant, variantsByColor }) => (
              <ProductCard
                key={variant.id}
                category={"eyeglasses"}
                product={variant}
                colorways={product.colors}
                variantsByColor={variantsByColor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EyeglassesPage;
