import { useState, useEffect } from 'react';
import { useDriveData, useSetDriveData } from './components/drivedata.tsx';
import FAQ from './components/faq.tsx';
import PrivacyPolicy from './components/privacy.tsx';
import TermsOfUse from './components/tos.tsx';
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
              title="Frequently Asked Questions"
              onClick={() => goTo({ path: "/faq" })}
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
        ) : currentPath == "/faq" ? (
          <>
            <FAQ goTo={goTo} />
          </>
        ) : currentPath == "/privacy" ? (
          <>
            <PrivacyPolicy />
          </>
        ) : currentPath == "/tos" ? (
          <>
            <TermsOfUse />
          </>
        ) : (

          <div className="flex flex-col justify-evenly items-center text-center min-h-[calc(100vh-4rem)] w-3/4 py-2 mx-auto">
            <p className="text-gray-300 text-3xl">
              Explore your Google Drive folders and gain insights into your storage usage directly within your browser.
            </p>
            <img
              src="/assets/screenshot.png"
              className="rounded-lg border-2 border-gray-300 w-3/4 shadow-lg"
            />
            <p className="text-gray-300 text-2xl">
              Read our <a href="#" onClick={() => goTo({ path: "/faq" })} className="underline">FAQ</a>, our <a href="#" onClick={() => goTo({ path: "/privacy" })} className="underline">Privacy Policy</a> and our <a href="#" onClick={() => goTo({ path: "/tos" })} className="underline">Terms of Use</a>.
            </p>
            <button
              onClick={handleStart}
              className="px-14 py-5 text-4xl text-white font-bold rounded-full bg-logo-space-blue-darker hover:bg-logo-space-blue-darkest shadow-xl"
            >
              {driveWalkStarted ? 'Results' : 'Start'}
            </button>
          </div>

        )}
        <footer className="text-center text-gray-500 text-sm mt-6">
          © 2024–{new Date().getFullYear()} Unimplemented LLC. All rights reserved.
        </footer>
      </div>
    </>
  );
}

export default App;
