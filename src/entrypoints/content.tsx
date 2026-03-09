import ReactDOM from 'react-dom/client'

type HintBadge = {
    label: string
    top: number
    left: number
}

function collectBadges(): HintBadge[] {
    const links = document.querySelectorAll('a[href]')
    const viewport = { w: window.innerWidth, h: window.innerHeight }
    const badges: HintBadge[] = []

    for (const link of links) {
        const rect = link.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) continue
        if (rect.bottom < 0 || rect.top > viewport.h) continue
        if (rect.right < 0 || rect.left > viewport.w) continue

        badges.push({
            label: 'H',
            top: window.scrollY + rect.top,
            left: window.scrollX + rect.left,
        })
    }
    return badges
}

function HintLayer({ badges }: { badges: HintBadge[] }) {
    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 2147483647,
                pointerEvents: 'none',
            }}
        >
            {badges.map((badge, i) => (
                <div
                    key={i}
                    style={{
                        position: 'absolute',
                        top: `${badge.top}px`,
                        left: `${badge.left}px`,
                        background: '#FFFF00',
                        color: '#000',
                        font: 'bold 12px monospace',
                        padding: '1px 4px',
                        borderRadius: '3px',
                    }}
                >
                    {badge.label}
                </div>
            ))}
        </div>
    )
}

export default defineContentScript({
    matches: ['<all_urls>'],
    cssInjectionMode: 'ui',

    async main(ctx: InstanceType<typeof ContentScriptContext>) {
        let ui: Awaited<ReturnType<typeof createShadowRootUi>> | null = null

        function activate() {
            dismiss()

            const badges = collectBadges()
            console.log(`[Link Hinter] badges: ${badges.length}`)

            createShadowRootUi(ctx, {
                name: 'link-hinter',
                position: 'overlay',
                onMount: (container) => {
                    const wrapper = document.createElement('div')
                    container.append(wrapper)
                    const root = ReactDOM.createRoot(wrapper)
                    root.render(<HintLayer badges={badges} />)
                    return root
                },
                onRemove: (root) => {
                    root?.unmount()
                },
            }).then((created) => {
                ui = created
                ui.mount()
            })
        }

        function dismiss() {
            if (ui) {
                ui.remove()
                ui = null
            }
        }

        document.addEventListener('keydown', (e) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
            if ((e.target as HTMLElement).isContentEditable) return

            if (e.key === 'f' && !ui) {
                activate()
            } else if (e.key === 'Escape' && ui) {
                dismiss()
            }
        })
    },
})
