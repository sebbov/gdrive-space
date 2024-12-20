import { useState } from 'react';
import { useSetDriveData } from './components/drivedata.tsx';
import ZoomableIcicle from './components/icicle.tsx';
import { walkDrive } from './drive/ops.ts';
import { Folder } from './drive/defs.ts';
import { gapi } from 'gapi-script';
import ProgressBar from './components/progress.tsx';

const CLIENT_ID = '161482153716-nc2jdhntjl4aor8f9slfb40tu7gnnmvb.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';


function App() {
  const setData = useSetDriveData();
  const [isStartButtonDisabled, setIsStartButtonDisabled] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const handleStart = async () => {
    setIsStartButtonDisabled(true);

    const initClient = async () => {
      await gapi.client.init({
        clientId: CLIENT_ID,
        scope: SCOPES,
        discoveryDocs: [DISCOVERY_DOC],
      });

      const authInstance = gapi.auth2.getAuthInstance();
      if (!authInstance.isSignedIn.get()) {
        await authInstance.signIn();
      }
      setIsSignedIn(true);

      await walkDrive((folder: Folder) => setData(folder));

      setIsStartButtonDisabled(false);
    }
    gapi.load('client:auth2', initClient);
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

      <ProgressBar enabled={isSignedIn} />
      <ZoomableIcicle />
    </>
  );
}

export default App;
