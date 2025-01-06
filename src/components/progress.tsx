import React, { useEffect, useState } from 'react';
import { useDriveData } from './drivedata.tsx';
import { Folder } from '../drive.ts';

interface ProgressBarProps {
    enabled: boolean;
    completed: boolean;
}

// An upper limit for Drive storage for the lifetime of this app.
const hellaByte = 2 ** 90;

const ProgressBar: React.FC<ProgressBarProps> = ({ enabled, completed }) => {
    const [totalSize, setTotalSize] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (!enabled) {
            setTotalSize(undefined);
            return;
        }

        setTotalSize(hellaByte);

        const getTotalSize = async () => {
            const response = await gapi.client.drive.about.get({
                fields: "storageQuota",
            });
            console.log(response);
            setTotalSize(parseInt(response.result.storageQuota?.usageInDrive || "0", 10));
        }

        getTotalSize();
    }, [enabled])

    let percentage = 100;
    if (!completed) {
        const data = useDriveData();
        const calculateTotalSize = (folder: Folder | undefined): number => {
            if (!folder) return 0;
            let totalSize = folder.size;
            for (const subfolder of folder.subfolders) {
                totalSize += calculateTotalSize(subfolder);
            }
            return totalSize;
        }
        if (totalSize !== undefined) {
            // Clamp at 99 until we know the Drive walk completed. A 100% progress would
            // be surprising before that point.
            percentage = Math.min(99, Math.round(100.0 * calculateTotalSize(data) / totalSize));
        }
    }

    return (
        <>
            {enabled ? (
                <div className="relative w-full bg-gray-400 h-6">
                    <div
                        className="h-6 bg-logo-gdrive-yellow"
                        style={{ width: `${percentage}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-black font-bold">
                        {Math.min(100, Math.max(0, percentage!))}%
                    </span>
                </div>
            ) : (<></>)}
        </>
    );
};

export default ProgressBar;
