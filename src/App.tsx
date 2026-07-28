'use client'

import { useEffect, useState, type ReactNode } from 'react'
import {
  ArrowLeft, ArrowRight, Bell, BellRing, BookOpen, CalendarDays, Check,
  ChevronRight, CircleUserRound, Clock3, FileCheck2, FileText, FlaskConical,
  FolderKanban, KeyRound, LayoutDashboard, LockKeyhole, Menu, MessageSquareText,
  Orbit, Search, ShieldCheck, X,
} from 'lucide-react'
import AuthPage from './AuthPage'
import { authClient } from './auth'

const services = [
  { name: 'OSai Ventures', text: 'We co-build and back ventures with exceptional founders. From first conviction to scaling growth, we provide capital, hands-on partnership, and a network that accelerates what’s next.', icon: Orbit },
  { name: 'OSai Innovation', text: 'We help organizations turn bold ideas into real-world solutions. Our innovation programs blend strategy, design, and emerging technology to create products and ventures that drive lasting impact.', icon: Orbit },
  { name: 'OSai Consulting', text: 'We solve complex business and technology challenges. From market strategy to operating model and technology roadmaps, we deliver clarity and results that move your business forward.', icon: Orbit },
]

const stages = ['Discover', 'Validate', 'Define', 'Build', 'Launch', 'Advance']
const memberNav = [
  { slug: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { slug: 'projects', label: 'Projects', icon: FolderKanban },
  { slug: 'agreements', label: 'Agreements', icon: FileCheck2 },
  { slug: 'beta-programs', label: 'Beta Programs', icon: FlaskConical },
  { slug: 'updates', label: 'Updates', icon: BookOpen },
  { slug: 'notifications', label: 'Notifications', icon: Bell, count: 3 },
  { slug: 'profile', label: 'Profile & Security', icon: ShieldCheck },
]

const projects = [
  { name: 'Advanced Predictive Data', description: 'A decision-support environment for turning complex signals into practical foresight.', status: 'Full access', tone: 'teal', initials: 'AP' },
  { name: 'Career Pivot', description: 'Clarity and structured next steps for people navigating a meaningful career change.', status: 'Member overview', tone: 'blue', initials: 'CP' },
  { name: 'Social Encounter', description: 'An early concept exploring more intentional ways to build real-world connection.', status: 'Request access', tone: 'slate', initials: 'SE' },
]

const updates = [
  { title: 'Project brief updated', detail: 'Advanced Predictive Data', date: 'Jul 26', icon: FileText },
  { title: 'New beta invitation', detail: 'Career Pivot research preview', date: 'Jul 24', icon: FlaskConical },
  { title: 'Agreement completed', detail: 'General NDA · Version 1.0', date: 'Jul 18', icon: FileCheck2 },
  { title: 'Member hub welcome', detail: 'A guide to your OSai access', date: 'Jul 16', icon: MessageSquareText },
]

function Brand({ light = true }: { light?: boolean }) {
  return <a className={`brand ${light ? 'brand-light' : ''}`} href="/" aria-label="Orbit Systems home">
    <span className="brand-mark" aria-hidden="true"><i /><b /><em /></span>
    <span className="brand-type"><strong>ORBIT</strong><strong>SYSTEMS</strong><small>AUGMENTED INTELLIGENCE</small></span>
  </a>
}

function PublicSite() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeStage, setActiveStage] = useState(0)
  useEffect(() => {
    const timer = window.setInterval(() => setActiveStage((stage) => (stage + 1) % stages.length), 1800)
    return () => window.clearInterval(timer)
  }, [])
  const closeMenu = () => setMenuOpen(false)
  return <div id="top">
    <section className="hero">
      <header className="site-header page-wrap"><Brand /><nav className={menuOpen ? 'open' : ''} aria-label="Primary navigation">
        <a href="#top" onClick={closeMenu}>Home</a><a href="#ventures" onClick={closeMenu}>Ventures</a><a href="#innovation" onClick={closeMenu}>Innovation</a><a href="#consulting" onClick={closeMenu}>Consulting</a><a href="/insights">Insights</a><a href="#contact" onClick={closeMenu}>Contact</a><a className="nav-sign-in" href="/auth/sign-in" onClick={closeMenu}>Sign in</a>
      </nav><div className="header-actions"><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? <X /> : <Menu />}</button></div></header>
      <div className="hero-art" aria-hidden="true" /><div className="hero-content page-wrap"><div className="hero-copy"><h1>We turn ideas into market-ready businesses and products.</h1><p>OSai brings strategy, product development, technology, and commercialization together—so promising ideas can move from possibility to progress.</p><div className="hero-actions"><a className="button button-orange" href="mailto:hello@osai.com">Start a conversation</a><a className="button button-outline" href="#what-we-do">Explore what we do</a></div></div></div>
    </section>
    <main><section className="services page-wrap" id="what-we-do"><h2>Three ways to move<br />an idea forward</h2><div className="service-grid">{services.map(({ name, text, icon: Icon }, index) => <article className="service" id={index === 0 ? 'ventures' : index === 1 ? 'innovation' : 'consulting'} key={name}><span className={`service-icon icon-${index}`}><Icon /></span><h3>{name}</h3><p>{text}</p></article>)}</div></section>
      <section className="process" id="how-we-work"><div className="page-wrap process-inner"><div className="process-heading"><h2>From possibility<br />to progress.</h2><p>We can contribute at one critical stage or partner across the full journey.</p></div><div className="stage-track">{stages.map((stage, index) => <button key={stage} onClick={() => setActiveStage(index)} className={index <= activeStage ? 'active' : ''}><span><i /></span><strong>{stage}</strong></button>)}</div><div className="process-orbit orbit-one" /><div className="process-orbit orbit-two" /></div></section>
      <section className="integration page-wrap" id="about"><div className="integration-copy"><h2>One team across<br />the work that matters.</h2><p>Strategy, product creation, technical execution, and go-to-market planning work together—reducing handoffs and keeping the idea connected to the outcome.</p></div><div className="principles"><span>Clarity</span><span>Practical innovation</span><span>Disciplined execution</span><span>Market focus</span></div></section>
      <section className="cta" id="contact"><div className="page-wrap cta-inner"><div><h2>Have an idea worth<br />moving forward?</h2><p>Tell us what you’re building, where you’re stuck, or what opportunity you want to explore.</p></div><div className="cta-actions"><a className="button button-orange" href="mailto:hello@osai.com">Start a conversation</a><a href="#about">Learn about OSai <ArrowRight size={18} /></a></div></div></section></main>
    <footer><div className="page-wrap footer-inner"><div><Brand /><p>Creating, building, and taking<br />ideas to market.</p></div><nav><a href="#top">Home</a><a href="#ventures">Ventures</a><a href="#innovation">Innovation</a><a href="#consulting">Consulting</a><a href="#contact">Contact</a></nav></div></footer>
  </div>
}

function Status({ children, tone = 'teal' }: { children: ReactNode, tone?: string }) { return <span className={`status status-${tone}`}>{children}</span> }
function SectionHead({ title, action, to }: { title: string, action?: string, to?: string }) { return <div className="section-head"><h2>{title}</h2>{action && <a href={to}>{action}<ChevronRight size={18} /></a>}</div> }

function Dashboard() { return <>
  <header className="member-page-head"><h1>Welcome back, Earl</h1><p>Here’s what’s happening across your OSai access.</p></header>
  <section><SectionHead title="Your access" /><a className="access-row" href="/member/agreements"><span className="round-icon teal"><FileCheck2 /></span><span><strong>General NDA</strong><Status>Signed</Status><small>Completed July 18, 2026 · Version 1.0</small></span><span className="row-action">View agreement <ChevronRight /></span></a></section>
  <div className="dashboard-columns"><section><SectionHead title="Available projects" action="View all projects" to="/member/projects" /><div className="lined-list">{projects.map((project) => <a className="project-row" href="/member/projects" key={project.name}><span className={`project-avatar ${project.tone}`}>{project.initials}</span><span className="row-copy"><strong>{project.name}</strong><small>{project.description}</small></span><Status tone={project.tone}>{project.status}</Status><ChevronRight /></a>)}</div></section>
  <div><section><SectionHead title="Beta programs" /><a className="beta-card" href="/member/beta-programs"><span className="round-icon orange"><FlaskConical /></span><span><strong>Career Pivot research preview</strong><small>Help test a guided career clarity experience.</small><em>Invitation expires Aug 11</em></span><button>View invitation</button></a></section><section className="updates-block"><SectionHead title="Latest updates" action="View all updates" to="/member/updates" /><UpdateList limit={3} /></section></div></div>
  </> }

function ProjectsPage() { const [filter, setFilter] = useState('All projects'); return <><PageHead title="Projects" intro="Explore the projects available at your current access level." /><div className="toolbar"><div className="filter-tabs">{['All projects','Available','Requested'].map(x=><button className={filter===x?'active':''} onClick={()=>setFilter(x)} key={x}>{x}</button>)}</div><label className="search"><Search size={18}/><input aria-label="Search projects" placeholder="Search projects" /></label></div><div className="project-catalog">{projects.map((p,i)=><article className="catalog-row" key={p.name}><div className={`catalog-visual ${p.tone}`}><span>{p.initials}</span></div><div><Status tone={p.tone}>{p.status}</Status><h2>{p.name}</h2><p>{p.description}</p><div className="meta-line"><span><Clock3/> {i===0?'Updated 2 days ago':'Updated this month'}</span><span><ShieldCheck/> {i===2?'General NDA required':'Member access'}</span></div></div><button className={i===2?'secondary-button':'text-button'}>{i===2?'Request access':'Open project'} <ArrowRight size={17}/></button></article>)}</div></> }

function AgreementsPage() { return <><PageHead title="Agreements" intro="Review the agreements connected to your OSai access." /><div className="info-banner"><ShieldCheck/><span><strong>Your access is current</strong><small>OSai verifies agreement status before protected content is shown.</small></span></div><div className="data-list"><div className="data-head"><span>Agreement</span><span>Status</span><span>Completed</span><span></span></div><div className="data-row"><span className="title-cell"><FileCheck2/><span><strong>General NDA</strong><small>Version 1.0</small></span></span><Status>Signed</Status><span>July 18, 2026</span><button className="text-button">View details <ChevronRight/></button></div><div className="data-row"><span className="title-cell"><FileText/><span><strong>Advanced Predictive Data acknowledgement</strong><small>Project agreement</small></span></span><Status tone="blue">Not required</Status><span>—</span><button className="text-button">About access <ChevronRight/></button></div></div></> }

function BetaPage() { return <><PageHead title="Beta Programs" intro="Join invited previews and keep track of feedback you’ve shared." /><div className="split-feature"><div className="feature-copy"><Status tone="orange">Invitation</Status><h2>Career Pivot research preview</h2><p>Try an early guided experience and share what helps, what feels unclear, and what you would change.</p><ul><li><CalendarDays/> Invitation expires August 11, 2026</li><li><LockKeyhole/> Access is limited to invited participants</li></ul><div><button className="primary-button">Review invitation</button><button className="plain-button">Not now</button></div></div><div className="feature-panel"><FlaskConical/><strong>Your feedback stays connected</strong><p>Submissions remain linked to their original context and are reviewed by the project team.</p></div></div><section className="lower-section"><SectionHead title="Your participation"/><div className="empty-state"><MessageSquareText/><h3>No feedback submitted yet</h3><p>Your submissions and their review status will appear here.</p></div></section></> }

function UpdateList({limit=updates.length}:{limit?:number}) { return <div className="update-list">{updates.slice(0,limit).map(({title,detail,date,icon:Icon})=><a href="/member/updates" key={title}><span className="mini-icon"><Icon/></span><span><strong>{title}</strong><small>{detail}</small></span><time>{date}</time><ChevronRight/></a>)}</div> }
function UpdatesPage() { return <><PageHead title="Updates" intro="News and changes from the projects and programs you can access." /><div className="update-layout"><UpdateList/><aside><h3>Following</h3><p>You’re receiving updates for one project.</p><div className="following"><span className="project-avatar teal">AP</span><span><strong>Advanced Predictive Data</strong><small>Email and in-app updates</small></span></div><button className="secondary-button">Manage preferences</button></aside></div></> }
function NotificationsPage() { const [read,setRead]=useState<number[]>([]); const notes=['Your beta invitation is ready to review','Advanced Predictive Data published an update','Your General NDA was completed']; return <><PageHead title="Notifications" intro="Access, agreement, and project activity that needs your attention." /><div className="notification-actions"><button className="text-button" onClick={()=>setRead([0,1,2])}><Check/> Mark all as read</button></div><div className="notification-list">{notes.map((n,i)=><button onClick={()=>setRead([...read,i])} className={read.includes(i)?'read':''} key={n}><span className="notice-dot"/><span className="mini-icon">{i===0?<FlaskConical/>:i===1?<BookOpen/>:<FileCheck2/>}</span><span><strong>{n}</strong><small>{i===0?'Invitation expires August 11':i===1?'2 days ago':'July 18'}</small></span><ChevronRight/></button>)}</div></> }
function ProfilePage() { const [saved,setSaved]=useState(false); return <><PageHead title="Profile & Security" intro="Manage your member profile, sign-in details, and notification preferences." /><div className="settings-layout"><section><h2>Profile</h2><div className="avatar-editor"><span>ER</span><div><strong>Earl Reeves</strong><small>Member since July 2026</small></div><button className="plain-button">Change photo</button></div><div className="form-grid"><label>First name<input defaultValue="Earl"/></label><label>Last name<input defaultValue="Reeves"/></label><label className="wide">Email<input defaultValue="earl@example.com" disabled/><small>Your verified sign-in email</small></label></div><button className="primary-button" onClick={()=>setSaved(true)}>{saved?'Saved':'Save changes'}</button></section><aside><h2>Security</h2><a href="#password"><KeyRound/><span><strong>Password</strong><small>Last changed recently</small></span><ChevronRight/></a><a href="#sessions"><CircleUserRound/><span><strong>Active sessions</strong><small>1 signed-in device</small></span><ChevronRight/></a><a href="#notifications"><BellRing/><span><strong>Notifications</strong><small>Email and in-app preferences</small></span><ChevronRight/></a></aside></div></> }

function PageHead({title,intro}:{title:string,intro:string}) { return <header className="member-page-head"><h1>{title}</h1><p>{intro}</p></header> }
function MemberHub() {
  const initial = window.location.pathname.split('/').filter(Boolean)[1] || 'dashboard'
  const [page,setPage]=useState(initial)
  const [navOpen,setNavOpen]=useState(false)
  useEffect(()=>{ const onPop=()=>setPage(window.location.pathname.split('/').filter(Boolean)[1]||'dashboard'); window.addEventListener('popstate',onPop); return()=>window.removeEventListener('popstate',onPop)},[])
  const navigate=(slug:string)=>{window.history.pushState({},'',`/member/${slug}`);setPage(slug);setNavOpen(false);window.scrollTo(0,0)}
  const screens:Record<string,ReactNode>={dashboard:<Dashboard/>,projects:<ProjectsPage/>,agreements:<AgreementsPage/>,'beta-programs':<BetaPage/>,updates:<UpdatesPage/>,notifications:<NotificationsPage/>,profile:<ProfilePage/>}
  return <div className="member-shell"><aside className={`member-sidebar ${navOpen?'open':''}`}><div className="member-brand"><Brand/></div><nav aria-label="Member navigation">{memberNav.map(({slug,label,icon:Icon,count})=><a href={`/member/${slug}`} className={page===slug?'active':''} onClick={(e)=>{e.preventDefault();navigate(slug)}} key={slug}><Icon/><span>{label}</span>{count&&<b>{count}</b>}</a>)}</nav><a className="signout" href="/"><ArrowLeft/> Sign out</a></aside><div className="member-main"><header className="member-topbar"><button className="member-menu" onClick={()=>setNavOpen(!navOpen)} aria-label="Open navigation"><Menu/></button><span className="topbar-title">Member hub</span><div><button aria-label="Help"><MessageSquareText/></button><a href="/member/notifications" onClick={(e)=>{e.preventDefault();navigate('notifications')}}><Bell/><b>3</b></a><a className="user-chip" href="/member/profile" onClick={(e)=>{e.preventDefault();navigate('profile')}}><span>ER</span><strong>Earl Reeves</strong></a></div></header><main className="member-content">{screens[page]||<Dashboard/>}</main></div>{navOpen&&<button className="nav-scrim" onClick={()=>setNavOpen(false)} aria-label="Close navigation"/>}</div>
}

function ProtectedMemberHub() {
  const [state, setState] = useState<'checking' | 'signed-in' | 'signed-out'>('checking')
  const isDevelopmentPreview = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_MEMBER_PREVIEW === 'true'
  useEffect(() => {
    if (isDevelopmentPreview) return
    const client = authClient
    if (!client) { setState('signed-out'); return }
    client.getSession().then(({ data }) => setState(data?.session ? 'signed-in' : 'signed-out'))
  }, [isDevelopmentPreview])
  if (isDevelopmentPreview) return <MemberHub />
  if (state === 'checking') return <main className="session-check"><ShieldCheck /><p>Checking your secure session…</p></main>
  if (state === 'signed-out') return <AuthPage />
  return <MemberHub />
}

export default function App() {
  if (window.location.pathname.startsWith('/auth/')) return <AuthPage />
  return window.location.pathname.startsWith('/member') ? <ProtectedMemberHub /> : <PublicSite/>
}
