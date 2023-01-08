import React, { useState } from 'react';
import { getBackendOptions, MultiBackend } from '@minoru/react-dnd-treeview';
import { Tree, DragLayerMonitorProps } from './Tree';
import { NodeModel } from './Provider';
import initialData from './initial-data.json';
import { DndProvider } from 'react-dnd';

export function App() {
  const [treeData, setTreeData] = useState(initialData);
  const handleDrop = (newTreeData: any) => setTreeData(newTreeData);

  return (
    <DndProvider backend={MultiBackend} options={getBackendOptions()}>
      <Tree
        tree={treeData}
        rootId={0}
        render={(
          node: NodeModel<{ fileType: string; fileSize: string }>,
          { depth, isOpen, onToggle }: any
        ) => (
          <Node node={node} depth={depth} isOpen={isOpen} onToggle={onToggle} />
        )}
        dragPreviewRender={(monitorProps: any) => (
          <DragPreview monitorProps={monitorProps} />
        )}
        onDrop={handleDrop}
        sort={false}
        insertDroppableFirst={false}
        canDrop={(tree, { dragSource, dropTargetId, dropTarget }) => {
          if (dragSource?.parent === dropTargetId) {
            return true;
          }
        }}
        dropTargetOffset={10}
        placeholderRender={(node: NodeModel<unknown>, { depth }: any) => (
          <Placeholder node={node} depth={depth} />
        )}
      />
    </DndProvider>
  );
}

export const Node = ({
  ...props
}: {
  node: NodeModel<{
    fileType: string;
    fileSize: string;
  }>;
  depth: number;
  isOpen: boolean;
  onToggle: (id: NodeModel['id']) => void;
}) => {
  const { id, droppable, data } = props.node;
  const indent = props.depth * 24;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    props.onToggle(props.node.id);
  };

  return (
    <div style={{ paddingInlineStart: indent }}>
      <div>{props.node.droppable && <div onClick={handleToggle}>→</div>}</div>
      <div></div>
      <div>{props.node.text}</div>
    </div>
  );
};
export const Placeholder = (props: { node: NodeModel; depth: number }) => (
  <div style={{ left: props.depth * 24 }} data-testid="placeholder"></div>
);

type DragPreviewProps = {
  monitorProps: DragLayerMonitorProps<{ fileType: string; fileSize: string }>;
};
export const DragPreview = (props: DragPreviewProps) => {
  const item = props.monitorProps.item;
  return (
    <div>
      <div>{item.text}</div>
    </div>
  );
};
