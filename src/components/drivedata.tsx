import React, { createContext, useContext, useState } from 'react';
import { Folder } from '../drive/defs.ts';

interface DriveDataContextType {
    data: Folder;
    setData: React.Dispatch<React.SetStateAction<Folder>>;
}

const initialRoot: Folder = {
    name: "root",
    subfolders: [],
    size: 0,
};

const DriveDataContext = createContext<DriveDataContextType | null>(null);

export const DriveDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [data, setData] = useState(initialRoot);

    return (
        <DriveDataContext.Provider value={{ data, setData }}>
            {children}
        </DriveDataContext.Provider>
    );
};

export const useDriveData = (): Folder => {
    const context = useContext(DriveDataContext);
    if (!context) {
        throw new Error("useDriveData must be used within a DriveDataProvider");
    }
    return context.data;
};

export const useSetDriveData = (): React.Dispatch<React.SetStateAction<Folder>> => {
    const context = useContext(DriveDataContext);
    if (!context) {
        throw new Error("useSetDriveData must be used within a DriveDataProvider");
    }
    return context.setData;
};
