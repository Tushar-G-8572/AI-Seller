import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useProducts } from '../hooks/useProduct'
import { useSelector } from 'react-redux'

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

const MEDALS = ['🥇', '🥈', '🥉']
const RANK_STYLES = [
  { ring: 'ring-amber-400/40', bg: 'bg-amber-400/5', text: 'text-amber-400', bar: 'bg-amber-400' },
  { ring: 'ring-gray-400/30', bg: 'bg-gray-400/5', text: 'text-gray-300', bar: 'bg-gray-400' },
  { ring: 'ring-amber-700/30', bg: 'bg-amber-700/5', text: 'text-amber-700', bar: 'bg-amber-700' },
]

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-800/30 animate-pulse">
      <div className="w-8 h-4 bg-gray-800 rounded" />
      <div className="w-9 h-9 rounded-full bg-gray-800 flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-3 bg-gray-800 rounded w-1/3" />
        <div className="h-2 bg-gray-800 rounded w-1/2" />
      </div>
      <div className="w-20 h-4 bg-gray-800 rounded" />
    </div>
  )
}

// ─── Top 3 Podium Card ────────────────────────────────────────────────────────
function TopThreeCard({ entry, rank }) {
  const style = RANK_STYLES[rank] || { ring: 'ring-gray-800', bg: 'bg-gray-900/40', text: 'text-gray-400', bar: 'bg-gray-600' }

  return (
    <div className={`flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-800/60 ${style.bg} ring-1 ${style.ring} ${rank === 0 ? 'scale-105 z-10' : 'opacity-90'} transition-all duration-300 hover:opacity-100`}>
      <div className="text-4xl">{MEDALS[rank]}</div>
      <div className={`w-14 h-14 rounded-full bg-gray-800 border-2 ${style.text} flex items-center justify-center text-xl font-bold overflow-hidden`}>
        {entry.user_avatar
          ? <img src={entry.user_avatar} alt={entry.user_name} className="w-full h-full object-cover" />
          : <span className={style.text}>{entry.user_name?.[0]?.toUpperCase() || '?'}</span>
        }
      </div>
      <div className="text-center">
        <div className={`font-bold text-sm ${style.text}`}>{entry.user_name || 'Anonymous'}</div>
        <div className="text-gray-600 text-[10px] truncate max-w-[100px]">{entry.product_name}</div>
      </div>
      <div className="text-center">
        <div className={`text-xl font-black ${style.text}`}>{entry.saving_percent?.toFixed(1)}%</div>
        <div className="text-gray-600 text-[10px] uppercase tracking-widest">saved</div>
      </div>
      <div className="w-full pt-3 border-t border-gray-800/60 flex justify-between text-[10px]">
        <span className="text-gray-600">Deal</span>
        <span className="text-white font-semibold">{fmt(entry.deal_price)}</span>
      </div>
    </div>
  )
}

// ─── Regular Row ──────────────────────────────────────────────────────────────
function LeaderboardRow({ entry, rank }) {
  const isTop3 = rank < 3
  const style = RANK_STYLES[rank] || {}

  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-800/30 hover:bg-white/[0.02] transition-colors">
      <div className={`w-8 text-center font-black text-sm ${isTop3 ? style.text : 'text-gray-600'}`}>
        {MEDALS[rank] || `#${rank + 1}`}
      </div>
      <div className="w-9 h-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
        {entry.user_avatar
          ? <img src={entry.user_avatar} alt={entry.user_name} className="w-full h-full object-cover" />
          : <span className="text-sm font-bold text-gray-400">{entry.user_name?.[0]?.toUpperCase() || '?'}</span>
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm font-semibold truncate">{entry.user_name || 'Anonymous'}</div>
        <div className="text-gray-600 text-[10px] truncate">{entry.product_name} · {entry.total_rounds} rounds</div>
      </div>
      <div className="w-28 hidden sm:block">
        <div className="flex justify-between text-[9px] mb-1">
          <span className="text-gray-600">savings</span>
          <span className={`font-semibold ${isTop3 ? style.text : 'text-gray-400'}`}>{entry.saving_percent?.toFixed(1)}%</span>
        </div>
        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${isTop3 ? style.bar : 'bg-gray-600'}`}
            style={{ width: `${Math.min(entry.saving_percent, 100)}%` }}
          />
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-white text-sm font-bold">{fmt(entry.deal_price)}</div>
        <div className="text-gray-600 text-[10px]">deal price</div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const Leaderboard = () => {
  const navigate = useNavigate()
  const { handleGetLeaderBoard } = useProducts()

  // ✅ Read from Redux — same slice as the rest of your app
  const leaders = useSelector(state => Array.isArray(state.product.leader) ? state.product.leader : [])
  const loading = useSelector(state => state.product.loading)
  const error = useSelector(state => state.product.error)

  const [filter, setFilter] = useState('all')

  useEffect(() => {
    handleGetLeaderBoard(filter !== 'all' ? filter : undefined)
  }, [filter])

  // ✅ Derived from Redux state — no separate local state needed
  const top3 = leaders.slice(0, 3)

  return (
    <div className="min-h-screen bg-black text-gray-200">
      <div className="fixed inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="fixed top-0 inset-x-0 h-48 bg-gradient-to-b from-amber-400/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">

        {/* Nav */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-white text-xs tracking-widest uppercase transition-colors group mb-10"
        >
          <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span>
          Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Global Rankings</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight">Leaderboard</h1>
          <p className="text-amber-400 text-sm mt-2 tracking-wide">Who negotiated the best deal?</p>
        </div>


        {/* Content */}
        {loading ? (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-4">
              {[0, 1, 2].map(i => (
                <div key={i} className="animate-pulse flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-800">
                  <div className="text-4xl">⬜</div>
                  <div className="w-14 h-14 rounded-full bg-gray-800" />
                  <div className="h-3 bg-gray-800 rounded w-2/3" />
                  <div className="h-5 bg-gray-800 rounded w-1/2" />
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-gray-800/60 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          </div>

        ) : error ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <span className="text-5xl">⚠️</span>
            <p className="text-white font-semibold">{error}</p>
            <button
              onClick={() => handleGetLeaderBoard(filter !== 'all' ? filter : undefined)}
              className="text-xs uppercase tracking-widest bg-white text-black px-5 py-2 rounded-lg font-bold hover:bg-gray-200 transition-all"
            >
              Retry
            </button>
          </div>

        ) : leaders.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <span className="text-6xl">🏆</span>
            <p className="text-white font-semibold text-lg">No deals yet</p>
            <p className="text-gray-500 text-sm">Be the first to close a deal and claim the top spot!</p>
            <button
              onClick={() => navigate('/')}
              className="text-xs uppercase tracking-widest border border-gray-700 hover:border-gray-400 text-gray-400 hover:text-white px-5 py-2 rounded-lg transition-all"
            >
              Start Negotiating →
            </button>
          </div>

        ) : (
          <>
            {/* Podium — reordered: 2nd | 1st | 3rd */}
            {top3.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[top3[1], top3[0], top3[2]].map((entry, visualIdx) => {
                  if (!entry) return <div key={visualIdx} />
                  const actualRank = entry === top3[0] ? 0 : entry === top3[1] ? 1 : 2
                  return <TopThreeCard key={entry._id || visualIdx} entry={entry} rank={actualRank} />
                })}
              </div>
            )}

            {/* Full list */}
            <div className="rounded-2xl border border-gray-800/60 overflow-hidden bg-[#080808]">
              <div className="px-5 py-3 border-b border-gray-800/60 flex items-center gap-2 bg-[#0a0a0a]">
                <span className="text-[10px] uppercase tracking-widest text-gray-500">All Deals</span>
                <span className="text-[10px] text-gray-700">·</span>
                <span className="text-[10px] text-gray-600">{leaders.length} negotiators</span>
              </div>
              {leaders.map((entry, idx) => (
                <LeaderboardRow key={entry._id || idx} entry={entry} rank={idx} />
              ))}
            </div>

            <p className="text-center text-gray-700 text-[10px] tracking-widest uppercase mt-10">
              Ranked by highest savings % · Updated in real time
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default Leaderboard