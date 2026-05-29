import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="flex flex-col gap-6 py-6 sm:gap-8 sm:py-8">
      <section className="flex flex-col gap-3">
        <Skeleton className="h-9 w-60" />
        <Skeleton className="h-5 w-72 max-w-full" />
        <div className="h-1 w-16 bg-[#00c9c9]/20 rounded-full" />
      </section>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded-xl" />
        ))}
      </div>
    </main>
  );
}
