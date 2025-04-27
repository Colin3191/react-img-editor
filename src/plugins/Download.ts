import type { DrawEventParams } from '../common/type';
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
      let { width, height, x, y } = imageElement.getClientRect();
      if (x < 0) {
        width = width + x;
        x = 0;
      }
      if (y < 0) {
        height = height + y;
        y = 0;
      }
      if (x + width > stage.width()) {
        width = stage.width() - x;
      }
      if (y + height > stage.height()) {
        height = stage.height() - y;
      }

      const canvas = stage.toCanvas({
        pixelRatio,
        x,
        y,
        width,
        height,
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
