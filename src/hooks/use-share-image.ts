import { useCallback, useRef, useState } from 'react'
import { toPng } from 'html-to-image'

export function useShareImage() {
  const ref = useRef<HTMLDivElement>(null)
  const [generating, setGenerating] = useState(false)

  const generate = useCallback(async (): Promise<string | null> => {
    if (!ref.current) return null
    setGenerating(true)
    try {
      return await toPng(ref.current, { pixelRatio: 2, cacheBust: true })
    } finally {
      setGenerating(false)
    }
  }, [])

  const download = useCallback(
    async (filename: string) => {
      const dataUrl = await generate()
      if (!dataUrl) return
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = filename
      a.click()
    },
    [generate],
  )

  const share = useCallback(
    async (filename: string, title: string): Promise<boolean> => {
      const dataUrl = await generate()
      if (!dataUrl) return false
      try {
        const blob = await (await fetch(dataUrl)).blob()
        const file = new File([blob], filename, { type: 'image/png' })
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title })
          return true
        }
      } catch {
        // usuário cancelou ou share indisponível → cai no download
      }
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = filename
      a.click()
      return true
    },
    [generate],
  )

  return { ref, generating, download, share }
}
