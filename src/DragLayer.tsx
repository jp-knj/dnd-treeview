import React, { ReactElement } from "react";
import { useTreeContext } from "./useTreeContext";
import { useDragLayer } from "react-dnd";
import { DragLayerMonitorProps, ItemTypes } from "./Tree";

export const DragLayer = <T,>(): ReactElement | null => {
  const context = useTreeContext<T>();
  const monitorProps = useTreeDragLayer<T>();
  const { isDragging, clientOffset } = monitorProps;

  if (!isDragging || !clientOffset) {
    return null;
  }

  return (
    <div style={rootStyle}>
      <div style={getItemStyles(monitorProps)}>
        {context.dragPreviewRender && context.dragPreviewRender(monitorProps)}
      </div>
    </div>
  );
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

const rootStyle: React.CSSProperties = {
  height: '100%',
  left: 0,
  pointerEvents: 'none',
  position: 'fixed',
  top: 0,
  width: '100%',
  zIndex: 100,
};

const getItemStyles = (monitorProps: any): React.CSSProperties => {
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