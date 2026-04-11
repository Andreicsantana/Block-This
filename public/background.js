chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'BLOCK_THIS_OPEN_HOME') return undefined

  const currentTabId = sender.tab?.id

  chrome.tabs.create({}, (tab) => {
    if (currentTabId != null) {
      chrome.tabs.remove(currentTabId, () => {
        sendResponse({ ok: !chrome.runtime.lastError, tabId: tab?.id })
      })
      return
    }

    sendResponse({ ok: true, tabId: tab?.id })
  })

  return true
})