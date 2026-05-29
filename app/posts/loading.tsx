import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="flex flex-col gap-6 py-6 sm:gap-8 sm:py-8">
      <section className="flex flex-col gap-3">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-5 w-96 max-w-full" />
        <div className="h-1 w-16 bg-[#00c9c9]/20 rounded-full" />
      </section>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-12 w-36 rounded-lg" />
      </div>
    </main>
  );
}
