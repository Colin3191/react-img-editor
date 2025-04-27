import Konva from 'konva';
import React from 'react';
import PubSub from '../common/PubSub';
import { prefixCls } from '../common/constants';
import type { DrawEventParams } from '../common/type';
import { uuid } from '../common/utils';
import { type EditorContextProps, withEditorContext } from './EditorContext';

export interface PaletteProps extends EditorContextProps {
  height: number;
  imageObj: HTMLImageElement;
  getStage?: (stage: any) => void;
}

export type PaletteRef = InstanceType<typeof Palette>;

class Palette extends React.Component<PaletteProps> {
  containerId = prefixCls + uuid();
  canvasWidth: number;
  canvasHeight: number;
  pixelRatio: number;
  stage: Konva.Stage | null = null;
  imageLayer: Konva.Layer | null = null;
  drawLayer: Konva.Layer | null = null;
  imageElement: Konva.Image | null = null;
  imageData: ImageData | null = null;
  historyStack: any[] = [];
  pubSub: InstanceType<typeof PubSub>;

  constructor(props: PaletteProps) {
    super(props);

    const { containerWidth, imageObj } = props;

    const imageNatureWidth = imageObj.naturalWidth;
    const imageNatureHeight = imageObj.naturalHeight;
    const wRatio = containerWidth / imageNatureWidth;
    const hRatio = props.height / imageNatureHeight;
    const scaleRatio = Math.min(wRatio, hRatio, 1);

    this.canvasWidth = Math.round(imageNatureWidth * scaleRatio);
    this.canvasHeight = Math.round(imageNatureHeight * scaleRatio);
    this.pixelRatio = 1 / scaleRatio;

    Konva.pixelRatio = this.pixelRatio;

    this.pubSub = new PubSub(this.containerId);
    this.subHistoryStack();
  }

  componentDidMount() {
    this.init();

    const { currentPlugin } = this.props;
    if (currentPlugin && currentPlugin.onEnter) {
      currentPlugin.onEnter(this.getDrawEventParams(null));
    }
  }

  componentDidUpdate(prevProps: PaletteProps) {
    const prevCurrentPlugin = prevProps.currentPlugin;
    const { currentPlugin } = this.props;

    // 撤销等操作，点击后会再自动清除当前插件
    if (currentPlugin !== prevCurrentPlugin) {
      if (prevCurrentPlugin && prevCurrentPlugin.onLeave) {
        if (prevCurrentPlugin.name !== currentPlugin?.name) {
          prevCurrentPlugin.onLeave(this.getDrawEventParams(null));
        }
      }

      if (currentPlugin) {
        this.bindEvents();

        if (currentPlugin.onEnter) {
          currentPlugin.onEnter(this.getDrawEventParams(null));
        }
      }
    }

    if (this.stage) {
      this.stage.draggable(this.props.draggable);
    }
  }

  componentWillUnmount() {
    const { currentPlugin } = this.props;
    currentPlugin &&
      currentPlugin.onLeave &&
      currentPlugin.onLeave(this.getDrawEventParams(null));
  }

  init = () => {
    const { getStage, imageObj } = this.props;

    this.stage = new Konva.Stage({
      container: this.containerId,
      width: this.props.containerWidth,
      height: this.props.height,
      // width: this.canvasWidth,
      // height: this.canvasHeight,
    });

    getStage && getStage(this.resetStage(this.stage!));

    const img = new Konva.Image({
      x: (this.props.containerWidth - this.canvasWidth) / 2,
      y: (this.props.height - this.canvasHeight) / 2,
      image: imageObj,
      width: this.canvasWidth,
      height: this.canvasHeight,
    });
    this.imageElement = img;
    this.imageLayer = new Konva.Layer();
    this.stage.add(this.imageLayer);
    this.imageLayer.setZIndex(0);
    this.imageLayer.add(img);
    this.imageLayer.draw();

    this.imageData = this.generateImageData(
      imageObj,
      this.canvasWidth,
      this.canvasHeight,
    );

    this.drawLayer = new Konva.Layer();
    this.stage.add(this.drawLayer);
    this.bindEvents();
    if (this.props.draggable) {
      this.stage.draggable(true);
    }
  };

  // 裁剪等操作执行后需要重新初始化
  reload = (imgObj: any, width: number, height: number) => {
    const { getStage } = this.props;

    this.removeEvents();
    this.historyStack = [];
    this.stage = new Konva.Stage({
      container: this.containerId,
      width: width,
      height: height,
    });

    getStage && getStage(this.resetStage(this.stage!));

    const img = new Konva.Image({
      x: 0,
      y: 0,
      image: imgObj,
      width: width,
      height: height,
    });

    this.imageElement = img;
    this.imageLayer = new Konva.Layer();
    this.stage.add(this.imageLayer);
    this.imageLayer.add(img);
    this.imageLayer.draw();

    this.imageData = this.generateImageData(imgObj, width, height);

    this.drawLayer = new Konva.Layer();
    this.stage.add(this.drawLayer);
    this.bindEvents();
  };

  resetStage = (stage: Konva.Stage) => {
    // @ts-ignore
    stage._pixelRatio = this.pixelRatio;
    // @ts-ignore
    stage.clearAndToCanvas = (config: any) => {
      const { currentPlugin } = this.props;
      currentPlugin &&
        currentPlugin.onLeave &&
        currentPlugin.onLeave(this.getDrawEventParams(null));
      return stage.toCanvas(config);
    };
    return stage;
  };

  bindEvents = () => {
    if (!this.stage || !this.drawLayer) return;

    const { plugins, currentPlugin, handlePluginChange } = this.props;
    this.removeEvents();
    // this.stage.add(this.drawLayer)
    this.drawLayer.setZIndex(1);

    this.stage.on('click tap', (e: any) => {
      if (e.target.name && e.target.name()) {
        const name = e.target.name();
        for (let i = 0; i < plugins.length; i++) {
          // 点击具体图形，会切到对应的插件去
          if (
            plugins[i].shapeName &&
            plugins[i].shapeName === name &&
            (!currentPlugin ||
              !currentPlugin.shapeName ||
              name !== currentPlugin.shapeName)
          ) {
            ((event: any) => {
              setTimeout(() => {
                plugins[i].onClick &&
                  plugins[i].onClick!(this.getDrawEventParams(event));
              });
            })(e);
            handlePluginChange(plugins[i], false);
            return;
          }
        }
      }

      if (currentPlugin && currentPlugin.onClick) {
        currentPlugin.onClick(this.getDrawEventParams(e));
      }
    });

    this.stage.on('mousedown touchstart', (e: any) => {
      if (this.props.currentPlugin && this.props.currentPlugin.onDrawStart) {
        this.props.currentPlugin.onDrawStart(this.getDrawEventParams(e));
      }
    });

    this.stage.on('mousemove touchmove', (e: any) => {
      if (this.props.currentPlugin && this.props.currentPlugin.onDraw) {
        this.props.currentPlugin.onDraw(this.getDrawEventParams(e));
      }
    });

    this.stage.on('mouseup touchend', (e: any) => {
      if (this.props.currentPlugin && this.props.currentPlugin.onDrawEnd) {
        this.props.currentPlugin.onDrawEnd(this.getDrawEventParams(e));
      }
    });

    this.stage.on('wheel', (e) => {
      if (!this.props.enableZoom || !this.stage) return;
      // stop default scrolling
      e.evt.preventDefault();

      const oldScale = this.stage.scaleX();
      const pointer = this.stage.getPointerPosition();
      if (!pointer) return;

      const mousePointTo = {
        x: (pointer.x - this.stage.x()) / oldScale,
        y: (pointer.y - this.stage.y()) / oldScale,
      };

      // how to scale? Zoom in? Or zoom out?
      let direction = e.evt.deltaY > 0 ? 1 : -1;

      // when we zoom on trackpad, e.evt.ctrlKey is true
      // in that case lets revert direction
      if (e.evt.ctrlKey) {
        direction = -direction;
      }

      const newScale =
        direction > 0
          ? oldScale * (1 + this.props.zoomRatio)
          : oldScale / (1 + this.props.zoomRatio);

      this.stage.scale({ x: newScale, y: newScale });

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };
      this.stage.position(newPos);
    });
  };

  removeEvents = () => {
    if (!this.stage) return;

    this.stage.off('click tap');
    this.stage.off('mousedown touchstart');
    this.stage.off('mousemove touchmove');
    this.stage.off('mouseup touchend');
    this.stage.off('wheel');
  };

  subHistoryStack = () => {
    this.pubSub.sub('PUSH_HISTORY', (_: any, node: any) => {
      const { toolbarItemConfig, updateToolbarItemConfig } = this.props;
      // 撤销按钮更新为激活状态
      if (this.historyStack.length === 0) {
        const newToolbarItemConfig = { ...toolbarItemConfig };
        if (newToolbarItemConfig.repeal) {
          newToolbarItemConfig.repeal.disable = false;
          updateToolbarItemConfig(newToolbarItemConfig);
        }
      }
      this.historyStack.push(node.toObject());
    });

    // 仅接收状态，不实际 pop history
    this.pubSub.sub('POP_HISTORY', (_: any, historyStack: any[]) => {
      const { toolbarItemConfig, updateToolbarItemConfig } = this.props;
      if (historyStack.length === 0) {
        const newToolbarItemConfig = { ...toolbarItemConfig };
        if (newToolbarItemConfig.repeal) {
          newToolbarItemConfig.repeal.disable = true;
          updateToolbarItemConfig(newToolbarItemConfig);
        }
      }
    });
  };

  // 主要用于在马赛克时，进行图片像素处理
  generateImageData = (imgObj: any, width: number, height: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx!.drawImage(imgObj, 0, 0, width, height);
    return ctx!.getImageData(0, 0, width, height);
  };

  // 生命周期的统一参数生成函数
  getDrawEventParams = (e: any) => {
    const props = this.props;
    const drawEventParams: DrawEventParams = {
      event: e,
      stage: this.stage!,
      imageLayer: this.imageLayer!,
      drawLayer: this.drawLayer!,
      imageElement: this.imageElement!,
      imageData: this.imageData!,
      reload: this.reload,
      historyStack: this.historyStack,
      pixelRatio: this.pixelRatio,
      pubSub: this.pubSub,
      zoomRatio: props.zoomRatio,
      enableZoom: props.enableZoom,
      draggable: props.draggable,
      // editor context
      containerWidth: props.containerWidth,
      containerHeight: props.containerHeight,
      plugins: props.plugins,
      toolbar: props.toolbar,
      currentPlugin: props.currentPlugin,
      handlePluginChange: props.handlePluginChange,
      paramValue: props.paramValue,
      handlePluginParamValueChange: props.handlePluginParamValueChange,
      toolbarItemConfig: props.toolbarItemConfig,
      updateToolbarItemConfig: props.updateToolbarItemConfig,
    };

    return drawEventParams;
  };

  toCanvas = () => {
    let { width, height, x, y } = this.imageElement!.getClientRect();
    if (x < 0) {
      width = width + x;
      x = 0;
    }
    if (y < 0) {
      height = height + y;
      y = 0;
    }
    if (x + width > this.stage!.width()) {
      width = this.stage!.width() - x;
    }
    if (y + height > this.stage!.height()) {
      height = this.stage!.height() - y;
    }

    const canvas = this.stage!.toCanvas({
      pixelRatio: this.pixelRatio,
      x,
      y,
      width,
      height,
    });
    return canvas;
  };

  render() {
    const { height } = this.props;
    const { containerWidth } = this.context as EditorContextProps;
    const style = {
      width: containerWidth,
      height: height, // 高度是用户设置的高度减掉工具栏的高度
    };

    return (
      <div className={`${prefixCls}-palette`} style={style}>
        <div id={this.containerId} className={`${prefixCls}-container`} />
      </div>
    );
  }
}

export default withEditorContext(Palette);
