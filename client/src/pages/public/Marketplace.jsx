import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ShoppingBag,
  Check,
  AlertTriangle,
  ArrowUpDown,
  GraduationCap,
  BookOpen,
  Atom,
  FlaskConical,
  Zap,
  Cpu,
  Code2,
  Languages,
  Compass,
  Wrench,
  Binary,
  Globe,
  FileCode,
  FolderGit2,
  Terminal,
  Coffee,
  Shield,
  Database,
  Network,
  Layers,
  BrainCircuit,
  Award,
  Sparkles,
  FileText,
  Folder,
  Edit3,
  CheckCircle2,
  Truck,
  RotateCw,
  Clock,
  ShieldCheck,
  Grid
} from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { AKTU_CATEGORIES, AKTU_LAB_FILES } from '../../data/aktuLabFiles';

const renderSubjectIcon = (iconType, className = "w-5 h-5") => {
  switch (iconType) {
    case 'Atom': return <Atom className={className} />;
    case 'FlaskConical': return <FlaskConical className={className} />;
    case 'Zap': return <Zap className={className} />;
    case 'Cpu': return <Cpu className={className} />;
    case 'Code2': return <Code2 className={className} />;
    case 'Languages': return <Languages className={className} />;
    case 'Compass': return <Compass className={className} />;
    case 'Wrench': return <Wrench className={className} />;
    case 'Binary': return <Binary className={className} />;
    case 'Globe': return <Globe className={className} />;
    case 'FileCode': return <FileCode className={className} />;
    case 'FolderGit2': return <FolderGit2 className={className} />;
    case 'Terminal': return <Terminal className={className} />;
    case 'Coffee': return <Coffee className={className} />;
    case 'Shield': return <Shield className={className} />;
    case 'Database': return <Database className={className} />;
    case 'Network': return <Network className={className} />;
    case 'Layers': return <Layers className={className} />;
    case 'BrainCircuit': return <BrainCircuit className={className} />;
    case 'Award': return <Award className={className} />;
    case 'GraduationCap': return <GraduationCap className={className} />;
    case 'FileText': return <FileText className={className} />;
    case 'Folder': return <Folder className={className} />;
    case 'Edit3': return <Edit3 className={className} />;
    case 'Grid': return <Grid className={className} />;
    default: return <BookOpen className={className} />;
  }
};

const LabFileCardCover = ({ product }) => {
  const isLabFile = product.categoryId?.slug === 'lab-files' || product.semester;
  const gradient = product.gradient || 'from-indigo-700 via-blue-800 to-slate-950';

  if (!isLabFile && product.images && product.images[0] && !product.images[0].includes('unsplash.com/photo-1589829085413')) {
    return (
      <div className="relative aspect-[16/10] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
    );
  }

  return (
    <div className={`relative aspect-[16/10] w-full bg-gradient-to-br ${gradient} p-4 flex flex-col justify-between overflow-hidden shadow-inner group-hover:scale-[1.01] transition-transform duration-300 select-none`}>
      {/* Decorative background watermark */}
      <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/5 blur-2xl pointer-events-none" />
      <div className="absolute right-3 bottom-3 opacity-10 text-white pointer-events-none">
        {renderSubjectIcon(product.iconType || 'BookOpen', 'w-24 h-24')}
      </div>

      {/* Realistic spiral spine on left */}
      <div className="absolute left-0 top-0 bottom-0 w-3.5 bg-black/40 border-r border-white/20 flex flex-col justify-around py-2.5 items-center z-10">
        {[...Array(6)].map((_, i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/60 block shadow-xs" />
        ))}
      </div>

      {/* Top Header of the Book Cover */}
      <div className="pl-2.5 flex items-center justify-between text-white/90 z-10">
        <div className="flex items-center space-x-1.5">
          <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-[10px] font-black tracking-widest uppercase text-amber-200">
            AKTU B.TECH CSE
          </span>
        </div>
        <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold text-white shadow-xs border border-white/20">
          {product.subjectCode || product.SKU}
        </span>
      </div>

      {/* Center Subject Title & Icon */}
      <div className="pl-2.5 flex items-center space-x-3 my-auto z-10">
        <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shadow-lg shrink-0">
          {renderSubjectIcon(product.iconType || 'BookOpen', 'w-5 h-5 text-amber-300')}
        </div>
        <div className="min-w-0">
          <h4 className="text-white font-black text-sm sm:text-base leading-tight tracking-tight drop-shadow-sm line-clamp-2">
            {product.subject || product.title.replace(/Semester \d+: /, '')}
          </h4>
          <span className="text-[10px] text-white/80 font-medium block mt-0.5 tracking-wide">
            Official Practical Manual & Record
          </span>
        </div>
      </div>

      {/* Bottom Cover Strip */}
      <div className="pl-2.5 pt-2 border-t border-white/15 flex items-center justify-between text-white/90 text-[10px] z-10">
        <div className="flex items-center space-x-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
          <span className="text-[9px] text-white/90 font-medium">Verified Rubric & Index</span>
        </div>
        <span className="bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full text-[9px] font-semibold text-white/95">
          {product.pages || '120 Pages • Interleaved'}
        </span>
      </div>
    </div>
  );
};

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
            (p.subject && p.subject.toLowerCase().includes(query)) ||
            (p.subjectCode && p.subjectCode.toLowerCase().includes(query)) ||
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

  // Semester Counts for quick overview
  const getSemesterCount = (sem) => {
    return AKTU_LAB_FILES.filter((p) => p.semester === sem).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-indigo-50/20 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900/50 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Hero Header Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-6 sm:p-8 shadow-xl overflow-hidden border border-indigo-700/30">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-violet-500/20 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 shadow-xs">
              <GraduationCap className="w-4 h-4 text-amber-300" />
              <span>AKTU B.Tech CSE • Official Stationery & Lab Store</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Semester 1 to 8 Engineering Lab Files & Manuals
            </h1>

            <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed max-w-2xl">
              University-approved syllabus practical record books, interleaved graph sheets, drawing binders, and exam instruments with direct 20-minute hostel room delivery.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-white/90">
              <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/15">
                <Truck className="w-3.5 h-3.5 text-emerald-400" />
                <span>20 Min Hostel Delivery</span>
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/15">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                <span>Verified AKTU Index & Certificates</span>
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/15">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
                <span>100% University Exam Approved</span>
              </span>
            </div>
          </div>
        </div>

        {/* Semester-Wise Filter Tabs (1 to 8 Semester) */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center space-x-2 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Select Your Semester:</span>
            </div>
            {selectedSemester && (
              <button
                onClick={() => setSelectedSemester('')}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline self-start sm:self-auto flex items-center space-x-1"
              >
                <RotateCw className="w-3 h-3" />
                <span>Show All Products</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedSemester('')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap flex items-center space-x-1.5 ${
                !selectedSemester
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>All Items ({products.length})</span>
            </button>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(String(sem))}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap flex items-center space-x-1.5 ${
                  selectedSemester === String(sem)
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30 scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <span>Sem {sem}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedSemester === String(sem) ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                  {getSemesterCount(sem)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search & Secondary Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by subject e.g. Physics, C, DBMS, AI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
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
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="createdAt_desc">Recommended / Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="title_asc">Name: A to Z</option>
            </select>
          </div>

          {/* In Stock Toggle */}
          <div className="flex items-center space-x-2 px-1">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
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
                  className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    {/* Realistic Subject Book Cover */}
                    <LabFileCardCover product={product} />

                    {/* Card Body Details */}
                    <div className="p-4 space-y-2.5">
                      {/* Top Badges Row */}
                      <div className="flex items-center justify-between text-xs">
                        {product.semester ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            Semester {product.semester}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {product.categoryId?.name || 'Stationery'}
                          </span>
                        )}

                        {/* Live Stock Indicator */}
                        {isOutOfStock ? (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Only {product.currentStock} left
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {product.currentStock} in stock
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {product.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom: Price & Add Button */}
                  <div className="p-4 pt-2">
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Price
                        </div>
                        <div className="flex items-baseline space-x-1">
                          <span className="text-xl font-black text-slate-900 dark:text-white">
                            ₹{product.price}
                          </span>
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5 mt-0.5">
                          <Truck className="w-3 h-3" />
                          <span>Hostel Delivery</span>
                        </div>
                      </div>

                      <button
                        onClick={() => addItem(product, 1)}
                        disabled={isOutOfStock}
                        className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all shadow-md active:scale-95 ${
                          isOutOfStock
                            ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed shadow-none'
                            : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-indigo-500/25'
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
