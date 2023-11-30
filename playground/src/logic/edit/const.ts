import { DEFAULT_FONT } from '@amihhs/canvas-poster'
import type { BaseSetting, CanvasControlLocationJson, DrawJson } from '@/interface'

export const CANVAS_EL_KEY = Symbol('CANVAS_EL')

export const BASE_SETTING_KEY = Symbol('BASE_SETTING')

export const CONTENT_JSON_KEY = Symbol('CONTENT_JSON')

export const ADD_FROM_KEY = Symbol('ADD_FROM_KEY')

/** */

export const baseSettingDefault: BaseSetting = {
  debug: true,
  width: 375,
  height: 'auto',
  dpi: window.devicePixelRatio || 2,
  defaultFont: Object.assign({}, DEFAULT_FONT),
  defaultColor: '#000000',
}

export const defaultChangeContext = {
  x: 0,
  y: 0,
  item: null as CanvasControlLocationJson | null,
}

/** */

export const DRAW_CONTEXT_MAP = ref<Map<string, CanvasControlLocationJson>>(new Map())

export const CURRENT_HOVER_KEY = ref<{ key: string, index: number } | null>(null)

export const CURRENT_CHANGE_JSON = ref<DrawJson | null>(null)

export const CHANGE_JSON_DRAWER_VISIBLE = ref<boolean>(false)

export const CHANGE_START_CONTEXT = ref(Object.assign({}, defaultChangeContext))
