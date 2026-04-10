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
    pauseStart: '',
    pauseEnd: '',
  },
}

function getStorageSync() {
  if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
    return chrome.storage.sync
  }

  return {
    get(defaults, callback) {
      const local = {
        theme: localStorage.getItem('blockThisTheme') || undefined,
        blockThisSettings: localStorage.getItem('blockThisSettings')
          ? JSON.parse(localStorage.getItem('blockThisSettings'))
          : undefined,
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
  }
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

  const saveAndLock = () => {
    if (settings.locked) return

    const hasOnePauseValue = Boolean(settings.timers.pauseStart) !== Boolean(settings.timers.pauseEnd)
    if (hasOnePauseValue) {
      setStatus('Para usar pausa, preencha inicio e fim.')
      return
    }

    const finalSettings = {
      ...settings,
      locked: true,
    }

    storage.set({ blockThisSettings: finalSettings }, () => {
      setSettings(finalSettings)
      setStatus('Configuracao salva e travada.')
    })
  }

  const isDark = theme === 'dark'
  const isLocked = settings.locked

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

        <div style={styles.field}>
          <label style={styles.label}>Desbloqueio diario apos</label>
          <input
            style={styles.input}
            type="time"
            value={settings.timers.unlockAt}
            onChange={(e) => updateTimer('unlockAt', e.target.value)}
            disabled={isLocked}
          />
        </div>

        <div style={styles.timerGrid}>
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
