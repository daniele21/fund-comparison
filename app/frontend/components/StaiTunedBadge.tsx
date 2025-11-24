import React from 'react';

const StaiTunedBadge: React.FC = () => {
  return (
    <a
      href="https://staituned.com"
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md hover:scale-105 transition-all cursor-pointer"
      title="Visit stAI tuned website"
    >
      <span className="text-[10px] text-slate-700 dark:text-slate-300 font-medium leading-tight">
        Realizzato con <strong className="font-bold text-blue-600 dark:text-blue-400">GenAI</strong>
      </span>
      <img
        src="/icons/logo-text-light-mode.png"
        alt="stAI tuned"
        className="h-3 dark:hidden"
      />
      <img
        src="/icons/logo-text-dark-mode.png"
        alt="stAI tuned"
        className="h-3 hidden dark:block"
      />
    </a>
  );
};

export default StaiTunedBadge;
