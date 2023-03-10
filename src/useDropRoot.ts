import { RefObject, useContext } from 'react';
import { useDrop, DragElementWrapper } from 'react-dnd';
import { ItemTypes } from './Tree';
import { isDroppable } from './isDroppable';
import { NodeModel } from './Provider';
import { PlaceholderContext } from './PlaceholderProvider';
import { getDropTarget } from './getDropTarget';
import { useTreeContext } from './useTreeContext';

export const useDropRoot = <T>(
  ref: RefObject<HTMLElement>
): [NodeModel, DragElementWrapper<HTMLElement>] => {
  const treeContext = useTreeContext<T>();
  const placeholderContext = useContext(PlaceholderContext);
  const [{ dragSource }, drop] = useDrop({
    accept: [ItemTypes.TREE_ITEM, ...treeContext.extraAcceptTypes],
    drop: (dragItem: any, monitor) => {
      const { rootId, onDrop } = treeContext;
      const { dropTargetId, index } = placeholderContext;

      if (
        monitor.isOver({ shallow: true }) &&
        dropTargetId !== undefined &&
        index !== undefined
      ) {
        // If the drag source is outside the react-dnd,
        // a different object is passed than the NodeModel.
        onDrop(isNodeModel<T>(dragItem) ? dragItem : null, rootId, index);
      }

      placeholderContext.hidePlaceholder();
    },
    canDrop: (dragItem, monitor) => {
      const { rootId } = treeContext;

      if (monitor.isOver({ shallow: true })) {
        if (dragItem === undefined) {
          return false;
        }

        return isDroppable(
          isNodeModel<T>(dragItem) ? dragItem.id : undefined,
          rootId,
          treeContext
        );
      }

      return false;
    },
    hover: (dragItem, monitor) => {
      if (monitor.isOver({ shallow: true })) {
        const { rootId } = treeContext;
        const { dropTargetId, index, showPlaceholder, hidePlaceholder } =
          placeholderContext;

        const dropTarget = getDropTarget<T>(
          null,
          ref.current,
          monitor,
          treeContext
        );

        if (
          dropTarget === null ||
          !isDroppable(
            isNodeModel<T>(dragItem) ? dragItem.id : undefined,
            rootId,
            treeContext
          )
        ) {
          hidePlaceholder();
          return;
        }

        if (dropTarget.id !== dropTargetId || dropTarget.index !== index) {
          showPlaceholder(dropTarget.id, dropTarget.index);
        }
      }
    },
    collect: (monitor) => {
      const dragSource: NodeModel<T> = monitor.getItem();

      return {
        isOver: monitor.isOver({ shallow: true }) && monitor.canDrop(),
        dragSource,
      };
    },
  });

  return [dragSource, drop];
};

export const isNodeModel = <T>(arg: any): arg is NodeModel<T> => {
  return (
    arg.id !== undefined && arg.parent !== undefined && arg.text !== undefined
  );
};
