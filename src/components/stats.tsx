import React, { useState } from 'react';
import Path from './path.tsx';
import Table, { TableData } from './table.tsx';
import Icicle from './icicle.tsx';

interface StatsProps {
    currentRootPath: string[];
    setCurrentRootPath: (path: string[]) => void;
}

const Stats: React.FC<StatsProps> = ({ currentRootPath, setCurrentRootPath }) => {
    const [tableData, setTableData] = useState<TableData | undefined>(undefined);

    return (
        <>
            <div className="w-full">
                <Path value={currentRootPath} setCurrentRootPath={setCurrentRootPath} />
            </div>
            <div className="flex items-start gap-4">
                <div className="w-1/2 overflow-auto max-h-screen">
                    {tableData && (
                        <Table
                            tableData={tableData}
                            setCurrentRootPath={setCurrentRootPath}
                        />
                    )}
                </div>
                <Icicle
                    currentRootPath={currentRootPath}
                    setCurrentRootPath={setCurrentRootPath}
                    setTableData={setTableData}
                />
            </div>
        </>
    );
};

export default Stats;
