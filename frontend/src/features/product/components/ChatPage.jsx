import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useProducts } from '../hooks/useProduct'
import { useSelector } from 'react-redux'
import { getSocket } from '../service/chat.socket'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

const ROUND_COLORS = ['text-cyan-400', 'text-amber-400', 'text-rose-300', 'text-emerald-400', 'text-violet-400']

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-3 h-3 ${i < Math.round(rating) ? 'text-amber-400' : 'text-gray-700'}`}
          fill="currentColor" viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-gray-500 text-[10px] ml-1">{rating?.toFixed(1)}</span>
    </div>
  )
}

function ProductPanel({ product, session, onAccept, onAbandon, dealClosed }) {
  if (!product) return (
    <div className="flex flex-col gap-4 animate-pulse p-6">
      <div className="w-full aspect-square bg-gray-800 rounded-2xl" />
      <div className="h-4 bg-gray-800 rounded w-3/4" />
      <div className="h-3 bg-gray-800 rounded w-1/2" />
    </div>
  )

  const savings = product.offerPrice - (session?.currentOffer ?? product.offerPrice)
  const savingsPct = ((savings / product.offerPrice) * 100).toFixed(1)

  return (
    <div className="flex flex-col h-full">
      {/* Product Image */}
      <div className="relative rounded-2xl overflow-hidden bg-[#0d0d0d] border border-gray-800/60 mb-5">
        <img
          src={product.image}
          alt={product.name}
          className="w-full object-contain aspect-square p-6"
          style={{ filter: dealClosed ? 'grayscale(0.3)' : 'none' }}
        />
        {dealClosed && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <span className="text-2xl font-black tracking-tight text-white border-4 border-white px-4 py-1 rotate-[-8deg] opacity-90">
              DEAL CLOSED
            </span>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] text-gray-400 uppercase tracking-widest border border-gray-700">
          {product.category}
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-3 flex-1">
        <h2 className="text-white font-bold text-sm leading-snug line-clamp-2">{product.name}</h2>
        <StarRating rating={product.rating?.rate} />
        <p className="text-gray-600 text-xs leading-relaxed line-clamp-3">{product.description}</p>

        {/* Price block */}
        <div className="mt-auto pt-3 border-t border-gray-800/60">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-gray-600 text-xs line-through">{fmt(product.mrp)}</span>
            <span className="text-[10px] text-gray-600 tracking-widest uppercase">MRP</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-0.5">Listed Price</div>
              <div className="text-lg font-bold text-white">{fmt(product.offerPrice)}</div>
            </div>
            {session && (
              <div className="text-right">
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-0.5">AI Counter</div>
                <div className={`text-lg font-bold ${savings > 0 ? 'text-emerald-400' : 'text-white'}`}>
                  {fmt(session.currentOffer)}
                </div>
              </div>
            )}
          </div>

          {/* Savings bar */}
          {savings > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-gray-600 uppercase tracking-wider">Your savings</span>
                <span className="text-emerald-400 font-semibold">{savingsPct}% off</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(savingsPct, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {session && !dealClosed && (
          <div className="flex flex-col gap-2 mt-3">
            <button
              onClick={onAccept}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black tracking-widest uppercase transition-all duration-200 active:scale-95"
            >
              ✓ Accept {fmt(session.currentOffer)}
            </button>
            <button
              onClick={onAbandon}
              className="w-full py-2 rounded-xl border border-gray-800 hover:border-gray-600 text-gray-600 hover:text-gray-400 text-[10px] tracking-widest uppercase transition-all duration-200"
            >
              Walk Away
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function RoundBadge({ round, total }) {
  const color = ROUND_COLORS[(round - 1) % ROUND_COLORS.length]
  return (
    <div className={`inline-flex items-center gap-1.5 text-[10px] ${color} tracking-widest uppercase font-semibold border border-current/20 bg-current/5 px-2.5 py-1 rounded-full`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current animate-pulse`} />
      Round {round}/{total}
    </div>
  )
}

function ChatBubble({ msg }) {
  const isUser = msg.role === 'user'
  const isSystem = msg.role === 'system'

  if (isSystem) return (
    <div className="flex justify-center my-2">
      <span className="text-[10px] text-gray-600 uppercase tracking-widest bg-gray-900 border border-gray-800 px-3 py-1 rounded-full">
        {msg.text}
      </span>
    </div>
  )

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400/20 to-rose-400/20 border border-amber-400/20 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">
          🤖
        </div>
      )}
      <div className={`max-w-[78%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isUser
            ? 'bg-white text-black rounded-tr-sm font-medium'
            : 'bg-[#111] border border-gray-800 text-gray-200 rounded-tl-sm'
            }`}
        >
          {msg.text}
          {msg.streaming && (
            <span className="inline-flex gap-0.5 ml-1 align-middle">
              <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          )}
        </div>
        {msg.offer && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${isUser
            ? 'bg-gray-800 text-gray-400 self-end'
            : 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
            }`}>
            {isUser ? `Your offer: ${fmt(msg.offer)}` : `Counter: ${fmt(msg.offer)}`}
          </span>
        )}
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-white/10 border border-gray-700 flex items-center justify-center text-sm ml-2 flex-shrink-0 mt-1">
          👤
        </div>
      )}
    </div>
  )
}

function DealClosedBanner({ data, onLeaderboard }) {
  return (
    <div className="mx-4 mb-4 p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-sm text-center">
      <div className="text-3xl mb-2">🎉</div>
      <div className="text-emerald-400 font-black text-lg tracking-tight">Deal Locked!</div>
      <div className="text-white font-bold text-2xl mt-1">{fmt(data.finalPrice)}</div>
      <div className="text-gray-500 text-xs mt-1 line-through">{fmt(data.offerPrice)} listed</div>
      <div className="flex items-center justify-center gap-3 mt-3">
        <span className="text-emerald-400 text-sm font-semibold">You saved {fmt(data.savings)}</span>
        <span className="text-gray-600">·</span>
        <span className="text-gray-400 text-xs">{data.savingsPct?.toFixed(1)}% off</span>
      </div>
      <button
        onClick={onLeaderboard}
        className="mt-4 w-full py-2 rounded-xl bg-white text-black text-xs font-black tracking-widest uppercase hover:bg-gray-200 transition-all duration-200"
      >
        View Leaderboard →
      </button>
    </div>
  )
}

// ─── Main ChatPage ─────────────────────────────────────────────────────────────
const ChatPage = () => {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { handleSingleProduct } = useProducts()

  const product = useSelector(state => state.product.product)

  const [sessionId, setSessionId] = useState(null)
  const [sessionInfo, setSessionInfo] = useState(null)
  const [messages, setMessages] = useState([])
  const [offerInput, setOfferInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [dealClosed, setDealClosed] = useState(false)
  const [dealData, setDealData] = useState(null)
  const [socketError, setSocketError] = useState(null)
  const [connected, setConnected] = useState(false)

  const chatEndRef = useRef(null)
  const socketRef = useRef(null)
  const streamingMsgIdRef = useRef(null)

  // Auto-scroll on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load product via API
  useEffect(() => {
    if (productId) handleSingleProduct(productId)
  }, [productId])

  // ── Socket setup
  useEffect(() => {
    const socket = getSocket()
    socketRef.current = socket

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    // Session started
    socket.on('session_started', ({ sessionId, product: prod, currentRound, maxRounds, roundHistory }) => {
      setSessionId(sessionId)
      setSessionInfo({
        currentOffer: prod.offerPrice,
        currentRound,
        maxRounds,
        roundsLeft: maxRounds - (roundHistory?.length ?? 0),
      })

      // Replay history if resuming
      if (roundHistory?.length) {
        const replayed = []
        roundHistory.forEach((r, i) => {
          replayed.push({ id: `h-u-${i}`, role: 'user', text: `I'd like to buy for ${fmt(r.user_offer)}`, offer: r.user_offer })
          replayed.push({ id: `h-a-${i}`, role: 'ai', text: r.ai_message, offer: r.ai_counter_offer })
        })
        setMessages(replayed)
      } else {
        setMessages([{ id: 'sys-0', role: 'system', text: `Negotiation started · ${maxRounds} rounds` }])
      }
    })

    // AI is generating
    socket.on('ai_thinking', ({ round }) => {
      setIsThinking(true)
      const msgId = `ai-stream-${Date.now()}`
      streamingMsgIdRef.current = msgId
      setMessages(prev => [...prev, { id: msgId, role: 'ai', text: '', streaming: true }])
    })

    // Streaming token
    socket.on('ai_token', ({ token }) => {
      const id = streamingMsgIdRef.current
      if (!id) return
      setMessages(prev =>
        prev.map(m => m.id === id ? { ...m, text: m.text + token } : m)
      )
    })

    // Round complete
    socket.on('round_complete', ({ round, userOffer, aiMessage, aiCounterOffer, roundsLeft, isFinalRound }) => {
      const id = streamingMsgIdRef.current
      // Finalize the streaming bubble
      setMessages(prev =>
        prev.map(m =>
          m.id === id
            ? { ...m, text: aiMessage, streaming: false, offer: aiCounterOffer }
            : m
        )
      )
      streamingMsgIdRef.current = null
      setIsThinking(false)

      setSessionInfo(prev => ({
        ...prev,
        currentOffer: aiCounterOffer,
        currentRound: round + 1,
        roundsLeft,
      }))

      if (isFinalRound) {
        setMessages(prev => [...prev, { id: `sys-final-${round}`, role: 'system', text: 'Final round — take it or leave it!' }])
      }
    })

    // Deal closed
    socket.on('deal_closed', (data) => {
      setDealClosed(true)
      setDealData(data)
      setIsThinking(false)
    })

    // Error
    socket.on('error', ({ message }) => {
      setSocketError(message)
      setIsThinking(false)
      setTimeout(() => setSocketError(null), 4000)
    })

    return () => {
      socket.off('session_started')
      socket.off('ai_thinking')
      socket.off('ai_token')
      socket.off('round_complete')
      socket.off('deal_closed')
      socket.off('error')
      socket.off('connect')
      socket.off('disconnect')
    }
  }, [])

  // Start session once product is loaded
  useEffect(() => {
    if (product && productId && socketRef.current && !sessionId) {
      socketRef.current.emit('start_session', { productId })
    }
  }, [product, productId, sessionId])

  // ── Handlers
  const handleMakeOffer = useCallback(() => {
    const offer = Number(offerInput.replace(/[^0-9]/g, ''))
    if (!offer || offer <= 0 || !sessionId || isThinking || dealClosed) return

    const msgId = `user-${Date.now()}`
    setMessages(prev => [...prev, { id: msgId, role: 'user', text: `${offerInput}`, offer }])
    setOfferInput('')
    socketRef.current?.emit('make_offer', { sessionId, userOffer: offer, offerInput })
  }, [offerInput, sessionId, isThinking, dealClosed])

  const handleAccept = useCallback(() => {
    if (!sessionId || dealClosed) return
    socketRef.current?.emit('accept_offer', { sessionId })
  }, [sessionId, dealClosed])

  const handleAbandon = useCallback(() => {
    if (!sessionId) return
    socketRef.current?.emit('abandon_session', { sessionId })
    navigate(-1)
  }, [sessionId, navigate])

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleMakeOffer()
    }
  }

  // ── Render
  return (
    <div className="min-h-screen bg-black text-gray-200 flex flex-col">
      {/* Dot grid bg */}
      <div className="fixed inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Top nav */}
      <header className="relative z-20 flex items-center justify-between px-5 py-3 border-b border-gray-800/60 bg-black/80 backdrop-blur-md">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-white text-xs tracking-widest uppercase transition-colors group"
        >
          <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span>
          Back
        </button>

        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400' : 'bg-red-500'} animate-pulse`} />
          <span className="text-[10px] text-gray-600 uppercase tracking-widest">{connected ? 'Live' : 'Reconnecting'}</span>
        </div>

        <button
          onClick={() => navigate('/leaderboard')}
          className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-amber-400 border border-gray-800 hover:border-amber-400/30 px-3 py-1.5 rounded-lg transition-all duration-200"
        >
          🏆 Leaderboard
        </button>
      </header>

      {/* Error toast */}
      {socketError && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-2 rounded-xl backdrop-blur-md">
          ⚠️ {socketError}
        </div>
      )}

      {/* Main layout */}
      <div className="relative z-10 flex flex-1 max-w-6xl mx-auto w-full px-4 py-6 gap-5 min-h-0" style={{ height: 'calc(100vh - 57px)' }}>

        {/* ── LEFT: Product Panel */}
        <aside className="w-72 flex-shrink-0 overflow-y-auto pr-1 custom-scroll">
          <ProductPanel
            product={product ? {
              name: product.product_name,
              image: product.product_image_url,
              category: product.product_category,
              description: product.product_description,
              mrp: product.product_mrp,
              offerPrice: product.product_offerPrice,
              rating: product.rating,
            } : null}
            session={sessionInfo}
            onAccept={handleAccept}
            onAbandon={handleAbandon}
            dealClosed={dealClosed}
          />
        </aside>

        {/* ── RIGHT: Chat Panel */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#080808] border border-gray-800/40 rounded-2xl overflow-hidden">

          {/* Chat header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800/40 bg-[#0a0a0a]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400/30 to-rose-500/30 border border-amber-400/20 flex items-center justify-center text-base">
                🤖
              </div>
              <div>
                <div className="text-white text-sm font-semibold">AI Seller</div>
                <div className="text-gray-600 text-[10px]">Negotiation Arena</div>
              </div>
            </div>
            {sessionInfo && !dealClosed && (
              <RoundBadge round={sessionInfo.currentRound ?? 1} total={sessionInfo.maxRounds ?? 5} />
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1 custom-scroll">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <div className="w-14 h-14 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-2xl">
                  🤝
                </div>
                <p className="text-gray-600 text-sm">Connecting to seller…</p>
              </div>
            )}
            {messages.map(msg => <ChatBubble key={msg.id} msg={msg} />)}
            {dealClosed && dealData && (
              <DealClosedBanner data={dealData} onLeaderboard={() => navigate('/leaderboard')} />
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Rounds left indicator */}
          {sessionInfo && !dealClosed && (
            <div className="px-5 py-2 border-t border-gray-800/30 flex items-center gap-2">
              <div className="flex gap-1">
                {Array.from({ length: sessionInfo.maxRounds }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 w-6 rounded-full transition-all duration-300 ${i < (sessionInfo.maxRounds - sessionInfo.roundsLeft)
                      ? 'bg-amber-400'
                      : 'bg-gray-800'
                      }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-gray-600 ml-1">
                {sessionInfo.roundsLeft} round{sessionInfo.roundsLeft !== 1 ? 's' : ''} left
              </span>
            </div>
          )}

          {/* Input area */}
          {!dealClosed && (
            <div className="px-4 pb-4 pt-3 border-t border-gray-800/40 bg-[#0a0a0a]">
              <div className="flex items-center  gap-3 bg-[#111] border border-gray-800 rounded-xl px-4 py-3 focus-within:border-gray-600 transition-colors">
                <span className="text-gray-600 text-sm">$</span>
                <input
                  type="text"
                  value={offerInput}
                  onChange={e => setOfferInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Enter your message and offer price…"
                  disabled={isThinking || dealClosed || !sessionId}
                  className="flex-1  bg-transparent  text-white text-sm outline-none placeholder-gray-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={handleMakeOffer}
                  disabled={isThinking || dealClosed || !sessionId || !offerInput}
                  className="px-4 py-1.5 rounded-lg bg-white text-black text-xs font-black tracking-wider uppercase disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 active:scale-95 transition-all duration-150"
                >
                  {isThinking ? '…' : 'Offer'}
                </button>
              </div>
              <p className="text-[10px] text-gray-700 mt-2 text-center">
                Press Enter to send · Accept to close the deal early
              </p>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #1f1f1f; border-radius: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #2a2a2a; }
      `}</style>
    </div>
  )
}

export default ChatPage