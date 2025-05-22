import type { PluginOption } from 'vite'
export default function vitePinia(): PluginOption {
  return {
    name: 'vite-plugin-pinia-hmr',
    transform(code, id) {
      console.log({code, id});
    }
  }
}
