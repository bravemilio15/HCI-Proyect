'use client';

import { memo } from 'react';

interface HelpButtonProps {
  onClick: () => void;
}

const HelpButton = memo(function HelpButton({ onClick }: HelpButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 md:w-12 md:h-12 bg-gray-800 text-white text-xl md:text-2xl font-bold rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors border-2 border-gray-700 hover:border-gray-600"
      aria-label="Abrir tutorial de ayuda"
    >
      ?
    </button>
  );
});

export default HelpButton;
