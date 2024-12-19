
import { Folder } from './defs.ts';

export const walkDrive = async (setData: (folder: Folder) => void): Promise<void> => {
    setData({
        name: "root",
        size: 0,
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    setData({
        name: "root",
        size: 10,
        subfolders: [
            {
                name: "folder 1",
                size: 8,
            },
            {
                name: "folder 3",
                size: 12,
            },
        ],
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    setData({
        name: "root",
        size: 10,
        subfolders: [
            {
                name: "folder 1",
                size: 15,
            },
            {
                name: "folder 2",
                size: 13,
                subfolders: [
                    {
                        name: "folder 2a",
                        size: 50,
                    },

                ],
            },
            {
                name: "folder 3",
                size: 13,
            },
        ],
    });
}
