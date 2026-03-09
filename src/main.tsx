let container: HTMLDivElement | null = null

function activate() {
    dismiss()

    container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.top = '0'
    container.style.left = '0'
    container.style.zIndex = '2147483647'
    container.style.pointerEvents = 'none'
    document.body.appendChild(container)

    const links = document.querySelectorAll('a[href]')
    const viewport = { w: window.innerWidth, h: window.innerHeight }
    let total = 0
    let visible = 0

    for (const link of links) {
        const rect = link.getBoundingClientRect()
        total++
        if (rect.width === 0 || rect.height === 0) continue
        if (rect.bottom < 0 || rect.top > viewport.h) continue
        if (rect.right < 0 || rect.left > viewport.w) continue
        visible++

        const badge = document.createElement('div')
        badge.textContent = 'B'
        badge.style.position = 'absolute'
        badge.style.top = `${window.scrollY + rect.top}px`
        badge.style.left = `${window.scrollX + rect.left}px`
        badge.style.background = '#FFFF00'
        badge.style.color = '#000'
        badge.style.font = 'bold 12px monospace'
        badge.style.padding = '1px 4px'
        badge.style.borderRadius = '3px'
        container.appendChild(badge)
    }
    console.log(`[Link Hinter] viewport: ${viewport.w}x${viewport.h}, links: ${total}, visible: ${visible}`)
}

function dismiss() {
    if (container) {
        container.remove()
        container = null
    }
}

document.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
    if ((e.target as HTMLElement).isContentEditable) return

    if (e.key === 'f' && !container) {
        activate()
    } else if (e.key === 'Escape' && container) {
        dismiss()
    }
})
