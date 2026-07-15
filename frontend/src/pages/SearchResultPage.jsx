import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../common/ProductCard';
import { fetchEyeglasses, fetchSunglasses } from '../redux/productsSlice';
import { groupProductsByStyle } from '../utils/utils';
import { norm } from '../utils/productFilterUtils';
import '../styles/SearchPage.css';
import '../styles/SearchResultPage.css';

// A group is searchable by its style/product name, its shape (e.g. "Aviator",
// "Cat Eye"), and any of its available colors. Multi-word fields are indexed
// both spaced ("cat eye") and squished ("cateye") so either query form matches.
const buildSearchableText = (group) => {
  const fields = [group.variants[0]?.name, group.shape, ...(group.colors || [])].filter(
    Boolean
  );
  const tokens = fields.flatMap((field) => {
    const spaced = norm(field);
    const squished = spaced.replace(/\s+/g, '');
    return squished !== spaced ? [spaced, squished] : [spaced];
  });
  return tokens.join(' ');
};

// Query terms are ANDed together so multi-word searches (e.g. "black aviator")
// narrow down results instead of only matching an exact phrase.
const matchesAllTerms = (haystack, terms) =>
  terms.every((term) => haystack.includes(term));

// If the query matched a specific color (e.g. searching "gold"), show that
// color's variant as the thumbnail instead of whichever variant happened to
// load first for the style.
const pickPreferredVariant = (group, terms) => {
  const colorMatch = group.variants.find((v) => {
    const color = norm(v.color);
    return terms.some((term) => color.includes(term) || term.includes(color));
  });
  return colorMatch || group.variants[0];
};

const SearchResultPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [query, setQuery] = useState(queryParam);
  const { eyeglasses, sunglasses } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchEyeglasses());
    dispatch(fetchSunglasses());
  }, [dispatch]);

  useEffect(() => {
    setQuery(queryParam);
  }, [queryParam]);

  const results = useMemo(() => {
    const terms = norm(queryParam).split(/\s+/).filter(Boolean);
    if (terms.length === 0) return [];

    const eyeGroups = groupProductsByStyle(eyeglasses).map((group) => ({
      group,
      category: 'eyeglasses',
    }));
    const sunGroups = groupProductsByStyle(sunglasses).map((group) => ({
      group,
      category: 'sunglasses',
    }));

    return [...eyeGroups, ...sunGroups]
      .filter(({ group }) => matchesAllTerms(buildSearchableText(group), terms))
      .map(({ group, category }) => ({
        group,
        category,
        variant: pickPreferredVariant(group, terms),
      }));
  }, [eyeglasses, sunglasses, queryParam]);

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchParams({ q: trimmed });
  };

  return (
    <div className="searchResultPage">
      <div className="searchResultSubNav">
        <div className="searchResultTitle">
          {queryParam ? `Results for "${queryParam}"` : 'Search Results'}
        </div>
        <form className="searchResultForm" onSubmit={handleSubmit}>
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

      <div className="searchResultGrid">
        {results.length === 0 ? (
          <div className="searchResultNoMatch">
            <p className="searchResultNoMatch_text">There's no matching product.</p>
          </div>
        ) : (
          <div className="productGrid">
            {results.map(({ group, category, variant }) => {
              const variantsByColor = Object.fromEntries(
                group.variants.map((v) => [v.color, v])
              );
              return (
                <ProductCard
                  key={`${category}-${group.key}`}
                  category={category}
                  product={variant}
                  colorways={group.colors}
                  variantsByColor={variantsByColor}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultPage;
