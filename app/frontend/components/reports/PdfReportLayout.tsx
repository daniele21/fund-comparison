import React from 'react';
import { BRAND_TOKENS } from '../../config/brandTokens';

export const PDF_REPORT_DISCLAIMER = "Il presente documento e' stato predisposto a supporto dell'attivita' di consulenza e utilizza i rendimenti storici disponibili relativi ai fondi selezionati. Qualora non fosse disponibile uno storico coerente con l'orizzonte temporale analizzato, sono state adottate le migliori proxy ritenute adeguate allo scopo. Le analisi e le simulazioni presentate hanno finalita' esclusivamente informative e non costituiscono in alcun modo una raccomandazione personalizzata, un'offerta o un invito alla sottoscrizione di prodotti finanziari. I risultati storici non sono indicativi di performance future. Ogni decisione di investimento dovra' essere valutata tenendo conto della situazione personale, previdenziale e finanziaria del cliente, anche con il supporto del proprio consulente.";

export const formatReportDate = (date: Date): string => (
  new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
);

export const formatReportEmail = (email?: string | null): string => (
  email?.trim() ? email.trim() : "Indirizzo email dichiarato dall'utente"
);

interface PdfPageProps {
  title: string;
  generatedAt: Date;
  pageNumber: number;
  customerEmail?: string | null;
  children: React.ReactNode;
}

export const PdfPage: React.FC<PdfPageProps> = ({
  title,
  generatedAt,
  pageNumber,
  customerEmail,
  children,
}) => (
  <section className="pdf-page">
    <header className="pdf-report-header">
      <div className="pdf-brand-lockup">
        <img src={BRAND_TOKENS.logo.horizontal} alt={BRAND_TOKENS.name} className="pdf-brand-logo" />
        <div>
          <p className="pdf-overline">{BRAND_TOKENS.productName}</p>
          <h1>{title}</h1>
        </div>
      </div>
      <div className="pdf-generated">
        <span>Generato il</span>
        <strong>{formatReportDate(generatedAt)}</strong>
      </div>
    </header>

    <div className="pdf-page-content">{children}</div>

    <footer className="pdf-report-footer">
      <span>{pageNumber}</span>
      <span>{formatReportEmail(customerEmail)}</span>
    </footer>
  </section>
);

interface PdfSectionProps {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}

export const PdfSection: React.FC<PdfSectionProps> = ({ eyebrow, title, children }) => (
  <section className="pdf-section">
    {eyebrow && <p className="pdf-section-eyebrow">{eyebrow}</p>}
    <h2>{title}</h2>
    {children}
  </section>
);

interface PdfMetricProps {
  label: string;
  value: string;
  detail?: string;
  tone?: 'default' | 'positive' | 'accent' | 'warning';
}

export const PdfMetric: React.FC<PdfMetricProps> = ({
  label,
  value,
  detail,
  tone = 'default',
}) => (
  <div className={`pdf-metric pdf-metric--${tone}`}>
    <span>{label}</span>
    <strong>{value}</strong>
    {detail && <small>{detail}</small>}
  </div>
);

interface PdfNarrativeProps {
  title?: string;
  children: React.ReactNode;
  compact?: boolean;
}

export const PdfNarrative: React.FC<PdfNarrativeProps> = ({ title, children, compact = false }) => (
  <div className={`pdf-narrative${compact ? ' pdf-narrative--compact' : ''}`}>
    {title && <h3>{title}</h3>}
    <p>{children}</p>
  </div>
);

