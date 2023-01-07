import { useContext } from 'react'
import { TreeState, TreeContext } from './Provider'

export const useTreeContext = <T>(): TreeState<T> => {
    const treeContext = useContext<TreeState<T>>(
    TreeContext as unknown as React.Context<TreeState<T>>
    )

    if (!treeContext) {
        throw new Error('useTreeContext must be used under TreeProvider')
    }

    return treeContext
}
