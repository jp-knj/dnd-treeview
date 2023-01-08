import React, { useState } from 'react';
import { getBackendOptions, MultiBackend } from '@minoru/react-dnd-treeview';
import { Tree } from './Tree';
import { NodeModel } from './Provider';
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
          <CustomNode
            node={node}
            depth={depth}
            isOpen={isOpen}
            onToggle={onToggle}
          />
        )}
        dragPreviewRender={(monitorProps: any) => (
          <></>
          // <CustomDragPreview monitorProps={monitorProps} />
        )}
        onDrop={handleDrop}
        classes={{}}
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

export const CustomNode = ({
  testIdPrefix = '',
  ...props
}: {
  node: NodeModel<{
    fileType: string;
    fileSize: string;
  }>;
  depth: number;
  isOpen: boolean;
  testIdPrefix?: string;
  onToggle: (id: NodeModel['id']) => void;
}) => {
  const { id, droppable, data } = props.node;
  const indent = props.depth * 24;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    props.onToggle(props.node.id);
  };

  return (
    <div
      style={{ paddingInlineStart: indent }}
      data-testid={`${testIdPrefix}custom-node-${id}`}
    >
      <div>{props.node.droppable && <div onClick={handleToggle}>→</div>}</div>
      <div></div>
      <div>{props.node.text}</div>
    </div>
  );
};
export const Placeholder = (props: { node: NodeModel; depth: number }) => (
  <div style={{ left: props.depth * 24 }} data-testid="placeholder"></div>
);

const initialData = [
  {
    id: 1,
    parent: 0,
    droppable: true,
    text: 'Folder 1',
  },
  {
    id: 2,
    parent: 1,
    text: 'File 1-1',
    data: {
      fileType: 'csv',
      fileSize: '0.5MB',
    },
  },
  {
    id: 3,
    parent: 1,
    text: 'File 1-2',
    data: {
      fileType: 'text',
      fileSize: '4.8MB',
    },
  },
  {
    id: 4,
    parent: 0,
    droppable: true,
    text: 'Folder 2',
  },
  {
    id: 5,
    parent: 4,
    droppable: true,
    text: 'Folder 2-1',
  },
  {
    id: 6,
    parent: 5,
    text: 'File 2-1-1',
    data: {
      fileType: 'image',
      fileSize: '2.1MB',
    },
  },
  {
    id: 7,
    parent: 0,
    text: 'File 3',
    data: {
      fileType: 'image',
      fileSize: '0.8MB',
    },
  },
];
