import { useEffect, useState } from 'react'
import { ArrowRight, Menu, Orbit, X } from 'lucide-react'

const services = [
  { name: 'OSai Ventures', text: 'We co-build and back ventures with exceptional founders. From first conviction to scaling growth, we provide capital, hands-on partnership, and a network that accelerates what’s next.', icon: Orbit },
  { name: 'OSai Innovation', text: 'We help organizations turn bold ideas into real-world solutions. Our innovation programs blend strategy, design, and emerging technology to create products and ventures that drive lasting impact.', icon: Orbit },
  { name: 'OSai Consulting', text: 'We solve complex business and technology challenges. From market strategy to operating model and technology roadmaps, we deliver clarity and results that move your business forward.', icon: Orbit },
]

const stages = ['Discover', 'Validate', 'Define', 'Build', 'Launch', 'Advance']

function Brand({ light = true }: { light?: boolean }) {
  return <a className={`brand ${light ? 'brand-light' : ''}`} href="#top" aria-label="OSai home">
    <span className="brand-mark" aria-hidden="true"><i /><b /><em /></span>
    <span className="brand-type"><strong>ORBIT</strong><strong>SYSTEMS</strong><small>AUGMENTED INTELLIGENCE</small></span>
  </a>
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeStage, setActiveStage] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setActiveStage((stage) => (stage + 1) % stages.length), 1800)
    return () => window.clearInterval(timer)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return <div id="top">
    <section className="hero">
      <header className="site-header page-wrap">
        <Brand />
        <nav className={menuOpen ? 'open' : ''} aria-label="Primary navigation">
          <a href="#top" onClick={closeMenu}>Home</a>
          <a href="#ventures" onClick={closeMenu}>Ventures</a>
          <a href="#innovation" onClick={closeMenu}>Innovation</a>
          <a href="#consulting" onClick={closeMenu}>Consulting</a>
          <a href="/insights" onClick={closeMenu}>Insights</a>
          <a href="#contact" onClick={closeMenu}>Contact</a>
          <a className="mobile-sign-in" href="#signin" onClick={closeMenu}>Sign in</a>
        </nav>
        <div className="header-actions">
          <a className="sign-in" href="#signin">Sign in</a>
          <a className="button button-orange header-cta" href="#contact">Start a conversation</a>
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </header>

      <div className="hero-art" aria-hidden="true" />
      <div className="hero-content page-wrap">
        <div className="hero-copy">
          <h1>We turn ideas into market-ready businesses and products.</h1>
          <p>OSai brings strategy, product development, technology, and commercialization together—so promising ideas can move from possibility to progress.</p>
          <div className="hero-actions">
            <a className="button button-orange" href="mailto:hello@osai.com">Start a conversation</a>
            <a className="button button-outline" href="#what-we-do">Explore what we do</a>
          </div>
        </div>
      </div>
    </section>

    <main>
      <section className="services page-wrap" id="what-we-do">
        <h2>Three ways to move<br />an idea forward</h2>
        <div className="service-grid">
          {services.map(({ name, text, icon: Icon }, index) => <article className="service" id={index === 0 ? 'ventures' : index === 1 ? 'innovation' : 'consulting'} key={name}>
            <span className={`service-icon icon-${index}`}><Icon strokeWidth={1.35} /></span>
            <h3>{name}</h3>
            <p>{text}</p>
            <a href={`#${index === 0 ? 'ventures' : index === 1 ? 'how-we-work' : 'about'}`}>Learn more <ArrowRight size={18} /></a>
          </article>)}
        </div>
      </section>

      <section className="process" id="how-we-work">
        <div className="page-wrap process-inner">
          <div className="process-heading"><h2>From possibility<br />to progress.</h2><p>We can contribute at one critical stage or partner across the full journey.</p></div>
          <div className="stage-track" role="list" aria-label="OSai working process">
            {stages.map((stage, index) => <button key={stage} role="listitem" onClick={() => setActiveStage(index)} className={index <= activeStage ? 'active' : ''} aria-pressed={index === activeStage}>
              <span><i /></span><strong>{stage}</strong>
            </button>)}
          </div>
          <div className="process-orbit orbit-one" /><div className="process-orbit orbit-two" />
        </div>
      </section>

      <section className="integration page-wrap" id="about">
        <div className="integration-copy"><h2>One team across<br />the work that matters.</h2><p>Strategy, product creation, technical execution, and go-to-market planning work together—reducing handoffs and keeping the idea connected to the outcome.</p></div>
        <div className="principles"><span>Clarity</span><span>Practical innovation</span><span>Disciplined execution</span><span>Market focus</span></div>
      </section>

      <section className="cta" id="contact">
        <div className="page-wrap cta-inner">
          <div><h2>Have an idea worth<br />moving forward?</h2><p>Tell us what you’re building, where you’re stuck, or what opportunity you want to explore.</p></div>
          <div className="cta-actions"><a className="button button-orange" href="mailto:hello@osai.com">Start a conversation</a><a href="#about">Learn about OSai <ArrowRight size={18} /></a></div>
        </div>
      </section>
    </main>

    <footer>
      <div className="page-wrap footer-inner">
        <div><Brand /><p>Creating, building, and taking<br />ideas to market.</p></div>
        <nav aria-label="Footer navigation"><a href="#top">Home</a><a href="#ventures">Ventures</a><a href="#innovation">Innovation</a><a href="#consulting">Consulting</a><a href="/insights">Insights</a><a href="#contact">Contact</a></nav>
      </div>
    </footer>
  </div>
}

export default App
