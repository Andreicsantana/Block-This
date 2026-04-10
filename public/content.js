const REDIRECT_URL = 'https://www.google.com/'

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

let settings = DEFAULT_SETTINGS
let runScheduled = false

function parseTimeToMinutes(value) {
  if (!value || typeof value !== 'string') return null
  const [h, m] = value.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  if (h < 0 || h > 23 || m < 0 || m > 59) return null
  return h * 60 + m
}

function isNowAfter(minutes) {
  if (minutes === null) return false
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  return nowMinutes >= minutes
}

function isNowInTimeRange(startMinutes, endMinutes) {
  if (startMinutes === null || endMinutes === null) return false
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  if (startMinutes <= endMinutes) {
    return nowMinutes >= startMinutes && nowMinutes < endMinutes
  }

  return nowMinutes >= startMinutes || nowMinutes < endMinutes
}

function allowTotalYouTubeInstagram() {
  const unlockMinutes = parseTimeToMinutes(settings?.timers?.unlockAt)
  const pauseStart = parseTimeToMinutes(settings?.timers?.pauseStart)
  const pauseEnd = parseTimeToMinutes(settings?.timers?.pauseEnd)

  return isNowAfter(unlockMinutes) || isNowInTimeRange(pauseStart, pauseEnd)
}

function redirectAway() {
  if (location.href !== REDIRECT_URL) {
    location.replace(REDIRECT_URL)
  }
}

function blockYouTubeShorts() {
  if (location.pathname.startsWith('/shorts')) {
    location.replace('/')
    return
  }

  document.querySelectorAll('a[href^="/shorts"]').forEach((el) => {
    el.style.display = 'none'
  })

  document.querySelectorAll('ytd-reel-shelf-renderer, ytd-rich-section-renderer').forEach((el) => {
    if (el.innerText?.toLowerCase().includes('shorts')) {
      el.remove()
    }
  })
}

function blockInstagramReels() {
  if (location.pathname.includes('/reels')) {
    location.replace('/')
    return
  }

  document.querySelectorAll('a[href*="/reels"]').forEach((el) => {
    el.style.display = 'none'
  })
}

function applyRules() {
  const hostname = location.hostname
  const youtubeMode = settings?.rules?.youtube || 'shorts'
  const instagramMode = settings?.rules?.instagram || 'reels'
  const tiktokFull = Boolean(settings?.rules?.tiktokFull)
  const allowTotal = allowTotalYouTubeInstagram()

  if (hostname.includes('youtube.com')) {
    if (youtubeMode === 'full' && !allowTotal) {
      redirectAway()
      return
    }

    if (youtubeMode === 'shorts' || youtubeMode === 'full') {
      blockYouTubeShorts()
    }
  }

  if (hostname.includes('instagram.com')) {
    if (instagramMode === 'full' && !allowTotal) {
      redirectAway()
      return
    }

    if (instagramMode === 'reels' || instagramMode === 'full') {
      blockInstagramReels()
    }
  }

  if (hostname.includes('tiktok.com') && tiktokFull) {
    redirectAway()
  }
}

function scheduleRun() {
  if (runScheduled) return
  runScheduled = true

  requestAnimationFrame(() => {
    runScheduled = false
    applyRules()
  })
}

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

function loadSettingsAndRun() {
  chrome.storage.sync.get({ blockThisSettings: DEFAULT_SETTINGS }, (data) => {
    settings = normalizeSettings(data.blockThisSettings)
    scheduleRun()
  })
}

loadSettingsAndRun()

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync' || !changes.blockThisSettings) return
  settings = normalizeSettings(changes.blockThisSettings.newValue)
  scheduleRun()
})

new MutationObserver(scheduleRun).observe(document.documentElement, {
  childList: true,
  subtree: true,
})

setInterval(scheduleRun, 30000)
