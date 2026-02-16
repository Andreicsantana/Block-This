function blockYouTubeShorts() {
  if (location.pathname.startsWith('/shorts')) {
    location.replace('/')
  }

  document.querySelectorAll('ytd-rich-section-renderer').forEach(el => {
    if (el.innerText.toLowerCase().includes('shorts')) {
      el.remove()
    }
  })
}

function blockInstagramReels() {
  if (location.pathname.includes('/reels')) {
    location.replace('/')
  }

  document.querySelectorAll('a[href*="/reels"]').forEach(el => {
    el.style.display = 'none'
  })
}

function run() {
  if (location.hostname.includes('youtube')) blockYouTubeShorts()
  if (location.hostname.includes('instagram')) blockInstagramReels()
}

run()

new MutationObserver(run).observe(document.body, {
  childList: true,
  subtree: true
})
