import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock trial status
    ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
      if (url.includes('trial-status')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ used: 0, remaining: 3, limit: 3 }),
        })
      }
      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) })
    })
  })
  
  it('renders the main UI', async () => {
    render(<App />)
    
    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByTestId('content-input')).toBeInTheDocument()
    expect(screen.getByTestId('analyze-btn')).toBeInTheDocument()
  })
  
  it('shows trial remaining count', async () => {
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText(/trialRemaining/)).toBeInTheDocument()
    })
  })
  
  it('disables analyze button when content too short', () => {
    render(<App />)
    
    const btn = screen.getByTestId('analyze-btn')
    expect(btn).toBeDisabled()
    
    const input = screen.getByTestId('content-input')
    fireEvent.change(input, { target: { value: 'short' } })
    expect(btn).toBeDisabled()
  })
  
  it('enables analyze button when content is long enough', () => {
    render(<App />)
    
    const input = screen.getByTestId('content-input')
    fireEvent.change(input, { target: { value: 'a'.repeat(60) } })
    
    const btn = screen.getByTestId('analyze-btn')
    expect(btn).not.toBeDisabled()
  })
  
  it('shows error for short content', async () => {
    render(<App />)
    
    const input = screen.getByTestId('content-input')
    fireEvent.change(input, { target: { value: 'a'.repeat(60) } })
    
    // Clear and set short content
    fireEvent.change(input, { target: { value: 'short' } })
    
    const btn = screen.getByTestId('analyze-btn')
    fireEvent.click(btn)
    
    await waitFor(() => {
      expect(screen.getByText('minLength')).toBeInTheDocument()
    })
  })
  
  it('displays analysis result', async () => {
    const mockResult = {
      tool_name: 'Test Tool',
      overall_score: 75,
      verdict: 'Mostly honest',
      issues: [],
      tiers: [],
      summary: 'Test summary',
      recommendations: ['Rec 1'],
    }
    
    ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
      if (url.includes('trial-status')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ used: 0, remaining: 3, limit: 3 }),
        })
      }
      if (url.includes('analyze')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResult),
        })
      }
      return Promise.resolve({ ok: false })
    })
    
    render(<App />)
    
    const input = screen.getByTestId('content-input')
    fireEvent.change(input, { target: { value: 'a'.repeat(60) } })
    
    const btn = screen.getByTestId('analyze-btn')
    fireEvent.click(btn)
    
    await waitFor(() => {
      expect(screen.getByTestId('result')).toBeInTheDocument()
      expect(screen.getByText('Test Tool')).toBeInTheDocument()
      expect(screen.getByText('Mostly honest')).toBeInTheDocument()
    })
  })
  
  it('handles language switching', () => {
    render(<App />)
    
    const switcher = screen.getByTestId('lang-switcher')
    expect(switcher).toBeInTheDocument()
    
    fireEvent.change(switcher, { target: { value: 'zh' } })
  })
})
