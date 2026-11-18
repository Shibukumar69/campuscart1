import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingBag, Check, AlertTriangle, ArrowUpDown, GraduationCap, BookOpen } from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { AKTU_CATEGORIES, AKTU_LAB_FILES } from '../../data/aktuLabFiles';

export const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(AKTU_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  const { addItem } = useCart();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/products/categories');
        if (res.data.success && res.data.data?.length > 0) {
          setCategories(res.data.data);
        } else {
          setCategories(AKTU_CATEGORIES);
        }
      } catch (err) {
        setCategories(AKTU_CATEGORIES);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          search: search || undefined,
          category: selectedCategory || undefined,
          semester: selectedSemester || undefined,
          inStockOnly: inStockOnly ? 'true' : undefined,
          sort,
          order,
          limit: 100,
        };
        const res = await api.get('/products', { params });
        if (res.data.success && res.data.data.products && res.data.data.products.length > 0) {
          setProducts(res.data.data.products);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('API error or server offline, using local AKTU catalog:', err.message);
      }

      // Seamless fallback to comprehensive AKTU CSE Lab Files catalog
      let filtered = [...AKTU_LAB_FILES];

      if (selectedSemester) {
        filtered = filtered.filter((p) => String(p.semester) === String(selectedSemester));
      }

      if (selectedCategory) {
        filtered = filtered.filter(
          (p) => p.categoryId?.slug === selectedCategory || p.categoryId === selectedCategory
        );
      }

      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.tags?.some((t) => t.toLowerCase().includes(query)) ||
            p.SKU.toLowerCase().includes(query)
        );
      }

      if (inStockOnly) {
        filtered = filtered.filter((p) => p.currentStock > 0);
      }

      if (sort === 'price') {
        filtered.sort((a, b) => (order === 'asc' ? a.price - b.price : b.price - a.price));
      } else if (sort === 'title') {
        filtered.sort((a, b) => (order === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)));
      }

      setProducts(filtered);
      setLoading(false);
    };

    const timer = setTimeout(() => {
      fetchProducts();
    }, 200);

    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedSemester, inStockOnly, sort, order]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>AKTU B.Tech CSE Official Lab Store</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
              <span>Browse Stationery & AKTU Lab Files</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Select your semester to order certified Semester 1 to 8 Engineering Lab Files, manuals, assignment sheets, and exam tools.
            </p>
          </div>
        </div>

        {/* Semester-Wise Filter Tabs (1 to 8 Semester) */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>AKTU B.Tech CSE Semester Filter:</span>
            </div>
            {selectedSemester && (
              <button
                onClick={() => setSelectedSemester('')}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline self-start sm:self-auto"
              >
                Clear Semester Filter
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedSemester('')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center space-x-1.5 ${
                !selectedSemester
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>All Products ({products.length})</span>
            </button>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(String(sem))}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center space-x-1 ${
                  selectedSemester === String(sem)
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <span>Semester {sem}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by subject e.g. Physics, C, DBMS, AI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id || cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Select */}
          <div>
            <select
              value={`${sort}_${order}`}
              onChange={(e) => {
                const [newSort, newOrder] = e.target.value.split('_');
                setSort(newSort);
                setOrder(newOrder);
              }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="createdAt_desc">Recommended / Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="title_asc">Name: A to Z</option>
            </select>
          </div>

          {/* In Stock Toggle */}
          <div className="flex items-center space-x-2 px-1">
            <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span>In-Stock Only</span>
            </label>
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <LoadingSpinner text="Loading AKTU B.Tech CSE Lab Files..." />
        ) : products.length === 0 ? (
          <EmptyState
            title="No lab files match your search"
            description="Try selecting a different semester or clearing your search term."
            actionLabel="Reset All Filters"
            onAction={() => {
              setSearch('');
              setSelectedCategory('');
              setSelectedSemester('');
              setInStockOnly(false);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const isOutOfStock = product.currentStock <= 0;
              const isLowStock = product.currentStock > 0 && product.currentStock <= product.minStockThreshold;

              return (
                <div
                  key={product._id}
                  className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden"
                >
                  {/* Product Image */}
                  <div className="relative aspect-4/3 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ShoppingBag className="w-10 h-10 stroke-1" />
                      </div>
                    )}

                    {/* Badge Pill Overlay */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                      {product.semester && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-md">
                          Semester {product.semester}
                        </span>
                      )}
                      {isOutOfStock ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow">
                          Only {product.currentStock} Left
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-300 backdrop-blur-xs shadow-xs">
                          {product.currentStock} in stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400 truncate max-w-[140px]">
                          {product.categoryId?.name || 'Lab File'}
                        </span>
                        <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-bold">
                          {product.SKU}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug">
                        {product.title}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Price</span>
                        <p className="text-lg font-black text-slate-900 dark:text-white">
                          ₹{product.price}
                        </p>
                      </div>

                      <button
                        onClick={() => addItem(product, 1)}
                        disabled={isOutOfStock}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
                          isOutOfStock
                            ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shadow-indigo-500/20 active:scale-95'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
