"use client";

export function Greeting({ firstName }: { firstName: string }) {
  const hour = new Date().getHours();
  const saludo = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";
  return <>{saludo}, {firstName}</>;
}
