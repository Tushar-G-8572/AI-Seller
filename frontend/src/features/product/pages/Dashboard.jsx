import { useNavigate } from 'react-router'


const Dashboard = () => {
  const navigate = useNavigate();
  

  const handleNavigate = (category) => {
    navigate(`/products/${category}`)
  }

  return (
    <section className="relative bg-black text-gray-200 h-screen w-full overflow-hidden flex items-center justify-center">

      {/* subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-12 px-6 text-center">

        {/* heading */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs tracking-[0.3em] uppercase text-gray-500 font-medium">
            Negotiate the best deal
          </span>
          <h1 className="text-5xl font-bold tracking-tight text-white">
            Select a Category
          </h1>
          <p className="text-gray-400 text-sm max-w-xs">
            Pick a category and outsmart the AI seller to win the lowest price.
          </p>
        </div>

        {/* category buttons */}
        <div className="flex flex-col sm:flex-row gap-4">

          <button
            onClick={()=>{handleNavigate('clothing')}}
            className="group relative px-8 py-4 border border-gray-700 rounded-xl text-gray-300 text-sm font-medium tracking-wide hover:border-white hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg"></span> Clothing
            </span>
            <span className="absolute inset-x-0 bottom-0 h-px bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
          </button>

          <button
            onClick={()=>{handleNavigate('electronics')}}
            className="group relative px-8 py-4 border border-gray-700 rounded-xl text-gray-300 text-sm font-medium tracking-wide hover:border-white hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg"></span> Electronics
            </span>
            <span className="absolute inset-x-0 bottom-0 h-px bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
          </button>

          <button
            onClick={()=>{handleNavigate('jewelery')}}
            className="group relative px-8 py-4 border border-gray-700 rounded-xl text-gray-300 text-sm font-medium tracking-wide hover:border-white hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg"></span> Jewellery
            </span>
            <span className="absolute inset-x-0 bottom-0 h-px bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
          </button>

        </div>

        {/* bottom hint */}
        <p className="text-gray-600 text-xs tracking-widest uppercase">
          Lowest deal wins · Global leaderboard
        </p>

      </div>
    </section>
  )
}

export default Dashboard