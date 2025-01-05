import { useState, useEffect } from 'react';
import { useDriveData, useSetDriveData } from './components/drivedata.tsx';
import PrivacyPolicy from './components/privacy.tsx';
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
  const [driveWalkStarted, setDriveWalkStarted] = useState(false);
  const [driveWalkCompleted, setDriveWalkCompleted] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [currentPath, setCurrentPath] = useState(decodeURIComponent(window.location.pathname));
  const [currentFragment, setCurrentFragment] = useState(decodeURIComponent(window.location.hash.substring(1)));

  useEffect(() => {
    gapi.load('client:auth2', async () => {
      await gapi.client.init({
        clientId: CLIENT_ID,
        scope: SCOPES,
        discoveryDocs: [DISCOVERY_DOC],
      });
      const auth2 = gapi.auth2.getAuthInstance();
      setIsSignedIn(auth2.isSignedIn.get());
    });

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
    const currentFragment = fragment || window.location.hash.slice(1);
    const fullPath = currentFragment ? `${basePath}#${currentFragment}` : basePath;
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
    if (!driveData && currentPath == "/d/") {
      goTo({ path: "/" });
    }
  }, [driveData]);

  const handleStart = async () => {
    if (driveWalkStarted) {
      goTo({ path: "/d/" });
      return
    }

    if (!isSignedIn) {
      const authInstance = gapi.auth2.getAuthInstance();
      await authInstance.signIn();
    }
    setIsSignedIn(true);
    setDriveWalkStarted(true);

    goTo({ path: "/d/", fragment: "My Drive" });
    await walkDrive((folder: Folder) => setDriveData(folder));

    setDriveWalkCompleted(true);
  };

  const handleLogout = async () => {
    const auth2 = gapi.auth2.getAuthInstance();
    await auth2.signOut();
    auth2.disconnect();
    window.location.reload();
  };

  return (
    <>
      <div
        className="p-4 gap-4"
        style={{
          backgroundImage: "url('/assets/starfield.jpg')",
          backgroundRepeat: "repeat",
          backgroundSize: "auto",
          minHeight: "100vh",
        }}
      >
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center cursor-pointer" onClick={() => driveWalkStarted ? goTo({ path: "/d/" }) : goTo({ path: "/" })}>
            <img src="/assets/gdrive.png" alt="GDrive Logo" className="w-auto h-8" />
            <img src="/assets/space.png" alt="Space Logo" className="w-auto h-8" />
          </div>

          <div className="flex items-center gap-4">
            <span
              className="material-icons-outlined text-logo-space-blue hover:text-logo-gdrive-yellow cursor-pointer text-5xl"
              title="More Information"
              onClick={() => goTo({ path: "/info" })}
            >
              help
            </span>

            <span
              className="material-icons-outlined text-logo-space-blue hover:text-logo-gdrive-yellow cursor-pointer text-5xl"
              title="Privacy Policy"
              onClick={() => goTo({ path: "/privacy" })}
            >
              privacy_tip
            </span>

            {isSignedIn && (
              <span
                className="material-icons-outlined text-logo-space-blue hover:text-logo-gdrive-yellow cursor-pointer text-5xl"
                title="Revoke all access you provided this app to your Google Drive"
                onClick={handleLogout}
              >
                logout
              </span>
            )}
          </div>
        </div>

        <div
          className="cursor-pointer"
          onClick={() => driveWalkStarted ? goTo({ path: "/d/" }) : goTo({ path: "/" })}
        >
          <ProgressBar enabled={driveWalkStarted} completed={driveWalkCompleted} />
        </div>
        {currentPath == "/d/" ? (
          <>
            <ZoomableIcicle
              currentRootPath={currentFragment.split("/").filter(Boolean)}
              setCurrentRootPath={(path: string[]) => goTo({ fragment: path.join("/") })}
            />
          </>
        ) : currentPath == "/info" ? (
          <>
            <h1>Info</h1>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </>
        ) : currentPath == "/privacy" ? (
          <>
            <PrivacyPolicy />
          </>
        ) : (
          <button
            onClick={handleStart}
            className="px-4 py-2 text-logo-gdrive-yellow font-bold rounded bg-logo-space-blue hover:bg-logo-space-blue-darker"
          >
            {driveWalkStarted ? 'Results' : 'Start'}
          </button>
        )}

      </div>
    </>
  );
}

export default App;
