import React from "react";
import { toHumanReadableStorageSize } from '../util.ts';

export interface TableEntry {
    color: string;
    name: string;
    fileId?: string;
    size: number;
    select?: () => void;
    deselect?: () => void;
}

export interface TableData {
    color: string;
    path: string[];
    fileId: string;
    size: number;
    children: TableEntry[];
}

interface TableProps {
    tableData: TableData;
    setCurrentRootPath: (path: string[]) => void;
}


const Table: React.FC<TableProps> = ({ tableData, setCurrentRootPath }) => {
    return (
        <table className="w-full">
            <tbody>
                <tr key="0">
                    <td className="px-2 py-4">
                        {tableData.fileId && (
                            <a
                                href={`https://drive.google.com/drive/folders/${tableData.fileId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: "inline-block", width: "16px", height: "16px" }}
                            >
                                <img src="/assets/drive_logo.png" width="100%" height="100%" />
                            </a>
                        )}
                    </td>
                    <td className="px-2 py-4">
                        <div
                            className="inline-block w-6 h-6"
                            style={{ backgroundColor: tableData.color }}
                        />
                    </td>
                    <td className="px-2 py-4 text-xl">{toHumanReadableStorageSize(tableData.size)}</td>
                    <td className="px-2 py-4 text-xl w-full">{tableData.path[tableData.path.length - 1]}</td>
                </tr>
                {tableData.children.map((entry, index) => (
                    <tr key={index + 1}>
                        <td className="px-2">
                            {entry.fileId && (
                                <a
                                    href={`https://drive.google.com/drive/folders/${entry.fileId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block w-4 h-4"
                                >
                                    <img src="/assets/drive_logo.png" width="100%" height="100%" />
                                </a>
                            )}
                        </td>
                        <td className="px-2">
                            <div
                                className="inline-block w-4 h-4"
                                style={{ backgroundColor: entry.color }}
                            />
                        </td>
                        <td className="px-2">{toHumanReadableStorageSize(entry.size)}</td>
                        <td
                            onMouseOver={(e) => {
                                if (entry.select) {
                                    e.currentTarget.style.textDecoration = "underline";
                                    entry.select();
                                }
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.textDecoration = "none";
                                entry.deselect?.();
                            }}
                            onClick={() => setCurrentRootPath([...tableData.path, entry.name])}
                            className="px-2 w-full cursor-pointer"
                        >
                            {entry.name}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default Table;
