import React, {
  useState,
  PropsWithChildren,
  ReactElement,
  createContext,
} from 'react';
import { useDragDropManager } from 'react-dnd';
import type { DragDropMonitor } from 'dnd-core';
import { PlaceholderProvider } from "./PlaceholderProvider";
import { useOpenIds } from './useOpenIds'

export type TreeMethods = {
  open: any;
  close: any;
};

export type TreeStateBase<T> = {
  tree: NodeModel<T>[];
  rootId: NodeModel['id'];
  rootProps?: any;
  render: any;
  dragPreviewRender?: any;
  placeholderRender?: any;
  onDragStart?: (node: NodeModel<T>, monitor: any) => void;
  onDragEnd?: (node: NodeModel<T>, monitor: any) => void;
};

export type TreeState<T> = TreeStateBase<T> & {
  extraAcceptTypes: string[];
  sort: SortCallback<T> | boolean;
  dropTargetOffset: number;
  openIds: NodeModel['id'][];
  onDrop: any;
  canDrop?: any;
  canDrag?: any;
  onToggle: any;
};

export type TreeProps<T = unknown> = TreeStateBase<T> & {
  extraAcceptTypes?: string[];
  sort?: SortCallback<T> | boolean;
  dropTargetOffset?: number
  initialOpen?: InitialOpen;
  onChangeOpen?: ChangeOpenHandler;
  onDrop: (tree: NodeModel<T>[], options: DropOptions<T>) => void;
  canDrop?: (tree: NodeModel<T>[], options: DropOptions<T>) => boolean | void;
  canDrag?: (node: NodeModel<T> | undefined) => boolean;
};

export type NodeModel<T = unknown> = {
  id: number | string;
  parent: number | string;
  text: string;
  droppable?: boolean;
  data?: T;
};

export type InitialOpen = boolean | NodeModel['id'][];
export type SortCallback<T = unknown> = (
  a: NodeModel<T>,
  b: NodeModel<T>
) => number;

export type ChangeOpenHandler = (newOpenIds: NodeModel['id'][]) => void;

type Props<T> = PropsWithChildren<
  TreeProps<T> & {
    treeRef: React.ForwardedRef<TreeMethods>;
  }
>;

export type DropOptions<T = unknown> = {
  dragSourceId?: NodeModel['id'];
  dropTargetId: NodeModel['id'];
  dragSource?: NodeModel<T>;
  dropTarget?: NodeModel<T>;
  destinationIndex?: number;
  relativeIndex?: number;
  monitor: DragDropMonitor;
};

export type DragControlState = {
  isLock: boolean;
  lock: () => void;
  unlock: () => void;
};
export const Providers = <T,>(props: Props<T>): ReactElement => (
  <TreeProvider {...props}>
    <DragControlProvider>
      <PlaceholderProvider>{props.children}</PlaceholderProvider>
    </DragControlProvider>
  </TreeProvider>
);

export const TreeProvider = <T,>(props: Props<T>): ReactElement => {
  const [openIds, { handleToggle }] = useOpenIds();

  const monitor = useDragDropManager().getMonitor();
  const canDropCallback = props.canDrop;
  const canDragCallback = props.canDrag;

  const value: TreeState<T> = {
    extraAcceptTypes: [],
    sort: true,
    dropTargetOffset: 10,
    ...props,
    openIds,
    onDrop: (dragSource: any, dropTargetId: any, placeholderIndex: any) => {
      // if dragSource is null,
      // it means that the drop is from the outside of the react-dnd.
      if (!dragSource) {
        const options: DropOptions<T> = {
          dropTargetId,
          dropTarget: getTreeItem<T>(props.tree, dropTargetId),
          monitor,
        };

        if (props.sort === false) {
          options.destinationIndex = getDestIndex(
            props.tree,
            dropTargetId,
            placeholderIndex
          );

          options.relativeIndex = placeholderIndex;
        }

        props.onDrop(props.tree, options);
      } else {
        const options: DropOptions<T> = {
          dragSourceId: dragSource.id,
          dropTargetId,
          dragSource: dragSource,
          dropTarget: getTreeItem<T>(props.tree, dropTargetId),
          monitor,
        };

        let tree = props.tree;

        // If the dragSource does not exist in the tree,
        // it is an external node, so add it to the tree
        if (!getTreeItem(tree, dragSource.id)) {
          tree = [...tree, dragSource];
        }

        if (props.sort === false) {
          const [, destIndex] = getModifiedIndex(
            tree,
            dragSource.id,
            dropTargetId,
            placeholderIndex
          );
          options.destinationIndex = destIndex;
          options.relativeIndex = placeholderIndex;
          props.onDrop(
            mutateTreeWithIndex<T>(
              tree,
              dragSource.id,
              dropTargetId,
              placeholderIndex
            ),
            options
          );

          return;
        }

        props.onDrop(mutateTree<T>(tree, dragSource.id, dropTargetId), options);
      }
    },
    canDrop: canDropCallback
      ? (dragSourceId: any, dropTargetId: any) =>
          canDropCallback(props.tree, {
            dragSourceId,
            dropTargetId,
            dragSource: monitor.getItem(),
            dropTarget: getTreeItem(props.tree, dropTargetId),
            monitor,
          })
      : undefined,
    canDrag: canDragCallback
      ? (id: any) => canDragCallback(getTreeItem(props.tree, id))
      : undefined,
    onToggle: (id: any) => handleToggle(id, props.onChangeOpen),
  };

  return (
    <TreeContext.Provider value={value}>{props.children}</TreeContext.Provider>
  );
};

export const TreeContext = createContext({});

const initialState = {
  isLock: false,
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

export const DragControlContext = createContext<DragControlState>(
  {} as DragControlState
);


export function mutateTree<T>(
  tree: NodeModel<T>[],
  dragSourceId: NodeModel['id'],
  dropTargetId: NodeModel['id']
): NodeModel<T>[] {
  return tree.map((node) => {
    if (node.id === dragSourceId) {
      return {
        ...node,
        parent: dropTargetId,
      };
    }

    return node;
  });
}

export function mutateTreeWithIndex<T>(
  tree: NodeModel<T>[],
  dragSourceId: NodeModel['id'],
  dropTargetId: NodeModel['id'],
  index: number
): NodeModel<T>[] {
  const [srcIndex, destIndex] = getModifiedIndex(
    tree,
    dragSourceId,
    dropTargetId,
    index
  );

  const newTree = [...tree];
  arrayMoveMutable(newTree, srcIndex, destIndex);

  return newTree.map((node) => {
    if (node.id === dragSourceId) {
      return {
        ...node,
        parent: dropTargetId,
      };
    }

    return node;
  });
}

function arrayMoveMutable<T>(array: T[], fromIndex: number, toIndex: number) {
  const startIndex = fromIndex < 0 ? array.length + fromIndex : fromIndex;

  if (startIndex >= 0 && startIndex < array.length) {
    const endIndex = toIndex < 0 ? array.length + toIndex : toIndex;
    const [item] = array.splice(fromIndex, 1);
    array.splice(endIndex, 0, item);
  }
}

function getTreeItem<T>(
  tree: NodeModel<T>[],
  id: NodeModel['id']
): NodeModel<T> | undefined {
  return tree.find((n) => n.id === id);
}

function getDestIndex(
  tree: NodeModel[],
  dropTargetId: NodeModel['id'],
  index: number
) {
  if (index === 0) {
    return 0;
  }

  const siblings = tree.filter((node) => node.parent === dropTargetId);

  if (siblings[index]) {
    return tree.findIndex((node) => node.id === siblings[index].id);
  }

  return tree.findIndex((node) => node.id === siblings[index - 1].id) + 1;
}

const getSrcIndex = (tree: NodeModel[], dragSourceId: NodeModel['id']) => {
  return tree.findIndex((node) => node.id === dragSourceId);
};

function getModifiedIndex(
  tree: NodeModel[],
  dragSourceId: NodeModel['id'],
  dropTargetId: NodeModel['id'],
  index: number
): [number, number] {
  const srcIndex = getSrcIndex(tree, dragSourceId);
  let destIndex = getDestIndex(tree, dropTargetId, index);
  destIndex = destIndex > srcIndex ? destIndex - 1 : destIndex;

  return [srcIndex, destIndex];
}
