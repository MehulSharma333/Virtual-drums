
import { ClipLoader } from "react-spinners";

export function LoaderOverlay({
    isLoaded,
    fullScreen
}) {

  return (
    <div 
      key="soundPackLoader" // Important for AnimatePresence
      className={`fixed inset-0 z-[100] flex items-center justify-center ${!isLoaded ? "bg-white" : "bg-black/70"}   backdrop-blur-sm`}
    >
      <div
       
        className={`flex flex-col items-center space-y-6 p-10 rounded-2xl ${fullScreen ? "rotate-90" : ""} bg-zinc-800/80 shadow-2xl backdrop-blur-lg border border-teal-500/30`}
      >
        <ClipLoader
    color="#20c997" // Teal color
    loading={true}
         size={60} // Increase size for better visibility
    // Add custom CSS to increase the border thickness (e.g., to 8 pixels)
    cssOverride={{
      borderWidth: '8px',
      // For RingLoader, you might use: borderBottomWidth: '8px'
    }}

    aria-label="Loading Spinner"
    data-testid="loader"
/>
       
        <p className="font-sans text-2xl font-bold tracking-wider text-teal-400 animate-pulse sm:text-3xl">
          LOADING SOUNDS...
        </p>
        <p className="text-sm text-zinc-400">
          Preparing your new instrument pack. Please wait.
        </p>
      </div>
    </div>
  );
}