import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../common/ProductCard';
import { fetchEyeglasses, fetchSunglasses } from '../redux/productsSlice';
import { groupProductsByStyle } from '../utils/utils';
import '../styles/SearchPage.css';

const pickRandom = (arr, count) => {
  const pool = [...arr];
  const picks = [];
  while (pool.length && picks.length < count) {
    const idx = Math.floor(Math.random() * pool.length);
    picks.push(pool.splice(idx, 1)[0]);
  }
  return picks;
};

const SearchPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { eyeglasses, sunglasses } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchEyeglasses());
    dispatch(fetchSunglasses());
  }, [dispatch]);

  const eyeglassGroups = useMemo(() => groupProductsByStyle(eyeglasses), [eyeglasses]);
  const sunglassGroups = useMemo(() => groupProductsByStyle(sunglasses), [sunglasses]);

  // Only re-roll the picks when the underlying product lists change,
  // not on every render (e.g. while typing in the search field).
  const suggestedItems = useMemo(() => {
    const eyeItems = pickRandom(eyeglassGroups, 2).map((group) => ({
      group,
      category: 'eyeglasses',
    }));
    const sunItems = pickRandom(sunglassGroups, 2).map((group) => ({
      group,
      category: 'sunglasses',
    }));
    return [...eyeItems, ...sunItems];
  }, [eyeglassGroups, sunglassGroups]);

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/search/results?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="searchRoot">
      <div className="searchContainer">
        <h1 className="searchTitle">What are you looking for?</h1>
        <form className="searchForm" onSubmit={handleSubmit}>
          <input
            className="searchInput"
            type="text"
            placeholder="Search"
            value={query}
            onChange={handleChange}
          />
          <button className="searchBtn" type="submit">
            Search
          </button>
        </form>
      </div>

      {suggestedItems.length > 0 && (
        <section className="searchSuggestions">
          <h2 className="searchSuggestions_title">You might be interested in</h2>
          <div className="productGrid">
            {suggestedItems.map(({ group, category }) => {
              const variantsByColor = Object.fromEntries(
                group.variants.map((v) => [v.color, v])
              );
              return (
                <ProductCard
                  key={`${category}-${group.key}`}
                  category={category}
                  product={group.variants[0]}
                  colorways={group.colors}
                  variantsByColor={variantsByColor}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default SearchPage;
