import { NodeModel, TreeState } from './Provider';

export const isDroppable = <T>(
  dragSourceId: NodeModel['id'] | undefined,
  dropTargetId: NodeModel['id'],
  treeContext: TreeState<T>
): boolean => {
  const { tree, rootId, canDrop } = treeContext;

  if (dragSourceId === undefined) {
    // Dropability judgment of each node in the undragged state.
    // Without this process, the newly mounted node will not be able to be dropped unless it is re-rendered
    if (dropTargetId === rootId) {
      return true;
    }

    const dropTargetNode = tree.find((node) => node.id === dropTargetId);

    return !!(dropTargetNode && dropTargetNode.droppable);


  } else {
    if (canDrop) {
      const result = canDrop(dragSourceId, dropTargetId);

      if (result !== undefined) {
        return result;
      }
    }

    if (dragSourceId === dropTargetId) {
      return false;
    }

    const dragSourceNode = tree.find((node) => node.id === dragSourceId);
    const dropTargetNode = tree.find((node) => node.id === dropTargetId);

    // dragSource is external node
    if (dragSourceNode === undefined) {
      return dropTargetId === rootId || !!dropTargetNode?.droppable;
    }

    // dropTarget is root node
    if (dropTargetNode === undefined) {
      return dragSourceNode.parent !== 0;
    }

    if (dragSourceNode.parent === dropTargetId || !dropTargetNode.droppable) {
      return false;
    }

    return !isAncestor(tree, dragSourceId, dropTargetId);
  }
};

export const isAncestor = (
  tree: NodeModel[],
  sourceId: NodeModel['id'],
  targetId: NodeModel['id']
): boolean => {
  if (targetId === 0) {
    return false;
  }

  const targetNode = tree.find((node) => node.id === targetId);

  if (targetNode === undefined) {
    return false;
  }

  if (targetNode.parent === sourceId) {
    return true;
  }

  return isAncestor(tree, sourceId, targetNode.parent);
};


if (import.meta.vitest) {
  import { NodeRender } from "./Provider";
  const { describe, it, expect } = import.meta.vitest
  describe("isDroppable", () => {
    it("check for drop availability", () => {
      const render: NodeRender<unknown> = (node) => {
        return <div>{node.text}</div>;
      };

      const treeContext: TreeState<unknown> = {
        tree: treeData,
        rootId: 0,
        render,
        extraAcceptTypes: [],
        sort: false,
        insertDroppableFirst: true,
        dropTargetOffset: 0,
        initialOpen: false,
        openIds: [],
        onDrop: () => undefined,
        onToggle: () => undefined,
      };

      expect(isDroppable(7, 7, treeContext)).toBe(false);
      expect(isDroppable(7, 1, treeContext)).toBe(true);
      expect(isDroppable(1, 1, treeContext)).toBe(false);
      expect(isDroppable(4, 5, treeContext)).toBe(false);
    });
  });
}