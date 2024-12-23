import React, { useEffect, useState } from 'react';
import { useDriveData } from './drivedata.tsx';
import { Folder } from '../drive/defs.ts';

interface ProgressBarProps {
    enabled: boolean;
}

// An upper limit for Drive storage for the lifetime of this app.
const hellaByte = 2 ** 90;

const ProgressBar: React.FC<ProgressBarProps> = ({ enabled }) => {
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

    let percentage = undefined;
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
        // NB: Multi-parent and other corner cases in how total Drive storage is calculated
        // by the Drive service may make this > 100.  Experience will tell if this requires
        // adjustments (e.g. making this account for 95% and keep the remaining 5% time-based).
        percentage = Math.round(100.0 * calculateTotalSize(data) / totalSize);
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
