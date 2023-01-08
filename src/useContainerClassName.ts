import { NodeModel } from './Provider';
import { useTreeContext } from './useTreeContext';

export const useContainerClassName = (
  parentId: NodeModel['id'],
  isOver: boolean
): string => {
  const { rootId, rootProps } = useTreeContext();

  return 'className';
};
