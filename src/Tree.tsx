import React, {
  RefObject,
  useRef,
  useContext,
  ReactElement,
  forwardRef,
  PropsWithChildren,
} from 'react';
import { useDragLayer, XYCoord } from 'react-dnd';
import {
  Providers,
  TreeContext,
  TreeMethods,
  TreeProps,
  TreeState,
  NodeModel,
  SortCallback,
} from './Provider';
import { useContainerClassName } from './useContainerClassName';
import { useDropRoot } from './useDropRoot';
import { Placeholder } from './Placeholder';
import { Node } from './Node';
import { isDroppable } from './isDroppable';

export const ItemTypes = {
  TREE_ITEM: Symbol(),
};

export type DragLayerMonitorProps<T> = {
  item: DragItem<T>;
  clientOffset: XYCoord | null;
  isDragging: boolean;
};

export type DragItem<T> = NodeModel<T> & {
  ref: RefObject<HTMLElement>;
};
function useTreeDragLayer<T>(): DragLayerMonitorProps<T> {
  return useDragLayer((monitor) => {
    const itemType = monitor.getItemType();

    return {
      item: monitor.getItem(),
      clientOffset: monitor.getClientOffset(),
      isDragging: monitor.isDragging() && itemType === ItemTypes.TREE_ITEM,
    };
  });
}
const getItemStyles = <T,>(monitorProps: any): React.CSSProperties => {
  const offset = monitorProps.clientOffset;

  if (!offset) {
    return {};
  }

  const { x, y } = offset;
  const transform = `translate(${x}px, ${y}px)`;

  return {
    pointerEvents: 'none',
    transform,
  };
};

function useTreeContext<T>(): TreeState<T> {
  const treeContext = useContext<TreeState<T>>(
    TreeContext as unknown as React.Context<TreeState<T>>
  );

  if (!treeContext) {
    throw new Error('useTreeContext must be used under TreeProvider');
  }

  return treeContext;
}

type Props = PropsWithChildren<{
  parentId: NodeModel['id'];
  depth: number;
}>;

export const Container = <T,>(props: Props): ReactElement => {
  const treeContext = useTreeContext<T>();
  const ref = useRef<HTMLLIElement>(null);
  const nodes = treeContext.tree.filter((l) => l.parent === props.parentId);

  let view = nodes;
  const sortCallback =
    typeof treeContext.sort === 'function' ? treeContext.sort : compareItems;

  if (treeContext.insertDroppableFirst) {
    let droppableNodes = nodes.filter((n) => n.droppable);
    let nonDroppableNodes = nodes.filter((n) => !n.droppable);

    if (treeContext.sort === false) {
      view = [...droppableNodes, ...nonDroppableNodes];
    } else {
      droppableNodes = droppableNodes.sort(sortCallback);
      nonDroppableNodes = nonDroppableNodes.sort(sortCallback);
      view = [...droppableNodes, ...nonDroppableNodes];
    }
  } else {
    if (treeContext.sort !== false) {
      view = nodes.sort(sortCallback);
    }
  }

  const [isOver, dragSource, drop] = useDropRoot(ref);

  if (
    props.parentId === treeContext.rootId &&
    isDroppable(dragSource?.id, treeContext.rootId, treeContext)
  ) {
    drop(ref);
  }

  const className = useContainerClassName(props.parentId, isOver);
  const rootProps = treeContext.rootProps || {};

  return (
    <ul ref={ref} role="list" {...rootProps} className={className}>
      {view.map((node, index) => (
        <React.Fragment key={node.id}>
          <Placeholder
            depth={props.depth}
            listCount={view.length}
            dropTargetId={props.parentId}
            index={index}
          />
          <Node id={node.id} depth={props.depth} />
        </React.Fragment>
      ))}
      <Placeholder
        depth={props.depth}
        listCount={view.length}
        dropTargetId={props.parentId}
      />
    </ul>
  );
};
export const DragLayer = <T,>(): ReactElement | null => {
  const context = useTreeContext<T>();
  const monitorProps = useTreeDragLayer<T>();
  const { isDragging, clientOffset } = monitorProps;

  if (!isDragging || !clientOffset) {
    return null;
  }

  return (
    <div style={rootStyle}>
      <div style={getItemStyles<T>(monitorProps)}>
        {context.dragPreviewRender && context.dragPreviewRender(monitorProps)}
      </div>
    </div>
  );
};

function TreeInner<T>(
  props: TreeProps<T>,
  ref: React.ForwardedRef<TreeMethods>
) {
  return (
    <Providers {...props} treeRef={ref}>
      {props.dragPreviewRender && <DragLayer />}
      <Container parentId={props.rootId} depth={0} />
    </Providers>
  );
}

export const Tree = forwardRef(TreeInner) as <T = unknown>(
  props: TreeProps<T> & { ref?: React.ForwardedRef<TreeMethods> }
) => ReturnType<typeof TreeInner>;

const rootStyle: React.CSSProperties = {
  height: '100%',
  left: 0,
  pointerEvents: 'none',
  position: 'fixed',
  top: 0,
  width: '100%',
  zIndex: 100,
};

export const compareItems: SortCallback = (a, b) => {
  if (a.text > b.text) {
    return 1;
  } else if (a.text < b.text) {
    return -1;
  }

  return 0;
};
