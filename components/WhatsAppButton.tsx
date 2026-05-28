"use client";

import { trackEvent } from "@/lib/meta-pixel";

const WA_NUMBER = "5492944299692";
const WA_MESSAGE = encodeURIComponent(
  "Hola! Tengo una consulta sobre PropIA 👋"
);
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`;

export default function WhatsAppButton() {
  return (
    <a
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Consultar por WhatsApp"
      onClick={() => trackEvent("Contact", { method: "WhatsApp" })}
      className="fixed bottom-6 right-6 z-[100] flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-transform hover:scale-110 active:scale-95"
      style={{ background: "#25D366" }}
    >
      {/* WhatsApp SVG oficial */}
      <svg
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
        className="w-7 h-7"
        fill="white"
      >
        <path d="M16.003 2.667C8.637 2.667 2.667 8.637 2.667 16c0 2.358.633 4.663 1.833 6.68L2.667 29.333l6.84-1.793A13.28 13.28 0 0 0 16.003 29.333c7.363 0 13.33-5.97 13.33-13.333 0-7.363-5.967-13.333-13.33-13.333zm0 24.267a11.03 11.03 0 0 1-5.63-1.543l-.403-.24-4.063 1.063 1.083-3.957-.263-.41A10.987 10.987 0 0 1 5.003 16c0-6.07 4.93-11 11-11 6.073 0 11 4.93 11 11 0 6.073-4.927 11-11 11zm6.04-8.243c-.33-.167-1.953-.963-2.257-1.073-.303-.11-.523-.167-.743.167-.22.333-.853 1.073-.047 1.407.807.333 1.643.557 2.447.557.273 0 .537-.027.793-.083-.16.123-.47.177-.793.177-.617 0-1.273-.15-1.887-.45-.193-.097-.41-.113-.62-.053-.207.06-.38.19-.483.373l-.053.097c-.103.187-.11.407-.017.6.093.193.267.34.477.41.657.22 1.347.333 2.04.333 2.15 0 3.903-1.753 3.903-3.907 0-2.153-1.753-3.907-3.903-3.907-.54 0-1.07.107-1.567.317-.497.21-.94.517-1.313.9l-.3.317c-.08.083-.133.187-.157.297-.023.11-.01.223.04.323l.05.1c.13.26.41.41.697.38.183-.02.36-.103.493-.237l.3-.317c.25-.263.547-.473.877-.617.33-.143.683-.217 1.04-.217 1.38 0 2.5 1.12 2.5 2.5 0 .357-.073.7-.217 1.02z" />
      </svg>
    </a>
  );
}
