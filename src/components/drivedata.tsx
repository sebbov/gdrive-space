import React, { createContext, useContext, useState } from 'react';
import { Folder } from '../drive/defs.ts';

const initialRoot = {
    name: "root",
    subfolders: [],
    size: 0,
    filesSize: 0,
    filesCount: 0,
}

const DriveDataContext = createContext<Folder>(initialRoot);

export const DriveDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [data, setData] = useState(initialRoot);

    void setData; // TEMP

    return (
        <DriveDataContext.Provider value={data} > {children} </DriveDataContext.Provider>
    );
};

export const useDriveData = () => useContext(DriveDataContext);
