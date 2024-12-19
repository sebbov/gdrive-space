import { useState } from 'react';
import { useSetDriveData } from './components/drivedata.tsx';
import ZoomableIcicle from './components/icicle.tsx';
import { walkDrive } from './drive/ops.ts';
import { Folder } from './drive/defs.ts';

function App() {
  const setData = useSetDriveData();

  const [isStartButtonDisabled, setIsStartButtonDisabled] = useState(false);

  const handleStart = async () => {
    setIsStartButtonDisabled(true);
    await walkDrive((folder: Folder) => {
      setData(folder);
    });
    setIsStartButtonDisabled(false);
  };

  return (
    <>
      <div className="flex items-center justify-between p-4">
        <h1 className="text-3xl font-bold text-blue-600">GDrive Space</h1>
        <button
          onClick={handleStart}
          disabled={isStartButtonDisabled}
          className={`px-4 py-2 text-white font-bold rounded ${isStartButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
            }`}
        >
          {isStartButtonDisabled ? 'Running...' : 'Start'}
        </button>
      </div>

      <ZoomableIcicle />
    </>
  );
}

export default App;
