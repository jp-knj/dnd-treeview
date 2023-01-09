import React, {
  RefObject,
  useRef,
  ReactElement,
  forwardRef,
  PropsWithChildren,
} from 'react';
import { XYCoord } from 'react-dnd';
import {
  Providers,
  TreeMethods,
  TreeProps,
  NodeModel,
  SortCallback,
} from './Provider';
import { useDropRoot } from './useDropRoot';
import { Placeholder } from './Placeholder';
import { Node } from './Node';
import { isDroppable } from './isDroppable';
import { useTreeContext } from './useTreeContext';
import { DragLayer } from "./DragLayer";

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


type Props = PropsWithChildren<{
  parentId: NodeModel['id'];
  depth: number;
}>;

export const Tree = forwardRef(TreeInner) as <T = unknown>(
  props: TreeProps<T> & { ref?: React.ForwardedRef<TreeMethods> }
) => ReturnType<typeof TreeInner>;

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

export const Container = <T,>(props: Props): ReactElement => {
  const ref = useRef<HTMLLIElement>(null);
  const treeContext = useTreeContext<T>();

  const sortCallback =
    typeof treeContext.sort === 'function' ? treeContext.sort : compareItems;

  const nodes = treeContext.tree.filter((l) => l.parent === props.parentId);

  const view = treeContext.sort !== false ? nodes.sort(sortCallback) : nodes;

  const [dragSource, drop] = useDropRoot(ref);
  if (
    props.parentId === treeContext.rootId &&
    isDroppable(dragSource?.id, treeContext.rootId, treeContext)
  ) {
    drop(ref);
  }

  const rootProps = treeContext.rootProps || {};

  return (
    <ul ref={ref} role="list" {...rootProps}>
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


export const compareItems: SortCallback = (a, b) => {
  if (a.text > b.text) {
    return 1;
  } else if (a.text < b.text) {
    return -1;
  }

  return 0;
};