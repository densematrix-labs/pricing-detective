import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, AlertTriangle, CheckCircle, XCircle, Globe, Zap } from 'lucide-react'
import { useAppStore } from './lib/store'
import { analyzePricing, getTrialStatus } from './lib/api'

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
]

function LanguageSwitcher() {
  const { i18n } = useTranslation()
  
  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-amber-400" />
      <select
        value={i18n.language.split('-')[0]}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className="bg-noir-700 text-sm px-2 py-1 rounded border border-noir-600 focus:border-amber-400 outline-none"
        data-testid="lang-switcher"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  )
}

function ScoreGauge({ score }: { score: number }) {
  const getColor = (s: number) => {
    if (s >= 80) return '#22c55e'
    if (s >= 60) return '#f59e0b'
    if (s >= 40) return '#ef4444'
    return '#dc2626'
  }
  
  return (
    <div className="relative w-32 h-32" data-testid="score-gauge">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
        <circle
          cx="18" cy="18" r="16"
          fill="none"
          stroke="#252532"
          strokeWidth="3"
        />
        <circle
          cx="18" cy="18" r="16"
          fill="none"
          stroke={getColor(score)}
          strokeWidth="3"
          strokeDasharray={`${score} 100`}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-display text-amber-400">{score}</span>
      </div>
    </div>
  )
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors = {
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    critical: 'bg-red-600/30 text-red-300 border-red-600/50',
  }
  
  const { t } = useTranslation()
  
  return (
    <span className={`px-2 py-0.5 text-xs font-mono uppercase border rounded ${colors[severity as keyof typeof colors] || colors.medium}`}>
      {t(`severity.${severity}`)}
    </span>
  )
}

function IssueCard({ issue }: { issue: { type: string; severity: string; title: string; description: string; evidence: string; recommendation: string } }) {
  const { t } = useTranslation()
  
  return (
    <div className="bg-noir-700 border border-noir-600 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <h4 className="font-semibold">{issue.title}</h4>
        </div>
        <SeverityBadge severity={issue.severity} />
      </div>
      
      <p className="text-gray-300 text-sm">{issue.description}</p>
      
      {issue.evidence && (
        <div className="evidence-highlight text-gray-400">
          <span className="text-xs text-amber-400 uppercase tracking-wide">{t('evidence')}:</span>
          <p className="mt-1">"{issue.evidence}"</p>
        </div>
      )}
      
      <p className="text-sm text-amber-300">
        <Zap className="w-4 h-4 inline mr-1" />
        {issue.recommendation}
      </p>
    </div>
  )
}

function App() {
  const { t, i18n } = useTranslation()
  const {
    content, setContent,
    toolName, setToolName,
    isAnalyzing, setIsAnalyzing,
    result, setResult,
    error, setError,
    trialStatus, setTrialStatus,
  } = useAppStore()
  
  useEffect(() => {
    getTrialStatus().then(setTrialStatus).catch(console.error)
  }, [setTrialStatus])
  
  const handleAnalyze = async () => {
    if (content.length < 50) {
      setError(t('minLength'))
      return
    }
    
    setIsAnalyzing(true)
    setError(null)
    
    try {
      const res = await analyzePricing(content, toolName || null, i18n.language.split('-')[0])
      setResult(res)
      // Refresh trial status
      const status = await getTrialStatus()
      setTrialStatus(status)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'))
    } finally {
      setIsAnalyzing(false)
    }
  }
  
  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <header className="border-b border-noir-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Search className="w-8 h-8 text-amber-400" />
            <div>
              <h1 className="font-display text-2xl tracking-wide text-amber-400">{t('title')}</h1>
              <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">{t('tagline')}</p>
            </div>
          </div>
          <LanguageSwitcher />
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-2">
          <p className="text-xl text-gray-300">{t('subtitle')}</p>
          {trialStatus && (
            <p className="text-sm text-amber-400 font-mono">
              {trialStatus.remaining > 0 
                ? t('trialRemaining', { count: trialStatus.remaining })
                : t('trialExhausted')
              }
            </p>
          )}
        </div>
        
        {/* Input Form */}
        <div className="bg-noir-800 border border-noir-600 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">{t('inputLabel')}</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('inputPlaceholder')}
              className="w-full h-48 bg-noir-700 border border-noir-600 rounded-lg p-4 text-sm font-mono resize-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-colors"
              data-testid="content-input"
            />
          </div>
          
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-2">{t('toolNameLabel')}</label>
              <input
                type="text"
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
                placeholder={t('toolNamePlaceholder')}
                className="w-full bg-noir-700 border border-noir-600 rounded-lg px-4 py-2 text-sm focus:border-amber-400 outline-none transition-colors"
                data-testid="tool-name-input"
              />
            </div>
            
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || content.length < 50}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-noir-600 disabled:text-gray-500 text-noir-900 font-semibold rounded-lg transition-colors flex items-center gap-2"
              data-testid="analyze-btn"
            >
              <Search className="w-4 h-4" />
              {isAnalyzing ? t('analyzing') : t('analyzeButton')}
            </button>
          </div>
        </div>
        
        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-red-300">{error}</p>
          </div>
        )}
        
        {/* Results */}
        {result && (
          <div className="space-y-8 file-stamp" data-testid="result">
            {/* Score & Verdict */}
            <div className="bg-noir-800 border border-noir-600 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h2 className="text-2xl font-display text-amber-400">{result.tool_name}</h2>
                  <p className="text-gray-300">{result.verdict}</p>
                </div>
                <div className="text-center">
                  <ScoreGauge score={result.overall_score} />
                  <p className="text-xs text-gray-500 mt-2 font-mono uppercase">{t('score')}</p>
                </div>
              </div>
            </div>
            
            {/* Issues */}
            {result.issues.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  {t('issues')} ({result.issues.length})
                </h3>
                <div className="grid gap-4">
                  {result.issues.map((issue, i) => (
                    <IssueCard key={i} issue={issue} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-green-300">{t('noIssues')}</p>
              </div>
            )}
            
            {/* Tier Analysis */}
            {result.tiers.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('tiers')}</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {result.tiers.map((tier, i) => (
                    <div key={i} className="bg-noir-700 border border-noir-600 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-amber-400">{tier.name}</h4>
                        <span className="font-mono text-sm">{tier.stated_price}</span>
                      </div>
                      {tier.true_cost_estimate && (
                        <p className="text-sm text-amber-300 mb-2">
                          True cost: {tier.true_cost_estimate}
                        </p>
                      )}
                      {tier.limitations.length > 0 && (
                        <ul className="text-sm text-gray-400 space-y-1">
                          {tier.limitations.map((lim, j) => (
                            <li key={j} className="flex items-start gap-2">
                              <span className="text-red-400">•</span>
                              {lim}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('recommendations')}</h3>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300">
                      <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-noir-900/90 backdrop-blur border-t border-noir-700">
        <div className="max-w-4xl mx-auto px-4 py-3 text-center text-sm text-gray-500 font-mono">
          {t('footer')}
        </div>
      </footer>
    </div>
  )
}

export default App
