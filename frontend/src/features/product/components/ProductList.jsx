import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import ProductCard from './ProductCard'
import { useProducts } from '../hooks/useProduct'
import { useSelector } from 'react-redux'

// ─── Per-category visual identity ────────────────────────────────────────────
const CATEGORY_META = {
  clothing: {
    emoji: '👕',
    label: 'Clothing',
    tagline: 'Style is a negotiation.',
    accent: 'text-amber-400',
    accentBorder: 'border-amber-400/20',
    accentBg: 'bg-amber-400/5',
    pill: 'bg-amber-400/10 text-amber-400 border border-amber-400/20',
    headerGlow: 'from-amber-400/10 via-transparent to-transparent',
    dot: 'bg-amber-400',
  },
  electronics: {
    emoji: '💻',
    label: 'Electronics',
    tagline: 'Precision pricing. Your move.',
    accent: 'text-cyan-400',
    accentBorder: 'border-cyan-400/20',
    accentBg: 'bg-cyan-400/5',
    pill: 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20',
    headerGlow: 'from-cyan-400/10 via-transparent to-transparent',
    dot: 'bg-cyan-400',
  },
  jewelery: {
    emoji: '💎',
    label: 'Jewellery',
    tagline: 'Rare finds. Rarer deals.',
    accent: 'text-rose-300',
    accentBorder: 'border-rose-300/20',
    accentBg: 'bg-rose-300/5',
    pill: 'bg-rose-300/10 text-rose-300 border border-rose-300/20',
    headerGlow: 'from-rose-300/10 via-transparent to-transparent',
    dot: 'bg-rose-300',
  },
}

// ─── Skeleton Card (shown while loading) ─────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-[#0f0f0f] border border-gray-800 rounded-2xl overflow-hidden w-full max-w-xs animate-pulse">
      <div className="w-full aspect-[4/3] bg-gray-800/60" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-3 bg-gray-800 rounded w-3/4" />
        <div className="h-3 bg-gray-800 rounded w-1/2" />
        <div className="h-px bg-gray-800 w-full" />
        <div className="h-5 bg-gray-800 rounded w-1/3" />
        <div className="h-3 bg-gray-800 rounded w-full" />
        <div className="h-3 bg-gray-800 rounded w-5/6" />
        <div className="h-9 bg-gray-800 rounded-xl mt-1" />
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ category, meta, onBack }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-24 text-center px-6">
      <span className="text-6xl">{meta?.emoji || '🔍'}</span>
      <div>
        <p className="text-white font-semibold text-lg">No products found</p>
        <p className="text-gray-500 text-sm mt-1">
          Nothing in <span className={meta?.accent}>{meta?.label || category}</span> right now.
        </p>
      </div>
      <button
        onClick={onBack}
        className="text-xs tracking-widest uppercase text-gray-400 hover:text-white border border-gray-700 hover:border-gray-400 px-5 py-2 rounded-lg transition-all duration-200"
      >
        ← Back to categories
      </button>
    </div>
  )
}

// ─── Error state ──────────────────────────────────────────────────────────────
function ErrorState({ onRetry, onBack }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-24 text-center px-6">
      <span className="text-5xl">⚠️</span>
      <div>
        <p className="text-white font-semibold text-lg">Failed to load products</p>
        <p className="text-gray-500 text-sm mt-1">Something went wrong fetching the list.</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="text-xs tracking-widest uppercase text-black bg-white hover:bg-gray-200 px-5 py-2 rounded-lg transition-all duration-200 font-bold"
        >
          Retry
        </button>
        <button
          onClick={onBack}
          className="text-xs tracking-widest uppercase text-gray-400 hover:text-white border border-gray-700 hover:border-gray-400 px-5 py-2 rounded-lg transition-all duration-200"
        >
          ← Back
        </button>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
const ProductList = () => {
  const { category } = useParams()
  const navigate = useNavigate()
  const {handleGetAllProducts} = useProducts();

  useEffect(()=>{
    handleGetAllProducts(category);
  },[])

  const products = useSelector(state => Array.isArray(state.product.products) ? state.product.products : [])
  const loading = useSelector(state => state.product.loading)
  const error = useSelector(state => state.product.error)

  

  // const [products, setProducts] = useState([])
  // const [loading, setLoading] = useState(true)
  // const [error, setError] = useState(null)

  const meta = CATEGORY_META[category] || null


  const handleNegotiate = (product) => {
    navigate(`/negotiate/${product._id}`)
  }

  return (
    <div className="min-h-screen bg-black text-gray-200">

      {/* ── Subtle dot-grid background */}
      <div className="fixed inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

      {/* ── Category header glow strip */}
      {meta && (
        <div className={`fixed top-0 inset-x-0 h-40 bg-gradient-to-b ${meta.headerGlow} pointer-events-none z-0`} />
      )}

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* ── Top nav row */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-500 hover:text-white text-xs tracking-widest uppercase transition-colors duration-200 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-200 inline-block">←</span>
            Categories
          </button>

          {/* Live count pill */}
          {!loading && !error && (
            <span className={`text-[10px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full ${meta?.pill || 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
              {products.length} {products.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {/* ── Page header */}
        <div className="mb-10 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            {meta && (
              <span className={`w-2 h-2 rounded-full ${meta.dot} inline-block`} />
            )}
            <span className="text-xs tracking-[0.3em] uppercase text-gray-500">
              {meta?.label || category} · Negotiation Arena
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-none">
            {meta?.label || category}
          </h1>

          {meta?.tagline && (
            <p className={`text-sm ${meta.accent} tracking-wide mt-1`}>
              {meta.tagline}
            </p>
          )}
        </div>

        {/* ── Content area */}
        {loading ? (
          // Skeleton grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 justify-items-center">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState onRetry={()=>{handleGetAllProducts()}} onBack={() => navigate('/')} />
        ) : products.length === 0 ? (
          <EmptyState category={category} meta={meta} onBack={() => navigate('/')} />
        ) : (
          <>
            {/* Product grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 justify-items-center">
              {products.map((product, index) => (
                <div
                  key={product._id}
                  // Staggered fade-in via inline style
                  style={{
                    animation: `fadeSlideUp 0.4s ease forwards`,
                    animationDelay: `${index * 60}ms`,
                    opacity: 0,
                  }}
                  className="w-full flex justify-center"
                >
                  <ProductCard
                    product={product}
                    onNegotiate={handleNegotiate}
                  />
                </div>
              ))}
            </div>

            {/* Bottom tagline */}
            <p className="text-center text-gray-700 text-xs tracking-widest uppercase mt-14">
              Lowest deal wins · Global leaderboard
            </p>
          </>
        )}
      </div>

      {/* ── Keyframe for staggered card entrance */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default ProductList