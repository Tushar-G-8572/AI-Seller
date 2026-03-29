import React, { useState } from 'react'

const CATEGORY_THEMES = {
  clothing: {
    accent: 'text-amber-400',
    accentBorder: 'hover:border-amber-400/70',
    badge: 'bg-amber-400/10 text-amber-400 border border-amber-400/20',
    badgeLabel: '👕 Clothing',
    shimmer: 'from-amber-400/5 via-amber-400/10 to-transparent',
    btn: 'bg-amber-400 hover:bg-amber-300 text-black',
    divider: 'bg-amber-400/20',
    star: 'text-amber-400',
  },
  electronics: {
    accent: 'text-cyan-400',
    accentBorder: 'hover:border-cyan-400/70',
    badge: 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20',
    badgeLabel: '💻 Electronics',
    shimmer: 'from-cyan-400/5 via-cyan-400/10 to-transparent',
    btn: 'bg-cyan-400 hover:bg-cyan-300 text-black',
    divider: 'bg-cyan-400/20',
    star: 'text-cyan-400',
  },
  jewelery: {
    accent: 'text-rose-300',
    accentBorder: 'hover:border-rose-300/70',
    badge: 'bg-rose-300/10 text-rose-300 border border-rose-300/20',
    badgeLabel: '💎 Jewellery',
    shimmer: 'from-rose-300/5 via-rose-300/10 to-transparent',
    btn: 'bg-rose-300 hover:bg-rose-200 text-black',
    divider: 'bg-rose-300/20',
    star: 'text-rose-300',
  },
}

// ─── Star rating renderer ────────────────────────────────────────────────────
function StarRating({ rating, starClass }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? starClass : 'text-gray-700'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-gray-500 text-xs ml-1">({rating})</span>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
// Props:
//   product     — full product object from your API
//   onNegotiate — callback when user clicks "Start Negotiating"
const ProductCard = ({ product, onNegotiate }) => {
  const [imgError, setImgError] = useState(false)
  const [hovered, setHovered] = useState(false)

  const theme = CATEGORY_THEMES[product?.product_category] || CATEGORY_THEMES.clothing

  const discountPct = product?.product_mrp && product?.product_offerPrice
    ? Math.round(((product.product_mrp - product.product_offerPrice) / product.product_mrp) * 100)
    : 0

  return (
    <div
      className={`
        group relative flex flex-col
        bg-[#0f0f0f] border border-gray-800 ${theme.accentBorder}
        rounded-2xl overflow-hidden
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/60
        w-full max-w-xs
      `}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >

      {/* Accent shimmer glow on hover */}
      <div className={`
        absolute inset-0 rounded-2xl pointer-events-none z-0
        bg-gradient-to-br ${theme.shimmer}
        opacity-0 group-hover:opacity-100 transition-opacity duration-500
      `} />

      {/* Image container */}
      <div className="relative w-full aspect-[4/3] bg-[#1a1a1a] overflow-hidden">

        {/* Category badge */}
        <span className={`
          absolute top-3 left-3 z-10
          text-[10px] font-semibold tracking-widest uppercase px-2 py-1 rounded-md
          ${theme.badge}
        `}>
          {theme.badgeLabel}
        </span>

        {/* Discount badge */}
        {discountPct > 0 && (
          <span className="
            absolute top-3 right-3 z-10
            text-[10px] font-bold px-2 py-1 rounded-md
            bg-gray-900/80 text-gray-200 border border-gray-700
          ">
            {discountPct}% off
          </span>
        )}

        {/* Product image */}
        {!imgError ? (
          <img
            src={product?.product_image_url}
            alt={product?.product_name}
            onError={() => setImgError(true)}
            className={`
              w-full h-full object-cover
              transition-transform duration-500
              ${hovered ? 'scale-105' : 'scale-100'}
            `}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-gray-700">
            {product?.product_category === 'electronics' ? '💻'
              : product?.product_category === 'jewelery' ? '💎' : '👕'}
          </div>
        )}

        {/* Bottom fade into card */}
        <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-[#0f0f0f] to-transparent" />
      </div>

      {/* Card body */}
      <div className="relative z-10 flex flex-col gap-3 p-4 flex-1">

        {/* Product name */}
        <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 tracking-tight">
          {product?.product_name || 'Product Name'}
        </h3>

        {/* Rating + sold count */}
        <div className="flex items-center justify-between">
          <StarRating rating={product?.rating || 0} starClass={theme.star} />
          {product?.product_purchase_count > 0 && (
            <span className="text-gray-600 text-[10px]">
              {product.product_purchase_count.toLocaleString()} sold
            </span>
          )}
        </div>

        {/* Divider */}
        <div className={`h-px w-full ${theme.divider}`} />

        {/* Price */}
        <div className="flex items-end gap-2">
          <span className={`text-xl font-bold ${theme.accent}`}>
            ₹{product?.product_offerPrice?.toLocaleString()}
          </span>
          {product?.product_mrp && (
            <span className="text-gray-600 text-xs line-through mb-0.5">
              ₹{product.product_mrp.toLocaleString()}
            </span>
          )}
        </div>

        {/* Description */}
        {product?.product_description && (
          <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
            {product.product_description}
          </p>
        )}

        {/* CTA */}
        <button
          onClick={() => onNegotiate?.(product)}
          className={`
            mt-auto w-full py-2.5 rounded-xl
            text-xs font-bold tracking-widest uppercase
            transition-all duration-200 active:scale-95
            ${theme.btn}
          `}
        >
          Start Negotiating →
        </button>
      </div>
    </div>
  )
}

export default ProductCard