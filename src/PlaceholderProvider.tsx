import React, { createContext, useState } from 'react';
import { NodeModel } from './Provider';

export type PlaceholderState = {
  dropTargetId: NodeModel['id'] | undefined;
  index: number | undefined;
  showPlaceholder: (parentId: NodeModel['id'], index: number) => void;
  hidePlaceholder: () => void;
};

const initialPlaceholderState = {
  dropTargetId: undefined,
  index: undefined,
};

export const PlaceholderProvider = (props: { children: React.ReactNode }) => {
  // Drop する対象の id
  // exmp: Foloer 5 にファイルを Drop する場合、 Folder 5 の id を保存
  const [dropTargetId, setDropTargetId] = useState<
    PlaceholderState['dropTargetId']
  >(initialPlaceholderState.dropTargetId);

  // placeholder を表示させる箇所の index
  const [index, setIndex] = useState<PlaceholderState['index']>(
    initialPlaceholderState.index
  );

  const showPlaceholder = (
    dropTargetId: NodeModel['id'],
    index: number
  ): void => {
    setDropTargetId(dropTargetId);
    setIndex(index);
  };

  const hidePlaceholder = () => {
    setDropTargetId(initialPlaceholderState.dropTargetId);
    setIndex(initialPlaceholderState.index);
  };

  return (
    <PlaceholderContext.Provider
      value={{
        dropTargetId,
        index,
        showPlaceholder,
        hidePlaceholder,
      }}
    >
      {props.children}
    </PlaceholderContext.Provider>
  );
};

export const PlaceholderContext = createContext<PlaceholderState>(
  {} as PlaceholderState
);
