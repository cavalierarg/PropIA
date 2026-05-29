import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HomeIcon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="flex flex-col items-center gap-6 text-center px-4">
        <div className="flex flex-col items-center gap-2">
          <span className="text-8xl font-black text-[#0f3460]">404</span>
          <div className="h-1 w-16 bg-[#00c9c9] rounded-full" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-[#0f3460]">Página no encontrada</h1>
          <p className="text-muted-foreground max-w-sm">
            La página que buscás no existe o fue movida.
          </p>
        </div>
        <Button asChild className="bg-[#0f3460] hover:bg-[#0f3460]/90 text-white h-11 px-6">
          <Link href="/" className="flex items-center gap-2">
            <HomeIcon className="w-4 h-4" />
            Volver al inicio
          </Link>
        </Button>
      </div>
    </div>
  );
}
