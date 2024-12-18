import { DriveDataProvider } from './components/drivedata.tsx';
import ZoomableIcicle from './components/icicle.tsx';

function App() {
  return (
    <DriveDataProvider>
      <h1 className="text-3xl font-bold text-center text-blue-600">
        GDrive Space
      </h1>
      <ZoomableIcicle />
    </DriveDataProvider>
  )
}

export default App
