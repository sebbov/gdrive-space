import React, { createContext, useContext, useState } from 'react';

const DriveDataContext = createContext<any>(null);

export const DriveDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [data, setData] = useState({
        name: "root",
        children: [
            { name: "Child 1", value: 100 },
            {
                name: "Child 2",
                children: [
                    { name: "Subchild 1", value: 50 },
                    { name: "Subchild 2", value: 150 },
                    {
                        name: "Subchild 3",
                        children: [
                            { name: "Subchild 3a", value: 30 },
                            { name: "Subchild 3b", value: 80 },
                        ],
                    },
                ],
            },
        ],
    });

    void setData; // TEMP

    return (
        <DriveDataContext.Provider value={data} > {children} </DriveDataContext.Provider>
    );
};

export const useDriveData = () => useContext(DriveDataContext);
