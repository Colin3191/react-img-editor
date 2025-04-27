import type { Meta, StoryObj } from '@storybook/react';
import React, { useRef } from 'react';
import ReactImgEditor from '../src/index';
import '../src/assets/index.less';

const meta: Meta<typeof ReactImgEditor> = {
  title: 'Components/ReactImgEditor',
  component: ReactImgEditor,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    width: {
      description: '画板宽度',
      defaultValue: 700,
      control: { type: 'number' }
    },
    height: {
      description: '画板高度',
      defaultValue: 500,
      control: { type: 'number' }
    },
    src: {
      description: '图片URL',
      control: { type: 'text' }
    },
    defaultPluginName: {
      description: '默认选中的插件名称',
      control: { type: 'select' },
      options: ['pen', 'eraser', 'arrow', 'rect', 'circle', 'mosaic', 'text']
    },
    zoomRatio: {
      description: '缩放比例',
      defaultValue: 0.05,
      control: { type: 'number' }
    },
    enableZoom: {
      description: '是否启用缩放功能',
      defaultValue: false,
      control: { type: 'boolean' }
    },
    draggable: {
      description: '是否允许拖拽',
      defaultValue: false,
      control: { type: 'boolean' }
    }
  }
};

export default meta;
type Story = StoryObj<typeof ReactImgEditor>;

// 完整功能示例
export const FullFeatured: Story = {
  render: () => {
    const stageRef = useRef<any>(null);

    function setStage(stage: any) {
      stageRef.current = stage;
    }

    function downloadImage() {
      const canvas = stageRef.current.clearAndToCanvas({
        pixelRatio: stageRef.current._pixelRatio,
      });
      canvas.toBlob((blob: any) => {
        const link = document.createElement('a');
        link.download = 'edited-image.jpg';
        link.href = URL.createObjectURL(blob);
        link.click();
      }, 'image/jpeg');
    }

    return (
      <>
        <ReactImgEditor
          src="https://pro-cos-public.seewo.com/seewo-school/7614707e9bfe42f1bfa3bf7fb9d71844"
          width={736}
          height={414}
          getStage={setStage}
          defaultPluginName="text"
          crossOrigin="anonymous"
          toolbar={{
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
          }}
          zoomRatio={0.05}
          draggable
          enableZoom
        />
        <div style={{ marginTop: '60px', textAlign: 'center' }}>
          <button 
            onClick={downloadImage}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            下载图片
          </button>
        </div>
      </>
    );
  },
};

// 多实例示例
export const MultipleInstances: Story = {
  render: () => {
    const image1 =
      'https://pro-cos-public.seewo.com/seewo-school/7614707e9bfe42f1bfa3bf7fb9d71844';
    const image2 =
      'https://pro-cos-public.seewo.com/seewo-school/1a18f6b98c2e4220a07592c83dc2d070';

    return (
      <div style={{ display: 'flex', gap: '20px' }}>
        <ReactImgEditor
          src={image1}
          width={400}
          height={300}
          defaultPluginName="text"
          crossOrigin="anonymous"
          toolbar={{
            items: ['text', 'pen', 'download'],
          }}
        />
        <ReactImgEditor
          src={image2}
          width={400}
          height={300}
          defaultPluginName="rect"
          crossOrigin="anonymous"
          toolbar={{
            items: ['rect', 'circle', 'download'],
          }}
        />
      </div>
    );
  },
}; 