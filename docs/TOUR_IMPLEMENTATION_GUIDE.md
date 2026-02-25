/**
 * ESEMPIO DI IMPLEMENTAZIONE TOUR GUIDATO
 * 
 * Questa è una guida completa su come implementare il sistema di tour
 * in qualsiasi sezione dell'applicazione.
 */

import React from 'react';
import SectionHeader from './components/common/SectionHeader';
import GuidedTour, { useGuidedTour, FirstVisitBanner } from './components/common/GuidedTour';
import { simulatorTourSteps } from './config/tourSteps';

const ExamplePage: React.FC = () => {
  // 1️⃣ SETUP TOUR - Hook per gestire lo stato
  const { 
    isOpen,           // Tour aperto o chiuso
    shouldShowBanner, // Mostra banner "prima volta"?
    startTour,        // Funzione per aprire il tour
    closeTour,        // Funzione per chiudere il tour
    dismissBanner,    // Funzione per chiudere il banner senza fare il tour
    completeTour,     // Chiamata quando il tour è completato
  } = useGuidedTour('example-page'); // ← Chiave univoca per questa sezione

  return (
    <div className="space-y-6">
      {/* 2️⃣ BANNER PRIMO ACCESSO - Appare solo la prima volta */}
      {shouldShowBanner && (
        <FirstVisitBanner
          onStartTour={startTour}      // Quando clicca "Inizia tour"
          onDismiss={dismissBanner}     // Quando clicca "No grazie" o X
        />
      )}

      {/* 3️⃣ HEADER CON BUTTON TOUR - Sempre visibile */}
      <SectionHeader
        eyebrow="Esempio"
        title="Pagina di Esempio"
        description="Questa è una pagina di esempio per mostrare come funziona il tour guidato"
        primaryAction={{
          label: "Azione Principale",
          onClick: () => console.log('Azione!'),
        }}
        tourAction={{
          label: "Tour Guidato",
          onClick: startTour  // ← Permette di riaprire il tour in qualsiasi momento
        }}
      />

      {/* 4️⃣ CONTENUTO CON data-tour ATTRIBUTES */}
      <div className="space-y-6">
        {/* ⚠️ IMPORTANTE: Aggiungi data-tour ai contenitori che il tour deve evidenziare */}
        
        <section data-tour="example-inputs" className="bg-white rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">Sezione Input</h3>
          <p>Contenuto della sezione che verrà evidenziato nel tour...</p>
          {/* ... form, input, etc ... */}
        </section>

        <section data-tour="example-results" className="bg-white rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">Sezione Risultati</h3>
          <p>Risultati che verranno spiegati nel tour...</p>
          {/* ... grafici, tabelle, etc ... */}
        </section>
      </div>

      {/* 5️⃣ TOUR COMPONENT - Renderizzato condizionalmente */}
      <GuidedTour
        steps={simulatorTourSteps}  // ← Array di step definiti in config/tourSteps.tsx
        isOpen={isOpen}             // ← Controlla se il tour è visibile
        onClose={closeTour}         // ← Chiamato quando si chiude il tour
        onComplete={completeTour}   // ← Chiamato quando si completa il tour
        storageKey="example-page"   // ← Deve matchare la chiave usata in useGuidedTour
        showSkipButton={true}       // ← Opzionale: mostra button "Salta"
      />
    </div>
  );
};

export default ExamplePage;


/**
 * ═══════════════════════════════════════════════════════════════
 * FLUSSI UTENTE
 * ═══════════════════════════════════════════════════════════════
 * 
 * SCENARIO A - PRIMO ACCESSO (Utente Nuovo)
 * ───────────────────────────────────────────────────────────────
 * 1. Utente arriva sulla pagina
 * 2. shouldShowBanner = true
 * 3. Vede banner blu: "👋 Prima volta qui?"
 * 4. Utente ha 3 opzioni:
 * 
 *    OPZIONE 1: Clicca "Inizia il tour"
 *    → startTour() viene chiamato
 *    → isOpen = true
 *    → Tour parte e guida l'utente
 *    → Al termine: completeTour() → localStorage = 'tour_completed_example-page'
 *    → Accessi futuri: shouldShowBanner = false, banner non riappare
 * 
 *    OPZIONE 2: Clicca "No grazie, conosco già"
 *    → dismissBanner() viene chiamato
 *    → localStorage = 'tour_dismissed_example-page'
 *    → Banner scompare
 *    → Accessi futuri: shouldShowBanner = false, banner non riappare
 * 
 *    OPZIONE 3: Clicca "X" per chiudere
 *    → dismissBanner() viene chiamato
 *    → Stesso comportamento di OPZIONE 2
 * 
 * 
 * SCENARIO B - ACCESSI SUCCESSIVI (Utente Esperto)
 * ───────────────────────────────────────────────────────────────
 * 1. Utente torna sulla pagina
 * 2. shouldShowBanner = false (tour già visto/dismissato)
 * 3. Banner NON appare
 * 4. Vede solo il button "ℹ️ Tour Guidato" nell'header
 * 5. Se vuole rivedere il tour, clicca il button
 * 6. Tour riparte da capo
 * 
 * 
 * SCENARIO C - DEVELOPER/TESTING
 * ───────────────────────────────────────────────────────────────
 * Per resettare il tour durante sviluppo:
 * 
 * // In console del browser:
 * localStorage.removeItem('tour_completed_example-page');
 * localStorage.removeItem('tour_dismissed_example-page');
 * 
 * // Oppure nel codice (es: panel admin):
 * const { resetTour } = useGuidedTour('example-page');
 * <button onClick={resetTour}>Reset Tour</button>
 * 
 * 
 * ═══════════════════════════════════════════════════════════════
 * STORAGE KEYS USATE
 * ═══════════════════════════════════════════════════════════════
 * 
 * tour_completed_${key}  → L'utente ha COMPLETATO il tour
 * tour_dismissed_${key}  → L'utente ha CHIUSO il banner senza fare il tour
 * 
 * Se NESSUNA delle due chiavi esiste → PRIMO ACCESSO → Mostra banner
 * Se ALMENO UNA esiste → ACCESSO SUCCESSIVO → Non mostrare banner
 * 
 * 
 * ═══════════════════════════════════════════════════════════════
 * BEST PRACTICES
 * ═══════════════════════════════════════════════════════════════
 * 
 * ✅ DO:
 * - Mantieni i tour BREVI (60-120 secondi max)
 * - Focalizzati su 3-5 concetti chiave
 * - Usa linguaggio semplice e diretto
 * - Aggiungi emoji per rendere più friendly
 * - Permetti sempre di saltare il tour
 * - Tieni il button "Tour" sempre visibile nell'header
 * 
 * ❌ DON'T:
 * - Non forzare l'utente a fare il tour
 * - Non fare tour troppo lunghi (>3 minuti)
 * - Non bloccare l'interfaccia se l'utente vuole esplorare
 * - Non far riapparire il banner dopo che è stato chiuso
 * - Non nascondere il button "Tour" dopo il primo utilizzo
 * 
 * 
 * ═══════════════════════════════════════════════════════════════
 * ANALYTICS & TRACKING
 * ═══════════════════════════════════════════════════════════════
 * 
 * Per tracciare l'efficacia dei tour, aggiungi:
 * 
 * const { startTour, completeTour } = useGuidedTour('example');
 * 
 * const handleStartTour = () => {
 *   analytics.track('tour_started', { tour: 'example' });
 *   startTour();
 * };
 * 
 * const handleCompleteTour = () => {
 *   analytics.track('tour_completed', { tour: 'example' });
 *   completeTour();
 * };
 * 
 * const handleDismissBanner = () => {
 *   analytics.track('tour_dismissed', { tour: 'example' });
 *   dismissBanner();
 * };
 * 
 * Metriche da monitorare:
 * - Tour completion rate: (completed / started) * 100
 * - Banner dismiss rate: (dismissed / shown) * 100
 * - Tour restart rate: Quante volte viene riaperto dopo il primo uso
 */
