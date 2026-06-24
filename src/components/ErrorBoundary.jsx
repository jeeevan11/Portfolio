import { Component } from 'react'

// Last line of defence. The whole site reveals its content via JS animation;
// if any render throws (a GSAP load failure, a runtime error in the intro),
// React would otherwise unmount to a blank green screen. This catches that and
// renders a static, dependency-free fallback that still gives the visitor the
// name and the two things they came for: the résumé and a way to make contact.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // Surface during development; harmless no-op signature in production.
    if (import.meta.env && import.meta.env.DEV) {
      console.error('Portfolio render error:', error, info)
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const wrap = {
      fontFamily: '"Kumbh Sans", system-ui, -apple-system, sans-serif',
      color: '#F0E7C2',
      background: '#00291C',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '24px',
      gap: '18px',
    }
    const eyebrow = { fontSize: '12px', fontWeight: 500, letterSpacing: '0.24em', textTransform: 'uppercase', opacity: 0.5, margin: 0 }
    const title = { fontSize: 'clamp(46px, 10vw, 110px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, margin: 0 }
    const links = { display: 'flex', gap: '2.4em', marginTop: '8px' }
    const link = { color: '#F0E7C2', fontSize: '11px', fontWeight: 400, letterSpacing: '0.24em', textTransform: 'uppercase', opacity: 0.7, textDecoration: 'none' }

    return (
      <main style={wrap}>
        <p style={eyebrow}>Jatin Chhanwal</p>
        <h1 style={title}>Updating<span style={{ color: '#954130' }}>.</span></h1>
        <div style={links}>
          <a style={link} href="/Jatin_Chhanwal_Resume.pdf" download>AI Resume</a>
          <a style={link} href="/Jatin_Chhanwal_Resume_Systems.pdf" download>Systems Resume</a>
          <a style={link} href="https://www.linkedin.com/in/jatinchhanwal/" target="_blank" rel="noopener noreferrer">Contact</a>
        </div>
      </main>
    )
  }
}
