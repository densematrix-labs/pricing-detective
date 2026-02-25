import { create } from 'zustand'
import type { AnalysisResult, TrialStatus } from './api'

interface AppState {
  // Analysis
  content: string
  toolName: string
  isAnalyzing: boolean
  result: AnalysisResult | null
  error: string | null
  
  // Trial
  trialStatus: TrialStatus | null
  
  // Actions
  setContent: (content: string) => void
  setToolName: (name: string) => void
  setIsAnalyzing: (analyzing: boolean) => void
  setResult: (result: AnalysisResult | null) => void
  setError: (error: string | null) => void
  setTrialStatus: (status: TrialStatus) => void
  reset: () => void
}

export const useAppStore = create<AppState>((set) => ({
  content: '',
  toolName: '',
  isAnalyzing: false,
  result: null,
  error: null,
  trialStatus: null,
  
  setContent: (content) => set({ content }),
  setToolName: (name) => set({ toolName: name }),
  setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
  setResult: (result) => set({ result, error: null }),
  setError: (error) => set({ error, result: null }),
  setTrialStatus: (status) => set({ trialStatus: status }),
  reset: () => set({ content: '', toolName: '', result: null, error: null }),
}))
