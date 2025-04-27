import type React from 'react';
import { forwardRef, useEffect, useMemo, useState } from 'react';
import type { PluginParamValue } from './common/type';
import { EditorContext } from './components/EditorContext';
import Palette, { type PaletteRef } from './components/Palette';
import Toolbar from './components/Toolbar';
import type Plugin from './plugins/Plugin';
import PluginFactory from './plugins/PluginFactory';

interface ReactImageEditorProps {
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  plugins?: Plugin[];
  toolbar?: {
    items: string[];
  };
  src: string;
  getStage?: (stage: any) => void;
  defaultPluginName?: string;
  crossOrigin?: string;
  zoomRatio?: number;
  enableZoom?: boolean;
  draggable?: boolean;
}

const ReactImageEditor = forwardRef<PaletteRef, ReactImageEditorProps>(
  (props, ref) => {
    const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);

    const pluginFactory = new PluginFactory();
    const plugins = [...pluginFactory.plugins, ...props.plugins!];
    let defaultPlugin: Plugin | null = null;
    let defaultParamValue = {};
    for (let i = 0; i < plugins.length; i++) {
      if (
        props.defaultPluginName &&
        props.toolbar &&
        plugins[i].name === props.defaultPluginName
      ) {
        defaultPlugin = plugins[i];

        if (defaultPlugin.defaultParamValue) {
          defaultParamValue = defaultPlugin.defaultParamValue;
        }

        break;
      }
    }

    const [currentPlugin, setCurrentPlugin] = useState<Plugin | null>(
      defaultPlugin,
    );
    const [paramValue, setParamValue] =
      useState<PluginParamValue>(defaultParamValue);

    const draggable = useMemo(() => {
      if (currentPlugin) {
        return false;
      }
      return props.draggable;
    }, [currentPlugin, props.draggable]);

    // 生成默认 toolbarItemConfig
    const config: any = {};
    plugins.map((plugin) => {
      if (plugin.name === 'repeal') {
        config[plugin.name] = { disable: true };
      } else {
        config[plugin.name] = { disable: false };
      }
    });

    const [toolbarItemConfig, setToolbarItemConfig] = useState(config);

    useEffect(() => {
      const image = new Image();
      image.onload = () => {
        setImageObj(image);
      };
      if (props.crossOrigin !== undefined) {
        image.crossOrigin = props.crossOrigin;
      }
      image.src = props.src;
    }, [props.src, props.crossOrigin]);

    function handlePluginChange(plugin: Plugin, toggle = false) {
      setCurrentPlugin((prev) => {
        if (!toggle) {
          return plugin;
        }
        if (prev?.name === plugin.name) {
          return null;
        }
        return plugin;
      });
      plugin.defaultParamValue && setParamValue(plugin.defaultParamValue);
      if (plugin.disappearImmediately === true) {
        setTimeout(() => {
          setCurrentPlugin(null);
        });
      }
    }

    function handlePluginParamValueChange(value: PluginParamValue) {
      setParamValue(value);
    }

    function updateToolbarItemConfig(config: any) {
      setToolbarItemConfig(config);
    }

    const style = {
      width: props.width + 'px',
      height: props.height + 'px',
      ...props.style,
    };

    return (
      <EditorContext.Provider
        value={{
          containerWidth: props.width!,
          containerHeight: props.height!,
          plugins,
          toolbar: props.toolbar!,
          currentPlugin,
          paramValue,
          handlePluginChange,
          handlePluginParamValueChange,
          toolbarItemConfig,
          updateToolbarItemConfig,
          zoomRatio: props.zoomRatio!,
          enableZoom: props.enableZoom!,
          draggable: draggable!,
        }}
      >
        <div className="react-img-editor" style={style}>
          {imageObj ? (
            <>
              <Palette
                height={props.height! - 42}
                imageObj={imageObj}
                getStage={props.getStage}
                ref={ref}
              />
              <Toolbar />
            </>
          ) : null}
        </div>
      </EditorContext.Provider>
    );
  },
);

ReactImageEditor.defaultProps = {
  width: 700,
  height: 500,
  style: {},
  plugins: [],
  toolbar: {
    items: [
      'pen',
      'eraser',
      'arrow',
      'rect',
      'circle',
      'mosaic',
      'text',
      '|',
      'repeal',
      'download',
      'crop',
      '|',
      'zoomIn',
      'zoomOut',
    ],
  },
  zoomRatio: 0.05,
  enableZoom: false,
  draggable: false,
} as Partial<ReactImageEditorProps>;

export default ReactImageEditor;
