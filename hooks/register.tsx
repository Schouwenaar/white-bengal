import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

const BACKDROP = 'white-bengal'

// --- scene:start (plain JS, so it can be previewed outside the mod) ---
const INK = {
  D: '#4a4463', // outline
  W: '#fdfcff', // white fur
  S: '#e2dcf0', // fur shade
  K: '#6f6890', // stripes
  P: '#f4a6c0', // nose
  B: '#7cc4e8', // ice blue eyes
  I: '#f9c9dc', // inner ear
}

const TIGER = [
  '...DD............DD...',
  '..DWWD..........DWWD..',
  '..DWIWDDDDDDDDDDWIWD..',
  '..DWIWWWWKWWKWWWWIWD..',
  '..DWWWWWWKWWKWWWWWWD..',
  '.DWWWWWWWWKKWWWWWWWWD.',
  '.DKKWWWWWWWWWWWWWWKKD.',
  '.DWWWBBDWWWWWWDBBWWWD.',
  '.DKKWBBDWWWWWWDBBWKKD.',
  '.DWWWWWWWWPPWWWWWWWWD.',
  '.DKWWWWWWWPPWWWWWWWKD.',
  '..DWWWWWDWDDWDWWWWWD..',
  '..DWWWWWWDWWDWWWWWWD..',
  '...DDWWWWWWWWWWWWDD...',
  '....DDDDDDDDDDDDDD....',
  '...DWWKWWWWWWWWKWWD...',
  '..DWWWKKWWWWWWKKWWWD..',
  '..DWKWWWWWWWWWWWWKWD..',
  '..DWKKWWSWWWWSWWKKWD..',
  '..DWWWWWSWWWWSWWWWWD..',
  '..DWKWWWSWWWWSWWWKWD..',
  '..DWWWWDDWWWWDDWWWWD..',
  '..DDDDDD.DDDD.DDDDDD..',
]

const FACE = TIGER.slice(0, 15)

const PAW = ['.L.L.', 'L.L.L', '.LLL.', '.LLL.']

const rect = (x: number, y: number, w: number, h: number, fill: string) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`

// One rect per run of the same colour in a row.
const sprite = (rows: string[], ox: number, oy: number, px: number, inks: Record<string, string>) => {
  let out = ''
  rows.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const c = row[x] ?? '.'
      let n = 1
      while (x + n < row.length && row[x + n] === c) n += 1
      const ink = inks[c]
      if (ink) out += rect(ox + x * px, oy + y * px, n * px, px, ink)
      x += n
    }
  })
  return out
}

const scene = () => {
  const W = 320
  const H = 180
  let s = ''

  // Dusk sky in flat pixel bands.
  const sky = ['#a99bd0', '#b5a5d6', '#c3b0dc', '#d2b9de', '#e3c0dd', '#f1c6d8', '#f9cfd2', '#fddacd']
  sky.forEach((c, i) => {
    s += rect(0, i * 16, W, 16, c)
  })
  // Dither between bands.
  for (let i = 1; i < sky.length; i += 1) {
    for (let x = i % 2; x < W; x += 4) s += rect(x, i * 16 - 1, 2, 1, sky[i] ?? '#ffffff')
  }

  // Stars.
  const stars: [number, number][] = [[14, 10], [42, 26], [70, 8], [98, 34], [126, 14], [150, 40], [182, 6], [206, 28], [236, 44], [298, 12], [310, 50], [24, 52], [86, 58], [168, 22]]
  stars.forEach(([x, y], i) => {
    s += rect(x, y, 1, 1, '#ffffff')
    if (i % 3 === 0) {
      s += rect(x - 1, y, 3, 1, '#fff7fb') + rect(x, y - 1, 1, 3, '#fff7fb')
    }
  })

  // Moon.
  const moon: [number, number][] = [[3, 6], [1, 10], [0, 12], [0, 12], [0, 12], [0, 12], [1, 10], [3, 6]]
  moon.forEach(([x, w], y) => {
    s += rect(258 + x, 14 + y * 2, w, 2, '#fff6e0')
  })
  s += rect(262, 20, 2, 2, '#f6e6c8') + rect(266, 24, 3, 2, '#f6e6c8')

  // Far hills, stepped.
  const hill = (base: number, color: string, heights: number[]) => {
    heights.forEach((h, i) => {
      s += rect(i * 8, base - h, 8, H - base + h, color)
    })
  }
  hill(128, '#b9d8cf', [6, 10, 14, 18, 20, 20, 18, 14, 10, 8, 6, 6, 8, 12, 16, 22, 26, 28, 28, 24, 20, 14, 10, 6, 4, 4, 6, 10, 14, 18, 22, 24, 24, 20, 16, 12, 8, 6, 4, 4])
  hill(140, '#9cc7b8', [10, 12, 12, 10, 8, 4, 2, 2, 4, 8, 12, 14, 14, 12, 8, 4, 2, 0, 0, 2, 4, 8, 10, 12, 12, 10, 6, 4, 2, 2, 4, 6, 10, 12, 14, 14, 12, 10, 8, 6])

  // Snow.
  s += rect(0, 146, W, 34, '#f6f3fb')
  for (let x = 0; x < W; x += 6) s += rect(x, 145, 3, 1, '#f6f3fb')
  s += rect(0, 162, W, 18, '#ebe6f5')
  for (let x = 2; x < W; x += 5) s += rect(x, 161, 2, 1, '#ebe6f5')

  // Bamboo, left edge.
  const bamboo = (x: number, top: number, w: number) => {
    s += rect(x, top, w, 150 - top, '#86b9a2')
    s += rect(x, top, 1, 150 - top, '#a6d2bd')
    for (let y = top + 10; y < 150; y += 14) s += rect(x, y, w, 1, '#5f9480')
  }
  bamboo(8, 40, 4)
  bamboo(18, 62, 3)
  bamboo(28, 28, 4)
  const right: [number, number][] = [[12, 52], [32, 44], [21, 78], [32, 70]]
  right.forEach(([x, y]) => {
    s += rect(x, y, 6, 2, '#86b9a2') + rect(x + 4, y + 2, 5, 2, '#9cc7b8')
  })
  const left: [number, number][] = [[8, 66], [28, 90]]
  left.forEach(([x, y]) => {
    s += rect(x - 6, y, 6, 2, '#86b9a2') + rect(x - 9, y + 2, 5, 2, '#9cc7b8')
  })

  // Paw prints across the snow.
  const paws: [number, number][] = [[70, 166], [92, 158], [116, 167], [140, 159], [164, 168], [188, 160], [212, 168]]
  paws.forEach(([x, y]) => {
    s += sprite(PAW, x, y, 1, { L: '#cdc2e4' })
  })

  // The tiger, bottom right, with a curled tail.
  const tx = 246
  const ty = 112
  s += rect(tx + 38, ty + 34, 6, 2, INK.D) + rect(tx + 42, ty + 28, 2, 6, INK.D)
  s += rect(tx + 38, ty + 36, 8, 4, INK.W) + rect(tx + 44, ty + 28, 4, 8, INK.W)
  s += rect(tx + 44, ty + 31, 4, 1, INK.K) + rect(tx + 40, ty + 36, 1, 4, INK.K)
  s += rect(tx + 38, ty + 40, 10, 2, INK.D) + rect(tx + 48, ty + 28, 2, 12, INK.D) + rect(tx + 44, ty + 26, 4, 2, INK.D)
  s += sprite(TIGER, tx, ty, 2, INK)

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" ` +
    `preserveAspectRatio="xMaxYMax slice" shape-rendering="crispEdges">${s}</svg>`
  )
}

const face = () =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 15" shape-rendering="crispEdges">` +
  sprite(FACE, 0, 0, 1, INK) +
  `</svg>`

const pawRow = () => {
  let s = ''
  for (let i = 0; i < 3; i += 1) {
    s += sprite(PAW, i * 8, i % 2, 1, { L: ['#c8b6e2', '#f4a6c0', '#9cc7b8'][i] ?? '#c8b6e2' })
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 5" shape-rendering="crispEdges">${s}</svg>`
}
// --- scene:end ---

// Snow, lavender-grey stripes, ice-blue eyes and a pink nose, by day and by night.
const { theme, problems } = makeColors({
  label: 'Witte bengaal',
  roles: { accent: '#5aa9d6', danger: '#d9627e', success: '#5fa88c', warning: '#d19a4a', pro: '#a184d6' },
  light: {
    gray: {
      anchors: {
        'surface-0': '#ece8f4',
        'surface-1': '#f3f0f9',
        'surface-2': '#faf8fd',
        'text-primary': '#2b2740',
        'text-secondary': '#4d4868',
        'text-muted': '#655f80',
      },
    },
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#1c1a28',
        'surface-1': '#232031',
        'surface-2': '#2a273a',
        'surface-3': '#2c293d',
        'text-primary': '#f1eef9',
        'text-secondary': '#cfc9e0',
        'text-muted': '#a9a2c0',
      },
    },
  },
})

const THEME: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: BACKDROP, glass: { blur: 6, opacity: 0.62 } },
}

export const register: Register = on => {
  let isOn = true

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'white-bengal',
      description: 'Witte-bengaal thema aan of uit zetten',
      argumentHint: 'on | off',
    })
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))
    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    if (isOn) {
      void $.theme.set(THEME)
    }

    return next(e)
  })

  on('command.run', { command: 'white-bengal' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    isOn = arg === 'on' || arg === 'aan' ? true : arg === 'off' || arg === 'uit' ? false : !isOn
    if (isOn) {
      await $.theme.set(THEME)
    } else {
      await $.theme.clear()
    }

    return { text: isOn ? 'Witte-bengaal thema staat aan.' : 'Witte-bengaal thema staat uit.' }
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.props.scene !== BACKDROP || e.props.plugin !== 'white-bengal') {
      return next(e)
    }
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)

    return <Svg source={scene()} alt="Pixel-art witte bengaalse tijger in een pastel sneeuwlandschap" />
  })

  on('ui.render', { component: 'AbovePrompt' }, ($, e, next) => {
    if (!isOn || e.props.hasSurvey || e.surface !== 'desktop') {
      return next(e)
    }
    const { Box, Svg, Text } = $.ui.resolve(e)

    return (
      <Box flexDirection="row" alignItems="center" gap={1}>
        <Svg source={face()} alt="witte tijger" width={22} height={15} />
        <Text color="#9d8ec4">witte bengaal</Text>
        <Svg source={pawRow()} alt="pootafdrukken" width={44} height={10} />
      </Box>
    )
  })
}
