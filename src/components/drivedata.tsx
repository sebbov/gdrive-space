import React, { createContext, useContext, useState } from 'react';
import { Folder } from '../drive.ts';

interface DriveDataContextType {
    data: Folder | undefined;
    setData: React.Dispatch<React.SetStateAction<Folder | undefined>>;
}

const DriveDataContext = createContext<DriveDataContextType | null>(null);

export const DriveDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [data, setData] = useState<Folder | undefined>(undefined);

    return (
        <DriveDataContext.Provider value={{ data, setData }}>
            {children}
        </DriveDataContext.Provider>
    );
};

export const useDriveData = (): Folder | undefined => {
    const context = useContext(DriveDataContext);
    if (!context) {
        throw new Error("useDriveData must be used within a DriveDataProvider");
    }
    return context.data;
};

export const useSetDriveData = (): React.Dispatch<React.SetStateAction<Folder | undefined>> => {
    const context = useContext(DriveDataContext);
    if (!context) {
        throw new Error("useSetDriveData must be used within a DriveDataProvider");
    }
    return context.setData;
};
