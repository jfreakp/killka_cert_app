import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-white text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      {/* ── Top Navigation Bar ── */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.05)] transition-all duration-300">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <div className="text-2xl font-black tracking-tighter text-primary font-headline">KillkaCert</div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#benefits" className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors duration-300">Beneficios</a>
            <a href="#security" className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors duration-300">Seguridad</a>
            <a href="#how-it-works" className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors duration-300">Cómo funciona</a>
            <a href="#cta" className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors duration-300">Instituciones</a>
          </div>
          <Link
            href="/login"
            className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:opacity-90 transition-all duration-200 active:scale-95"
          >
            Iniciar sesión
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <header className="relative pt-32 pb-20 md:pt-48 md:pb-40 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-accent-turquoise/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />

        <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Powered by Polygon Network
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight text-on-surface font-headline">
              La Nueva Era de la{" "}
              <span className="text-accent-turquoise italic">Autoridad Académica</span>
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant max-w-lg leading-relaxed font-medium">
              Sistema avanzado para la emisión de certificados digitales inmutables, soberanos y universalmente verificables.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:translate-y-[-2px] transition-all text-center"
              >
                Comenzar Ahora
              </Link>
              <Link
                href="/verify"
                className="px-8 py-4 bg-surface-container text-primary font-bold rounded-xl border border-primary/10 hover:bg-surface-container-high transition-all flex items-center justify-center gap-2"
              >
                Verificar Certificado
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl rotate-3 bg-surface-container-lowest ring-1 ring-black/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiLORPAiqwu1Go72UIfboqqlfkk1rSB51POl8hO9UQStdYmbb9fu4RwPePgNOJuHaQI9_IJy3ZnldBQ3XGKcX-0LDtom2g8hzevCEMPxRMMYRBE6seF_ue8bQNO2gLFlijCkQIE0BH6SH84PrtaOiFgIyEmzigwj54RFkhPD1dwwwtr0-zZ2ph0GV3LK3Kd4oQCFqK4-MdQJHqI-eoDfyaKoN3jAnzB6W6-jdapIrQz1FMgpIS3-p5xIrNjYDgky_X5ExmwNylQadp"
                alt="Representación abstracta de seguridad blockchain"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-6 glass-panel p-6 rounded-2xl shadow-xl border border-black/5 max-w-[240px]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter">Certificado ID</p>
                  <p className="text-sm font-mono font-bold text-on-surface">0x82...f4e2</p>
                </div>
              </div>
              <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-accent-turquoise" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── ¿Qué es KillkaCert? / Security ── */}
      <section id="security" className="py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-8 text-on-surface font-headline">
                Confianza que no puede ser alterada
              </h2>
              <div className="space-y-6 text-on-surface-variant text-lg leading-relaxed">
                <p>
                  KillkaCert utiliza la tecnología{" "}
                  <strong className="text-on-surface font-bold">blockchain de Polygon</strong> para
                  crear un registro permanente y público de cada título emitido. Una vez que un
                  certificado es &quot;minteado&quot; en la red, se vuelve una verdad inmutable.
                </p>
                <p>
                  A diferencia de los diplomas en papel o PDF tradicionales, nuestros certificados
                  son imposibles de falsificar, eliminando por completo el fraude académico y
                  simplificando el proceso de verificación para empleadores y reguladores.
                </p>
              </div>
            </div>
            <div className="order-1 md:order-2 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-video bg-white border border-black/5 rounded-2xl p-6 flex flex-col justify-end shadow-sm">
                  <span className="text-3xl font-bold text-accent-turquoise">0%</span>
                  <span className="text-xs font-bold uppercase text-on-surface-variant">Posibilidad de fraude</span>
                </div>
                <div className="aspect-square bg-accent-turquoise/10 border border-accent-turquoise/20 rounded-2xl p-6">
                  <span className="material-symbols-outlined text-4xl text-primary mb-4">security</span>
                  <p className="font-bold text-primary">Criptografía de Grado Militar</p>
                </div>
              </div>
              <div className="pt-8 space-y-4">
                <div className="aspect-square bg-white border border-black/5 rounded-2xl overflow-hidden shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSuIS2hiaXUGzIjQi_GrHOnKCsTw94dTonAwCCPWb6qHZvx6VuDQqpV7W_-eLarIB-m3OYx8Wf0C18lL5KqbtzL_7myT60Oj-bPmazL1R0Rd40PhQrMQhynSOzGvj7gMscMtIw_Yj9o-MK1xSXG8yEXuX9U3CXXJz6C9dlYK1Ijce0jubf6zgybUEQBKhYp-VEZRwbr9ZcxH7sTMXzmX6oDAa96YYov2fW6ipF_kP0V7Nf6WE9e6L6WE7NEj9uqq-0_ObxxF4-C_y6"
                    alt="Patrón tecnológico"
                    className="w-full h-full object-cover opacity-80"
                  />
                </div>
                <div className="aspect-video bg-white rounded-2xl p-6 shadow-sm border border-black/5">
                  <p className="text-xs font-bold text-on-surface-variant uppercase mb-2">Respaldo</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-xs">P</span>
                    </div>
                    <span className="font-bold text-on-surface">Polygon Mainnet</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Beneficios Section ── */}
      <section id="benefits" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-on-surface font-headline">
              Beneficios para Instituciones
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
              Optimice sus procesos administrativos con herramientas diseñadas para la era digital.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group bg-surface-container hover:bg-white hover:shadow-xl hover:shadow-primary/5 p-10 rounded-[2rem] transition-all duration-300 border border-transparent hover:border-primary/10">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">shield_person</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-on-surface">Seguridad Total</h3>
              <p className="text-on-surface-variant leading-relaxed">
                Protección absoluta contra duplicaciones. Cada certificado posee un hash único verificable en la cadena de bloques.
              </p>
            </div>
            {/* Card 2 */}
            <div className="group bg-surface-container hover:bg-white hover:shadow-xl hover:shadow-primary/5 p-10 rounded-[2rem] transition-all duration-300 border border-transparent hover:border-primary/10">
              <div className="w-16 h-16 bg-accent-turquoise/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">grid_view</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-on-surface">Gestión Eficiente</h3>
              <p className="text-on-surface-variant leading-relaxed">
                Emisión masiva en segundos. Simplemente cargue su base de datos Excel y nuestro sistema se encarga del resto.
              </p>
            </div>
            {/* Card 3 */}
            <div className="group bg-surface-container hover:bg-white hover:shadow-xl hover:shadow-primary/5 p-10 rounded-[2rem] transition-all duration-300 border border-transparent hover:border-primary/10">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">speed</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-on-surface">Verificación Instantánea</h3>
              <p className="text-on-surface-variant leading-relaxed">
                Escaneo QR o enlace directo. Cualquier tercero puede validar la autenticidad del título sin burocracia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Cómo Funciona ── */}
      <section id="how-it-works" className="py-24 bg-inverse-surface text-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-black mb-6 font-headline">Proceso de Tres Pasos</h2>
              <p className="text-white/70 text-lg">
                Del papel a la inmutabilidad digital en una jornada fluida y automatizada.
              </p>
            </div>
            <div className="hidden md:block pb-2">
              <div className="flex gap-4">
                <div className="w-12 h-1 bg-accent-turquoise" />
                <div className="w-12 h-1 bg-white/20" />
                <div className="w-12 h-1 bg-white/20" />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-10 left-0 w-full h-[2px] bg-white/10 -z-0" />

            {/* Step 1 */}
            <div className="relative z-10 space-y-6">
              <div className="w-20 h-20 rounded-full bg-accent-turquoise text-on-surface flex items-center justify-center text-3xl font-black">
                01
              </div>
              <h4 className="text-2xl font-bold">Carga de Estudiantes</h4>
              <p className="text-white/60">
                Importe los datos de sus egresados mediante nuestra interfaz intuitiva o integración API directa.
              </p>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-accent-turquoise">upload_file</span>
                  <span className="text-sm font-mono">alumnos_promo_2024.xlsx</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 space-y-6 md:mt-24">
              <div className="w-20 h-20 rounded-full bg-white text-on-surface flex items-center justify-center text-3xl font-black">
                02
              </div>
              <h4 className="text-2xl font-bold">Proceso de Minteo</h4>
              <p className="text-white/60">
                Nuestra plataforma genera los Smart Contracts y ancla cada diploma en la red Polygon de forma automática.
              </p>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-accent-turquoise animate-pulse" />
                  <span className="text-xs font-mono uppercase">Procesando Bloque...</span>
                </div>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-accent-turquoise w-2/3" />
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 space-y-6">
              <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-black">
                03
              </div>
              <h4 className="text-2xl font-bold">Verificación Pública</h4>
              <p className="text-white/60">
                Los alumnos reciben su credencial digital única, lista para ser compartida en LinkedIn o verificada por QR.
              </p>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex justify-center">
                <div className="w-16 h-16 bg-white p-1 rounded-lg">
                  <div className="w-full h-full bg-on-surface rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section id="cta" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-8">
          <div className="bg-primary/5 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden border border-primary/10">
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAAdT7TLDcmbY9a3_xDfXh2lLSgDM67mU9t2cidW4cTwYCDJofS5q6bJzWjcTtkViXSo3daayuxEHQ7Bidmt-R2ulow3SLAsDrR5HU7NKVFq0-Fa6SzGrYcyYAyoMw3a76M7RPi14l2nDdASnTP0Hk-VkInqZ6gPEXvz6o9EF__xvljlrTWO96XcwFIdDZhNFs6ps0jBY29hFYNGDSpLZuDrNQsZ90ytUQjxzEG8TxWIoeJzLQyGQpLEzuE8BhH0FE_Exl3zam2tzi"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-on-surface mb-8 relative z-10 font-headline">
              ¿Listo para transformar su institución?
            </h2>
            <p className="text-on-surface-variant text-lg md:text-xl mb-12 max-w-2xl mx-auto relative z-10">
              Únase a las organizaciones que ya confían en la inmutabilidad de KillkaCert.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link
                href="/login"
                className="px-10 py-5 bg-primary text-white font-black rounded-2xl hover:scale-105 transition-transform shadow-xl shadow-primary/20"
              >
                Solicitar una Demo
              </Link>
              <Link
                href="/verify"
                className="px-10 py-5 bg-white border-2 border-primary/20 text-primary font-black rounded-2xl hover:bg-primary/5 transition-colors"
              >
                Verificar Certificado
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="w-full border-t border-black/5 bg-inverse-surface py-12">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 w-full max-w-7xl mx-auto gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="text-xl font-black text-accent-turquoise tracking-tighter font-headline">KillkaCert</div>
            <p className="text-sm text-white/50">© 2025 KillkaCert. Secured by Polygon.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#" className="text-sm text-white/70 hover:text-accent-turquoise transition-colors">Política de Privacidad</a>
            <a href="#" className="text-sm text-white/70 hover:text-accent-turquoise transition-colors">Términos de Servicio</a>
            <a href="#" className="text-sm text-white/70 hover:text-accent-turquoise transition-colors">Documentación</a>
            <a href="#" className="text-sm text-white/70 hover:text-accent-turquoise transition-colors">Soporte</a>
          </div>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-accent-turquoise hover:text-on-surface transition-all">
              <span className="material-symbols-outlined text-xl">share</span>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-accent-turquoise hover:text-on-surface transition-all">
              <span className="material-symbols-outlined text-xl">public</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
