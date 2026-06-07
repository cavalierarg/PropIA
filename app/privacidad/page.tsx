import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Política de Privacidad — PropIA",
  description: "Conocé cómo PropIA recopila, usa y protege tus datos.",
};

export default function PrivacidadPage() {
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
            Política de Privacidad
          </h1>
          <p className="text-white/40 text-sm">Última actualización: junio de 2026</p>
        </div>

        <div className="space-y-10 text-[15px] leading-relaxed text-white/75">

          <section>
            <h2 className="text-lg font-bold text-white mb-3">1. ¿Quién somos?</h2>
            <p>
              PropIA es una plataforma SaaS de marketing inmobiliario basada en inteligencia artificial,
              diseñada para agentes inmobiliarios hispanohablantes. Operamos bajo la marca <strong className="text-white">PropIA</strong> y
              podés contactarnos en{" "}
              <a href="mailto:cavalierarg@gmail.com" className="text-[#00c9c9] hover:underline">
                cavalierarg@gmail.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. Qué datos recopilamos</h2>
            <p className="mb-3">Al usar PropIA, podemos recopilar los siguientes datos:</p>
            <ul className="space-y-2 pl-4">
              {[
                "Nombre y dirección de email (al registrarte con Clerk)",
                "Datos de tus propiedades (tipo, ubicación, precio, características, fotos)",
                "Información de tu perfil de agente (nombre comercial, zona, logo, tono de voz)",
                "Datos de uso de la aplicación (herramientas utilizadas, generaciones realizadas)",
                "Datos de suscripción y pagos gestionados por Lemon Squeezy (no almacenamos tarjetas)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#00c9c9] mt-1.5 shrink-0">·</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. Para qué usamos tus datos</h2>
            <p className="mb-3">Tus datos se usan exclusivamente para:</p>
            <ul className="space-y-2 pl-4">
              {[
                "Generar contenido personalizado con IA (posts, reels, ads, carruseles) usando los datos de tus propiedades y tu perfil de agente",
                "Brindarte acceso a tu historial de propiedades y contenido generado",
                "Procesar tu suscripción y gestionar tu plan (Free, Pro o Pro Max)",
                "Enviarte comunicaciones relacionadas con tu cuenta o el servicio",
                "Mejorar la calidad de los prompts y la experiencia de la plataforma",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#00c9c9] mt-1.5 shrink-0">·</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">4. No vendemos tus datos</h2>
            <p>
              PropIA <strong className="text-white">no vende, alquila ni comparte</strong> tu información personal
              con terceros con fines publicitarios o comerciales. Tus datos de propiedades y contenido generado
              son exclusivamente tuyos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">5. Proveedores de servicio</h2>
            <p className="mb-3">
              Para operar el servicio utilizamos los siguientes proveedores, cada uno con sus propias políticas de privacidad:
            </p>
            <ul className="space-y-2 pl-4">
              {[
                "Clerk — autenticación e identidad de usuarios",
                "Supabase — almacenamiento de datos y archivos",
                "Anthropic — modelo de IA para generación de contenido (los prompts incluyen los datos de tu propiedad)",
                "Lemon Squeezy — procesamiento de pagos y suscripciones",
                "Vercel — infraestructura y hosting",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#00c9c9] mt-1.5 shrink-0">·</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">6. Retención de datos</h2>
            <p>
              Conservamos tus datos mientras tu cuenta esté activa. Si cancelás tu suscripción y eliminás
              tu cuenta, tus datos serán eliminados de nuestros servidores en un plazo de 30 días, salvo
              obligación legal de conservarlos por más tiempo.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">7. Tus derechos</h2>
            <p className="mb-3">Tenés derecho a:</p>
            <ul className="space-y-2 pl-4">
              {[
                "Acceder a los datos que tenemos sobre vos",
                "Solicitar la corrección de datos incorrectos",
                "Solicitar la eliminación de tu cuenta y datos",
                "Oponerte al procesamiento de tus datos",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#00c9c9] mt-1.5 shrink-0">·</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3">
              Para ejercer cualquiera de estos derechos, escribinos a{" "}
              <a href="mailto:cavalierarg@gmail.com" className="text-[#00c9c9] hover:underline">
                cavalierarg@gmail.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">8. Cambios a esta política</h2>
            <p>
              Podemos actualizar esta política ocasionalmente. Te notificaremos por email ante cambios
              significativos. El uso continuado de PropIA después de los cambios implica la aceptación
              de la nueva política.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">9. Contacto</h2>
            <p>
              Si tenés preguntas sobre esta política de privacidad, escribinos a{" "}
              <a href="mailto:cavalierarg@gmail.com" className="text-[#00c9c9] hover:underline">
                cavalierarg@gmail.com
              </a>.
            </p>
          </section>

        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row gap-4 text-sm text-white/30">
          <Link href="/terminos" className="hover:text-white transition-colors">Términos de uso</Link>
          <Link href="/" className="hover:text-white transition-colors">Volver a PropIA</Link>
        </div>

      </div>
    </div>
  );
}
