"use client";
import Image from "next/image";
import { useState , useEffect , useRef , useCallback , useLayoutEffect } from "react";
import { motion, useAnimation , AnimatePresence } from "motion/react";
import { CircleX , Menu } from 'lucide-react';
import  "./styles.css";
import { LoaderOverlay } from "./LoaderOverlay";
export default function Home() {
   const [fullScreen , setFullScreen] = useState(false);
   const [showDropdown, setShowDropdown] = useState(false);
   const [isLeftDiscAnimating, setIsLeftDiscAnimating] = useState(false);
   const [isRightDiscAnimating, setIsRightDiscAnimating] = useState(false);
   const [crashAnimating , setIsCrashAnimating] = useState(false);
   const [activeOverlay, setActiveOverlay] = useState(null);
     const [activeFeature, setActiveFeature] = useState(null);
     const [isRecording, setIsRecording] = useState(false);
const [isPlaying, setIsPlaying] = useState(false);
const [timer, setTimer] = useState(120); // 2 minutes
const [recordedEvents, setRecordedEvents] = useState([]);
const [recordingStartTime, setRecordingStartTime] = useState(null);

const [isJamming, setIsJamming] = useState(false);
const jamIntervalRef = useRef(null);  // to clear the loop
const [showFeatureOnFullScreen , setShowFeatureOnFullScreen] = useState(false);
const [pressedKey, setPressedKey] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
 const activeKeysRef = useRef(new Set());

const startRecording = () => {
  setIsRecording(true);
  setTimer(120);
  setRecordedEvents([]);
   setRecordingStartTime(Date.now());
};

const stopRecording = () => {
  setIsRecording(false);
  setIsPlaying(true); // in case it's accidentally true
  setTimer(120); // reset timer (if you want to allow new recording immediately)

  console.log("Final recordedEvents:", recordedEvents);
};

const playRecording = () => {
  if (recordedEvents.length === 0 || isRecording) return;

  setIsPlaying(true);

  const startTime = recordedEvents[0].time;  // move this here

  recordedEvents.forEach(event => {
    setTimeout(() => {
      handleOverlayClick(event.id);
    }, event.time - startTime);
  });

  const duration = recordedEvents[recordedEvents.length - 1].time - startTime;
    setTimeout(() => {
    setIsPlaying(false);
    setRecordedEvents([]);
    setRecordingStartTime(null)   // ✅ empty the recordedEvents after playback finishes
  }, duration + 500);
};

const themes = [
  { id: 'theme1', src: '/royal-blue.png', label: 'Midnight Thunder' }, // Black
  { id: 'theme2', src: '/drum-parent.png', label: 'Ocean Pulse' },       // Blue
  { id: 'theme3', src: '/royal-purple-4.png', label: 'Violet Vibe' }        // Purple
];

const [selectedTheme , setSelectedTheme] = useState(themes[0].src);

useEffect(() => {
  let interval = null;
  if (isRecording && timer > 0) {
    interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);
  } else if (!isRecording && timer !== 0) {
    clearInterval(interval);
  }
  if (timer === 0 && isRecording) {
    stopRecording();
  }
  return () => clearInterval(interval);
}, [isRecording, timer]);


   const drumSounds = {
  overlay1: "/drums-sound/drums-snare-left-left.wav",
  overlay2: "/drums-sound/drums-snare-right-top.wav",
  overlay3: "/drums-sound/drums-snare-left-top.wav",
  overlay4: "/drums-sound/drums-main-kick.wav",
  overlay5: "/drums-sound/drums-snare-main.wav",
  hithatOne: '/drums-sound/drums-hiHat-splash.wav',
  hithatTwo: '/drums-sound/drums-hiHat-small.wav',
  hithatThree: '/drums-sound/drums-hihat-three.wav'
}; 

 const allSoundPaths = Object.values(drumSounds);

let currentStep = 0;
const totalSteps = 8;

const groovePatterns = [
  [
    ["overlay4"], [], ["overlay2"], [], ["overlay4"], [], ["overlay2"], [],
    ["overlay4"], [], ["overlay2"], [], ["overlay4"], [], ["overlay2"], []
  ],
  [
    ["overlay4", "hithatOne"], [], ["overlay2"], [], ["overlay4"], [], ["hithatTwo"], [],
    ["overlay4", "overlay3"], [], ["overlay5"], [], ["overlay4"], [], ["overlay2"], []
  ],
  [
    ["hithatThree"], [], ["hithatThree"], ["overlay3"], ["overlay4"], [], [], ["overlay2"],
    [], ["hithatOne"], ["overlay4"], [], ["overlay2"], [], [], []
  ],
  [
    ["overlay4"], ["overlay2"], [], ["overlay3"], ["overlay4", "overlay3"], [], ["overlay5"], [],
    [], ["overlay4"], [], [], ["overlay2"], ["overlay4"], [], []
  ],
  [
    ["hithatThree", "overlay4"], [], ["hithatTwo", "overlay2"], [], ["overlay4"], [], ["overlay2"], [],
    ["hithatThree"], [], ["overlay4", "overlay5"], [], ["overlay3"], [], [], []
  ],
  [
    ["overlay4"], [], ["overlay3"], ["overlay4"], ["overlay5"], [], [], ["hithatOne"],
    ["overlay4", "overlay2"], [], ["overlay3"], [], ["overlay4"], [], [], []
  ]
];


const hiHatAnimMap = {
  hithatOne: setIsCrashAnimating,
  hithatTwo: setIsLeftDiscAnimating,
  hithatThree: setIsRightDiscAnimating,
};


const grooveTimeoutRef = useRef(null);

const startJamming = () => {
  if (jamIntervalRef.current) return;
  setIsJamming(true)

  let currentGrooveIndex = Math.floor(Math.random() * groovePatterns.length);
  let currentStep = 0;
  let currentGroove = groovePatterns[currentGrooveIndex];

  // Function to handle each step in the loop
const playStep = () => {
  const step = currentGroove[currentStep];

  step.forEach((drumId) => {
    if (hiHatAnimMap[drumId]) {
        const delayMap = {
      hithatOne: 700,
      hithatTwo: 600,
      hithatThree: 600,
    };
    const delay = delayMap[drumId] || 200;
      // Handle hi-hats with animation
      handleHiHatTap(hiHatAnimMap[drumId], drumId, delay);
    } else {
      // Handle other drum elements
      handleOverlayClick(drumId);
    }
  });

  // Advance to next step
  currentStep = (currentStep + 1) % currentGroove.length;
};

  jamIntervalRef.current = setInterval(playStep, 250); // 16th notes at 60 BPM

  const switchGroove = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * groovePatterns.length);
    } while (newIndex === currentGrooveIndex); // avoid immediate repeat

    currentGrooveIndex = newIndex;
    currentGroove = groovePatterns[currentGrooveIndex];
    currentStep = 0; // reset step to start the new groove cleanly

    grooveTimeoutRef.current = setTimeout(switchGroove, getRandomTime(20000, 30000));
  };

  grooveTimeoutRef.current = setTimeout(switchGroove, getRandomTime(20000, 30000));
};

const stopJamming = () => {
  clearInterval(jamIntervalRef.current);
  clearTimeout(grooveTimeoutRef.current);
  jamIntervalRef.current = null;
  grooveTimeoutRef.current = null;
  setIsJamming(false)
};

const getRandomTime = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;


function startLoop() {
  if (loopInterval) return; // prevent multiple loops
  currentStep = 0;
  loopInterval = setInterval(playLoopStep, 400); // ~150 BPM
}


function stopLoop() {
  clearInterval(loopInterval);
  loopInterval = null;
}



const keyBindings = {
  KeyA: "overlay1",      // kick
  KeyS: "overlay2",      // snare right
  KeyD: "overlay3",      // snare left
  KeyF: "overlay4",      // snare right right
  KeyG: "overlay5",      // snare left left
  KeyQ: "hithatOne",     // hi-hat splash
  KeyW: "hithatTwo",     // hi-hat small
  KeyE: "hithatThree",   // hi-hat small
};


const playSound = (id) => {
  const soundPath = drumSounds[id];
  if (soundPath) {
    const sound = new Audio(soundPath);
    sound.play();
  }
};

const releaseSound = (id) => {
    activeKeysRef.current.delete(id); // allow it to play next time
  };



 useEffect(() => {
  if (isJamming) return;

  const handleKeyDown = (e) => {
    const id = keyBindings[e.code];
    if (!id) return;

    // If key is already active, skip
    if (activeKeysRef.current.has(e.code)) return;

    activeKeysRef.current.add(e.code);
    triggerKeyAction(id, e.code);
  };

  const handleKeyUp = (e) => {
    activeKeysRef.current.delete(e.code);
  };

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
  };
}, [isRecording, isJamming]);

// Function to handle animation + sound
const triggerKeyAction = (id, code) => {
  // Animate key
  setPressedKey(code);
  setTimeout(() => setPressedKey(null), 200);

  // Play sound
  if (hiHatAnimMap[id]) {
    handleHiHatTap(hiHatAnimMap[id], id, 200);
  } else {
    handleOverlayClick(id);
  }
}

const playDrums = (id) => {
  if (isJamming) return ;
  handleOverlayClick(id)
}
   const handleOverlayClick = (id) => {
     console.log('[handleOverlayClick] triggered with id:', id);
  setActiveOverlay(id);
  // future: play sound
  playSound(id);
  // remove glow after short time
  setTimeout(() => setActiveOverlay(null), 200);
   if (isRecording && recordingStartTime) {
    const timeSinceStart = Date.now() - recordingStartTime;
    console.log('[handleOverlayClick] recording: id=', id, ' timeSinceStart=', timeSinceStart);
     setRecordedEvents(prev => {
      console.log('[handleOverlayClick] prev recordedEvents:', prev);
      return [...prev, { id, time: timeSinceStart }];
    });
  } else {
    console.log('[handleOverlayClick] not recording');
  }
  }

   const hitAnimation = {
  rotate: [0, 25, -10, 5, -2, 0],
  scale: [1, 0.95, 1.02, 0.98, 1],
  transition: { duration: 0.6, ease: "easeOut" }
};
const crashAnimation = {
  rotateX: [0, -60, 30, -20, 15, -2, 0],
  transition: { duration: 1, ease: "easeOut" }
};


 useLayoutEffect(() => {
  const isMobile = window.innerWidth <= 640;

  if (fullScreen && isMobile) {
    document.body.classList.add("locked");
    document.documentElement.classList.add("locked");
  } else {
    document.body.classList.remove("locked");
    document.documentElement.classList.remove("locked");
  }

  return () => {
    document.body.classList.remove("locked");
    document.documentElement.classList.remove("locked");
  };
}, [fullScreen]);
function fullScreenDrums() {
  const isMobile = window.innerWidth <= 450;

  if (isMobile) {
    document.body.classList.add("locked");
    document.documentElement.classList.add("locked");
  }

  requestAnimationFrame(() => {
    setFullScreen(true); // trigger re-render and rotate
  });
}

useEffect(() => {
  function handleResize() {
    const isMobile = window.innerWidth <= 450;

    if (!isMobile) {
      // Reset when width goes above 450px
      setFullScreen(false);
      document.body.classList.remove("locked");
      document.documentElement.classList.remove("locked");
    }
  }

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);



  const handleHiHatTap = (animSetter, soundId, duration) => {
  if (isJamming) return;

  animSetter(true);
  handleOverlayClick(soundId);

  setTimeout(() => {
    animSetter(false);
  }, duration);
};

  useEffect(() => {
    if (allSoundPaths.length === 0) {
      console.warn('No drum sound paths found.');
      setIsLoaded(true); 
      return;
    }

    const loadingPromises = allSoundPaths.map(path => {
      return new Promise((resolve) => {
        const audio = new Audio(path);
        
        // Resolve once the audio is ready to play through
        audio.addEventListener('canplaythrough', () => resolve(), { once: true });
        
        // Resolve even on error to prevent Promise.all from blocking the UI entirely
        audio.addEventListener('error', () => {
          console.error(`Failed to load drum sound: ${path}`);
          resolve();
        }, { once: true });
      });
    });

    Promise.all(loadingPromises)
      .then(() => {
        setIsLoaded(true);
        console.log('All drum sounds preloaded successfully! 🥁');
      })
      .catch(error => {
        console.error('An error occurred during drum sound preload:', error);
        setIsLoaded(true);
      });
  }, []);

  
   if (!isLoaded) {
     return (
   <LoaderOverlay/>
  );
  }

  return (
    <div className={`w-full ${fullScreen ? "h-[100svh] w-[100svw]  overflow-hidden" : "min-h-screen"}    flex flex-col   justify-center items-center  2xl:px-0  `}>
       <div className={`${fullScreen ? "rotate-piano  gap-4  " : "flex flex-col  gap-4 w-full items-center justify-center"} `}>
         {fullScreen && <button onClick={()=>setFullScreen(false)} className={` ${fullScreen ? "absolute  top-62 right-4 z-999 p-4 shadow-2xl rounded-3xl bg-amber-100" : "hidden"} `}>
         <CircleX color="red" size={40}/>
        </button>}
         
          {fullScreen && (
        <div className="absolute top-2 right-4 z-[999]">
          <button
            onClick={() => setShowDropdown(prev => !prev)}
            className="p-3 shadow-xl rounded-full bg-amber-100 hover:bg-amber-200 transition-colors"
          >
            <Menu color="red" size={20} />
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-48 bg-amber-50 rounded-xl shadow-xl flex flex-col"
              >
                   <button
                  onClick={() => {
                    setActiveFeature(1);
                    setShowDropdown(false);
                    setShowFeatureOnFullScreen(true);
                  }}
                  className="px-4 py-2 text-left hover:bg-amber-100 rounded-t-xl"
                >
                  Play and Record
                </button>
                 <button
                  onClick={() => {
                    setActiveFeature(2);
                    setShowDropdown(false);
                    setShowFeatureOnFullScreen(true);
                  }}
                  className="px-4 py-2 text-left hover:bg-amber-100"
                >
                  Theme Selector
                </button>
                <button
                  onClick={() => {
                    setActiveFeature(3);
                    setShowDropdown(false);
                    setShowFeatureOnFullScreen(true);
                  }}
                  className="px-4 py-2 text-left hover:bg-amber-100 rounded-b-xl"
                >
                  Loop Trainer
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      {!fullScreen && !activeFeature && (
  <div className="w-4/5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 rounded-xl shadow-inner">
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setActiveFeature(1)}
      className="bg-gray-900 text-white rounded-lg flex items-center justify-center p-8 cursor-pointer shadow-lg hover:shadow-xl transition"
    >
      <span className="text-xl font-semibold">▶️ Play & Record</span>
    </motion.div>
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setActiveFeature(2)}
      className="bg-gray-900 text-white rounded-lg flex items-center justify-center p-8 cursor-pointer shadow-lg hover:shadow-xl transition"
    >
      <span className="text-xl font-semibold">🎨 Select Theme</span>
    </motion.div>
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setActiveFeature(3)}
      className="bg-gray-900 text-white rounded-lg flex items-center justify-center p-8 cursor-pointer shadow-lg hover:shadow-xl transition"
    >
      <span className="text-xl font-semibold">💡 Auto Drummer</span>
    </motion.div>
  </div>
)}

        {activeFeature && (
          <motion.div
            key={activeFeature}
            
            className={`bg-gray-900 text-white w-4/5 md:w-2/3 p-8 rounded-xl shadow-2xl flex flex-col ${fullScreen ? "h-[30%] " : ""}  items-center justify-center relative overflow-y-auto`}
          >
            <button
              onClick={() => setActiveFeature(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition text-xl"
            >
              ✖
            </button>
            <h2 className={` ${fullScreen ? "hidden" : "text-2xl mb-4"} font-bold `}>
              {activeFeature === 1 && `▶️ Play & Record`}
              {activeFeature === 2 && `🎨 Select Theme`}
              {activeFeature === 3 && `💡 Auto Drummer`}
            </h2>
           
             {activeFeature === 1 && (
        <div className={` ${fullScreen ? "w-full h-[10%]  " : ""} flex flex-col justify-center items-center`}>
          {/* Timer */}
          <div className={` ${fullScreen ? "text-xs" : "text-3xl"} font-mono text-yellow-400 mb-4`}>
            {Math.floor(timer / 60).toString().padStart(2, '0')}:
            {(timer % 60).toString().padStart(2, '0')}
          </div>

          {/* Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={startRecording}
              disabled={isRecording}
              className={`bg-red-600 text-white ${fullScreen ? "text-xs" : ""} px-4 py-2 rounded shadow disabled:opacity-30 hover:bg-red-700 transition`}
            >
              ⏺ Record
            </button>
            <button
              onClick={stopRecording}
              disabled={!isRecording}
              className={`bg-gray-700 text-white ${fullScreen ? "text-xs" : ""} px-4 py-2 rounded shadow disabled:opacity-30 hover:bg-gray-600 transition`}
            >
              ⏹ Stop
            </button>
            <button
              onClick={playRecording}
              disabled={isRecording || recordedEvents.length === 0}
              className={`bg-green-600 text-white ${fullScreen ? "text-xs" : ""} px-4 py-2 rounded shadow disabled:opacity-30 hover:bg-green-700 transition`}
            >
              ▶️ Play
            </button>
          </div>
        </div>
      )}
     { activeFeature === 2 && (
  <div className={`flex flex-col items-center  w-full   ${fullScreen ? " h-[10%] justify-center" : ""} `}>
   
    <div className={`grid ${fullScreen ? "grid-cols-3" : "grid-cols-1 h-[160px]"}  sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl`}>
      {themes.map((theme) => (
      <motion.div
        key={theme.id}
        whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0], transition: { duration: 0.4 } }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setSelectedTheme(theme.src)}
        className={`cursor-pointer rounded-xl overflow-hidden shadow-lg relative 
          border-4 ${selectedTheme === theme.src ? 'border-yellow-400' : 'border-transparent'}
          transition-all`}
      >
        <img src={theme.src} alt={theme.label}
          className={` ${fullScreen ? "block" : "hidden"} md:block object-cover w-full h-12 md:h-18 xl:h-24`} />
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-40 text-center text-sm text-white py-1">
          {theme.label}
        </div>
      </motion.div>
    ))}
    </div>
  </div>
)}

{activeFeature === 3 && (
  <div className={` ${fullScreen ? " h-[10%] gap-2 " : " "} flex flex-col justify-center items-center text-center w-full   `}>
    <h2 className={` font-bold ${fullScreen ? " text-base" : "text-2xl mb-4"}`}>🥁 Random Jam / Auto-Drummer</h2>
    <p className={`text-gray-400 text-center ${fullScreen ? " text-xs" : " mb-6"} `}>
      Watch your drumset come alive! The app plays a random beat while you sit back and enjoy.
    </p>

    {/* Buttons row */}
    <div className={`flex space-x-4   ${fullScreen ? " text-base" : " mt-6"} `}>
  <motion.button
    layout
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={startJamming}
    disabled={isJamming}
    className={`bg-yellow-400 text-gray-900  ${fullScreen ? " text-sm px-4 py-2" : "px-6 py-3"}   rounded-full font-semibold shadow-md transition-all duration-300 ease-in-out
      ${isJamming ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-300'}`}
  >
    {isJamming ? 'Jamming...' : '▶️ Start Jam'}
  </motion.button>
  <AnimatePresence>
    {isJamming && (
      <motion.button
      onClick={stopJamming}
        key="stopJam"
        layout
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`bg-red-500 ${fullScreen ? " text-sm px-4 py-2" : "px-5 py-2"} text-white  rounded-full font-medium shadow transition hover:bg-red-400`}
      >
        ✖ Stop Jam
      </motion.button>
    )}
  </AnimatePresence>
</div>


    {/* Live pulse while jamming */}
    {isJamming && (
      <motion.div
        className="w-8 h-8 bg-yellow-400 rounded-full mt-6"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
    )}
  </div>
)}


          </motion.div>
        )}
    <main className={`flex flex-col items-center justify-end ${
    fullScreen
      ? activeFeature
        ? "h-[70%]"
        : "h-[80%]"
      : "h-[300px]"
  }   w-full  md:w-[600px]  lg:w-[800px] xl:w-[1000px] 2xl:w-[1200px] md:h-[400px] lg:h-[500px] relative`}>
    {!fullScreen && <div className="absolute top-2">
   <div className="flex flex-wrap justify-center gap-3 mb-4">
  {Object.entries(keyBindings).map(([key, id]) => (
    <div
      key={id}
      id={id}
       onClick={() => triggerKeyAction(id, key)}
      className={`
        flex items-center justify-center
        text-white font-semibold 
        bg-black
        px-2 py-1 lg:px-4 lg:py-2
        rounded-lg
        text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl
        cursor-pointer select-none
        transition-all duration-150 ease-out
        bg-gradient-to-br from-white/20 via-white/30 to-white/10
        backdrop-blur-md border border-white/20
        shadow-[0_4px_8px_rgba(255,255,255,0.2),_inset_0_2px_4px_rgba(255,255,255,0.15)]
        ${pressedKey === key ? "scale-110 shadow-[0_0_15px_rgba(255,255,255,0.8)]" : ""}
        hover:translate-y-[-3px] hover:scale-105
        active:translate-y-[1px] active:scale-95
      `}
    >
      {key.replace("Key", "")}
    </div>
  ))}
</div>
</div>} 
  {/* Overlays */}
    {/* Overlays — each has positions for default + sm + md + lg + xl + 2xl */}
 
      <motion.img src="/hi-hat-left-middle.png" className={`absolute z-50 select-none
        ${
  fullScreen && activeFeature
    ? selectedTheme === themes[2].src
      ? "-top-6 max-[380px]:top-[-12] left-[16%] max-[350px]:left-9 max-[370px]:left-26 max-[380px]:left-12 max-[400px]:left-32 w-[120px]"
      : "-top-2 max-[380px]:top-[-12] left-40 max-[350px]:w-[100px] max-[350px]:left-[22%] max-[370px]:left-26 max-[380px]:left-14 max-[400px]:left-35 max-[420px]:left-40 w-[120px]"
    : fullScreen
      ? selectedTheme === themes[2].src
        ? "-top-6 max-[380px]:top-[-12] left-[12%] max-[350px]:left-[16.5%] max-[370px]:left-26 max-[380px]:left-[2%] max-[400px]:left-[11%] w-[120px]"
        : "-top-2 left-32 max-[350px]:w-[100px] max-[350px]:left-[19%] max-[370px]:left-22 max-[380px]:left-9 max-[400px]:left-30 w-[100px]"
      : "top-18 max-[400px]:left-[8.4%] left-10 w-[50px] h-[40px] max-[380px]:left-[8%]"
} $[@media(min-width:500px)_and_(max-width:600px)]:top-12 md:top-16  md:left-2 [@media(min-width:500px)_and_(max-width:600px)]:left-12 lg:left-8 xl  xl:left-34 ${selectedTheme === themes[2].src ? "2xl:left-45" : "2xl:left-48"}  [@media(min-width:500px)_and_(max-width:600px)]:w-[70px] md:w-[90px] md:h-[70px] 2xl:w-[160px] 2xl:h-[60px]`} animate={crashAnimating ? crashAnimation : { rotateX: 0 }}  onClick={() => handleHiHatTap(setIsCrashAnimating, 'hithatOne', 200)}/>
      <motion.img src="/hi-hat-left-top.png" className={`absolute select-none  ${fullScreen && activeFeature
      ? "-top-2 left-59 max-[350px]:w-[90px] max-[350px]:left-[30%] w-[100px] max-[370px]:left-44 max-[380px]:left-34 max-[400px]:left-53" // custom combo
      : fullScreen
        ? "-top-2 left-54 w-[100px]  max-[350px]:w-[90px] max-[350px]:left-[28%] max-[370px]:left-40 max-[380px]:left-30 max-[400px]:left-50"
        : "top-18 left-20 w-[50px] h-[40px]   max-[400px]:left-18"
    }  [@media(min-width:500px)_and_(max-width:600px)]:top-12 md:top-16   md:left-23 [@media(min-width:500px)_and_(max-width:600px)]:left-28 lg:left-36   xl:left-60 ${selectedTheme === themes[2].src ? "2xl:left-72" : "2xl:left-74"}   [@media(min-width:500px)_and_(max-width:600px)]:w-[70px] md:w-[90px] md:h-[70px] 2xl:w-[160px] 2xl:h-[60px]`} animate={isLeftDiscAnimating ? hitAnimation : { rotate: 0, scale: 1 }} onTap={() => handleHiHatTap(setIsLeftDiscAnimating, 'hithatTwo', 200)} />
      <motion.img
  src="/hi-hat-right-image.png"
  className={`absolute select-none
    ${fullScreen && activeFeature
      ? "top-4 right-44 w-[120px] max-[350px]:w-[100px] max-[350px]:right-[25%] max-[370px]:right-32 max-[380px]:right-18 max-[400px]:right-38 max-[400px]:top-4" // custom combo
      : fullScreen
        ? "top-2 right-38 max-[350px]:right-[20%] w-[120px] max-[370px]:right-24 max-[380px]:right-12 max-[400px]:right-32 max-[400px]:top-2"
        : "top-20 right-14 max-[400px]:right-12 max-[400px]:top-22 w-[50px] h-[40px]"
    }
    md:top-18 lg:top-20 xl:top-24
    md:right-8 lg:right-14 [@media(min-width:500px)_and_(max-width:600px)]:top-12 xl:right-38
    ${selectedTheme === themes[2].src ? "2xl:right-56" : "2xl:right-58"} w-[50px] h-[40px]
    [@media(min-width:500px)_and_(max-width:600px)]:w-[70px] md:w-[90px] md:h-[70px]
    lg:w-[110px] lg:h-[90px] 2xl:w-[160px] 2xl:h-[60px]`}
  animate={isRightDiscAnimating ? hitAnimation : { rotate: 0, scale: 1 }}
  onTap={() => handleHiHatTap(setIsRightDiscAnimating, 'hithatThree', 200)}
/>
   <img src={selectedTheme}alt="Description" className={`object-contain select-none ${fullScreen ? "w-full h-full " : "w-5/6 h-[80%] "}    md:w-full `} />
   {/*overlay div */}
 <motion.div
  className={`absolute 
     ${ fullScreen && activeFeature ? " max-[350px]:w-[86px] max-[380px]:w-[100px] w-[105px] h-[30px]  max-[350px]:left-[29%] max-[370px]:left-[24%] max-[380px]:left-[19%] top-[20%] left-[26%]" : fullScreen ? " max-[350px]:w-[96px] max-[380px]:w-[105px] w-[120px] h-[30px] max-[350px]:left-[26%] max-[370px]:left-[20%] max-[380px]:left-[16%] top-[20%] left-[22%]" : " max-[400px]:w-[60px] max-[400px]:h-[15px] max-[400px]:top-[42%] max-[400px]:left-[17%] w-[70px] h-[20px] top-[40%] left-[17%]  "}
    md:w-[116px] md:h-[25px] md:top-[36%] md:left-[11%] 
    lg:left-[13%] 2xl:left-[24%] lg:top-[34%] 2xl:top-[35%] 
    z-999 lg:w-[126px] lg:h-[50px] xl:w-[122px] xl:h-[50px] 
    2xl:w-[150px] 2xl:h-[60px] rounded-full flex items-center justify-center `}
  onClick={() => playDrums("overlay1")}
>
  {/* Small centered circle */}
     {activeOverlay === "overlay1" && (
    <div
      className="w-12 h-2 rounded-lg bg-black opacity-80 blur-lg shadow-[0_0_50px_rgba(0,0,0,0.9)]"
    />
  )}
</motion.div>

<motion.div
  className={`absolute  
    ${fullScreen && activeFeature ? " max-[350px]:w-[80px] max-[350px]:h-[20px] max-[350px]:top-1 max-[350px]:left-[39%] max-[370px]:left-[37%] max-[370px]:w-[78px] max-[380px]:w-[88px] max-[380px]:h-[20px] max-[380px]:top-1 max-[380px]:left-[35%] max-[400px]:w-[80px] max-[400px]:h-[20px] max-[400px]:top-1  max-[400px]:left-[38%] w-[92px] h-[25px]  top-1 left-[37.5%]" : fullScreen ? "max-[350px]:w-[100px] max-[350px]:h-[20px] max-[350px]:top-1 max-[350px]:left-[36%] max-[370px]:left-[35%] max-[380px]:w-[88px] max-[380px]:h-[20px] max-[380px]:top-1 max-[380px]:left-[33%] max-[400px]:w-[88px] max-[400px]:h-[20px] max-[400px]:top-1  max-[400px]:left-[36%] w-[98px] h-[25px]  top-1 left-[36%]" : "max-[400px]:w-[50px] max-[400px]:h-[15px] max-[400px]:top-[33%] max-[400px]:left-[32%] w-[64px] h-[20px] top-[30%] left-[32%]  "}
     
    [@media(min-width:500px)_and_(max-width:600px)]:top-[20%] 
    [@media(min-width:500px)_and_(max-width:600px)]:left-[33%] 
    [@media(min-width:500px)_and_(max-width:600px)]:w-[70px]  
    md:w-[100px] md:h-[25px] md:top-[22%] md:left-[30%] 
    lg:left-[30%] lg:top-[20%] lg:w-[130px] lg:h-[32px] 
    z-999 xl:w-[122px] xl:h-[30px] xl:left-[34%]  
    2xl:w-[124px] 2xl:h-[30px] 2xl:left-[37%] 2xl:top-[20%] 
    rounded-full flex items-center justify-center `}
  onClick={() => playDrums("overlay2")}
>
  {/* Small centered circle with soft black glow */}
    {activeOverlay === "overlay2" && (
    <div
      className="w-12 h-2 rounded-lg bg-black opacity-80 blur-lg shadow-[0_0_50px_rgba(0,0,0,0.9)]"
    />
  )}

</motion.div>
<motion.div
  className={`absolute w-[64px] h-[20px] 
        ${fullScreen && activeFeature ? "max-[350px]:w-[72px] max-[350px]:h-[20px] max-[350px]:top-1 max-[350px]:left-[50%] max-[370px]:left-[49%] max-[380px]:w-[88px] max-[380px]:h-[20px] max-[380px]:top-1 max-[380px]:left-[49%] max-[400px]:w-[88px] max-[400px]:h-[20px] max-[400px]:top-1  max-[400px]:left-[50%] w-[85px] h-[25px]  top-1 left-[50%]" : fullScreen ? "max-[350px]:w-[86px] max-[350px]:h-[20px] max-[350px]:top-1 max-[350px]:left-[49%] max-[370px]:left-[49%] max-[380px]:w-[88px] max-[380px]:h-[20px] max-[380px]:top-1 max-[380px]:left-[49%] max-[400px]:w-[88px] max-[400px]:h-[20px] max-[400px]:top-1  max-[400px]:left-[50%] w-[98px] h-[25px]  top-1 left-[50%]" : "max-[400px]:w-[50px] max-[400px]:h-[15px] max-[400px]:top-[33%] max-[400px]:left-[49%] top-[30%] left-[48%]  "}
    [@media(min-width:500px)_and_(max-width:600px)]:top-[20%] 
    [@media(min-width:500px)_and_(max-width:600px)]:left-[50%] 
    [@media(min-width:500px)_and_(max-width:600px)]:w-[70px]  
    md:w-[100px] md:h-[25px] md:top-[22%] md:left-[48%] 
    lg:left-[48%] lg:top-[20%] lg:w-[130px] lg:h-[32px]   
    z-999 xl:w-[122px] xl:h-[30px] xl:left-[50%]  
    2xl:w-[124px] 2xl:h-[30px] 2xl:left-[49%] 2xl:top-[20%] 
    rounded-full flex items-center justify-center `}
  onClick={() => playDrums("overlay3")}
>
  {activeOverlay === "overlay3" && (
    <div className="w-12 h-2 rounded-lg bg-black opacity-80 blur-lg shadow-[0_0_50px_rgba(0,0,0,0.9)]" />
  )}
</motion.div>
<motion.div
  className={`absolute 
      ${fullScreen && activeFeature ? "max-[350px]:w-[130px] max-[350px]:h-[130px]  max-[370px]:w-[140px] max-[370px]:h-[140px]  max-[350px]:top-[37%] max-[350px]:left-[41%] max-[370px]:left-[39%] max-[370px]:top-[37%]  max-[380px]:w-[150px] max-[380px]:h-[150px] max-[380px]:top-[39%] max-[380px]:left-[37%] max-[400px]:w-[155px] max-[400px]:h-[155px] max-[400px]:top-[36%]  max-[400px]:left-[39%] w-[162px] h-[162px]  top-[36%] left-[39%]" : fullScreen ? "max-[350px]:w-[150px] max-[350px]:h-[150px]   max-[370px]:w-[150px] max-[370px]:h-[150px]  max-[350px]:top-[36%] max-[350px]:left-[39.5%] max-[370px]:left-[37.5%] max-[370px]:top-[37%]  max-[380px]:w-[165px] max-[380px]:h-[165px] max-[380px]:top-[36%] max-[380px]:left-[35%] max-[400px]:w-[164px] max-[400px]:h-[164px] max-[400px]:top-[36%]  max-[400px]:left-[38%] w-[178px] h-[178px]  top-[36%] left-[38%]" : "top-[54%] left-[36%]  max-[400px]:w-[84px] max-[400px]:h-[84px] max-[400px]:top-[54%] max-[400px]:left-[36%] w-[94px] h-[94px]  "}  
    [@media(min-width:500px)_and_(max-width:600px)]:top-[50%] 
    [@media(min-width:500px)_and_(max-width:600px)]:left-[36%] 
    [@media(min-width:500px)_and_(max-width:600px)]:w-[122px]  
    [@media(min-width:500px)_and_(max-width:600px)]:h-[122px]  
    md:w-[170px] md:h-[170px] md:top-[48%] md:left-[32%] 
    lg:left-[34%] lg:top-[50%] lg:w-[210px] lg:h-[210px]   
    z-999 xl:w-[220px] xl:h-[220px] xl:top-[48%] xl:left-[37%]  
    2xl:w-[220px] 2xl:h-[220px] 2xl:left-[39%] 2xl:top-[48%] 
    rounded-full flex items-center justify-center `}
  onClick={() => playDrums("overlay4")}
>
  {activeOverlay === "overlay4" && (
    <div className="w-12 h-2 rounded-lg bg-black opacity-80 blur-lg shadow-[0_0_50px_rgba(0,0,0,0.9)]" />
  )}
</motion.div>

<motion.div
  className={`absolute 
     ${fullScreen && activeFeature ? "max-[350px]:w-[82px] max-[350px]:h-[20px] max-[350px]:top-[22%] max-[350px]:left-[59%] max-[370px]:top-[23%] max-[370px]:left-[61%] max-[370px]:h-[16px] max-[380px]:w-[92px] max-[380px]:h-[20px] max-[380px]:top-[21%] max-[380px]:left-[62%] max-[400px]:w-[94px] max-[400px]:h-[20px] max-[400px]:top-[22%]  max-[400px]:left-[60%] w-[105px] h-[25px]  top-[22%] left-[60%]" : fullScreen ? "max-[350px]:w-[92px] max-[350px]:h-[20px] max-[350px]:top-[22%] max-[350px]:left-[60%] max-[370px]:top-[23%] max-[370px]:left-[62%] max-[370px]:h-[16px] max-[380px]:w-[98px] max-[380px]:h-[20px] max-[380px]:top-[21%] max-[380px]:left-[65%] max-[400px]:w-[105px] max-[400px]:h-[20px] max-[400px]:top-[22%]  max-[400px]:left-[62%] w-[118px] h-[25px]  top-[22%] left-[62%]" : "max-[400px]:w-[70px] max-[400px]:h-[15px] max-[400px]:top-[44%] max-[400px]:left-[62%] w-[68px] h-[15px] top-[43%] left-[62%]"}
    
    [@media(min-width:500px)_and_(max-width:600px)]:top-[20%]
    [@media(min-width:500px)_and_(max-width:600px)]:left-[50%]
    [@media(min-width:500px)_and_(max-width:600px)]:w-[70px]
    md:w-[110px] md:h-[25px] md:top-[38%] md:left-[66%]
    lg:left-[66%] lg:top-[38%] lg:w-[134px] lg:h-[32px]
    xl:w-[144px] xl:h-[30px] xl:top-[37%] xl:left-[62%]
    2xl:w-[144px] 2xl:h-[30px] 2xl:left-[60%] 2xl:top-[38%]
    rounded-full z-999 flex items-center justify-center `}
  onClick={() => playDrums("overlay5")}
>
  {activeOverlay === "overlay5" && (
    <div className="w-12 h-2 rounded-lg bg-transparent blur-lg shadow-[0_0_70px_rgba(0,0,0,0.95)]" />
  )}
</motion.div>


    </main>
       {/* FullScreen Feature */}
       {!fullScreen && <div className=' sm:hidden h-[60px] w-[250px] bg-yellow-500 rounded-xl '>
  <button onClick={fullScreenDrums} className = 'w-full h-full'>
  <h1 className='text-sm text-white'>Fullscreen</h1>
  </button>
 </div>}
    </div>
    </div>
  );
}
