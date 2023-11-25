# Canvas Poster

## Description  

This is a simple canvas poster that allows you to draw on a canvas and save the image as a poster.

The goal is to dynamically generate a specific json data format and then generate the corresponding poster when the data format of the poster content is known but the specific data is uncertain.

> This is a work in progress.  
> npm version: 0.* - `v0` branch
> The `main` branch has not yet released related versions on npm.  

[![npm](https://img.shields.io/npm/v/@amihhs/canvas-poster.svg)](https://npmjs.com/package/@amihhs/canvas-poster)

## Installation

```bash

pnpm install @amihhs/canvas-poster

```

## Usage

```typescript

import { PosterType, createPoster } from '@amihhs/canvas-poster'

const { context, render } = createPoster({/* PosterConfig */})
const json = [
  {
    type: PosterType.rect,
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    bgColor: '#000'
  }
]

try {
  const canvas = await render(context, json)
} catch(e) {
  console.error(e)
}

```

## API

```typescript

interface PosterConfig {
  // default: 375
  width?: number
  // default: auto
  height?: number | 'auto'
  // default: 2
  dpi?: number
  // default font style for text
  defaultFont?: Partial<FontConfig>
  // default: '#000000'
  defaultColor?: string
  // if true, will set crossOrigin to 'anonymous'; default: true
  cors?: boolean
  // when cors is true and image load error, will use this proxy to get image
  proxy?: ((src: string) => Promise<string>) | null
}

interface PosterContext {
  config: _Config
  canvas: CanvasElement
  context: CanvasRenderingContext2D
  font: (config: FontConfig) => string
  updateConfig: (cfg: Partial<PosterConfig>) => void
  sliceText: (data: Omit<CalcTextLineCountOptions, 'width' | 'height' | 'direction'>) => SliceText[]
  calcDPI: (data: number) => number
  calcTextWidth: (text: string, font: string, letterSpacing?: number) => number
  calcTextLineCount: (options: CalcTextLineCountOptions) => number
}

enum PosterType {
  line = 'line',
  image = 'image',
  text = 'text',
  rect = 'rect',
}

type PosterJson = PosterImage | PosterText | PosterRect | PosterLine

```

## License

[MIT License](/LICENSE)
