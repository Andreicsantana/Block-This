import { useEffect, useState } from 'react'

const DEFAULT_SETTINGS = {
  locked: false,
  rules: {
    youtube: 'shorts',
    instagram: 'reels',
    tiktokFull: false,
  },
  timers: {
    unlockAt: '',
    relockAt: '',
    pauseStart: '',
    pauseEnd: '',
  },
  redirects: {
    mode: 'newTab',
    customUrl: '',
  },
  extraSites: '',
}

function getStorageSync() {
  if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
    return chrome.storage.sync
  }

  return {
    get(defaults, callback) {
      let blockThisSettings

      try {
        blockThisSettings = localStorage.getItem('blockThisSettings')
          ? JSON.parse(localStorage.getItem('blockThisSettings'))
          : undefined
      } catch {
        blockThisSettings = undefined
      }

      const local = {
        theme: localStorage.getItem('blockThisTheme') || undefined,
        blockThisSettings,
      }
      callback({ ...defaults, ...local })
    },
    set(value, callback) {
      if (value.blockThisSettings) {
        localStorage.setItem('blockThisSettings', JSON.stringify(value.blockThisSettings))
      }
      if (value.theme) {
        localStorage.setItem('blockThisTheme', value.theme)
      }
      callback?.()
    },
  }
}

const storage = getStorageSync()

function normalizeSettings(raw = {}) {
  return {
    ...DEFAULT_SETTINGS,
    ...raw,
    rules: {
      ...DEFAULT_SETTINGS.rules,
      ...(raw.rules || {}),
    },
    timers: {
      ...DEFAULT_SETTINGS.timers,
      ...(raw.timers || {}),
    },
    redirects: {
      ...DEFAULT_SETTINGS.redirects,
      ...(raw.redirects || {}),
    },
    extraSites: typeof raw.extraSites === 'string' ? raw.extraSites : DEFAULT_SETTINGS.extraSites,
  }
}

function parseExtraSites(value) {
  if (typeof value !== 'string') return []

  return value
    .split(/[\n,]/)
    .map((site) => site.trim().toLowerCase())
    .filter(Boolean)
    .map((site) => site.replace(/^https?:\/\//, '').replace(/^www\./, ''))
}

function mergeExtraSites(currentValue, nextValue) {
  const currentSites = parseExtraSites(currentValue)
  const nextSites = parseExtraSites(nextValue)
  const mergedSites = [...currentSites]

  nextSites.forEach((site) => {
    if (!mergedSites.includes(site)) {
      mergedSites.push(site)
    }
  })

  return mergedSites.join('\n')
}

function App() {
  const [theme, setTheme] = useState('light')
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [status, setStatus] = useState('')

  useEffect(() => {
    storage.get({ theme: 'light' }, (data) => {
      setTheme(data.theme)
    })

    storage.get({ blockThisSettings: DEFAULT_SETTINGS }, (data) => {
      setSettings(normalizeSettings(data.blockThisSettings))
    })
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.body.dataset.theme = theme
  }, [theme])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    storage.set({ theme: newTheme })
  }

  const updateRule = (key, value) => {
    if (settings.locked) return
    setSettings((prev) => ({
      ...prev,
      rules: {
        ...prev.rules,
        [key]: value,
      },
    }))
  }

  const updateTimer = (key, value) => {
    if (settings.locked) return
    setSettings((prev) => ({
      ...prev,
      timers: {
        ...prev.timers,
        [key]: value,
      },
    }))
  }

  const updateRedirect = (key, value) => {
    if (settings.locked) return
    setSettings((prev) => ({
      ...prev,
      redirects: {
        ...prev.redirects,
        [key]: value,
      },
    }))
  }

  const updateExtraSites = (value) => {
    setSettings((prev) => {
      const nextExtraSites = prev.locked ? mergeExtraSites(prev.extraSites, value) : value
      const nextSettings = {
        ...prev,
        extraSites: nextExtraSites,
      }

      if (prev.locked) {
        storage.set({ blockThisSettings: nextSettings })
      }

      return nextSettings
    })
  }

  const saveAndLock = () => {
    if (settings.locked) return

    const hasOneDailyWindowValue = Boolean(settings.timers.unlockAt) !== Boolean(settings.timers.relockAt)
    if (hasOneDailyWindowValue) {
      setStatus('Para janela diaria, preencha desbloqueio e reativacao.')
      return
    }

    const hasOnePauseValue = Boolean(settings.timers.pauseStart) !== Boolean(settings.timers.pauseEnd)
    if (hasOnePauseValue) {
      setStatus('Para usar pausa, preencha inicio e fim.')
      return
    }

    if (settings.redirects.mode === 'custom' && !settings.redirects.customUrl.trim()) {
      setStatus('Informe a URL personalizada ou troque para nova aba do navegador.')
      return
    }

    const finalRedirects = {
      ...settings.redirects,
      customUrl: settings.redirects.customUrl.trim(),
    }

    const finalSettings = {
      ...settings,
      redirects: finalRedirects,
      locked: true,
    }

    storage.set({ blockThisSettings: finalSettings }, () => {
      setSettings(finalSettings)
      setStatus('Configuracao salva e travada.')
    })
  }

  const isDark = theme === 'dark'
  const isLocked = settings.locked
  const extraSitesDisplay = settings.locked ? parseExtraSites(settings.extraSites).join('\n') : settings.extraSites

  const styles = {
    container: {
      width: 360,
      background: isDark ? '#000000' : '#ffffff',
      color: isDark ? '#ffffff' : '#000000',
      padding: 24,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      transition: 'background 0.2s, color 0.2s',
      margin: 0,
      border: 'none',
      boxSizing: 'border-box',
    },
    header: {
      textAlign: 'center',
      marginBottom: 32,
      position: 'relative',
    },
    title: {
      margin: 0,
      fontSize: 17,
      fontWeight: 400,
      letterSpacing: '2px',
      textTransform: 'uppercase',
    },
    themeToggle: {
      position: 'absolute',
      top: -4,
      right: -4,
      background: 'transparent',
      border: `1px solid ${isDark ? '#333333' : '#e0e0e0'}`,
      borderRadius: 4,
      width: 32,
      height: 32,
      cursor: 'pointer',
      fontSize: 14,
      color: isDark ? '#ffffff' : '#000000',
      transition: 'border-color 0.2s, color 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    section: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
      marginBottom: 12,
      opacity: 0.5,
      textAlign: 'center',
    },
    field: {
      marginBottom: 10,
    },
    label: {
      display: 'block',
      fontSize: 12,
      opacity: 0.7,
      marginBottom: 6,
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
    },
    input: {
      width: '100%',
      background: isDark ? '#080808' : '#fafafa',
      color: isDark ? '#ffffff' : '#000000',
      border: `1px solid ${isDark ? '#2a2a2a' : '#dddddd'}`,
      borderRadius: 6,
      height: 34,
      padding: '0 10px',
      fontSize: 13,
      outline: 'none',
      opacity: isLocked ? 0.6 : 1,
    },
    checkboxRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 13,
      opacity: isLocked ? 0.6 : 1,
    },
    timerGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10,
    },
    saveButton: {
      width: '100%',
      height: 38,
      borderRadius: 6,
      border: `1px solid ${isDark ? '#ffffff' : '#000000'}`,
      background: isLocked ? 'transparent' : (isDark ? '#ffffff' : '#000000'),
      color: isLocked ? (isDark ? '#ffffff' : '#000000') : (isDark ? '#000000' : '#ffffff'),
      cursor: isLocked ? 'not-allowed' : 'pointer',
      fontSize: 13,
      fontWeight: 600,
      letterSpacing: '0.6px',
      textTransform: 'uppercase',
      marginTop: 10,
      opacity: isLocked ? 0.6 : 1,
    },
    status: {
      marginTop: 10,
      fontSize: 12,
      textAlign: 'center',
      opacity: 0.7,
      minHeight: 18,
    },
    textarea: {
      width: '100%',
      background: isDark ? '#080808' : '#fafafa',
      color: isDark ? '#ffffff' : '#000000',
      border: `1px solid ${isDark ? '#2a2a2a' : '#dddddd'}`,
      borderRadius: 6,
      minHeight: 74,
      padding: 10,
      fontSize: 13,
      outline: 'none',
      resize: 'none',
      opacity: isLocked ? 0.6 : 1,
      fontFamily: 'inherit',
    },
    radioRow: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      fontSize: 13,
      opacity: isLocked ? 0.6 : 1,
    },
    radioOption: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    helperText: {
      marginTop: 6,
      fontSize: 11,
      lineHeight: 1.4,
      opacity: 0.6,
    },
    info: {
      fontSize: 12,
      lineHeight: 1.5,
      textAlign: 'center',
      opacity: 0.65,
      marginTop: 14,
    },
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Block This</h1>
        <button 
          style={styles.themeToggle} 
          onClick={toggleTheme}
          title={isDark ? 'Tema claro' : 'Tema escuro'}
        >
          {isDark ? '◐' : '◑'}
        </button>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Regras de bloqueio</div>

        <div style={styles.field}>
          <label style={styles.label}>YouTube</label>
          <select
            style={styles.input}
            value={settings.rules.youtube}
            onChange={(e) => updateRule('youtube', e.target.value)}
            disabled={isLocked}
          >
            <option value="none">Nao bloquear</option>
            <option value="shorts">Somente Shorts</option>
            <option value="full">YouTube total + Shorts</option>
          </select>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Instagram</label>
          <select
            style={styles.input}
            value={settings.rules.instagram}
            onChange={(e) => updateRule('instagram', e.target.value)}
            disabled={isLocked}
          >
            <option value="none">Nao bloquear</option>
            <option value="reels">Somente Reels</option>
            <option value="full">Instagram total + Reels</option>
          </select>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>TikTok</label>
          <label style={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={settings.rules.tiktokFull}
              onChange={(e) => updateRule('tiktokFull', e.target.checked)}
              disabled={isLocked}
            />
            Bloquear TikTok total
          </label>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Horarios (YouTube/Instagram total)</div>

        <div style={styles.timerGrid}>
          <div style={styles.field}>
            <label style={styles.label}>Desbloqueio diario</label>
            <input
              style={styles.input}
              type="time"
              value={settings.timers.unlockAt}
              onChange={(e) => updateTimer('unlockAt', e.target.value)}
              disabled={isLocked}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Reativar bloqueio</label>
            <input
              style={styles.input}
              type="time"
              value={settings.timers.relockAt}
              onChange={(e) => updateTimer('relockAt', e.target.value)}
              disabled={isLocked}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Pausa inicio</label>
            <input
              style={styles.input}
              type="time"
              value={settings.timers.pauseStart}
              onChange={(e) => updateTimer('pauseStart', e.target.value)}
              disabled={isLocked}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Pausa fim</label>
            <input
              style={styles.input}
              type="time"
              value={settings.timers.pauseEnd}
              onChange={(e) => updateTimer('pauseEnd', e.target.value)}
              disabled={isLocked}
            />
          </div>
        </div>
        <div style={styles.helperText}>
          Defina inicio e fim para abrir uma janela diaria. Fora dela, o bloqueio total volta automaticamente.
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Outros acessos</div>

        <div style={styles.field}>
          <label style={styles.label}>Sites extras para bloquear</label>
          <textarea
            style={styles.textarea}
            value={extraSitesDisplay}
            onChange={(e) => updateExtraSites(e.target.value)}
            placeholder="facebook.com, x.com, reddit.com"
          />
          <div style={styles.helperText}>
            Separe por virgula ou quebra de linha. Quando a configuracao estiver travada, voce ainda pode acrescentar novos sites, mas os antigos continuam mantidos.
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Redirecionar para</label>
          <div style={styles.radioRow}>
            <label style={styles.radioOption}>
              <input
                type="radio"
                name="redirectMode"
                value="newTab"
                checked={settings.redirects.mode === 'newTab'}
                onChange={(e) => updateRedirect('mode', e.target.value)}
                disabled={isLocked}
              />
              Nova aba do navegador
            </label>
            <label style={styles.radioOption}>
              <input
                type="radio"
                name="redirectMode"
                value="custom"
                checked={settings.redirects.mode === 'custom'}
                onChange={(e) => updateRedirect('mode', e.target.value)}
                disabled={isLocked}
              />
              URL personalizada
            </label>
          </div>
        </div>

        {settings.redirects.mode === 'custom' && (
          <div style={styles.field}>
            <label style={styles.label}>Endereco de destino</label>
            <input
              style={styles.input}
              type="text"
              value={settings.redirects.customUrl}
              onChange={(e) => updateRedirect('customUrl', e.target.value)}
              disabled={isLocked}
              placeholder="https://exemplo.com"
            />
          </div>
        )}
      </div>

      <button style={styles.saveButton} onClick={saveAndLock} disabled={isLocked}>
        {isLocked ? 'Configuracao travada' : 'Salvar e travar'}
      </button>

      <div style={styles.status}>{status}</div>

      <div style={styles.info}>
        Depois de travar, so desinstalando ou desativando a extensao para remover as regras.
      </div>
    </div>
  )
}

export default App
