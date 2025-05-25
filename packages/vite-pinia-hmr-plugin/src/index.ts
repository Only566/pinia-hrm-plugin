import type { PluginOption } from 'vite'
import MagicString from 'magic-string';
export interface Options {
  include?: string[]
  exclude?: string[]
}
const regex = /^export\s*(const|var|let)\s*(\w+Store)\s*=/gm;

const generateHMRCode = (storeVariableNames: string[]) => `if (import.meta.hot) {
${storeVariableNames.map(v => `  import.meta.hot.accept(acceptHMRUpdate(${v}, import.meta.hot))`).join('\n')}
}`
export default function vitePinia(): PluginOption {
  return {
    name: 'vite-plugin-pinia-hmr',
    transform(code, id) {
      try {
        if (id.includes('/node_modules/')) return

        const storeVariableNames = new Set<string>()
        let match;
        while ((match = regex.exec(code)) !== null) {
          storeVariableNames.add(match[2])
        }
        if (storeVariableNames.size === 0) return

        const ms = new MagicString(code)
        ms.appendLeft(0, 'import { acceptHMRUpdate } from \'pinia\';\n')
        ms.appendRight(code.length, generateHMRCode([...storeVariableNames]))
        return {
          code: ms.toString(),
          map: ms.generateMap({ hires: 'boundary' })
        }
      } catch (e) {
        console.warn(`[Pinia HMR Plugin] Error processing ${id}:`, e)
      }
    }
  }
}
