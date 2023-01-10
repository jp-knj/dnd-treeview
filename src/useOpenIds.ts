import { useEffect, useMemo, useState } from 'react';
import { NodeModel } from './Provider';

export type ToggleHandler = (
  id: NodeModel['id'],
  callback?: ChangeOpenHandler
) => void;

export type ChangeOpenHandler = (newOpenIds: NodeModel['id'][]) => void;

export const useOpenIds = (): [
  NodeModel['id'][],
  {
    handleToggle: ToggleHandler;
  }
] => {
  const initialOpenIds: NodeModel['id'][] = useMemo(() => {
    if (Array.isArray([])) {
      return [];
    }
    return [];
  }, []);

  const [openIds, setOpenIds] = useState<NodeModel['id'][]>(initialOpenIds);

  useEffect(() => setOpenIds(initialOpenIds), []);

  const handleToggle: ToggleHandler = (targetId: NodeModel['id'], callback) => {
    const newOpenIds = openIds.includes(targetId)
      ? openIds.filter((id) => id !== targetId)
      : [...openIds, targetId];

    setOpenIds(newOpenIds);

    if (callback) {
      callback(newOpenIds);
    }
  };

  return [openIds, { handleToggle }];
};
