import React from 'react';
import Footer from './Footer';
import StaiTunedBadge from './StaiTunedBadge';

interface PlaybookProps {
  onStart: () => void;
  theme: string;
  toggleTheme: () => void;
}

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

const Playbook: React.FC<PlaybookProps> = ({ onStart, theme, toggleTheme }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
        {/* Header with StaiTuned Badge and Theme Toggle */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 md:top-6 md:left-6 lg:top-8 lg:left-12 z-50">
            <StaiTunedBadge location="playbook-header" />
        </div>
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 lg:top-8 lg:right-12 z-50">
            <button
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 focus:ring-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
            >
                {theme === 'light' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                )}
            </button>
        </div>
        
        <div className="relative isolate overflow-hidden">
             <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-white to-slate-50 dark:from-blue-950/30 dark:via-slate-900 dark:to-slate-950"></div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 text-center">
                <div className="inline-flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-950/50 p-3 sm:p-4 rounded-2xl mb-5 sm:mb-6 border border-blue-200 dark:border-blue-800/50 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight px-2 mb-5 sm:mb-6">
                    Costruisci la Tua Pensione Oggi,<br className="hidden sm:block"/>Assicura il Tuo Domani.
                </h1>
                <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto px-4 leading-relaxed">
                    La pensione pubblica potrebbe non bastare. Un fondo pensione privato è una scelta strategica per un futuro sereno. Questa guida spiega i pro, i contro e come usare questo strumento per scegliere con consapevolezza.
                </p>
                <div className="mt-8 sm:mt-10">
                    <button
                        onClick={onStart}
                        className="inline-flex items-center gap-x-2 px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 dark:focus:ring-offset-slate-900 transition-all duration-200 transform hover:scale-105 hover:-translate-y-0.5 active:scale-100 active:translate-y-0"
                    >
                        Inizia a Confrontare
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>
            </div>
        </div>

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 space-y-16 sm:space-y-20 lg:space-y-24">
            <section>
                <div className="text-center max-w-2xl mx-auto px-4">
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">Perché è una Scelta Intelligente</h2>
                    <p className="mt-3 sm:mt-4 text-base sm:text-lg leading-7 sm:leading-8 text-slate-600 dark:text-slate-300">I vantaggi chiave che rendono la pensione integrativa un potente strumento finanziario.</p>
                </div>
                <div className="mt-8 sm:mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                    <InfoCard title="Deducibilità Fiscale" accent="emerald" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}>
                        Deduci fino a 5.164,57€ all'anno dal tuo reddito imponibile. Questo significa pagare meno tasse oggi, un risparmio tangibile che aumenta il beneficio netto del tuo investimento.
                    </InfoCard>
                    <InfoCard title="Contributo del Datore di Lavoro" accent="emerald" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}>
                        Aderendo a un fondo negoziale (FPN) e versando un tuo contributo, hai diritto a un versamento aggiuntivo da parte del tuo datore di lavoro. Sono soldi "gratis" che accelerano la crescita del tuo capitale.
                    </InfoCard>
                    <InfoCard title="Tassazione Agevolata sui Rendimenti" accent="emerald" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>}>
                        I rendimenti sono tassati al 20% (con ulteriori agevolazioni per i Titoli di Stato), anziché al 26% standard della maggior parte degli altri strumenti finanziari. Più guadagno netto per te.
                    </InfoCard>
                    <InfoCard title="Il Potere dell'Interesse Composto" accent="emerald" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>}>
                        I rendimenti guadagnati ogni anno vengono reinvestiti, generando a loro volta nuovi rendimenti. Su un orizzonte lungo, questo "effetto valanga" può far crescere il tuo capitale in modo esponenziale.
                    </InfoCard>
                </div>
            </section>

            <section>
                 <div className="text-center max-w-2xl mx-auto px-4">
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">I Compromessi da Considerare</h2>
                    <p className="mt-3 sm:mt-4 text-base sm:text-lg leading-7 sm:leading-8 text-slate-600 dark:text-slate-300">È un ottimo strumento, ma è importante capirne i limiti prima di impegnarsi.</p>
                </div>
                <div className="mt-8 sm:mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                    <InfoCard title="Capitale Vincolato" accent="rose" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}>
                        Le somme sono accessibili, di norma, solo al momento della pensione. Esistono eccezioni per anticipi (es. acquisto prima casa, spese sanitarie), ma non è uno strumento liquido come un conto corrente.
                    </InfoCard>
                    <InfoCard title="Costi di Gestione (ISC)" accent="rose" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 9a2 2 0 10-4 0v5a2 2 0 01-2 2h6m-6-4h4m8 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                        Ogni fondo ha dei costi che riducono i rendimenti netti. L'ISC (Indicatore Sintetico di Costo) li riassume. Anche una piccola differenza percentuale, su 30-40 anni, può valere decine di migliaia di euro.
                    </InfoCard>
                </div>
            </section>
            
            <section>
                 <div className="text-center max-w-2xl mx-auto px-4">
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">Capire le Diverse Opzioni</h2>
                    <p className="mt-3 sm:mt-4 text-base sm:text-lg leading-7 sm:leading-8 text-slate-600 dark:text-slate-300">I fondi pensione si dividono in diverse tipologie e livelli di rischio. Ecco cosa devi sapere.</p>
                </div>
                <div className="mt-10 sm:mt-12 md:mt-16">
                     <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8 text-slate-900 dark:text-slate-100 px-4">Le Tipologie di Fondo Pensione</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                        <InfoCard title="Fondi Negoziali (FPN)" accent="slate" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}>
                           Detti anche "chiusi", sono istituiti per specifiche categorie di lavoratori (es. Cometa per i metalmeccanici). Vantaggio chiave: contributo obbligatorio del datore. Hanno costi tipicamente più bassi.
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
                     <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8 text-slate-900 dark:text-slate-100 px-4">Le Linee di Investimento (Livelli di Rischio)</h3>
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
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-blue-700 dark:text-blue-400 md:text-4xl">Come Questo Strumento Ti Aiuta</h2>
                </div>
                <div className="mt-8 sm:mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center">
                    <div className="p-4 sm:p-5 bg-white/80 dark:bg-slate-900/50 rounded-xl backdrop-blur-sm border border-blue-100 dark:border-slate-700 shadow-sm">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-xl sm:text-2xl shadow-md">1</div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 text-base sm:text-lg">Filtra e Trova</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">Usa i filtri per restringere la ricerca per categoria di rischio o società di gestione.</p>
                    </div>
                     <div className="p-4 sm:p-5 bg-white/80 dark:bg-slate-900/50 rounded-xl backdrop-blur-sm border border-blue-100 dark:border-slate-700 shadow-sm">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-xl sm:text-2xl shadow-md">2</div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 text-base sm:text-lg">Confronta Visivamente</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">Seleziona fino a 10 fondi per vedere performance e costi in grafici di facile lettura.</p>
                    </div>
                     <div className="p-4 sm:p-5 bg-white/80 dark:bg-slate-900/50 rounded-xl backdrop-blur-sm border border-blue-100 dark:border-slate-700 shadow-sm">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-xl sm:text-2xl shadow-md">3</div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 text-base sm:text-lg">Analizza i Dettagli</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">Clicca su ogni fondo in tabella per aprire una vista di dettaglio con tutti i dati storici.</p>
                    </div>
                </div>
            </section>
            
            <div className="text-center pt-4 sm:pt-6 px-4">
                <button
                    onClick={onStart}
                    className="inline-flex items-center gap-x-2 px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 dark:focus:ring-offset-slate-900 transition-all duration-200 transform hover:scale-105 hover:-translate-y-0.5 active:scale-100 active:translate-y-0"
                >
                    Inizia Subito
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
            </div>
        </main>
        
        <Footer />
    </div>
  );
};

export default Playbook;
