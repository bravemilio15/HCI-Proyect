'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ResetButtonProps {
  onReset: () => Promise<void>;
}

export default function ResetButton({ onReset }: ResetButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await onReset();
      setShowConfirm(false);
    } catch (error) {
      console.error('Error resetting network:', error);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setShowConfirm(true)}
        className="fixed top-2 right-2 md:top-4 md:right-4 z-50 bg-red-600 hover:bg-red-700 text-white px-2 py-1.5 md:px-4 md:py-2 rounded-lg shadow-lg transition-colors flex items-center gap-1 md:gap-2 text-sm md:text-base"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 md:h-5 md:w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
            clipRule="evenodd"
          />
        </svg>
        <span className="hidden sm:inline">Reiniciar</span>
      </motion.button>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isResetting && setShowConfirm(false)}
          >
            <motion.div
              className="bg-gray-900 border border-gray-700 rounded-lg p-4 md:p-6 max-w-md mx-4 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white text-lg md:text-xl font-bold mb-3 md:mb-4">
                Confirmar Reinicio
              </h3>
              <p className="text-gray-300 mb-4 md:mb-6 text-sm md:text-base">
                Estas seguro de que quieres reiniciar todo el progreso? Esta accion no se puede deshacer.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3 sm:justify-end">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={isResetting}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 text-sm md:text-base order-2 sm:order-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReset}
                  disabled={isResetting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm md:text-base order-1 sm:order-2"
                >
                  {isResetting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Reiniciando...
                    </>
                  ) : (
                    'Si, Reiniciar'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
