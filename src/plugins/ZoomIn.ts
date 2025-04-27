import type { DrawEventParams, PluginParamValue } from '../common/type';
import Plugin from './Plugin';

export default class ZoomIn extends Plugin {
  name = 'zoomIn';
  iconfont = 'iconfont icon-zoomIn';
  title = '放大';
  defaultParamValue = {
    zoomRatio: 0.2,
  } as PluginParamValue;
  disappearImmediately = true;

  onEnter = (drawEventParams: DrawEventParams) => {
    const { paramValue, imageLayer, drawLayer } = drawEventParams;

    const zoomRatio =
      paramValue && paramValue.zoomRatio
        ? paramValue.zoomRatio
        : this.defaultParamValue.zoomRatio || 0;

    const scaleX = imageLayer.scaleX() * (1 + zoomRatio);
    const scaleY = imageLayer.scaleY() * (1 + zoomRatio);
    imageLayer.scale({
      x: scaleX,
      y: scaleY,
    });
    drawLayer.scale({
      x: scaleX,
      y: scaleY,
    });

    imageLayer.x(imageLayer.width() / 2);
    imageLayer.y(imageLayer.height() / 2);
    drawLayer.x(drawLayer.width() / 2);
    drawLayer.y(drawLayer.height() / 2);
    imageLayer.offsetX(imageLayer.width() / 2);
    imageLayer.offsetY(imageLayer.height() / 2);
    drawLayer.offsetX(drawLayer.width() / 2);
    drawLayer.offsetY(drawLayer.height() / 2);

    imageLayer.draw();
    drawLayer.draw();
  };

  onLeave = (drawEventParams: DrawEventParams) => {
    const { stage } = drawEventParams;
    stage.draw();
  };
}
