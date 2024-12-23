import { useState, useEffect } from 'react';
import { useSetDriveData } from './components/drivedata.tsx';
import ZoomableIcicle from './components/icicle.tsx';
import { walkDrive } from './drive/ops.ts';
import { Folder } from './drive/defs.ts';
import { devData } from './drive/fake.ts';
import { gapi } from 'gapi-script';
import ProgressBar from './components/progress.tsx';

const CLIENT_ID = '161482153716-nc2jdhntjl4aor8f9slfb40tu7gnnmvb.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';


function App() {
  const setData = useSetDriveData();
  const [isStartButtonDisabled, setIsStartButtonDisabled] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [currentPath, setCurrentPath] = useState(decodeURIComponent(window.location.pathname));

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(decodeURIComponent(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const goToPath = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key in devData) {
        setData(devData[event.key]);
      }
    }

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);


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

      goToPath("/d/My Drive");
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

      {currentPath.startsWith("/d/") ? (
        <>
          <ProgressBar enabled={isSignedIn} />
          <ZoomableIcicle
            currentRootPath={currentPath.replace(/^\/d\//, "").split("/").filter(Boolean)}
            setCurrentRootPath={(path: string[]) => goToPath(`/d/${path.join("/")}`)}
          />
        </>
      ) : (
        <h1>Start page...</h1>
      )}
    </>
  );
}

export default App;
