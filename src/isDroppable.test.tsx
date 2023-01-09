import React from 'react';
import { TreeState } from './Provider';
import { isDroppable } from './isDroppable';
import treeData from './initial-data.json';
if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;
  describe('isDroppable', () => {
    const render = (node: any) => {
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

    it('check for drop availability', () => {
      expect(isDroppable(4, 5, treeContext)).toBe(false);
    });
    it('check for drop availability', () => {
      expect(isDroppable(7, 7, treeContext)).toBe(false);
    });
    it('check for drop availability', () => {
      expect(isDroppable(7, 1, treeContext)).toBe(true);
    });
    it('check for drop availability', () => {
      expect(isDroppable(1, 1, treeContext)).toBe(false);
    });
    it('check for drop availability', () => {
      expect(isDroppable(5, 1, treeContext)).toBe(true);
    });
  });
}
