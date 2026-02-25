import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock FingerprintJS
vi.mock('@fingerprintjs/fingerprintjs', () => ({
  default: {
    load: vi.fn().mockResolvedValue({
      get: vi.fn().mockResolvedValue({ visitorId: 'test-device-id' }),
    }),
  },
}))

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { count?: number }) => {
      if (opts?.count !== undefined) return `${key} (${opts.count})`
      return key
    },
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}))

// Mock fetch
global.fetch = vi.fn()
