import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col space-y-3 animate-pulse">
      <div className="w-full aspect-[3/4] bg-neutral-100 rounded-2xl overflow-hidden" />
      <div className="space-y-1.5 px-1">
        <div className="h-3 w-1/3 bg-neutral-200 rounded" />
        <div className="h-4 w-3/4 bg-neutral-200 rounded" />
        <div className="flex items-center gap-2 pt-1">
          <div className="h-4 w-16 bg-neutral-200 rounded" />
          <div className="h-3 w-12 bg-neutral-100 rounded" />
        </div>
      </div>
    </div>
  );
};

export const ShopGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const ProductDetailsSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Gallery skeleton */}
        <div className="lg:col-span-7 flex flex-col sm:flex-row gap-4">
          <div className="hidden sm:flex flex-col gap-3 w-20">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-20 h-24 bg-neutral-100 rounded-xl" />
            ))}
          </div>
          <div className="flex-1 aspect-[3/4] bg-neutral-100 rounded-2xl" />
        </div>

        {/* Details skeleton */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-neutral-200 rounded" />
            <div className="h-8 w-4/5 bg-neutral-200 rounded" />
            <div className="h-4 w-1/2 bg-neutral-100 rounded" />
          </div>

          <div className="h-8 w-32 bg-neutral-200 rounded" />

          <div className="space-y-3 pt-4 border-t border-neutral-100">
            <div className="h-4 w-20 bg-neutral-200 rounded" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-neutral-200" />
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-neutral-100">
            <div className="h-4 w-20 bg-neutral-200 rounded" />
            <div className="flex gap-2">
              {['S', 'M', 'L', 'XL'].map((s) => (
                <div key={s} className="w-12 h-10 rounded-xl bg-neutral-100" />
              ))}
            </div>
          </div>

          <div className="pt-6 space-y-3">
            <div className="h-12 w-full bg-neutral-900/20 rounded-2xl" />
            <div className="h-12 w-full bg-neutral-100 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const CategoryCardSkeleton: React.FC = () => {
  return (
    <div className="shrink-0 w-[calc((100vw-32px)/3.5)] sm:w-[calc((100vw-48px)/4.5)] lg:w-[calc((min(1500px,100vw)-48px)/5.5)] animate-pulse">
      <div className="flex flex-col items-center text-center">
        {/* Square Image Box Skeleton */}
        <div className="relative aspect-square w-full rounded-2xl sm:rounded-3xl bg-neutral-200/80 border border-[#EDE5DA]/70 shadow-xs overflow-hidden" />

        {/* Clean Category Title Skeleton */}
        <div className="mt-2 sm:mt-2.5 h-3 sm:h-3.5 w-14 sm:w-20 bg-neutral-200/80 rounded-md" />
      </div>
    </div>
  );
};

export const FeaturedCategoriesSkeleton: React.FC<{ itemsPerRow?: number }> = ({ itemsPerRow = 6 }) => {
  return (
    <div className="space-y-3.5 sm:space-y-5 md:space-y-6 pb-2">
      {/* Row 1 */}
      <div className="flex gap-2.5 sm:gap-4 md:gap-5 flex-nowrap w-max px-4 sm:px-6">
        {Array.from({ length: itemsPerRow }).map((_, i) => (
          <CategoryCardSkeleton key={`cat-skel-1-${i}`} />
        ))}
      </div>
      {/* Row 2 */}
      <div className="flex gap-2.5 sm:gap-4 md:gap-5 flex-nowrap w-max px-4 sm:px-6">
        {Array.from({ length: itemsPerRow }).map((_, i) => (
          <CategoryCardSkeleton key={`cat-skel-2-${i}`} />
        ))}
      </div>
    </div>
  );
};

export const ShopProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 p-2 overflow-hidden shadow-2xs flex flex-col justify-between space-y-3 animate-pulse">
      {/* Product Image Frame */}
      <div className="relative aspect-square bg-zinc-200/70 rounded-xl overflow-hidden" />
      {/* Title, Category & Price */}
      <div className="space-y-2 p-1">
        <div className="h-4 bg-zinc-200/80 rounded w-4/5" />
        <div className="h-3 bg-zinc-100 rounded w-2/5" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-4 bg-zinc-200/90 rounded w-1/3" />
          <div className="h-3 bg-zinc-100 rounded w-1/4" />
        </div>
      </div>
      {/* Action Button */}
      <div className="h-9 bg-zinc-200/70 rounded-xl w-full" />
    </div>
  );
};

export const ShopCategoryItemSkeleton: React.FC = () => {
  return (
    <div className="shrink-0 w-[calc(100%/3)] sm:w-[calc(100%/5)] lg:w-[calc(100%/6)] xl:w-[calc(100%/8)] px-1.5 sm:px-2 md:px-3 text-center animate-pulse">
      <div className="flex flex-col items-center justify-between w-full h-full py-2">
        <div className="w-[76px] h-[76px] min-[400px]:w-[84px] min-[400px]:h-[84px] sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 aspect-square rounded-2xl bg-zinc-200/80 p-0.5 shadow-sm" />
      </div>
    </div>
  );
};


