/**
 * Central GSAP setup. Import { gsap, ... } from here everywhere so plugins are
 * registered exactly once and defaults stay consistent.
 */
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { SplitText } from 'gsap/SplitText'
import { Flip } from 'gsap/Flip'

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrambleTextPlugin, SplitText, Flip)

gsap.defaults({ ease: 'power3.out', duration: 0.9 })

// Custom expo ease used across reveals.
gsap.config({ nullTargetWarn: false })

export { gsap, useGSAP, ScrollTrigger, ScrambleTextPlugin, SplitText, Flip }

export const EASE = {
  expo: 'expo.out',
  power3: 'power3.out',
  power4: 'power4.out',
  // for clip/mask curtain reveals
  curtain: 'power4.inOut',
} as const
