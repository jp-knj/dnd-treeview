import React, { useState } from 'react'
import { getBackendOptions, MultiBackend } from '@minoru/react-dnd-treeview'
import { Tree } from './Tree'
import { DndProvider } from 'react-dnd'

export function App() {
    const [treeData, setTreeData] = useState(initialData)
    const handleDrop = (newTreeData: any) => setTreeData(newTreeData)

    return (
        <DndProvider backend={MultiBackend} options={getBackendOptions()}>
            <Tree
                tree={treeData}
                rootId={0}
                onDrop={handleDrop}
                // @ts-ignore
                render={(node, { depth, isOpen, onToggle }) => (
                    <div style={{ marginLeft: depth * 10 }}>
                        {node.droppable && (
                            <span onClick={onToggle}>{isOpen ? '[-]' : '[+]'}</span>
                        )}
                        {node.text}
                    </div>
                )}
            />
        </DndProvider>
    )
}

const initialData = [
    { id: 1, parent: 0, droppable: true, text: 'Folder 1' },
    {
        id: 2,
        parent: 1,
        text: 'File 1-1',
    },
    {
        id: 3,
        parent: 1,
        text: 'File 1-2',
    },
    {
        id: 4,
        parent: 0,
        droppable: true,
        text: 'Folder 2',
    },
    {
        id: 5,
        parent: 4,
        droppable: true,
        text: 'Folder 2-1',
    },
    {
        id: 6,
        parent: 5,
        text: 'File 2-1-1',
    },
]
