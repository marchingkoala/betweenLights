import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import ProductCard from "../common/ProductCard";
import "../styles/SunglassesPage.css";
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

const SunglassesPage = () => {
  const sunglasses = useSelector((state) => state.products.sunglasses);
  const sortedSunglasses = useMemo(
    () => groupProductsByStyle(sunglasses),
    [sunglasses]
  );

  const [filterOpen, setFilterOpen] = useState(false);
  const [colorAccordionOpen, setColorAccordionOpen] = useState(false);
  const [shapeAccordionOpen, setShapeAccordionOpen] = useState(false);
  const [selectedColors, setSelectedColors] = useState(() => new Set());
  const [selectedShapes, setSelectedShapes] = useState(() => new Set());
  const [appliedColors, setAppliedColors] = useState(() => new Set());
  const [appliedShapes, setAppliedShapes] = useState(() => new Set());

  const filteredSunglasses = useMemo(
    () =>
      sortedSunglasses.filter((group) =>
        groupMatchesAppliedFilters(group, appliedColors, appliedShapes)
      ),
    [sortedSunglasses, appliedColors, appliedShapes]
  );

  const displayCards = useMemo(() => {
    const rows = [];
    for (const product of filteredSunglasses) {
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
    return rows;
  }, [filteredSunglasses, appliedColors]);

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
  };

  return (
    <div className="sunglassesPage">
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
                        name="sunglasses-filter-color"
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
                        name="sunglasses-filter-shape"
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

      <div className="sunglassesSubNav">
        <div className="sunglassesTitle">Sunglasses</div>

        <div className="sunglassesActions">
          <button
            type="button"
            className="filterLabel"
            onClick={() => setFilterOpen(true)}
          >
            Filter
          </button>
          <span className="sortLabel">Sort By</span>
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
                category={"sunglasses"}
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

export default SunglassesPage;
