import { useState, useEffect } from 'react';
import { useDriveData, useSetDriveData } from './components/drivedata.tsx';
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
  const driveData = useDriveData();
  const setDriveData = useSetDriveData();
  const [isStartButtonDisabled, setIsStartButtonDisabled] = useState(false);
  const [driveWalkCompleted, setDriveWalkCompleted] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [currentPath, setCurrentPath] = useState(decodeURIComponent(window.location.pathname));
  const [currentFragment, setCurrentFragment] = useState(decodeURIComponent(window.location.hash.substring(1)));

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(decodeURIComponent(window.location.pathname));
      setCurrentFragment(decodeURIComponent(window.location.hash.substring(1)));
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const goTo = ({ path, fragment }: { path?: string; fragment?: string } = {}) => {
    const basePath = path || window.location.pathname;
    const fullPath = fragment ? `${basePath}#${fragment}` : basePath;
    window.history.pushState({}, '', fullPath);
    if (path) setCurrentPath(path);
    if (fragment) setCurrentFragment(fragment);
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key in devData) {
        setDriveData(devData[event.key]);
        goTo({ path: "/d/", fragment: "My Drive" });
      }
    }

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  useEffect(() => {
    if (!driveData) {
      goTo({ path: "/" });
    }
  }, [driveData]);

  const handleStart = async () => {
    setIsStartButtonDisabled(true);
    setDriveWalkCompleted(false);

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

      goTo({ path: "/d/", fragment: "My Drive" });
      await walkDrive((folder: Folder) => setDriveData(folder));
      setDriveWalkCompleted(true);
      setIsStartButtonDisabled(false);
    }
    gapi.load('client:auth2', initClient);
  };

  return (
    <div
      style={{
        backgroundImage: "url('/assets/starfield.jpg')",
        backgroundRepeat: "repeat",
        backgroundSize: "auto",
        minHeight: "100vh",
      }}
    >
      <div className="flex items-center p-2 cursor-pointer" onClick={() => goTo({ path: "/" })}>
        <img src="/assets/gdrive.png" width="10%" height="10%" />
        <img src="/assets/space.png" width="10%" height="10%" />
      </div>

      {currentPath.startsWith("/d/") ? (
        <>
          <ProgressBar enabled={isSignedIn} completed={driveWalkCompleted} />
          <ZoomableIcicle
            currentRootPath={currentFragment.split("/").filter(Boolean)}
            setCurrentRootPath={(path: string[]) => goTo({ fragment: path.join("/") })}
          />
        </>
      ) : (
        <button
          onClick={handleStart}
          disabled={isStartButtonDisabled}
          className={`px-4 py-2 text-white font-bold rounded ${isStartButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
        >
          {isStartButtonDisabled ? 'Running...' : 'Start'}
        </button>
      )}
    </div>
  );
}

export default App;
