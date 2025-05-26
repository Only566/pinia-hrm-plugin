import type { PluginOption } from 'vite'
import MagicString from 'magic-string';
import { parse } from '@babel/parser'
import { walk } from 'estree-walker';
import type {
  CallExpression,
  ExportNamedDeclaration,
  Identifier,
  ImportDeclaration,
  Program,
} from '@babel/types';
interface StoreDefinition {
  variableName: string
  storeId: string
}

const generateHMRCode = (storeVariableNames: string[]) => `if (import.meta.hot) {
${storeVariableNames.map(v => `  import.meta.hot.accept(acceptHMRUpdate(${v}, import.meta.hot))`).join('\n')}
}`
export default function vitePinia(): PluginOption {
  return {
    name: 'vite-plugin-pinia-hmr',
    transform(code, id) {
      try {
        if (id.includes('/node_modules/')) return
        const ast = parse(code, {
          sourceType: 'module',
          plugins: ['typescript', 'importAssertions'],
          allowReturnOutsideFunction: true
        }) as unknown as Program

        let hasPiniaImport = false
        let defineStoreAlias: string | null = null
        const stores: StoreDefinition[] = []
        walk(ast as any, {
          enter(node) {
            if (node.type === 'ImportDeclaration') {
              const importNode = node as unknown as ImportDeclaration
              if (importNode.source.value === 'pinia') {
                hasPiniaImport = true
                importNode.specifiers.forEach(spec => {
                  if (spec.type === 'ImportSpecifier' && spec.imported.type === 'Identifier') {
                    if (spec.imported.name === 'defineStore') {
                      defineStoreAlias = spec.local.name
                    }
                  }
                })
              }
            }
            if (node.type === 'ExportNamedDeclaration') {
              const exportNode = node as unknown as ExportNamedDeclaration
              if (exportNode.declaration?.type === 'VariableDeclaration') {
                exportNode.declaration.declarations.forEach(declarator => {
                  if (declarator.type === 'VariableDeclarator' &&
                    declarator.init?.type === 'CallExpression') {
                    const callExpr = declarator.init as CallExpression
                    if (callExpr.callee.type === 'Identifier' &&
                      callExpr.callee.name === defineStoreAlias) {
                      const varName = (declarator.id as Identifier).name
                      const storeIdNode = callExpr.arguments[0]
                      if (storeIdNode?.type === 'StringLiteral') {
                        stores.push({
                          variableName: varName,
                          storeId: storeIdNode.value
                        })
                      }
                    }
                  }
                })
              }
            }
          }
        })
        if (!hasPiniaImport || stores.length === 0) return

        const ms = new MagicString(code)
        ms.appendLeft(0, 'import { acceptHMRUpdate } from \'pinia\';\n')
        ms.appendRight(code.length, generateHMRCode([...stores.map(stores => stores.variableName)]))
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
