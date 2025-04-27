import type { DrawEventParams } from '../common/type';
import {
  drawLayerName,
  imageElementName,
  imageLayerName,
} from '../common/constants';
import Plugin from './Plugin';

export default class Download extends Plugin {
  name = 'download';
  iconfont = 'iconfont icon-download';
  title = '下载图片';
  disappearImmediately = true;

  onEnter = (drawEventParams: DrawEventParams) => {
    const { stage, pixelRatio, imageElement } = drawEventParams;
    // 延迟下载，等触发 plugin 的 onLeave 生命周期，清除未完成的现场
    setTimeout(() => {
      const cloneStage = stage.clone();
      const imageLayer = cloneStage.findOne(`.${imageLayerName}`);
      const drawLayer = cloneStage.findOne(`.${drawLayerName}`);
      const image = cloneStage.findOne(`.${imageElementName}`);
      imageLayer?.scale({ x: 1, y: 1 });
      drawLayer?.scale({ x: 1, y: 1 });
      const { width, height, x, y } = image!.getClientRect();
      const canvas = cloneStage.toCanvas({
        x,
        y,
        width,
        height,
        pixelRatio,
      });
      canvas.toBlob((blob: any) => {
        const link = document.createElement('a');
        link.download = '';
        link.href = URL.createObjectURL(blob);
        link.click();
      }, 'image/png');
    }, 100);
  };
}
