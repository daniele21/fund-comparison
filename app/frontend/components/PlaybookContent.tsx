import React from 'react';
import { AnimatedButton } from './animations/AnimatedButton';

type PlaybookContentProps = {
  onNavigate?: (section: 'have-fund' | 'choose-fund' | 'learn') => void;
};

const InfoCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  accent: 'emerald' | 'rose' | 'sky' | 'slate';
}> = ({ title, icon, children, accent }) => {
  const accentColors = {
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
      border: 'border-emerald-200 dark:border-emerald-800',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900',
      iconText: 'text-emerald-600 dark:text-emerald-400',
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/50',
      border: 'border-rose-200 dark:border-rose-800',
      iconBg: 'bg-rose-100 dark:bg-rose-900',
      iconText: 'text-rose-600 dark:text-rose-400',
    },
    sky: {
      bg: 'bg-sky-50 dark:bg-sky-950/50',
      border: 'border-sky-200 dark:border-sky-800',
      iconBg: 'bg-sky-100 dark:bg-sky-900',
      iconText: 'text-sky-600 dark:text-sky-400',
    },
    slate: {
      bg: 'bg-white dark:bg-slate-800/50',
      border: 'border-slate-200 dark:border-slate-700',
      iconBg: 'bg-slate-100 dark:bg-slate-700',
      iconText: 'text-slate-600 dark:text-slate-400',
    },
  };
  const colors = accentColors[accent];

  return (
    <div className={`p-4 sm:p-5 md:p-6 rounded-xl border ${colors.border} ${colors.bg} h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5`}>
      <div className={`w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 rounded-xl flex items-center justify-center ${colors.iconBg} ${colors.iconText} shadow-sm`}>
        {icon}
      </div>
      <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 sm:mb-3 text-base sm:text-lg leading-tight">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{children}</p>
    </div>
  );
};

const PlaybookContent: React.FC<PlaybookContentProps> = ({ onNavigate }) => {
  return (
    <div className="relative px-2 sm:px-4 md:px-6 lg:px-0">
      <div className="space-y-16 sm:space-y-20 lg:space-y-24">
        <section className="pt-4">
          <div className="text-center max-w-2xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">Perché è una scelta intelligente</h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg leading-7 sm:leading-8 text-slate-600 dark:text-slate-300">I vantaggi chiave che rendono la pensione integrativa un potente strumento finanziario.</p>
          </div>
          <div className="mt-8 sm:mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <InfoCard title="Deducibilità Fiscale" accent="emerald" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}>
              Deduci fino a 5.164,57€ all&apos;anno dal tuo reddito imponibile. Questo significa pagare meno tasse oggi, un risparmio tangibile che aumenta il beneficio netto del tuo investimento.
            </InfoCard>
            <InfoCard title="Contributo del Datore di Lavoro" accent="emerald" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}>
              Aderendo a un fondo negoziale (FPN) e versando un tuo contributo, hai diritto a un versamento aggiuntivo da parte del tuo datore di lavoro. Sono soldi &quot;gratis&quot; che accelerano la crescita del tuo capitale.
            </InfoCard>
            <InfoCard title="Tassazione Agevolata sui Rendimenti" accent="emerald" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>}>
              I rendimenti sono tassati al 20% (con ulteriori agevolazioni per i Titoli di Stato), anziché al 26% standard della maggior parte degli altri strumenti finanziari. Più guadagno netto per te.
            </InfoCard>
            <InfoCard title="Il Potere dell'Interesse Composto" accent="emerald" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>}>
              I rendimenti guadagnati ogni anno vengono reinvestiti, generando a loro volta nuovi rendimenti. Su un orizzonte lungo, questo effetto valanga può far crescere il tuo capitale in modo esponenziale.
            </InfoCard>
          </div>
        </section>

        <section>
          <div className="text-center max-w-2xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">I compromessi da considerare</h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg leading-7 sm:leading-8 text-slate-600 dark:text-slate-300">È un ottimo strumento, ma è importante capirne i limiti prima di impegnarsi.</p>
          </div>
          <div className="mt-8 sm:mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <InfoCard title="Capitale Vincolato" accent="rose" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}>
              Le somme sono accessibili, di norma, solo al momento della pensione. Esistono eccezioni per anticipi (es. acquisto prima casa, spese sanitarie), ma non è uno strumento liquido come un conto corrente.
            </InfoCard>
            <InfoCard title="Costi di Gestione (ISC)" accent="rose" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 9a2 2 0 10-4 0v5a2 2 0 01-2 2h6m-6-4h4m8 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
              Ogni fondo ha dei costi che riducono i rendimenti netti. L&apos;ISC (Indicatore Sintetico di Costo) li riassume. Anche una piccola differenza percentuale, su 30-40 anni, può valere decine di migliaia di euro.
            </InfoCard>
          </div>
        </section>

        <section>
          <div className="text-center max-w-2xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">Capire le diverse opzioni</h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg leading-7 sm:leading-8 text-slate-600 dark:text-slate-300">I fondi pensione si dividono in diverse tipologie e livelli di rischio. Ecco cosa devi sapere.</p>
          </div>
          <div className="mt-10 sm:mt-12 md:mt-16">
            <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8 text-slate-900 dark:text-slate-100 px-4">Le tipologie di fondo pensione</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              <InfoCard title="Fondi Negoziali (FPN)" accent="slate" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}>
                Detti anche &quot;chiusi&quot;, sono istituiti per specifiche categorie di lavoratori (es. Cometa per i metalmeccanici). Vantaggio chiave: contributo obbligatorio del datore. Hanno costi tipicamente più bassi.
              </InfoCard>
              <InfoCard title="Fondi Aperti (FPA)" accent="slate" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.75 4l.03-.03a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-2.83 2.829a2 2 0 01-2.828 0l-2.829-2.829a2 2 0 010-2.828l.03-.03z" /></svg>}>
                Istituiti da banche o assicurazioni, sono aperti a chiunque. Offrono flessibilità ma non hanno il contributo obbligatorio del datore e i costi possono essere più alti.
              </InfoCard>
              <InfoCard title="Piani Individuali (PIP)" accent="slate" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}>
                Contratti di assicurazione sulla vita con finalità pensionistica. Accessibili a tutti, includono spesso coperture assicurative aggiuntive ma tendono ad avere i costi più elevati.
              </InfoCard>
            </div>
          </div>
          <div className="mt-10 sm:mt-12 md:mt-16">
            <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8 text-slate-900 dark:text-slate-100 px-4">Le linee di investimento (livelli di rischio)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              <InfoCard title="Garantita (GAR)" accent="slate" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944A12.02 12.02 0 0012 22a12.02 12.02 0 009-1.056A11.955 11.955 0 0121.944 12a11.955 11.955 0 01-2.326-8.984z" /></svg>}>
                <b>Basso Rischio.</b> Mira a proteggere il capitale, spesso garantendo un rendimento minimo o il capitale a scadenza. Ideale per chi è vicino alla pensione.
              </InfoCard>
              <InfoCard title="Obbligazionaria (OBB)" accent="slate" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}>
                <b>Basso-Medio Rischio.</b> Investe principalmente in titoli di stato e obbligazioni aziendali. Offre rendimenti stabili ma modesti.
              </InfoCard>
              <InfoCard title="Bilanciata (BIL)" accent="slate" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>}>
                <b>Medio Rischio.</b> Un mix di azioni (30-60%) e obbligazioni. Cerca un equilibrio tra crescita e stabilità. Una scelta comune per orizzonti temporali lunghi.
              </InfoCard>
              <InfoCard title="Azionaria (AZN)" accent="slate" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6-6" /></svg>}>
                <b>Alto Rischio.</b> Investe principalmente in azioni (&gt;70%). Mira alla massima crescita a lungo termine, ma con maggiore volatilità. Adatta a chi ha molti anni davanti prima della pensione.
              </InfoCard>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-800/50 dark:via-slate-800/30 dark:to-slate-800/50 py-12 sm:py-16 md:py-20 rounded-xl sm:rounded-2xl px-4 border border-blue-100 dark:border-slate-700 shadow-lg">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-blue-700 dark:text-blue-400 md:text-4xl">Come questo strumento ti aiuta</h2>
          </div>
          <div className="mt-8 sm:mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div className="p-4 sm:p-5 bg-white/80 dark:bg-slate-900/50 rounded-xl backdrop-blur-sm border border-blue-100 dark:border-slate-700 shadow-sm">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-xl sm:text-2xl shadow-md">1</div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 text-base sm:text-lg">Filtra e trova</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">Usa i filtri per restringere la ricerca per categoria di rischio o società di gestione.</p>
            </div>
            <div className="p-4 sm:p-5 bg-white/80 dark:bg-slate-900/50 rounded-xl backdrop-blur-sm border border-blue-100 dark:border-slate-700 shadow-sm">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-xl sm:text-2xl shadow-md">2</div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 text-base sm:text-lg">Confronta visivamente</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">Seleziona fino a 10 fondi per vedere performance e costi in grafici di facile lettura.</p>
            </div>
            <div className="p-4 sm:p-5 bg-white/80 dark:bg-slate-900/50 rounded-xl backdrop-blur-sm border border-blue-100 dark:border-slate-700 shadow-sm">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-xl sm:text-2xl shadow-md">3</div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 text-base sm:text-lg">Analizza i dettagli</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">Clicca su ogni fondo in tabella per aprire una vista di dettaglio con tutti i dati storici.</p>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 md:py-20">
          <div className="text-center max-w-2xl mx-auto px-4 mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">Pronto a iniziare?</h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg leading-7 sm:leading-8 text-slate-600 dark:text-slate-300">
              Scegli il percorso più adatto alla tua situazione.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 px-4">
            {/* Check - Ho già un fondo */}
            <button
              onClick={() => onNavigate?.('have-fund')}
              className="group relative overflow-hidden rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 sm:p-8 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-blue-400 dark:border-blue-800 dark:from-blue-950/50 dark:to-blue-900/50 dark:hover:border-blue-600"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mb-4 rounded-xl flex items-center justify-center bg-blue-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Check</h3>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 mb-4">
                  Scopri se il tuo fondo pensione attuale sta performando bene rispetto al mercato.
                </p>
                <div className="inline-flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:gap-2 transition-all duration-300">
                  Verifica ora
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-blue-600/0 group-hover:from-blue-400/10 group-hover:to-blue-600/10 transition-all duration-300" />
            </button>

            {/* Capire - Voglio capire come funzionano */}
            <button
              onClick={() => onNavigate?.('learn')}
              className="group relative overflow-hidden rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-6 sm:p-8 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-purple-400 dark:border-purple-800 dark:from-purple-950/50 dark:to-purple-900/50 dark:hover:border-purple-600"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mb-4 rounded-xl flex items-center justify-center bg-purple-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Capire</h3>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 mb-4">
                  Impara a leggere ISC, rendimenti e categorie di rischio con spiegazioni semplici.
                </p>
                <div className="inline-flex items-center text-purple-600 dark:text-purple-400 font-semibold group-hover:gap-2 transition-all duration-300">
                  Esplora ora
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/0 to-purple-600/0 group-hover:from-purple-400/10 group-hover:to-purple-600/10 transition-all duration-300" />
            </button>

            {/* Decisione - Devo scegliere un fondo */}
            <button
              onClick={() => onNavigate?.('choose-fund')}
              className="group relative overflow-hidden rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 sm:p-8 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-emerald-400 dark:border-emerald-800 dark:from-emerald-950/50 dark:to-emerald-900/50 dark:hover:border-emerald-600"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mb-4 rounded-xl flex items-center justify-center bg-emerald-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Decisione</h3>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 mb-4">
                  Trova il fondo perfetto per il tuo profilo e orizzonte temporale con una shortlist personalizzata.
                </p>
                <div className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-semibold group-hover:gap-2 transition-all duration-300">
                  Inizia ora
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/0 to-emerald-600/0 group-hover:from-emerald-400/10 group-hover:to-emerald-600/10 transition-all duration-300" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PlaybookContent;
