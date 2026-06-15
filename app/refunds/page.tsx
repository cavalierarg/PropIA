import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Política de Reembolsos — PropIA",
  description: "Conocé la garantía de satisfacción y cómo solicitar un reembolso en PropIA.",
};

export default function RefundsPage() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      <div className="max-w-3xl mx-auto px-5 py-14 sm:py-20">

        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        {/* Header */}
        <div className="mb-12">
          <span className="text-xs font-bold text-[#00c9c9] uppercase tracking-widest">Legal</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-3">
            Política de Reembolsos
          </h1>
          <p className="text-white/40 text-sm">Última actualización: junio de 2026</p>
        </div>

        <div className="space-y-10 text-[15px] leading-relaxed text-white/75">

          <section>
            <h2 className="text-lg font-bold text-white mb-3">1. Garantía de satisfacción</h2>
            <p>
              PropIA ofrece una garantía de reembolso de <strong className="text-white">7 días</strong> desde
              la fecha de pago. Si por cualquier motivo no estás satisfecho con el servicio, podés solicitar
              un reembolso completo dentro de ese período sin necesidad de justificación.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. Cómo solicitar un reembolso</h2>
            <p className="mb-3">
              Enviá un email a{" "}
              <a href="mailto:soporte@propia.online" className="text-[#00c9c9] hover:underline">
                soporte@propia.online
              </a>{" "}
              con el asunto <strong className="text-white">&quot;Solicitud de reembolso&quot;</strong> indicando
              tu nombre, email de registro y motivo opcional.
            </p>
            <ul className="space-y-2 pl-4">
              {[
                "Procesamos todos los reembolsos dentro de las 48 horas hábiles siguientes a la solicitud.",
                "El dinero se acredita en tu método de pago original dentro de 5 a 10 días hábiles dependiendo de tu banco.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#00c9c9] mt-1.5 shrink-0">·</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. Condiciones</h2>
            <ul className="space-y-2 pl-4">
              {[
                "El reembolso aplica únicamente a suscripciones pagadas en los últimos 7 días.",
                "No se aplica a períodos de suscripción ya utilizados más allá de los 7 días.",
                "Los usuarios del plan Free no requieren reembolso ya que el servicio es gratuito.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#00c9c9] mt-1.5 shrink-0">·</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">4. Contacto</h2>
            <p>
              Para cualquier consulta sobre reembolsos o pagos escribinos a{" "}
              <a href="mailto:soporte@propia.online" className="text-[#00c9c9] hover:underline">
                soporte@propia.online
              </a>.
            </p>
          </section>

        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row gap-4 text-sm text-white/30">
          <Link href="/privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link>
          <Link href="/terminos" className="hover:text-white transition-colors">Términos de uso</Link>
          <Link href="/" className="hover:text-white transition-colors">Volver a PropIA</Link>
        </div>

      </div>
    </div>
  );
}
