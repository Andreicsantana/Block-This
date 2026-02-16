import { useEffect, useState } from 'react'

function App() {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    chrome.storage.sync.get({ theme: 'light' }, (data) => {
      setTheme(data.theme)
    })
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    chrome.storage.sync.set({ theme: newTheme })
  }

  const isDark = theme === 'dark'

  const styles = {
    container: {
      width: 280,
      background: isDark ? '#000000' : '#ffffff',
      color: isDark ? '#ffffff' : '#000000',
      padding: 32,
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
      fontSize: 18,
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
    divider: {
      height: 1,
      background: isDark ? '#222222' : '#e0e0e0',
      margin: '24px 0',
    },
    section: {
      marginBottom: 24,
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
    list: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
    listItem: {
      fontSize: 14,
      padding: '8px 0',
      textAlign: 'center',
      borderBottom: `1px solid ${isDark ? '#111111' : '#f5f5f5'}`,
    },
    info: {
      fontSize: 12,
      lineHeight: 1.6,
      textAlign: 'center',
      opacity: 0.6,
      marginTop: 24,
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

      <div style={styles.divider} />

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Bloqueado</div>
        <ul style={styles.list}>
          <li style={styles.listItem}>YouTube Shorts</li>
          <li style={styles.listItem}>Instagram Reels</li>
        </ul>
      </div>

      <div style={styles.divider} />

      <div style={styles.info}>
        Para desbloquear, desative a extensão nas configurações do navegador
      </div>
    </div>
  )
}

export default App
