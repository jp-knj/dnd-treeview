import { RefObject, useEffect } from 'react';
import {
  useDrag,
  DragElementWrapper,
  DragSourceOptions,
  DragPreviewOptions,
  ConnectDragSource,
  ConnectDragPreview,
} from 'react-dnd';
import { ItemTypes, DragItem } from './Tree';
import { NodeModel } from './Provider';
import { useTreeContext } from './useTreeContext';

export type DragSourceElement = EventTarget | null;
export const useDragNode = <T>(
  item: NodeModel<T>,
  ref: RefObject<HTMLElement>
): [
  boolean,
  DragElementWrapper<DragSourceOptions>,
  DragElementWrapper<DragPreviewOptions>
] => {
  const treeContext = useTreeContext<T>();

  useEffect(() => {
    const node = ref.current;
    node?.addEventListener('dragstart', handleDragStart);
    node?.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    });

    return () => {
      node?.removeEventListener('dragstart', handleDragStart);
      node?.removeEventListener('touchstart', handleTouchStart);
    };
  }, [ref]);

  const [{ isDragging }, drag, preview]: [
    { isDragging: boolean },
    ConnectDragSource,
    ConnectDragPreview
  ] = useDrag({
    type: ItemTypes.TREE_ITEM,
    item: (monitor) => {
      const dragItem: DragItem<T> = { ref, ...item };

      if (treeContext.onDragStart) {
        treeContext.onDragStart(dragItem, monitor);
      }

      console.log('onDragStart', dragItem);
      return dragItem;
    },
    end: (item, monitor) => {
      const dragItem = item as DragItem<T>;

      if (treeContext.onDragEnd) {
        treeContext.onDragEnd(dragItem, monitor);
        console.log('onDragEnd', dragItem);
      }
    },
    canDrag: () => {
      const { canDrag } = treeContext;

      if (dragSourceElement !== ref.current) {
        return false;
      }

      if (canDrag) {
        return canDrag(item.id);
      }

      return true;
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return [isDragging, drag, preview];
};

let dragSourceElement: DragSourceElement = null;

const register = (e: DragEvent | TouchEvent): void => {
  const { target } = e;

  if (target instanceof HTMLElement) {
    const source = target.closest('[role="listitem"]');

    if (e.currentTarget === source) {
      dragSourceElement = source;
      console.log('dragSourceElement', dragSourceElement);
    }
  }
};

const handleDragStart = (e: DragEvent) => register(e);
const handleTouchStart = (e: TouchEvent) => register(e);
