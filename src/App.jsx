import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'
import Lenis from 'lenis'
import Name from './components/Name'
import Scrollable from './components/Scrollable'
import Footer from './components/Footer'
import Grain from './components/Grain'
import quotes from './components/quotesData'

let _audioCtx = null
let _lastClickTime = 0
let _clickCount = 0
function _initCtx() { if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)() }
function _buildAndPlay(velocity) {
  const ctx = _audioCtx, now = ctx.currentTime
  const freq = (_clickCount++ % 2 === 0 ? 2200 : 2600) + Math.random() * 300
  const dur = 0.012, buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 12)
  const src = ctx.createBufferSource(); src.buffer = buf
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = 3.5
  const body = ctx.createBiquadFilter(); body.type = 'peaking'; body.frequency.value = freq * 0.45; body.gain.value = 6; body.Q.value = 4
  const gain = ctx.createGain(); gain.gain.setValueAtTime(Math.min(0.18, 0.08 + Math.abs(velocity) * 0.006), now); gain.gain.exponentialRampToValueAtTime(0.0001, now + dur)
  src.connect(bp); bp.connect(body); body.connect(gain); gain.connect(ctx.destination)
  src.start(now); src.stop(now + dur + 0.002)
}
function _tryPlay(v) { if (!_audioCtx) return; if (_audioCtx.state === 'running') _buildAndPlay(v); else _audioCtx.resume().then(() => { if (_audioCtx.state === 'running') _buildAndPlay(v) }).catch(() => {}) }
function initMechanicalClicks(lenis) {
  _initCtx()
  const unlock = () => { if (_audioCtx && _audioCtx.state !== 'running') _audioCtx.resume().catch(() => {}) }
  const evts = ['click','pointerdown','touchstart','keydown']
  evts.forEach(e => document.addEventListener(e, unlock, { passive: true }))
  document.addEventListener('click', () => _tryPlay(1.6))
  lenis.on('scroll', ({ velocity }) => {
    const speed = Math.abs(velocity); if (speed < 0.3) return
    const now = Date.now(); if (now - _lastClickTime < Math.max(45, 180 - speed * 22)) return
    _lastClickTime = now; _tryPlay(velocity)
  })
  return () => evts.forEach(e => document.removeEventListener(e, unlock))
}

gsap.registerPlugin(ScrollTrigger, CustomEase)

// ── Liquid motion language ─────────────────────────────────────────────
// Every animation on this site shares one set of curves so the whole page
// feels like a single fluid system. Each curve is tuned to a specific
// quality of liquid motion:
//   liquid     — viscous flow (slow surface tension at start, smooth glide,
//                gentle settle). The default ease for everything.
//   liquidFlow — symmetric inOut, like fluid pouring through a narrow neck.
//                Use for things that flow continuously in both directions.
//   liquidPour — heavy decel, like water arriving at a basin and slowing
//                as it fills. Use for "settles into place" motion.
//   liquidDrip — slight overshoot, like a droplet hitting and rebounding.
//                Use for elements that should feel alive when they land.
CustomEase.create('liquid',     'M0,0 C0.22,0.04 0.16,1 1,1')
CustomEase.create('liquidFlow', 'M0,0 C0.65,0.02 0.05,0.98 1,1')
CustomEase.create('liquidPour', 'M0,0 C0.16,0.86 0.18,1 1,1')
CustomEase.create('liquidDrip', 'M0,0 C0.34,1.18 0.22,0.97 1,1')

// Default ease for every gsap.to/from on the page — one motion language.
gsap.defaults({ ease: 'liquid', duration: 1.2 })

// No video on phone. Touch-here screen → JC animation → content reveal.
const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768

function App() {
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [soundOn, setSoundOn] = useState(IS_MOBILE ? false : true)
  const soundOnRef = useRef(IS_MOBILE ? false : true)
  const ambientAudioRef = useRef(null)
  const ambientVideoRef = useRef(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [closing, setClosing] = useState(false)
  const startedRef = useRef(false)
  const startSequenceRef = useRef(null)
  // Tracks whether the user hit Skip vs Start — needed when the click
  // arrives before the timeline-building effect has resolved.
  const skipRequestedRef = useRef(false)
  const [focusActive, setFocusActive] = useState(false)
  const focusActiveRef = useRef(false)
  const focusOnExitRef = useRef(null)
  const introTimeoutRef = useRef(null)
  const introVideoStartRef = useRef(null)
  const cinematicRef = useRef(false)
  const focusEnteringRef = useRef(false)
  const focusUnmountTimerRef = useRef(null)

  const enterFocusMode = (onExit, opts = {}) => {
    if (IS_MOBILE) {
      // Phone: no video. Skip the focus-mode cinematic and run the
      // animation timeline immediately via onExit.
      if (onExit) onExit()
      return
    }
    if (focusActiveRef.current) return
    focusActiveRef.current = true
    focusOnExitRef.current = onExit || null
    setFocusActive(true)
    document.body.classList.add('focusMode')

    const isCinematic = !!opts.intro
    cinematicRef.current = isCinematic
    if (isCinematic) {
      document.body.classList.add('focusIntro')
    }

    // Pause music while focused video plays
    const audio = ambientAudioRef.current
    if (audio) audio.pause()

    const video = ambientVideoRef.current
    if (!video) return

    // Video plays its full duration. No early fade. Hard cut on `ended`.
    let exitTriggered = false
    const cleanup = () => {
      video.removeEventListener('ended', onEnded)
    }
    const onEnded = () => {
      if (exitTriggered) return
      exitTriggered = true
      cleanup()
      exitFocusMode()
    }

    const playVideoNow = () => {
      video.muted = false
      video.loop = false
      try { video.currentTime = 0 } catch (e) {}
      video.volume = 1.0
      video.play().catch(() => {})
      video.addEventListener('ended', onEnded)
    }

    if (isCinematic) {
      // Cinematic timing — butter smooth:
      //   t=0–1s caption alone (silent, no video at all)
      //   t=1.0s video.play() → audio begins (visual still hidden)
      //   t=4.6s body.focusIntro removed → visual reveals at video's t=3.6s
      //          Caption fade-out completes at the same moment.
      if (introTimeoutRef.current) clearTimeout(introTimeoutRef.current)
      if (introVideoStartRef.current) clearTimeout(introVideoStartRef.current)
      introVideoStartRef.current = setTimeout(() => {
        playVideoNow()
        introVideoStartRef.current = null
      }, 1000)
      introTimeoutRef.current = setTimeout(() => {
        document.body.classList.remove('focusIntro')
        introTimeoutRef.current = null
      }, 4600)
    } else {
      // JC / Creative click — play immediately, no captions
      playVideoNow()
    }
  }

  const exitFocusMode = () => {
    if (!focusActiveRef.current) return
    focusActiveRef.current = false
    // NOTE: setFocusActive(false) is deferred until after the silence beat
    // and backdrop fade-out — keeps the backdrop in the DOM throughout.
    const wasCinematic = cinematicRef.current
    const isQuick = document.body.classList.contains('focusQuick')
    cinematicRef.current = false
    document.body.classList.remove('focusIntro')
    document.body.classList.remove('focusEntering')
    document.body.classList.remove('showCreativeFill')
    if (introTimeoutRef.current) {
      clearTimeout(introTimeoutRef.current)
      introTimeoutRef.current = null
    }
    if (introVideoStartRef.current) {
      clearTimeout(introVideoStartRef.current)
      introVideoStartRef.current = null
    }

    // HARD CUT: video pauses + reset. focusEnding triggers black backdrop.
    const video = ambientVideoRef.current
    if (video) {
      gsap.killTweensOf(video)
      video.pause()
      video.muted = true
      video.loop = true
      try { video.currentTime = 0 } catch (e) {}
    }
    document.body.classList.add('focusEnding')

    // Audio resumes silently — toggle stays on, scroll governs volume
    const audio = ambientAudioRef.current
    if (audio && soundOnRef.current && document.body.classList.contains('started')) {
      if (wasCinematic) audio.volume = 0
      audio.play().catch(() => {})
    }

    if (focusUnmountTimerRef.current) clearTimeout(focusUnmountTimerRef.current)

    // Silence beat — long for cinematic, snappy for JC quick exit
    const silenceMs = isQuick ? 200 : 1600
    const unmountMs = isQuick ? 250 : 1100

    setTimeout(() => {
      document.body.classList.remove('focusMode')
      document.body.classList.remove('focusEnding')
      document.body.classList.remove('focusQuick')
      if (focusOnExitRef.current) {
        const cb = focusOnExitRef.current
        focusOnExitRef.current = null
        cb()
      }
      focusUnmountTimerRef.current = setTimeout(() => {
        setFocusActive(false)
        focusUnmountTimerRef.current = null
      }, unmountMs)
    }, silenceMs)
  }

  // JC click → fast open/close, no press-and-hold. focusQuick class
  // overrides transitions to ~0.2s for snappy in/out.
  const triggerFocusFromClick = () => {
    if (IS_MOBILE) return // no video on phone — JC click does nothing
    if (!startedRef.current || focusActiveRef.current) return
    document.body.classList.add('focusQuick')
    document.body.classList.add('showCreativeFill')
    enterFocusMode()
  }
  const handleNameClick = triggerFocusFromClick

  const handleStart = () => {
    if (startedRef.current) return
    startedRef.current = true
    setClosing(true)
    // Cinematic intro: 3-second subtitle hold, then video reveal.
    // Intro animation + music start AFTER video ends (or user skips).
    enterFocusMode(() => {
      // Music is paused while focus is active; startSequenceRef will
      // re-enable it. Scroll-based lerp will pick the right volume from there.
      if (startSequenceRef.current) {
        startSequenceRef.current()
      }
    }, { intro: true })
    setTimeout(() => setHasStarted(true), 600)
  }

  // Skip the cinematic — no video, no captions. The master timeline
  // still plays so the user sees the Jatin Chhanwal name animation
  // (loader fades in, expands, parks at the corner, content reveals).
  // Only the focus-mode video sequence is bypassed.
  const handleSkip = (e) => {
    if (e) e.stopPropagation() // don't also trigger the parent's handleStart
    if (startedRef.current) return
    startedRef.current = true
    skipRequestedRef.current = true
    setClosing(true)
    // Kick off the master timeline directly — same path enterFocusMode
    // takes after the video ends, just without the video step.
    if (startSequenceRef.current) startSequenceRef.current()
    setTimeout(() => setHasStarted(true), 600)
  }

  const shuffleQuote = () => {
    setQuoteIndex(i => {
      if (quotes.length <= 1) return i
      let next
      do { next = Math.floor(Math.random() * quotes.length) } while (next === i)
      return next
    })
  }

  const handleSoundToggle = () => {
    const next = !soundOnRef.current
    soundOnRef.current = next
    setSoundOn(next)
    const audio = ambientAudioRef.current
    if (!audio) return
    if (next) audio.play().catch(() => {})
    else audio.pause()
    // Video plays continuously regardless of mute — only the dim filter responds (via body.musicPaused)
  }

  // Sync body.musicPaused with soundOn for photo dimming
  useEffect(() => {
    if (soundOn) {
      document.body.classList.remove('musicPaused')
    } else {
      document.body.classList.add('musicPaused')
    }
  }, [soundOn])

  // Pause the ambient video on mount — it should only play during focus mode now.
  useEffect(() => {
    const video = ambientVideoRef.current
    if (!video) return
    video.pause()
    video.muted = true
  }, [])

  // Create the ambient audio element immediately on mount (not waiting for fonts).
  // Critical for iOS Safari: the audio element must exist when the user taps
  // the start screen so we can call .play() synchronously inside the click.
  useEffect(() => {
    if (IS_MOBILE) return // no music on phone
    const audio = new Audio(encodeURI('/04 Wick Man (Instrumental).mp3'))
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = 0
    audio.setAttribute('playsinline', '')
    audio.setAttribute('webkit-playsinline', '')
    ambientAudioRef.current = audio

    const onPlay = () => setSoundOn(true)
    const onPauseEv = () => setSoundOn(false)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPauseEv)

    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPauseEv)
      audio.pause()
      audio.src = ''
      ambientAudioRef.current = null
    }
  }, [])

  // Hovering / touching the toggle reveals the creative-word stencil only
  const handleToggleEnter = () => document.body.classList.add('showCreativeFill')
  const handleToggleLeave = () => document.body.classList.remove('showCreativeFill')

  useEffect(() => {
    const fontsReady =
      document.fonts && document.fonts.ready
        ? document.fonts.ready
        : Promise.resolve()

    fontsReady.then(() => {
      // ── Smooth scroll (Lenis + GSAP ticker) ───────────────────────
      // Liquid scroll: longer settling time + viscous quartic ease.
      // 1 - (1-t)^4.5 decays more gently than the default exponential —
      // the page keeps drifting briefly after the wheel stops, like
      // surface tension carrying water past where you stopped pouring.
      const lenis = new Lenis({
        duration: 2.6,
        easing: (t) => 1 - Math.pow(1 - t, 4.5),
        smoothWheel: true,
        syncTouch: true,
        touchInertiaMultiplier: 28,
        wheelMultiplier: 1.0,
      })

      lenis.on('scroll', ScrollTrigger.update)
      const rafFn = (time) => lenis.raf(time * 1000)
      gsap.ticker.add(rafFn)
      gsap.ticker.lagSmoothing(0)
      lenis.stop()

      const cleanupClicks = initMechanicalClicks(lenis)

      // ── Ambient music ───────────────────────────────────────────────
      // Subtle. Music fades in gently as the user reaches the page-bottom,
      // and fades back out as they scroll back up.
      //   • Silent above the fade range
      //   • Within last ~70% viewport-height of scroll: smooth ramp up
      //   • At bottom: holds at a quiet ceiling
      const BASE_VOL = 0.10         // ceiling — kept very subtle; mechanical clicks remain prominent
      const FADE_RANGE_MULT = 0.7   // viewport-fraction over which the ramp happens

      let targetVol = 0
      let currentVol = 0

      const computeTargetVol = () => {
        if (!lenis) return 0
        const limit = lenis.limit || 0
        if (limit <= 0) return 0
        const distFromBottom = Math.max(0, limit - lenis.scroll)
        const fadeRange = window.innerHeight * FADE_RANGE_MULT
        if (distFromBottom <= 0) return BASE_VOL
        if (distFromBottom >= fadeRange) return 0
        const t = 1 - (distFromBottom / fadeRange)
        return t * t * (3 - 2 * t) * BASE_VOL
      }

      // Volume lerp loop — slow ramp for subtle, restrained feel
      let audioRafId = null
      const tickAudio = () => {
        targetVol = computeTargetVol()
        const audio = ambientAudioRef.current
        if (audio) {
          const effectiveTarget = soundOnRef.current ? targetVol : 0
          currentVol += (effectiveTarget - currentVol) * 0.04
          if (currentVol < 0.0008) currentVol = 0
          audio.volume = Math.max(0, Math.min(1, currentVol))
        }
        audioRafId = requestAnimationFrame(tickAudio)
      }
      audioRafId = requestAnimationFrame(tickAudio)

      // The intro timeline is kicked off by the click on #startScreen.
      // body.started is added here so CSS animations are strictly coupled
      // to the GSAP timeline starting — no race window.
      // Audio.play() is handled separately in handleStart (synchronous user gesture).
      let started = false
      startSequenceRef.current = () => {
        if (started) return
        started = true
        document.body.classList.add('started')
        document.body.classList.add('intro') // removed once JC parks at corner
        tl.play()
        // Music does NOT auto-start after the cinematic intro.
        // It only plays when soundOnRef is true AND user is overscrolling at bottom.
        const audio = ambientAudioRef.current
        if (audio && soundOnRef.current) {
          currentVol = 0
          audio.volume = 0
          audio.play().catch(() => {})
        }
      }
      // Bootstrap moved to after timeline construction — see end of effect.

      // ── Nav name rolling — direction-aware continuous slot machine ──
      let rollActive = false
      let rollDir = 0
      const rollTls = []
      const settleTls = [] // tracked separately so startRoll can kill them

      function killSettles() {
        settleTls.forEach(t => t.kill())
        settleTls.length = 0
      }

      function startRoll(rolls, dir) {
        killSettles()           // kill any in-progress settle before rolling again
        rollTls.forEach(t => t.kill())
        rollTls.length = 0
        rolls.forEach((roll, i) => {
          gsap.set(roll, { y: '-1em' })
          const t = gsap.to(roll, {
            y: dir > 0 ? '-2em' : '0em',
            duration: 0.3,
            ease: 'none',
            repeat: -1,
          })
          // seek() is more reliable than progress() on repeat:-1 tweens.
          // Phase-offset each letter so they cascade without a start delay
          // — all letters are live immediately, no race with short flicks.
          t.seek(i * 0.018)
          rollTls.push(t)
        })
      }

      lenis.on('scroll', ({ velocity }) => {
        const rolls = document.querySelectorAll('.navLetterRoll')
        if (!rolls.length) return

        const speed = Math.abs(velocity)
        const dir   = velocity >= 0 ? 1 : -1

        if (speed > 0.2) {
          if (!rollActive || rollDir !== dir) {
            rollActive = true
            rollDir    = dir
            startRoll(Array.from(rolls), dir)
          }
          // Faster scroll = faster roll, capped so it stays legible
          const scale = gsap.utils.clamp(0.5, 4, speed)
          rollTls.forEach(t => t.timeScale(scale))
        } else if (rollActive) {
          rollActive = false
          rollDir    = 0
          rollTls.forEach(t => t.kill())
          rollTls.length = 0
          // Settle: each letter falls into its rest position with a tiny
          // overshoot — like a droplet hitting the surface and rebounding.
          // liquidDrip's curve has an ~18% overshoot then gentle return.
          rolls.forEach((roll, i) => {
            const st = gsap.to(roll, {
              y: '-1em',
              duration: 0.95,
              ease: 'liquidDrip',
              delay: i * 0.024,
              overwrite: 'auto',
            })
            settleTls.push(st)
          })
        }
      })

      // Hover handlers live in Name.jsx via React onMouseEnter/onMouseLeave

      // ── Loader element refs ───────────────────────────────────────
      const loader = document.getElementById('loader')
      const letterN = document.getElementById('letterJ')
      const letterC = document.getElementById('letterC')
      const fillAnak = document.getElementById('fillAtin')
      const fillHahal = document.getElementById('fillHhanwal')

      // ── Responsive sizing ─────────────────────────────────────────
      const w = window.innerWidth
      const isMobile = w < 768
      // Phone: cap so JatinChhanwal renders with natural spacing inside viewport.
      const initialLoaderSize = isMobile
        ? Math.min(w * 0.082, 40)
        : Math.min(w * 0.11, 200)
      const finalLoaderSize = isMobile ? 18 : 24
      const finalLoaderPos = isMobile ? 12 : 20

      // Force explicit font-size so the global `*` rule can't break measurements.
      const loaderEls = [loader, letterN, fillAnak, letterC, fillHahal]
      loaderEls.forEach((el) => { el.style.fontSize = initialLoaderSize + 'px' })

      // ── Measure natural fill widths ───────────────────────────────
      fillAnak.style.width = 'auto'
      fillHahal.style.width = 'auto'
      const fillAnakWidth = fillAnak.offsetWidth
      const fillHahalWidth = fillHahal.offsetWidth
      fillAnak.style.width = '0px'
      fillHahal.style.width = '0px'
      const letterNWidth  = letterN.offsetWidth
      const letterCWidth  = letterC.offsetWidth

      // ── Loader animation values (px-based) ────────────────────────
      // Both: start as JC initials at center → expand to full name → shrink to corner.
      const targetFillAnak   = fillAnakWidth
      const targetFillHahal  = fillHahalWidth

      // Center the WHOLE visible text (not just C) at each phase
      const fullNameWidth   = letterNWidth + fillAnakWidth + letterCWidth + fillHahalWidth
      const initialsWidth   = letterNWidth + letterCWidth

      // Phone reverses direction: starts as full JatinChhanwal centered, contracts
      // to JC and slides to corner. Desktop keeps JC → expand → shrink to corner.
      const initialLoaderLeft = isMobile
        ? w * 0.5 - fullNameWidth / 2  // mobile: full name centered at start
        : w * 0.5 - initialsWidth / 2  // desktop: JC centered at start
      const phase2EndLeft     = isMobile
        ? w * 0.5 - fullNameWidth / 2  // mobile: stays put through expand step
        : w * 0.5 - fullNameWidth / 2  // desktop: expands to full name centered

      // Fill widths at start vs final
      const initialFillAnak  = isMobile ? fillAnakWidth  : 0
      const initialFillHahal = isMobile ? fillHahalWidth : 0
      const fillAnakAtFinal  = isMobile ? 0 : (fillAnakWidth  / initialLoaderSize) * finalLoaderSize
      const fillHahalAtFinal = isMobile ? 0 : (fillHahalWidth / initialLoaderSize) * finalLoaderSize

      // ── Initial states ────────────────────────────────────────────
      // All positioning via transform (x/y) — never top/left during animation.
      // transform-origin: left top (set in CSS) so scale anchors to the corner.
      const h = window.innerHeight
      gsap.set(loader, {
        x: initialLoaderLeft,
        y: h / 2,
        yPercent: -50,
        opacity: 0,
      })
      gsap.set(fillAnak,  { width: initialFillAnak  + 'px' })
      gsap.set(fillHahal, { width: initialFillHahal + 'px' })

      gsap.set('#content',     { opacity: 0 })
      gsap.set('#details p',   { opacity: 0, y: 50 })
      gsap.set('.projectPara', { opacity: 0, y: 50 })
      gsap.set('#connectDiv p',{ opacity: 0, y: 50 })
      gsap.set('#footerYear',  { opacity: 0, y: 120 })
      gsap.set('#footerLine',  { scaleX: 0 })
      gsap.set('.footerBackTop',{ opacity: 0, y: 20 })
      gsap.set('#footerMark',  { opacity: 0, y: 10 })

      // ── Back-to-top click handler ─────────────────────────────────
      // Long viscous scroll back to top — like draining water upward.
      const backToTopBtn = document.querySelector('.footerBackTop')
      if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
          lenis.scrollTo(0, {
            duration: 2.6,
            easing: (t) => 1 - Math.pow(1 - t, 4.5),
          })
        })
      }

      // ── Rebuild loader as per-letter rolling spans after intro ────
      function rebuildNavName() {
        const el = document.getElementById('loader')
        if (!el) return
        const text = isMobile ? 'JC' : 'JatinChhanwal'
        // Switch from scale-based sizing back to actual font-size.
        // Both render identically — no visual flash.
        el.style.fontSize = finalLoaderSize + 'px'
        gsap.set(el, { scale: 1, x: finalLoaderPos, y: finalLoaderPos, yPercent: 0 })
        el.innerHTML = Array.from(text).map(char =>
          `<span class="navLetterWrap"><span class="navLetterRoll"><span>${char}</span><span>${char}</span><span>${char}</span></span></span>`
        ).join('')
        gsap.set('.navLetterRoll', { y: '-1em' })
      }

      // ── Master timeline (paused — runs after start screen click) ──
      const tl = gsap.timeline({ paused: true })

      // 1. Loader dissolves in — liquid surface rising into view
      tl.to(loader, {
        opacity: 1,
        duration: isMobile ? 0.7 : 2.4,
        ease: 'liquid',
        delay: isMobile ? 0.05 : 0.4,
      })

      const scaleRatio = finalLoaderSize / initialLoaderSize

      if (isMobile) {
        // Compressed for snappy phone load — total ~3.6s before content shows.
        // 2a. Hold the full name in place
        tl.to(loader, { duration: 0.6, ease: 'none' })

        // 2b. Contract fills to 0 — JatinChhanwal collapses to JC, still centered.
        // liquidFlow: a symmetric inOut, like fluid retreating through a neck.
        tl.to(
          [fillAnak, fillHahal],
          { width: 0, duration: 0.9, ease: 'liquidFlow' }
        )
        // x instead of left — transform, no layout recalc
        tl.to(
          loader,
          { x: w * 0.5 - initialsWidth / 2, duration: 0.9, ease: 'liquidFlow' },
          '<'
        )

        // 2c. Move to nav corner + scale down. liquidPour eases hard at the end —
        // like water arriving at a basin and slowing as it fills the corner.
        tl.to(
          loader,
          {
            x: finalLoaderPos,
            y: finalLoaderPos,
            yPercent: 0,
            scale: scaleRatio,
            duration: 0.9,
            ease: 'liquidPour',
            delay: 0.15,
          }
        )
      } else {
        // Desktop: JC expands to full name centered, then shrinks to corner.
        // Both phases use liquidFlow — fluid pouring out, then fluid receding.
        tl.to(
          [fillAnak, fillHahal],
          {
            width: (i) => [targetFillAnak, targetFillHahal][i] + 'px',
            duration: 3.0,
            ease: 'liquidFlow',
            delay: 1.4,
          }
        )
        // x instead of left
        tl.to(
          loader,
          { x: phase2EndLeft, duration: 3.0, ease: 'liquidFlow' },
          '<'
        )

        // Shrink to corner: scale replaces fontSize animation, x/y replace top/left.
        // liquidPour for the heavy decel — the name "settles" into the corner
        // like fluid finding its lowest point.
        tl.to(
          loader,
          {
            x: finalLoaderPos,
            y: finalLoaderPos,
            yPercent: 0,
            scale: scaleRatio,
            duration: 3.4,
            ease: 'liquidPour',
            delay: 2.0,
          }
        )
      }

      tl.call(() => {
        rebuildNavName()
        document.body.classList.remove('intro')
      }, null, '>')

      // 4. Page breathes open. Phone: sequential — content only after JC settles.
      // liquid ease: viscous fade, like ink blooming across paper.
      tl.to(
        '#content',
        {
          opacity: 1,
          duration: 2.6,
          ease: 'liquid',
          onStart: () => lenis.start(),
        },
        isMobile ? '+=0.2' : '-=2.0'
      )

      // 5. Stagger reveal — each element rises through fluid, slightly out of phase
      tl.to('#details p',    { opacity: 1, y: 0, duration: 2.4, stagger: 0.34, ease: 'liquid' }, '-=1.8')
      tl.to('.projectPara',  { opacity: 1, y: 0, duration: 2.4, stagger: 0.14, ease: 'liquid' }, '-=2.0')
      tl.to('#connectDiv p', { opacity: 1, y: 0, duration: 2.4, stagger: 0.26, ease: 'liquid' }, '-=1.8')

      // ── Footer scroll-triggered animations ────────────────────────
      // liquidPour: heavy decel — each element "fills" its slot like
      // water finding the bottom of a basin.
      gsap.to('#footerLine', {
        scaleX: 1,
        duration: 2.2,
        ease: 'liquidFlow',
        scrollTrigger: { trigger: '#footerDiv', start: 'top 75%' },
      })

      gsap.to('.footerBackTop', {
        opacity: 1,
        y: 0,
        duration: 1.4,
        ease: 'liquidPour',
        scrollTrigger: { trigger: '#footerDiv', start: 'top 80%' },
      })

      gsap.to('#footerMark', {
        opacity: 0.65,
        y: 0,
        duration: 1.2,
        ease: 'liquidPour',
        scrollTrigger: { trigger: '#footerDiv', start: 'top 80%' },
      })

      if (isMobile) {
        tl.to(
          '#footerYear',
          { opacity: 1, y: 0, duration: 1.8, ease: 'liquidPour' },
          '-=0.4'
        )
      } else {
        gsap.to('#footerYear', {
          opacity: 1,
          y: 0,
          duration: 2.0,
          ease: 'liquidPour',
          scrollTrigger: { trigger: '#footerDiv', start: 'top center' },
        })
      }

      // ── Scroll-cycle: pinned slot, items shift up one-by-one ─────
      // The projects list and the socials list each pin to a fixed screen
      // position. As the user scrolls, the inner container translates
      // upward so one item at a time passes through the visible slot —
      // SG → Nile → PersonaAI → etc — until every item has cycled.
      // Then the pin releases and normal scroll resumes to the next section.
      //
      // distMult controls "scroll pixels per pixel of inner travel":
      //   2.5 means each item takes ~2.5 × itemHeight of scroll to swap.
      //   Higher = slower / more deliberate cycling. Lower = snappier.
      //
      // pinType: 'transform' plays nicely with Lenis (avoids position:fixed
      // jank when the smooth scroller is driving the document).
      function setupScrollCycle(containerSel, innerSel, opts = {}) {
        const container = document.querySelector(containerSel)
        const inner     = document.querySelector(innerSel)
        if (!container || !inner) return
        const items = inner.children
        if (items.length < 2) return

        // Defer one frame so any pending layout has settled before measuring
        requestAnimationFrame(() => {
          const itemH = items[0].offsetHeight
          if (itemH <= 0) return
          container.style.height = itemH + 'px'
          const totalTravel = (items.length - 1) * itemH

          gsap.to(inner, {
            y: -totalTravel,
            ease: 'none',
            scrollTrigger: {
              trigger: container,
              start: opts.start || 'top 28%',
              end: '+=' + (totalTravel * (opts.distMult || 2.5)),
              pin: true,
              pinSpacing: true,
              pinType: 'transform',
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          })
        })
      }

      setupScrollCycle('#projectRefs', '.projectsInner', { start: 'top 28%', distMult: 2.5 })
      setupScrollCycle('#connectDiv',  '.connectInner',  { start: 'top 28%', distMult: 2.5 })

      // Timeline fully built — if the user clicked Skip before this
      // effect resolved, kick off the master timeline now. (For Start,
      // enterFocusMode handles kickoff after the video ends; we don't
      // call startSequenceRef here in that case.)
      if (startedRef.current && skipRequestedRef.current) {
        startSequenceRef.current()
      }

      // No background cycle — using static palette colors

      // ── Cleanup ───────────────────────────────────────────────────
      return () => {
        if (audioRafId) cancelAnimationFrame(audioRafId)
        cleanupClicks()
        rollTls.forEach(tl => tl.kill())
        gsap.ticker.remove(rafFn)
        lenis.destroy()
        ScrollTrigger.getAll().forEach((t) => t.kill())
      }
    })
  }, [])

  return (
    <div className="dark">
      {/* SVG filter defs — referenced by LiquidCursor (and any element that
          wants to "melt" into a goo). The Gaussian blur smudges shapes,
          then the colorMatrix re-thresholds alpha so blurred blobs that
          overlap merge into one solid mass. Classic CSS goo effect. */}
      <svg
        aria-hidden="true"
        focusable="false"
        style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}
      >
        <defs>
          <filter id="liquidGoo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 22 -10"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
          {/* Heavier goo for slow, syrupy hover melts */}
          <filter id="liquidGooHeavy">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 28 -14"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
      <Grain opacity={0.032} />
      {!hasStarted && (
        <div
          id="startScreen"
          className={closing ? 'closing' : ''}
          onClick={handleStart}
          role="button"
          aria-label="Click anywhere to enter"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleStart() }}
        >
          <span className="startPromptText">
            <span className="startPromptMain">click anywhere</span>
          </span>
          <button
            type="button"
            className="startSkip"
            onClick={handleSkip}
            onKeyDown={(e) => {
              // Stop space/enter from also firing the parent's handler
              if (e.key === 'Enter' || e.key === ' ') e.stopPropagation()
            }}
            aria-label="Skip the cinematic and go straight to the portfolio"
          >
            skip the cinema
          </button>
        </div>
      )}
      {focusActive && (
        <>
          <div
            id="focusBackdrop"
            onClick={exitFocusMode}
            role="button"
            aria-label="Skip video and continue"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') exitFocusMode() }}
          />
          <div id="focusCaption" aria-live="polite" aria-hidden="true">
            <span>But who wants an easy life?</span>
            <span>It&apos;s boring.</span>
          </div>
        </>
      )}
      {/* Creative press-and-hold photo peek — visible while body.creativePeek is active */}
      <div id="creativePeekBackdrop" aria-hidden="true" />
      <img id="creativePeek" alt="" aria-hidden="true" draggable="false" />
      {!IS_MOBILE && (
        <div id="profilePhoto" role="presentation" aria-hidden="true">
          <video
            ref={ambientVideoRef}
            src="/ambient.mp4"
            muted
            loop
            playsInline
            preload="auto"
            tabIndex={-1}
          />
        </div>
      )}
      {!IS_MOBILE && (
      <button
        id="soundToggle"
        type="button"
        onClick={handleSoundToggle}
        onMouseEnter={handleToggleEnter}
        onMouseLeave={handleToggleLeave}
        onTouchStart={handleToggleEnter}
        onTouchEnd={handleToggleLeave}
        onTouchCancel={handleToggleLeave}
        aria-pressed={soundOn}
        aria-label={soundOn ? 'Pause music' : 'Play music'}
      >
        {soundOn ? (
          <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true" focusable="false">
            <rect x="3" y="2" width="2" height="10" fill="currentColor" />
            <rect x="9" y="2" width="2" height="10" fill="currentColor" />
          </svg>
        ) : (
          <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true" focusable="false">
            <path d="M3 2 L12 7 L3 12 Z" fill="currentColor" />
          </svg>
        )}
      </button>
      )}
      <Name onNameClick={handleNameClick} />
      <main id="content">
        <Scrollable />
        <Footer quote={quotes[quoteIndex]} onLineHover={shuffleQuote} />
      </main>
    </div>
  )
}

export default App
