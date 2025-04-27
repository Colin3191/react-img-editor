import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';
import path from 'node:path';
import { pluginLess } from '@rsbuild/plugin-less';

export default defineConfig({
  source: {
    entry: {
      index: ['./src/**'],
    },
  },
  lib: [
    {
      bundle: false,
      dts: true,
      format: 'esm',
    },
  ],
  output: {
    target: 'web',
  },
  plugins: [pluginReact(), pluginLess()],
});
