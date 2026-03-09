let container: HTMLDivElement | null = null

function activate() {
    dismiss()

    container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.top = '0'
    container.style.left = '0'
    container.style.zIndex = '2147483647'
    container.style.pointerEvents = 'none'
    document.body.appendChild(container)

    const links = document.querySelectorAll('a[href]')

    for (const link of links) {
        const rect = link.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) continue
        if (rect.bottom < 0 || rect.top > window.innerHeight) continue
        if (rect.right < 0 || rect.left > window.innerWidth) continue

        const badge = document.createElement('div')
        badge.textContent = 'H'
        badge.style.position = 'fixed'
        badge.style.top = `${rect.top}px`
        badge.style.left = `${rect.left}px`
        badge.style.background = '#FFFF00'
        badge.style.color = '#000'
        badge.style.font = 'bold 12px monospace'
        badge.style.padding = '1px 4px'
        badge.style.borderRadius = '3px'
        container.appendChild(badge)
    }
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
