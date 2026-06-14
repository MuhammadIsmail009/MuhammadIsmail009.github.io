import { createContext, useContext } from 'react'

/** True once the preloader has finished (or immediately under reduced motion). */
export const MotionReadyContext = createContext(false)

export const useMotionReady = () => useContext(MotionReadyContext)
