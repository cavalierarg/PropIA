import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Términos de Uso — PropIA",
  description: "Condiciones de uso, planes y pagos de PropIA.",
};

export default function TerminosPage() {
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
            Términos de Uso
          </h1>
          <p className="text-white/40 text-sm">Última actualización: junio de 2026</p>
        </div>

        <div className="space-y-10 text-[15px] leading-relaxed text-white/75">

          <section>
            <h2 className="text-lg font-bold text-white mb-3">1. ¿Qué es PropIA?</h2>
            <p>
              PropIA es una plataforma de marketing inmobiliario asistida por inteligencia artificial.
              Permite a agentes inmobiliarios hispanohablantes generar contenido profesional para redes
              sociales, portales y publicidad — incluyendo posts, guiones para Reels, descripciones de
              propiedades, calendarios de contenido, ads para Meta Ads y carruseles de Instagram — a
              partir de los datos de sus propiedades.
            </p>
            <p className="mt-3">
              Al registrarte y usar PropIA, aceptás estos términos en su totalidad.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. Condiciones de uso</h2>
            <ul className="space-y-2 pl-4">
              {[
                "Debés tener al menos 18 años para usar PropIA.",
                "Sos responsable de la exactitud de los datos de propiedades que cargás en la plataforma.",
                "No podés usar PropIA para generar contenido falso, engañoso o que viole leyes locales.",
                "Una cuenta es personal e intransferible. No podés compartir tu acceso con terceros.",
                "Nos reservamos el derecho de suspender cuentas que violen estos términos.",
                "El contenido generado con IA es una herramienta de asistencia. Sos responsable de revisar y aprobar todo el contenido antes de publicarlo.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#00c9c9] mt-1.5 shrink-0">·</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. Planes y pagos</h2>
            <p className="mb-4">PropIA ofrece tres planes:</p>

            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="font-bold text-white">Plan Free</p>
                <p className="text-sm mt-1">5 generaciones mensuales de posts. Sin costo, sin tarjeta de crédito requerida.</p>
              </div>
              <div className="rounded-xl border border-[#00c9c9]/20 bg-[#00c9c9]/5 p-4">
                <p className="font-bold text-white">Plan Pro — $29 USD/mes</p>
                <p className="text-sm mt-1">Generaciones ilimitadas + Calendario de contenido + Descripciones para portal + Guiones para Reels + Tendencias del mercado + Generador de Ads básico.</p>
              </div>
              <div className="rounded-xl border border-[#f59e0b]/20 bg-[#f59e0b]/5 p-4">
                <p className="font-bold text-white">Plan Pro Max — $59 USD/mes</p>
                <p className="text-sm mt-1">Todo el Plan Pro + Generador de Ads avanzado (3 fotos) + Carruseles de Instagram.</p>
              </div>
            </div>

            <p className="mt-4">
              Los pagos se procesan a través de{" "}
              <strong className="text-white">Lemon Squeezy</strong>, plataforma certificada de procesamiento
              de pagos. PropIA no almacena datos de tarjetas de crédito.
            </p>
            <p className="mt-3">
              Las suscripciones se renuevan automáticamente cada mes hasta que las cancelés. Los precios
              están expresados en dólares estadounidenses (USD) e incluyen todos los impuestos aplicables.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">4. Cancelación</h2>
            <p>
              Podés cancelar tu suscripción en cualquier momento desde tu cuenta en Lemon Squeezy, sin
              penalidades ni cargos adicionales. Al cancelar:
            </p>
            <ul className="space-y-2 pl-4 mt-3">
              {[
                "Tu plan sigue activo hasta el final del período ya pagado.",
                "No realizamos reembolsos por períodos parciales, salvo casos especiales evaluados individualmente.",
                "Ofrecemos garantía de devolución de 7 días desde la primera suscripción — si no quedás conforme, escribinos.",
                "Después de la cancelación, tu cuenta pasa al plan Free automáticamente.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#00c9c9] mt-1.5 shrink-0">·</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3">
              Para solicitar un reembolso dentro de los 7 días, escribinos a{" "}
              <a href="mailto:cavalierarg@gmail.com" className="text-[#00c9c9] hover:underline">
                cavalierarg@gmail.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">5. Propiedad intelectual</h2>
            <p>
              El código, diseño y marca de PropIA son propiedad de sus creadores. El contenido generado
              por la IA a partir de <em>tus datos de propiedad</em> es tuyo para usar libremente —
              publicarlo, modificarlo o compartirlo según consideres conveniente.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">6. Disponibilidad del servicio</h2>
            <p>
              Nos esforzamos por mantener PropIA disponible 24/7, pero no garantizamos disponibilidad
              ininterrumpida. Podemos realizar mantenimientos programados o no programados. En caso de
              interrupciones prolongadas, lo comunicaremos por email.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">7. Limitación de responsabilidad</h2>
            <p className="mb-3">PropIA se provee "tal como está". No nos responsabilizamos por:</p>
            <ul className="space-y-2 pl-4">
              {[
                "El rendimiento de los ads o publicaciones generadas con la plataforma.",
                "Inexactitudes en el contenido generado por la IA — siempre revisá antes de publicar.",
                "Cambios en las políticas de Meta Ads, Instagram u otras plataformas que afecten la publicación del contenido.",
                "Pérdida de datos por causas fuera de nuestro control (fallos de proveedores, fuerza mayor).",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#00c9c9] mt-1.5 shrink-0">·</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3">
              En ningún caso la responsabilidad total de PropIA superará el monto que hayas pagado en
              los últimos 3 meses de suscripción.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">8. Cambios a los términos</h2>
            <p>
              Podemos modificar estos términos con previo aviso de 15 días por email. Si continuás
              usando PropIA después de los cambios, se entiende que los aceptás. Si no estás de acuerdo,
              podés cancelar tu suscripción antes de que entren en vigencia.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">9. Ley aplicable</h2>
            <p>
              Estos términos se rigen por las leyes de la República Argentina. Cualquier disputa se
              resolverá en los tribunales competentes de la Ciudad Autónoma de Buenos Aires.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">10. Contacto</h2>
            <p>
              Consultas sobre estos términos:{" "}
              <a href="mailto:cavalierarg@gmail.com" className="text-[#00c9c9] hover:underline">
                cavalierarg@gmail.com
              </a>
            </p>
          </section>

        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row gap-4 text-sm text-white/30">
          <Link href="/privacidad" className="hover:text-white transition-colors">Política de privacidad</Link>
          <Link href="/" className="hover:text-white transition-colors">Volver a PropIA</Link>
        </div>

      </div>
    </div>
  );
}
