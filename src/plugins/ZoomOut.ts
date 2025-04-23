
import { DrawEventParams, PluginParamValue } from '../common/type'
import Plugin from './Plugin'

export default class ZoomOut extends Plugin {
  name = 'zoomOut'
  iconfont = 'iconfont icon-zoomOut'
  title = '缩小'
  defaultParamValue = {
    zoomRatio: 0.2,
  } as PluginParamValue

  onEnter = (drawEventParams: DrawEventParams) => {
    const {stage, paramValue} = drawEventParams

    const zoomRatio = (paramValue && paramValue.zoomRatio) ? paramValue.zoomRatio : this.defaultParamValue.zoomRatio || 0

    stage.scale({
      x: stage.scaleX() * (1 - zoomRatio),
      y: stage.scaleY() * (1 - zoomRatio),
    })

    stage.x(stage.width() / 2)
    stage.y(stage.height() / 2)
    stage.offsetX(stage.width() / 2)
    stage.offsetY(stage.height() / 2)
    stage.draggable(true)
    stage.draw()
  }

  onLeave = (drawEventParams: DrawEventParams) => {
    const {stage} = drawEventParams
    stage.draggable(false)
    stage.draw()
  }
}