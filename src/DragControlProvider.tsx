import React, { createContext, useState } from 'react';

export type DragControlState = {
  isLock: boolean;
  lock: () => void;
  unlock: () => void;
};

export const DragControlProvider: React.FC<{ children: React.ReactNode }> = (
  props
) => {
  const [isLock, setIsLock] = useState(initialState.isLock);
  return (
    <DragControlContext.Provider
      value={{
        isLock,
        lock: () => setIsLock(true),
        unlock: () => setIsLock(false),
      }}
    >
      {props.children}
    </DragControlContext.Provider>
  );
};

const initialState = {
  isLock: false,
};

export const DragControlContext = createContext<DragControlState>(
  {} as DragControlState
);
