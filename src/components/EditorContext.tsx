import React from 'react';
import type { PluginParamValue } from '../common/type';
import withContext from '../common/withContext';
import type Plugin from '../plugins/Plugin';

export interface EditorContextProps {
  containerWidth: number;
  containerHeight: number;
  plugins: Plugin[];
  toolbar: {
    items: string[];
  };
  currentPlugin: Plugin | null;
  handlePluginChange: (plugin: Plugin, toggle?: boolean) => void;
  paramValue: PluginParamValue | null;
  handlePluginParamValueChange: (paramValue: PluginParamValue) => void;
  toolbarItemConfig: any;
  updateToolbarItemConfig: (config: any) => void;
  zoomRatio: number;
  enableZoom: boolean;
  draggable: boolean;
}

export const EditorContext = React.createContext({} as EditorContextProps);
export const withEditorContext = withContext<EditorContextProps>(EditorContext);
