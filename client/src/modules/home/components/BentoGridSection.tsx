import { Link } from "react-router-dom";

export default function BentoGridSection() {
  return (
    <section className="w-full py-6 sm:py-10 md:py-12 lg:py-16">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-5 sm:mb-7 md:mb-9 lg:mb-10">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-[34px] lg:text-4xl font-bold tracking-[0.1em] text-brand-maroon uppercase">
            EXPLORE OUR CATEGORIES
          </h2>
        </div>

        {/* ========================================================================= */}
        {/* DESKTOP, LAPTOP & TABLET VIEW: Exact 1:1 Aspect Ratio (Zero Crop)        */}
        {/* ========================================================================= */}
        <div className="hidden md:flex md:flex-row gap-3.5 sm:gap-4 lg:gap-5 items-stretch w-full">
          {/* LEFT COLUMN: ~35% width */}
          <div className="w-[35%] flex flex-col gap-3.5 sm:gap-4 lg:gap-5 justify-between shrink-0">
            {/* Choli Card (Exact Aspect 1098x1740) */}
            <Link
              to="/shop?category=choli"
              className="group relative w-full aspect-[1098/1740] rounded-2xl lg:rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-500 block isolate [transform:translateZ(0)] [mask-image:-webkit-radial-gradient(white,black)] cursor-pointer"
            >
              <img
                src="/images/home/Bento Grid/Choli.png"
                alt="Handmade Choli"
                className="w-full h-full object-cover object-center rounded-2xl lg:rounded-3xl group-hover:scale-104 transition-transform duration-700 ease-out will-change-transform pointer-events-none"
                loading="lazy"
              />
              <div className="absolute inset-0 rounded-2xl lg:rounded-3xl bg-black/0 group-hover:bg-black/8 transition-colors duration-300 pointer-events-none" />
            </Link>

            {/* Watch Card (Exact Aspect 826x832) */}
            <Link
              to="/shop?category=watch"
              className="group relative w-full aspect-[826/832] rounded-2xl lg:rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-500 block isolate [transform:translateZ(0)] [mask-image:-webkit-radial-gradient(white,black)] cursor-pointer"
            >
              <img
                src="/images/home/Bento Grid/Watch.png"
                alt="Handmade Watch"
                className="w-full h-full object-cover object-center rounded-2xl lg:rounded-3xl group-hover:scale-104 transition-transform duration-700 ease-out will-change-transform pointer-events-none"
                loading="lazy"
              />
              <div className="absolute inset-0 rounded-2xl lg:rounded-3xl bg-black/0 group-hover:bg-black/8 transition-colors duration-300 pointer-events-none" />
            </Link>
          </div>

          {/* RIGHT COLUMN: ~65% width */}
          <div className="w-[65%] flex flex-col gap-3.5 sm:gap-4 lg:gap-5 justify-between shrink-0">
            {/* Jewellery Card (Exact Aspect 1732x830) */}
            <Link
              to="/shop?category=necklace"
              className="group relative w-full aspect-[1732/830] rounded-2xl lg:rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-500 block isolate [transform:translateZ(0)] [mask-image:-webkit-radial-gradient(white,black)] cursor-pointer"
            >
              <img
                src="/images/home/Bento Grid/Jewellery.png"
                alt="Handmade Jewellery"
                className="w-full h-full object-cover object-center rounded-2xl lg:rounded-3xl group-hover:scale-104 transition-transform duration-700 ease-out will-change-transform pointer-events-none"
                loading="lazy"
              />
              <div className="absolute inset-0 rounded-2xl lg:rounded-3xl bg-black/0 group-hover:bg-black/8 transition-colors duration-300 pointer-events-none" />
            </Link>

            {/* Middle Row: Latkan & Tassel (Exact Aspects 826x830 each) */}
            <div className="grid grid-cols-2 gap-3.5 sm:gap-4 lg:gap-5">
              {/* Latkan */}
              <Link
                to="/shop?category=latkan"
                className="group relative w-full aspect-[826/830] rounded-2xl lg:rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-500 block isolate [transform:translateZ(0)] [mask-image:-webkit-radial-gradient(white,black)] cursor-pointer"
              >
                <img
                  src="/images/home/Bento Grid/Latkan.png"
                  alt="Handmade Latkan"
                  className="w-full h-full object-cover object-center rounded-2xl lg:rounded-3xl group-hover:scale-104 transition-transform duration-700 ease-out will-change-transform pointer-events-none"
                  loading="lazy"
                />
                <div className="absolute inset-0 rounded-2xl lg:rounded-3xl bg-black/0 group-hover:bg-black/8 transition-colors duration-300 pointer-events-none" />
              </Link>

              {/* Tassel */}
              <Link
                to="/shop?category=tassel"
                className="group relative w-full aspect-[826/830] rounded-2xl lg:rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-500 block isolate [transform:translateZ(0)] [mask-image:-webkit-radial-gradient(white,black)] cursor-pointer"
              >
                <img
                  src="/images/home/Bento Grid/Tassel.png"
                  alt="Handmade Tassel"
                  className="w-full h-full object-cover object-center rounded-2xl lg:rounded-3xl group-hover:scale-104 transition-transform duration-700 ease-out will-change-transform pointer-events-none"
                  loading="lazy"
                />
                <div className="absolute inset-0 rounded-2xl lg:rounded-3xl bg-black/0 group-hover:bg-black/8 transition-colors duration-300 pointer-events-none" />
              </Link>
            </div>

            {/* Hair Accessories Card (Exact Aspect 2004x832) */}
            <Link
              to="/shop?category=hair-accessories"
              className="group relative w-full aspect-[2004/832] rounded-2xl lg:rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-500 block isolate [transform:translateZ(0)] [mask-image:-webkit-radial-gradient(white,black)] cursor-pointer"
            >
              <img
                src="/images/home/Bento Grid/Hair Accessories.png"
                alt="Handmade Hair Accessories"
                className="w-full h-full object-cover object-center rounded-2xl lg:rounded-3xl group-hover:scale-104 transition-transform duration-700 ease-out will-change-transform pointer-events-none"
                loading="lazy"
              />
              <div className="absolute inset-0 rounded-2xl lg:rounded-3xl bg-black/0 group-hover:bg-black/8 transition-colors duration-300 pointer-events-none" />
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE VIEW: Exact Bento Grid matching reference image                   */}
        {/* ========================================================================= */}
        <div className="flex flex-col gap-2.5 sm:gap-3.5 md:hidden w-full">
          {/* Top Section: Choli (Left, ~62%) + Latkan & Tassel (Right, ~38%) */}
          <div className="grid grid-cols-[1.63fr_1fr] gap-2.5 sm:gap-3.5 items-stretch w-full">
            {/* Choli Card (Tall) */}
            <Link
              to="/shop?category=choli"
              className="group relative w-full h-full aspect-[1348/1740] rounded-xl sm:rounded-2xl overflow-hidden shadow-xs active:scale-[0.99] transition-all duration-300 block isolate [transform:translateZ(0)] [mask-image:-webkit-radial-gradient(white,black)] cursor-pointer"
            >
              <img
                src="/images/home/Bento Grid/mobile/Choli.png"
                alt="Handmade Choli"
                className="w-full h-full object-cover object-center rounded-xl sm:rounded-2xl pointer-events-none"
                loading="lazy"
              />
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-black/0 active:bg-black/8 transition-colors duration-200 pointer-events-none" />
            </Link>

            {/* Right Column: Latkan (Top) + Tassel (Bottom) */}
            <div className="flex flex-col gap-2.5 sm:gap-3.5 justify-between">
              {/* Latkan Card */}
              <Link
                to="/shop?category=latkan"
                className="group relative w-full aspect-[826/830] rounded-xl sm:rounded-2xl overflow-hidden shadow-xs active:scale-[0.99] transition-all duration-300 block isolate [transform:translateZ(0)] [mask-image:-webkit-radial-gradient(white,black)] cursor-pointer"
              >
                <img
                  src="/images/home/Bento Grid/mobile/Latkan.png"
                  alt="Handmade Latkan"
                  className="w-full h-full object-cover object-center rounded-xl sm:rounded-2xl pointer-events-none"
                  loading="lazy"
                />
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-black/0 active:bg-black/8 transition-colors duration-200 pointer-events-none" />
              </Link>

              {/* Tassel Card */}
              <Link
                to="/shop?category=tassel"
                className="group relative w-full aspect-[826/830] rounded-xl sm:rounded-2xl overflow-hidden shadow-xs active:scale-[0.99] transition-all duration-300 block isolate [transform:translateZ(0)] [mask-image:-webkit-radial-gradient(white,black)] cursor-pointer"
              >
                <img
                  src="/images/home/Bento Grid/mobile/Tassel.png"
                  alt="Handmade Tassel"
                  className="w-full h-full object-cover object-center rounded-xl sm:rounded-2xl pointer-events-none"
                  loading="lazy"
                />
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-black/0 active:bg-black/8 transition-colors duration-200 pointer-events-none" />
              </Link>
            </div>
          </div>

          {/* Middle Section: Watch (Left, ~38%) + Jewellery (Right, ~62%) */}
          <div className="grid grid-cols-[1fr_1.63fr] gap-2.5 sm:gap-3.5 items-stretch w-full">
            {/* Watch Card */}
            <Link
              to="/shop?category=watch"
              className="group relative w-full aspect-[826/832] rounded-xl sm:rounded-2xl overflow-hidden shadow-xs active:scale-[0.99] transition-all duration-300 block isolate [transform:translateZ(0)] [mask-image:-webkit-radial-gradient(white,black)] cursor-pointer"
            >
              <img
                src="/images/home/Bento Grid/mobile/Watch.png"
                alt="Handmade Watch"
                className="w-full h-full object-cover object-center rounded-xl sm:rounded-2xl pointer-events-none"
                loading="lazy"
              />
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-black/0 active:bg-black/8 transition-colors duration-200 pointer-events-none" />
            </Link>

            {/* Jewellery Card */}
            <Link
              to="/shop?category=necklace"
              className="group relative w-full aspect-[1348/830] rounded-xl sm:rounded-2xl overflow-hidden shadow-xs active:scale-[0.99] transition-all duration-300 block isolate [transform:translateZ(0)] [mask-image:-webkit-radial-gradient(white,black)] cursor-pointer"
            >
              <img
                src="/images/home/Bento Grid/mobile/Jewellery.png"
                alt="Handmade Jewellery"
                className="w-full h-full object-cover object-center rounded-xl sm:rounded-2xl pointer-events-none"
                loading="lazy"
              />
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-black/0 active:bg-black/8 transition-colors duration-200 pointer-events-none" />
            </Link>
          </div>

          {/* Bottom Section: Hair Accessories (Full Width) */}
          <Link
            to="/shop?category=hair-accessories"
            className="group relative w-full aspect-[2254/832] rounded-xl sm:rounded-2xl overflow-hidden shadow-xs active:scale-[0.99] transition-all duration-300 block isolate [transform:translateZ(0)] [mask-image:-webkit-radial-gradient(white,black)] cursor-pointer"
          >
            <img
              src="/images/home/Bento Grid/mobile/Hair Accessories.png"
              alt="Handmade Hair Accessories"
              className="w-full h-full object-cover object-center rounded-xl sm:rounded-2xl pointer-events-none"
              loading="lazy"
            />
            <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-black/0 active:bg-black/8 transition-colors duration-200 pointer-events-none" />
          </Link>
        </div>
      </div>
    </section>
  );
}
