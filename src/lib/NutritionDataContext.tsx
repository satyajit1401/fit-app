"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NutritionDataContextType {
  nutritionDataVersion: number;
  signalNutritionDataChanged: () => void;
}

const NutritionDataContext = createContext<NutritionDataContextType | undefined>(undefined);

export const NutritionDataProvider = ({ children }: { children: ReactNode }) => {
  const [nutritionDataVersion, setNutritionDataVersion] = useState(0);
  const signalNutritionDataChanged = () => setNutritionDataVersion(v => v + 1);
  return (
    <NutritionDataContext.Provider value={{ nutritionDataVersion, signalNutritionDataChanged }}>
      {children}
    </NutritionDataContext.Provider>
  );
};

export const useNutritionData = () => {
  const ctx = useContext(NutritionDataContext);
  if (!ctx) throw new Error('useNutritionData must be used within NutritionDataProvider');
  return ctx;
}; 