import React, { useEffect, useRef, useContext, ReactElement } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Container } from './Tree';
import { isDroppable } from './isDroppable';
import { useDragHandle } from './useDragHandle';
import { useDragControl } from './useDragControl';
import { useDragNode } from './useDragNode';
import { useDropNode } from './useDropNode';
import { useTreeContext } from './useTreeContext';
import { PlaceholderContext, NodeModel } from './Provider';

type Props = {
  id: NodeModel['id'];
  depth: number;
};

export const Node = <T,>(props: Props): ReactElement | null => {
  const treeContext = useTreeContext<T>();
  const placeholderContext = useContext(PlaceholderContext);
  const containerRef = useRef<HTMLLIElement>(null);
  const handleRef = useRef<any>(null);
  const item = treeContext.tree.find(
    (node: any) => node.id === props.id
  ) as NodeModel<T>;
  const { openIds } = treeContext;
  const open = openIds.includes(props.id);

  const [isDragging, drag, preview] = useDragNode(item, containerRef);
  const [isOver, dragSource, drop] = useDropNode(item, containerRef);

  useDragHandle(containerRef, handleRef, drag);

  if (isDroppable(dragSource?.id, props.id, treeContext)) {
    drop(containerRef);
  }

  useEffect(() => {
    if (treeContext.dragPreviewRender) {
      preview(getEmptyImage(), { captureDraggingState: true });
    } else if (handleRef.current) {
      preview(containerRef);
    }
  }, [preview, treeContext.dragPreviewRender]);

  useDragControl(containerRef);

  const handleToggle = () => treeContext.onToggle(item.id);

  const draggable = treeContext.canDrag ? treeContext.canDrag(props.id) : true;
  const isDropTarget = placeholderContext.dropTargetId === props.id;
  const children = treeContext.tree.filter(
    (node: any) => node.parent === props.id
  );

  const params: any = {
    depth: props.depth,
    isOpen: open,
    isDragging,
    isDropTarget,
    draggable,
    hasChild: children.length > 0,
    containerRef,
    handleRef,
    onToggle: handleToggle,
  };

  return (
    <li ref={containerRef} role="listitem">
      {treeContext.render(item, params)}
      {params.hasChild && open && (
        <Container parentId={props.id} depth={props.depth + 1} />
      )}
    </li>
  );
};
