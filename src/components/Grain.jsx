import { useEffect, useRef } from 'react'

// WebGL grain overlay — GPU-rendered animated film grain.
// Runs entirely on the compositor thread at ~20fps.
// Two triangles covering the screen + a hash-based noise fragment shader.

const VERT = `
  attribute vec2 a_pos;
  void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`

const FRAG = `
  precision mediump float;
  uniform float u_time;
  uniform vec2  u_res;

  float hash(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_res;
    // Shift UV each frame so grain animates
    float n = hash(uv + fract(u_time * 0.07));
    gl_FragColor = vec4(vec3(n), 1.0);
  }
`

function compile(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  return s
}

export default function Grain({ opacity = 0.032 }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const gl = canvas.getContext('webgl', { antialias: false, depth: false, alpha: false })
    if (!gl) return

    // Compile + link
    const prog = gl.createProgram()
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER,   VERT))
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    // Full-screen quad (2 triangles)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1,  -1, 1,
      -1,  1,  1, -1,   1, 1,
    ]), gl.STATIC_DRAW)

    const pos = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uRes  = gl.getUniformLocation(prog, 'u_res')

    const draw = (t) => {
      gl.uniform1f(uTime, t)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width  = window.innerWidth  * dpr
      canvas.height = window.innerHeight * dpr
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      draw(0) // redraw so the grain survives a resize even when paused
    }
    resize()
    window.addEventListener('resize', resize)

    // Render at ~20fps — grain doesn't need 60fps, saves GPU budget
    let frame = null
    let last = 0
    const INTERVAL = 50 // ms

    function tick(now) {
      frame = requestAnimationFrame(tick)
      if (now - last < INTERVAL) return
      last = now
      draw(now * 0.001)
    }

    const start = () => { if (frame === null) { last = 0; frame = requestAnimationFrame(tick) } }
    const stop  = () => { if (frame !== null) { cancelAnimationFrame(frame); frame = null } }

    // Reduced motion: keep one static grain frame, never run the loop.
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Don't animate while the tab is hidden — saves battery/GPU and keeps INP clean.
    const onVisibility = () => { if (document.hidden) stop(); else if (!reduced) start() }

    if (!reduced) start()
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', resize)
      gl.deleteProgram(prog)
      gl.deleteBuffer(buf)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9998,
        opacity,
        mixBlendMode: 'overlay',
      }}
    />
  )
}
