import { useState, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Name from './components/Name'
import Scrollable from './components/Scrollable'
import Footer from './components/Footer'

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

gsap.registerPlugin(ScrollTrigger)

function App() {
  const [theme] = useState('dark')

  useEffect(() => {
    const fontsReady =
      document.fonts && document.fonts.ready
        ? document.fonts.ready
        : Promise.resolve()

    fontsReady.then(() => {
      // ── Smooth scroll (Lenis + GSAP ticker) ───────────────────────
      const lenis = new Lenis({
        duration: 2.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      })

      lenis.on('scroll', ScrollTrigger.update)
      const rafFn = (time) => lenis.raf(time * 1000)
      gsap.ticker.add(rafFn)
      gsap.ticker.lagSmoothing(0)
      lenis.stop()

      const cleanupClicks = initMechanicalClicks(lenis)

      // ── Nav name rolling — direction-aware continuous slot machine ──
      let rollActive = false
      let rollDir = 0
      const rollTls = []

      function startRoll(rolls, dir) {
        rollTls.forEach(t => t.kill())
        rollTls.length = 0
        rolls.forEach((roll, i) => {
          gsap.set(roll, { y: '-1em' })
          const t = gsap.to(roll, {
            y: dir > 0 ? '-2em' : '0em',
            duration: 0.3,
            ease: 'none',
            repeat: -1,
            delay: i * 0.018,
          })
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
          rolls.forEach((roll, i) => {
            gsap.to(roll, {
              y: '-1em',
              duration: 0.65,
              ease: 'power3.out',
              delay: i * 0.018,
              overwrite: 'auto',
            })
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
      const initialLoaderSize = Math.min(w * 0.11, 200)
      const finalLoaderSize = isMobile ? 18 : 24
      const finalLoaderPos = isMobile ? 12 : 20

      // Force explicit font-size so the global `*` rule can't break measurements.
      const loaderEls = [loader, letterN, fillAnak, letterC, fillHahal]
      loaderEls.forEach((el) => {
        el.style.fontSize = initialLoaderSize + 'px'
      })

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
      // Mobile: starts fully expanded, shrinks to JC.
      // Desktop: starts as JC, expands to JatinChhanwal.
      const initialFillAnak  = isMobile ? fillAnakWidth : 0
      const initialFillHahal = isMobile ? fillHahalWidth : 0
      const targetFillAnak   = isMobile ? 0 : fillAnakWidth
      const targetFillHahal  = isMobile ? 0 : fillHahalWidth

      // Center the WHOLE visible text (not just C) at each phase
      const fullNameWidth   = letterNWidth + fillAnakWidth + letterCWidth + fillHahalWidth
      const initialsWidth   = letterNWidth + letterCWidth

      const initialLoaderLeft = isMobile
        ? w * 0.5 - fullNameWidth / 2    // mobile: full name centered at start
        : w * 0.5 - initialsWidth / 2    // desktop: JC centered at start

      const phase2EndLeft = isMobile
        ? w * 0.5 - initialsWidth / 2    // mobile: JC centered at end
        : w * 0.5 - fullNameWidth / 2    // desktop: full name centered at end

      // Fill widths scaled to the final font-size (desktop only)
      const fillAnakAtFinal  = (fillAnakWidth  / initialLoaderSize) * finalLoaderSize
      const fillHahalAtFinal = (fillHahalWidth / initialLoaderSize) * finalLoaderSize

      // ── Initial states ────────────────────────────────────────────
      gsap.set(loader, {
        top: '50%',
        left: initialLoaderLeft + 'px',
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
      const backToTopBtn = document.querySelector('.footerBackTop')
      if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
          lenis.scrollTo(0, { duration: 2 })
        })
      }

      // ── Rebuild loader as per-letter rolling spans after intro ────
      function rebuildNavName() {
        const el = document.getElementById('loader')
        if (!el) return
        const text = 'JatinChhanwal'
        el.style.fontSize = finalLoaderSize + 'px'
        el.innerHTML = Array.from(text).map(char =>
          `<span class="navLetterWrap"><span class="navLetterRoll"><span>${char}</span><span>${char}</span><span>${char}</span></span></span>`
        ).join('')
        // Sit at middle copy — both directions can roll without a visible jump
        gsap.set('.navLetterRoll', { y: '-1em' })
      }

      // ── Master timeline ───────────────────────────────────────────
      const tl = gsap.timeline()

      // 1. Breathe in — slow, deliberate fade
      tl.to(loader, { opacity: 1, duration: 2.0, ease: 'power3.out', delay: 0.3 })

      // 2. Name expands
      tl.to(
        [fillAnak, fillHahal],
        {
          width: (i) => [targetFillAnak, targetFillHahal][i] + 'px',
          duration: 2.2,
          ease: 'expo.inOut',
          delay: 1.0,
        }
      )
      tl.to(
        loader,
        { left: phase2EndLeft + 'px', duration: 2.2, ease: 'expo.inOut' },
        '<'
      )

      // 3. Hold then exhale: shrink to nav corner
      tl.to(loaderEls, {
        fontSize: finalLoaderSize + 'px',
        duration: 2.6,
        ease: 'expo.inOut',
        delay: 1.5,
      })
      if (!isMobile) {
        tl.to(
          [fillAnak, fillHahal],
          {
            width: (i) => [fillAnakAtFinal, fillHahalAtFinal][i] + 'px',
            duration: 2.6,
            ease: 'expo.inOut',
          },
          '<'
        )
      }
      tl.to(
        loader,
        {
          top: finalLoaderPos + 'px',
          left: finalLoaderPos + 'px',
          yPercent: 0,
          duration: 2.6,
          ease: 'expo.inOut',
        },
        '<'
      )

      tl.call(() => rebuildNavName(), null, '>')

      // 4. Page breathes open
      tl.to(
        '#content',
        {
          opacity: 1,
          duration: 2.0,
          ease: 'power3.out',
          onStart: () => lenis.start(),
        },
        '-=1.6'
      )

      // 5. Stagger reveal
      tl.to(
        '#details p',
        { opacity: 1, y: 0, duration: 2.0, stagger: 0.28, ease: 'power3.out' },
        '-=1.4'
      )
      tl.to(
        '.projectPara',
        { opacity: 1, y: 0, duration: 2.0, stagger: 0.12, ease: 'power3.out' },
        '-=1.6'
      )
      tl.to(
        '#connectDiv p',
        { opacity: 1, y: 0, duration: 2.0, stagger: 0.22, ease: 'power3.out' },
        '-=1.4'
      )

      // ── Footer scroll-triggered animations ────────────────────────
      gsap.to('#footerLine', {
        scaleX: 1,
        duration: 2.2,
        ease: 'expo.out',
        scrollTrigger: { trigger: '#footerDiv', start: 'top 75%' },
      })

      gsap.to('.footerBackTop', {
        opacity: 1,
        y: 0,
        duration: 1.4,
        ease: 'expo.out',
        scrollTrigger: { trigger: '#footerDiv', start: 'top 80%' },
      })

      gsap.to('#footerMark', {
        opacity: 0.65,
        y: 0,
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: { trigger: '#footerDiv', start: 'top 80%' },
      })

      if (isMobile) {
        tl.to(
          '#footerYear',
          { opacity: 1, y: 0, duration: 1.8, ease: 'expo.out' },
          '-=0.4'
        )
      } else {
        gsap.to('#footerYear', {
          opacity: 1,
          y: 0,
          duration: 2.0,
          ease: 'expo.out',
          scrollTrigger: { trigger: '#footerDiv', start: 'top center' },
        })
      }

      // No background cycle — using static palette colors

      // ── Cleanup ───────────────────────────────────────────────────
      return () => {
        cleanupClicks()
        rollTls.forEach(tl => tl.kill())
        gsap.ticker.remove(rafFn)
        lenis.destroy()
        ScrollTrigger.getAll().forEach((t) => t.kill())
      }
    })
  }, [])

  return (
    <div className={theme}>
      <div id="profilePhoto" aria-hidden="true"></div>
      <Name />
      <div id="content">
        <Scrollable />
        <Footer />
      </div>
    </div>
  )
}

export default App
