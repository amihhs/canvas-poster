import { DEFAULT_FONT } from '@amihhs/canvas-poster'
import type { BaseSetting, CanvasControlLocationJson, DrawJson } from '@/interface'

/**
 * @description 画布元素
 */
export const CANVAS_EL_KEY = Symbol('CANVAS_EL')
/**
 * @description 基础设置
 */
export const BASE_SETTING_KEY = Symbol('BASE_SETTING')
/**
 * @description 绘制内容json
 */
export const CONTENT_JSON_KEY = Symbol('CONTENT_JSON')
/**
 * @description 添加表单数据
 */
export const ADD_FROM_KEY = Symbol('ADD_FROM_KEY')

/** */
/** */
/** */
/** */

/**
 * @description 基础设置默认值
 */
export const baseSettingDefault: BaseSetting = {
  width: 375,
  height: 'auto',
  dpi: 3,
  defaultFont: Object.assign({}, DEFAULT_FONT),
  defaultColor: '#000000',
}
/**
 * @description 正在修改的json的初始状态默认值
 */
export const defaultChangeContext = {
  x: 0,
  y: 0,
  item: null as CanvasControlLocationJson | null,
}

/** */

/**
 * @description 绘制内容MAP
 */
export const DRAW_CONTEXT_MAP = ref<Map<string, CanvasControlLocationJson>>(new Map())
/**
 * @description 当前鼠标悬浮的 MAP KEY
 */
export const CURRENT_HOVER_KEY = ref<{ key: string, index: number } | null>(null)
/**
 * @description 当前正在修改的json
 */
export const CURRENT_CHANGE_JSON = ref<DrawJson | null>(null)
/**
 * @description 当前正在修改的json的可见性
 */
export const CHANGE_JSON_DRAWER_VISIBLE = ref<boolean>(false)
/**
 * 正在修改的json的初始状态
 */
export const CHANGE_START_CONTEXT = ref(Object.assign({}, defaultChangeContext))
