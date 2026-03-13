/**
 * Transform tokens.json (Tokens Studio format) into CSS custom property maps.
 * Can be run as a script to regenerate css-vars.ts.
 */

import tokensData from './tokens.json'

type TokenValue = { value: string; type: string }
type TokenGroup = { [key: string]: TokenValue | TokenGroup }

/** Resolve token references like {color.primary.DEFAULT} */
function resolveReference(ref: string, root: TokenGroup): string {
  const path = ref.replace(/^\{/, '').replace(/\}$/, '').split('.')
  let current: TokenGroup | TokenValue = root
  for (const segment of path) {
    if (current && typeof current === 'object' && segment in current) {
      current = (current as TokenGroup)[segment] as TokenGroup | TokenValue
    } else {
      return ref // unresolvable, return as-is
    }
  }
  if (current && typeof current === 'object' && 'value' in current) {
    const val = (current as TokenValue).value
    if (val.startsWith('{')) return resolveReference(val, root)
    return val
  }
  return ref
}

/** Flatten nested token structure into CSS custom property map */
function flattenTokens(
  obj: TokenGroup,
  prefix: string,
  root: TokenGroup,
): Record<string, string> {
  const result: Record<string, string> = {}

  for (const [key, val] of Object.entries(obj)) {
    const propName =
      key === 'DEFAULT'
        ? prefix
        : `${prefix}-${key}`

    if (val && typeof val === 'object' && 'value' in val && 'type' in val) {
      let resolved = (val as TokenValue).value
      if (typeof resolved === 'string' && resolved.startsWith('{')) {
        resolved = resolveReference(resolved, root)
      }
      result[propName] = resolved
    } else if (val && typeof val === 'object') {
      Object.assign(result, flattenTokens(val as TokenGroup, propName, root))
    }
  }

  return result
}

/** Transform tokens.json into light and dark CSS variable maps */
export function transformTokens(): {
  light: Record<string, string>
  dark: Record<string, string>
} {
  const globalTokens = tokensData.global as unknown as TokenGroup
  const darkTokens = tokensData.dark as unknown as TokenGroup

  const light: Record<string, string> = {}
  const dark: Record<string, string> = {}

  // Process each category from global tokens
  for (const [category, tokens] of Object.entries(globalTokens)) {
    if (tokens && typeof tokens === 'object') {
      Object.assign(
        light,
        flattenTokens(tokens as TokenGroup, `--${category}`, globalTokens),
      )
    }
  }

  // Process dark overrides
  for (const [category, tokens] of Object.entries(darkTokens)) {
    if (tokens && typeof tokens === 'object') {
      Object.assign(
        dark,
        flattenTokens(tokens as TokenGroup, `--${category}`, globalTokens),
      )
    }
  }

  return { light, dark }
}

// When run as script, output the token maps
if (import.meta.url.endsWith(process.argv[1]?.replace(/^file:\/\//, '') || '')) {
  const { light, dark } = transformTokens()
  console.log('Light tokens:', Object.keys(light).length)
  console.log('Dark tokens:', Object.keys(dark).length)
}
