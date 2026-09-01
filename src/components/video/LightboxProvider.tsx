'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { VideoModal, ModalWork } from './VideoModal';

interface LightboxContextType {
  open: (work: ModalWork) => void;
  close: () => void;
}

const LightboxContext = createContext<LightboxContextType | null>(null);

export function LightboxProvider({ children }: { children: React.ReactNode }) {
  const [activeWork, setActiveWork] = useState<ModalWork | null>(null);

  const open = useCallback((work: ModalWork) => {
    setActiveWork(work);
  }, []);

  const close = useCallback(() => {
    setActiveWork(null);
  }, []);

  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <LightboxContext.Provider value={value}>
      {children}
      <VideoModal work={activeWork} onClose={close} />
    </LightboxContext.Provider>
  );
}

export function useLightbox(): LightboxContextType {
  const context = useContext(LightboxContext);
  if (!context) {
    throw new Error('useLightbox must be used within a <LightboxProvider>');
  }
  return context;
}
