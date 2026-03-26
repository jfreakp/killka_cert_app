"use client";

import { Navbar } from "@/src/shared/ui";

export default function SettingsPage() {
  return (
    <>
      <Navbar title="Configuración" />

      <div className="pt-24 px-12 pb-12">
        <h1 className="text-5xl font-black text-on-surface font-headline tracking-tight mb-4">
          Configuración
        </h1>
        <p className="text-on-surface-variant text-lg leading-relaxed max-w-2xl mb-12">
          Administra las preferencias generales de la plataforma, integración blockchain y
          parámetros del tenant.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {[
            {
              icon: "apartment",
              title: "Institución",
              desc: "Nombre, logo y datos de la universidad.",
            },
            {
              icon: "link",
              title: "Blockchain",
              desc: "Configuración de red Polygon y contratos.",
            },
            {
              icon: "palette",
              title: "Apariencia",
              desc: "Tema, colores y personalización visual.",
            },
            {
              icon: "notifications",
              title: "Notificaciones",
              desc: "Alertas por email y eventos del sistema.",
            },
          ].map((item) => (
            <button
              key={item.title}
              className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm hover:shadow-md transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-container/30 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">{item.icon}</span>
              </div>
              <h3 className="font-bold text-lg mb-1">{item.title}</h3>
              <p className="text-sm text-on-surface-variant">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
