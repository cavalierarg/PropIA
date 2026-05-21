import { Skeleton } from "@/components/ui/skeleton";

const COLORES_PLACEHOLDER = [
  "bg-gradient-to-r from-purple-400 to-pink-400",
  "bg-blue-500",
  "bg-gradient-to-r from-purple-400 to-pink-400",
  "bg-blue-500",
  "bg-sky-600",
];

export default function PostsSkeleton() {
  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-1 w-16 rounded-full" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-5">
        {COLORES_PLACEHOLDER.map((color, i) => (
          <div
            key={i}
            className="border border-slate-100 rounded-xl overflow-hidden shadow-sm"
          >
            <div className={`${color} opacity-40 h-10 w-full`} />
            <div className="p-4 flex flex-col gap-4 bg-white">
              <div className="flex flex-col gap-2.5">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Skeleton className="h-10 w-28 self-end rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
