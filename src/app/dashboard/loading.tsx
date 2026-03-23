export default function Loading() {
  return (
    <div className="flex flex-col min-h-full pb-28">
      {/* Header Skeleton */}
      <div className="bg-[#fbf9f5]/95 backdrop-blur-md sticky top-0 z-20 border-b border-[#c1c8c2]/10 shadow-sm">
        <div className="flex items-center justify-center px-5 pt-4 pb-1">
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="w-5 h-5 bg-[#042418]/10 rounded-full animate-pulse" />
            <div className="w-24 h-4 bg-[#1b3a2c]/10 rounded animate-pulse" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 px-5 pb-3 pt-1">
          <div className="w-7 h-7 bg-[#042418]/10 rounded-full animate-pulse" />
          <div className="w-12 h-2 bg-[#727974]/15 rounded animate-pulse" />
          <div className="w-20 h-3 bg-[#042418]/15 rounded animate-pulse" />
        </div>
      </div>

      <div className="flex flex-col gap-8 px-6 pt-6">
        {/* Hero Card Skeleton */}
        <div className="flex flex-col gap-5">
          <div className="w-32 h-7 bg-[#042418]/10 rounded-lg self-center animate-pulse" />
          
          <div className="relative w-full aspect-[4/4] rounded-[2rem] bg-[#f5f3ef] border border-[#c1c8c2]/10 flex flex-col justify-end p-7 animate-pulse">
            <div className="absolute top-5 left-5 w-20 h-6 bg-white/30 rounded-full" />
            <div className="flex flex-col gap-2">
              <div className="w-3/4 h-8 bg-white/30 rounded-lg" />
              <div className="w-1/2 h-8 bg-white/30 rounded-lg" />
              <div className="w-full h-4 bg-white/10 rounded mt-2" />
              <div className="w-2/3 h-4 bg-white/10 rounded" />
            </div>
          </div>
          
          <div className="w-full h-14 bg-[#042418]/10 rounded-full animate-pulse" />
        </div>

        {/* Categories Skeleton */}
        <div className="flex flex-col gap-5 mt-2">
          <div className="w-36 h-6 bg-[#042418]/10 rounded-md self-center animate-pulse" />
          
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((_, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className="w-[4.5rem] h-[4.5rem] rounded-2xl bg-[#f5f3ef] border border-[#c1c8c2]/10 animate-pulse" />
                <div className="w-12 h-2.5 bg-[#424844]/15 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Chain card Skeleton */}
        <div className="bg-[#f5f3ef] border border-[#c1c8c2]/10 rounded-2xl p-5 h-20 animate-pulse" />

        {/* Verse Card Skeleton */}
        <div className="bg-[#f5f3ef] border border-[#c1c8c2]/10 rounded-2xl p-5 h-16 animate-pulse mb-6" />
      </div>
    </div>
  )
}
