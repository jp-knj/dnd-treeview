import { useEffect, RefObject } from 'react';
import { DragElementWrapper, DragSourceOptions } from 'react-dnd';

export const useDragHandle = (
  containerRef: RefObject<HTMLElement>,
  handleRef: RefObject<HTMLElement>,
  drag: DragElementWrapper<DragSourceOptions>
) => {
  if (handleRef.current) {
    drag(handleRef);
  } else {
    drag(containerRef);
  }

  useEffect(() => {
    if (handleRef.current) {
      drag(handleRef);
    } else {
      drag(containerRef);
    }
  }, [handleRef.current]);
};
