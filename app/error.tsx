"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCwIcon } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-center px-4">
        <div className="flex flex-col items-center gap-2">
          <span className="text-6xl font-black text-[#0f3460]">Ups</span>
          <div className="h-1 w-16 bg-[#00c9c9] rounded-full" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-[#0f3460]">Algo salió mal</h2>
          <p className="text-muted-foreground max-w-sm">
            Ocurrió un error inesperado. Intentá de nuevo o contactanos si el problema persiste.
          </p>
        </div>
        <Button
          onClick={reset}
          className="bg-[#0f3460] hover:bg-[#0f3460]/90 text-white h-11 px-6"
        >
          <RefreshCwIcon className="w-4 h-4 mr-2" />
          Intentar de nuevo
        </Button>
      </div>
    </div>
  );
}
