export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-card border border-border-light bg-bg-main">
      <div className="aspect-square animate-pulse bg-bg-alt" />
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-bg-alt" />
        <div className="h-3 w-full animate-pulse rounded bg-bg-alt" />
        <div className="mt-2 flex items-center justify-between">
          <div className="h-4 w-14 animate-pulse rounded bg-bg-alt" />
          <div className="h-9 w-9 animate-pulse rounded-full bg-bg-alt" />
        </div>
      </div>
    </div>
  );
}
