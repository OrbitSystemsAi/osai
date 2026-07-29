'use client'

import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import Image from 'next/image'
import {
  ArrowLeft, ArrowRight, Bell, BellRing, BookOpen, CalendarDays, Check,
  ChevronRight, Clock3, FileCheck2, FileText, FlaskConical,
  FolderKanban, Hourglass, KeyRound, LayoutDashboard, LockKeyhole, Mail, Menu,
  DollarSign, ImageIcon, ListTodo, MessageSquareText, Orbit, Pencil, Plus, Search,
  LogOut, ShieldCheck, Target, Trash2, TrendingUp, User, UserCog, Users, X,
} from 'lucide-react'
import AuthPage from './AuthPage'
import { authClient, emailAuthClient } from './auth'

const services = [
  { name: 'OSai Ventures', text: 'We co-build and back ventures with exceptional founders. From first conviction to scaling growth, we provide capital, hands-on partnership, and a network that accelerates what’s next.', icon: Orbit },
  { name: 'OSai Innovation', text: 'We help organizations turn bold ideas into real-world solutions. Our innovation programs blend strategy, design, and emerging technology to create products and ventures that drive lasting impact.', icon: Orbit },
  { name: 'OSai Consulting', text: 'We solve complex business and technology challenges. From market strategy to operating model and technology roadmaps, we deliver clarity and results that move your business forward.', icon: Orbit },
]

const stages = ['Discover', 'Validate', 'Define', 'Build', 'Launch', 'Advance']
const PROJECT_TITLE_MAX = 80
const PROJECT_DESCRIPTION_MAX = 350
type MemberNavItem = { slug: string; label: string; icon: typeof LayoutDashboard; count?: number }
const memberNav: MemberNavItem[] = [
  { slug: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { slug: 'projects', label: 'Projects', icon: FolderKanban },
  { slug: 'agreements', label: 'Agreements', icon: FileCheck2 },
  { slug: 'beta-programs', label: 'Beta Programs', icon: FlaskConical },
  { slug: 'updates', label: 'Updates', icon: BookOpen },
]
const adminNav: MemberNavItem[] = [
  { slug: 'admin-users', label: 'Users', icon: UserCog, count: 0 },
  { slug: 'admin-projects', label: 'Manage Projects', icon: FolderKanban, count: 0 },
]

const projects = [
  { slug: 'advanced-predictive-data', name: 'Advanced Predictive Data', description: 'A decision-support environment for turning complex signals into practical foresight.', status: 'Full access', tone: 'teal', initials: 'AP' },
  { slug: 'career-pivot', name: 'Career Pivot', description: 'Clarity and structured next steps for people navigating a meaningful career change.', status: 'Member overview', tone: 'blue', initials: 'CP' },
  { slug: 'social-encounter', name: 'Social Encounter', description: 'An early concept exploring more intentional ways to build real-world connection.', status: 'Request access', tone: 'slate', initials: 'SE' },
]
type CatalogProject = (typeof projects)[number] & { imageUrl?: string }

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
  const [accountOpen, setAccountOpen] = useState(false)
  const [accountDialog, setAccountDialog] = useState<'sign-in' | 'create' | null>(null)
  const [accountEmail, setAccountEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verifyPassword, setVerifyPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [authError, setAuthError] = useState('')
  useEffect(() => {
    const timer = window.setInterval(() => setActiveStage((stage) => (stage + 1) % stages.length), 1800)
    return () => window.clearInterval(timer)
  }, [])
  useEffect(() => {
    if (!accountDialog) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setAccountDialog(null) }
    document.body.classList.add('modal-open')
    window.addEventListener('keydown', closeOnEscape)
    return () => { document.body.classList.remove('modal-open'); window.removeEventListener('keydown', closeOnEscape) }
  }, [accountDialog])
  const closeMenu = () => { setMenuOpen(false); setAccountOpen(false) }
  const openDialog = (dialog: 'sign-in' | 'create') => {
    setAccountDialog(dialog); setAccountOpen(false); setMenuOpen(false); setAuthError(''); setPassword(''); setVerifyPassword('')
  }
  const signIn = async (event: FormEvent) => {
    event.preventDefault(); setAuthBusy(true); setAuthError('')
    const { error } = await authClient.signInWithPassword({ email: accountEmail, password })
    setAuthBusy(false)
    if (error) return setAuthError(error.message || 'We could not sign you in. Check your details and try again.')
    window.location.href = '/member/dashboard'
  }
  const createAccount = async (event: FormEvent) => {
    event.preventDefault(); setAuthError('')
    if (password !== verifyPassword) return setAuthError('The passwords do not match.')
    setAuthBusy(true)
    const { error } = await emailAuthClient.signUp.email({ email: accountEmail, password, name: fullName })
    if (error) { setAuthBusy(false); return setAuthError(error.message || 'We could not create your account. Please try again.') }
    const { error: signInError } = await authClient.signInWithPassword({ email: accountEmail, password })
    setAuthBusy(false)
    if (signInError) return setAuthError(signInError.message || 'Your account was created, but we could not sign you in.')
    window.location.href = '/member/dashboard'
  }
  return <div id="top">
    <section className="hero">
      <header className="site-header page-wrap"><Brand /><nav className={menuOpen ? 'open' : ''} aria-label="Primary navigation">
        <a href="#top" onClick={closeMenu}>Home</a><a href="#ventures" onClick={closeMenu}>Ventures</a><a href="#innovation" onClick={closeMenu}>Innovation</a><a href="#consulting" onClick={closeMenu}>Consulting</a><a href="/insights">Insights</a><a href="#contact" onClick={closeMenu}>Contact</a><span className="account-entry"><button className="nav-sign-in" type="button" aria-expanded={accountOpen} onClick={() => setAccountOpen(!accountOpen)}>Account</button>{accountOpen && <span className="account-menu"><button onClick={() => openDialog('sign-in')}>Sign in</button><button onClick={() => openDialog('create')}>Create Account</button></span>}</span>
      </nav><div className="header-actions"><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? <X /> : <Menu />}</button></div></header>
      <div className="hero-art" aria-hidden="true" /><div className="hero-content page-wrap"><div className="hero-copy"><h1>We turn ideas into market-ready businesses and products.</h1><p>OSai brings strategy, product development, technology, and commercialization together—so promising ideas can move from possibility to progress.</p><div className="hero-actions"><a className="button button-orange" href="mailto:hello@osai.com">Start a conversation</a><a className="button button-outline" href="#what-we-do">Explore what we do</a></div></div></div>
    </section>
    <main><section className="services page-wrap" id="what-we-do"><h2>Three ways to move<br />an idea forward</h2><div className="service-grid">{services.map(({ name, text, icon: Icon }, index) => <article className="service" id={index === 0 ? 'ventures' : index === 1 ? 'innovation' : 'consulting'} key={name}><span className={`service-icon icon-${index}`}><Icon /></span><h3>{name}</h3><p>{text}</p></article>)}</div></section>
      <section className="process" id="how-we-work"><div className="page-wrap process-inner"><div className="process-heading"><h2>From possibility<br />to progress.</h2><p>We can contribute at one critical stage or partner across the full journey.</p></div><div className="stage-track">{stages.map((stage, index) => <button key={stage} onClick={() => setActiveStage(index)} className={index <= activeStage ? 'active' : ''}><span><i /></span><strong>{stage}</strong></button>)}</div><div className="process-orbit orbit-one" /><div className="process-orbit orbit-two" /></div></section>
      <section className="integration page-wrap" id="about"><div className="integration-copy"><h2>One team across<br />the work that matters.</h2><p>Strategy, product creation, technical execution, and go-to-market planning work together—reducing handoffs and keeping the idea connected to the outcome.</p></div><div className="principles"><span>Clarity</span><span>Practical innovation</span><span>Disciplined execution</span><span>Market focus</span></div></section>
      <section className="cta" id="contact"><div className="page-wrap cta-inner"><div><h2>Have an idea worth<br />moving forward?</h2><p>Tell us what you’re building, where you’re stuck, or what opportunity you want to explore.</p></div><div className="cta-actions"><a className="button button-orange" href="mailto:hello@osai.com">Start a conversation</a><a href="#about">Learn about OSai <ArrowRight size={18} /></a></div></div></section></main>
    <footer><div className="page-wrap footer-inner"><div><Brand /><p>Creating, building, and taking<br />ideas to market.</p></div><nav><a href="#top">Home</a><a href="#ventures">Ventures</a><a href="#innovation">Innovation</a><a href="#consulting">Consulting</a><a href="#contact">Contact</a></nav></div></footer>
    {accountDialog && <div className="account-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setAccountDialog(null) }}><section className="account-modal" role="dialog" aria-modal="true" aria-labelledby="account-dialog-title"><button className="account-modal-close" type="button" onClick={() => setAccountDialog(null)} aria-label="Close account dialog"><X /></button>{accountDialog === 'sign-in' ? <><h2 id="account-dialog-title">Sign in</h2><p>Continue to your OSai account.</p><form onSubmit={signIn}><label>Username (email)<input type="email" required autoComplete="email" value={accountEmail} onChange={(event) => setAccountEmail(event.target.value)} /></label><label>Password<input type="password" required minLength={8} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label><a className="account-forgot" href="/auth/forgot-password">Forgot password?</a>{authError && <div className="account-error" role="alert">{authError}</div>}<button className="account-submit" disabled={authBusy}>{authBusy ? 'Signing in…' : 'Sign in'}</button></form><button className="account-switch" type="button" onClick={() => openDialog('create')}>Create an account</button></> : <><h2 id="account-dialog-title">Create Account</h2><p>Create your OSai sign-in credentials.</p><form onSubmit={createAccount}><label>Full Name<input required autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} /></label><label>Email<input type="email" required autoComplete="email" value={accountEmail} onChange={(event) => setAccountEmail(event.target.value)} /></label><label>Password<input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label><label>Verify Password<input type="password" required minLength={8} autoComplete="new-password" value={verifyPassword} onChange={(event) => setVerifyPassword(event.target.value)} /></label>{authError && <div className="account-error" role="alert">{authError}</div>}<button className="account-submit" disabled={authBusy}>{authBusy ? 'Creating account…' : 'Create Account'}</button></form><button className="account-switch" type="button" onClick={() => openDialog('sign-in')}>Already have an account? Sign in</button></>}</section></div>}
  </div>
}

function Status({ children, tone = 'teal' }: { children: ReactNode, tone?: string }) { return <span className={`status status-${tone}`}>{children}</span> }
function SectionHead({ title, action, to }: { title: string, action?: string, to?: string }) { return <div className="section-head"><h2>{title}</h2>{action && <a href={to}>{action}<ChevronRight size={18} /></a>}</div> }

const urgentDashboardItems: Array<{ title: string, detail: string, href: string }> = []
const pendingDashboardItems: Array<{ title: string, detail: string, href: string }> = []

function ProjectSnapshot({ project, available = false }: { project: typeof projects[number], available?: boolean }) {
  return <a className="snapshot-tile" href="/member/projects">
    <span className={`snapshot-mark ${project.tone}`}>{project.initials}</span>
    <span className="snapshot-copy"><small>{available ? 'Available to you' : 'Current project'}</small><strong>{project.name}</strong><span>{project.description}</span></span>
    <span className="snapshot-foot"><Status tone={project.tone}>{project.status}</Status><ChevronRight /></span>
  </a>
}

function Dashboard() {
  const currentProjects = projects.filter(project => project.status !== 'Request access')
  const availableProjects = projects.filter(project => project.status === 'Request access')
  return <div className="modular-dashboard">
    <section className="dashboard-module analytics-module" aria-label="Financial forecasts">
      <div className="analytics-grid">
        <article className="analytic analytic-line">
          <header><h2>Projected portfolio value</h2><strong>$1.24M</strong><span>+18.6% forecast</span></header>
          <svg viewBox="0 0 340 132" role="img" aria-label="Projected portfolio value rises from 760 thousand dollars to 1.24 million dollars over five quarters">
            <g className="chart-grid"><path d="M12 18H328M12 64H328M12 110H328" /></g>
            <path className="area-fill" d="M12 104L75 90L138 96L201 62L264 50L328 22V120H12Z" />
            <path className="line-stroke" d="M12 104L75 90L138 96L201 62L264 50L328 22" />
            <g className="line-dots"><circle cx="12" cy="104" r="3" /><circle cx="75" cy="90" r="3" /><circle cx="138" cy="96" r="3" /><circle cx="201" cy="62" r="3" /><circle cx="264" cy="50" r="3" /><circle cx="328" cy="22" r="4" /></g>
          </svg>
          <div className="chart-axis" aria-hidden="true"><span>Q3</span><span>Q4</span><span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span></div>
        </article>

        <article className="analytic analytic-bars">
          <header><h2>Expected ROI by project</h2><strong>24.8%</strong><span>Blended forecast</span></header>
          <div className="vertical-bars" role="img" aria-label="Expected return on investment: APD 31 percent, Career Pivot 24 percent, Social Encounter 15 percent">
            <span><i style={{ height: '88%' }} /><small>APD</small><b>31%</b></span>
            <span><i style={{ height: '68%' }} /><small>CP</small><b>24%</b></span>
            <span><i style={{ height: '43%' }} /><small>SE</small><b>15%</b></span>
          </div>
        </article>

        <article className="analytic analytic-donut">
          <header><h2>My projects</h2><strong>{currentProjects.length}</strong><span>Active forecasts</span></header>
          <div className="donut-wrap">
            <div className="donut-chart" role="img" aria-label="Active project forecast mix: 63 percent Advanced Predictive Data and 37 percent Career Pivot"><span><strong>{currentProjects.length}</strong><small>Projects</small></span></div>
            <ul><li><i className="teal" />APD <b>63%</b></li><li><i className="blue" />Career Pivot <b>37%</b></li></ul>
          </div>
        </article>

        <article className="analytic analytic-allocation">
          <header><h2>12-month capital forecast</h2><strong>$420K</strong><span>Planned allocation</span></header>
          <div className="allocation-list">
            <span><small>Product development</small><b>$189K</b><i><em style={{ width: '45%' }} /></i></span>
            <span><small>Go-to-market</small><b>$126K</b><i><em style={{ width: '30%' }} /></i></span>
            <span><small>Operations</small><b>$105K</b><i><em style={{ width: '25%' }} /></i></span>
          </div>
        </article>
      </div>
      <p className="forecast-note">Illustrative forecasts for planning purposes; not verified performance or an investment offer.</p>
    </section>

    {urgentDashboardItems.length > 0 && <section className="dashboard-module action-module urgent-module"><SectionHead title="Urgent" />{urgentDashboardItems.map(item => <a href={item.href} key={item.title}><span><strong>{item.title}</strong><small>{item.detail}</small></span><ChevronRight /></a>)}</section>}

    <section className="dashboard-module invitation-module" aria-labelledby="invitations-title">
      <div className="module-heading compact"><span className="module-icon orange"><Mail /></span><div><h2 id="invitations-title">Invitations</h2><p>Opportunities waiting for your response.</p></div></div>
      <a className="invitation-row" href="/member/beta-programs"><span className="round-icon orange"><FlaskConical /></span><span><strong>Career Pivot research preview</strong><small>Help test a guided career clarity experience.</small><em>Expires Aug 11</em></span><button>View invitation</button></a>
    </section>

    {pendingDashboardItems.length > 0 && <section className="dashboard-module action-module pending-module"><div className="module-heading compact"><span className="module-icon blue"><Hourglass /></span><div><h2>Pending</h2><p>Items currently awaiting completion or approval.</p></div></div>{pendingDashboardItems.map(item => <a href={item.href} key={item.title}><span><strong>{item.title}</strong><small>{item.detail}</small></span><ChevronRight /></a>)}</section>}

    <section className="dashboard-module projects-module"><SectionHead title="Current Projects" action="View all projects" to="/member/projects" /><div className="snapshot-grid">{currentProjects.map(project => <ProjectSnapshot project={project} key={project.name} />)}</div></section>
    <section className="dashboard-module projects-module"><SectionHead title="Available Projects" action="Explore projects" to="/member/projects" /><div className="snapshot-grid">{availableProjects.map(project => <ProjectSnapshot project={project} available key={project.name} />)}</div></section>
  </div>
}

function MemberProjectDetailPage({ project, onBack, isAdmin, onProjectChange }: { project: CatalogProject; onBack: () => void; isAdmin: boolean; onProjectChange: (project: CatalogProject) => void }) {
  const [adminProject, setAdminProject] = useState<AdminProjectDetail | null>(null)
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description)
  const [imageUrl, setImageUrl] = useState(project.imageUrl || '')
  const [editingPart, setEditingPart] = useState<'title' | 'description' | null>(null)
  const [adminMessage, setAdminMessage] = useState('')
  useEffect(() => { if (!isAdmin) return; let active = true; void adminRequest('/api/admin/projects').then(async data => { const match = (data.projects as AdminProject[]).find(item => item.slug === project.slug); if (!match) return; const detail = projectDetailFromApi((await adminRequest(`/api/admin/projects/${match.id}`)).project); if (active) { setAdminProject(detail); setName(detail.name); setDescription(detail.description); setImageUrl(detail.image_url) } }).catch(error => { if (active) setAdminMessage(error instanceof Error ? error.message : 'Could not load project editing.') }); return () => { active = false } }, [isAdmin, project.slug])
  const ensureAdminProject = async () => {
    if (adminProject) return adminProject
    const current = await adminRequest('/api/admin/projects')
    const existing = (current.projects as AdminProject[]).find(item => item.slug === project.slug)
    if (existing) {
      const detail = projectDetailFromApi((await adminRequest(`/api/admin/projects/${existing.id}`)).project)
      setAdminProject(detail)
      setImageUrl(detail.image_url)
      return detail
    }
    const created = await adminRequest('/api/admin/projects', { method: 'POST', body: JSON.stringify({ name, slug: project.slug, description, status: 'published', accessLevel: 'member' }) })
    const detail = projectDetailFromApi((await adminRequest(`/api/admin/projects/${created.project.id}`)).project)
    setAdminProject(detail)
    return detail
  }
  const saveText = async () => { try { setAdminMessage('Saving…'); const record = await ensureAdminProject(); const nextName = name.trim(); const nextDescription = description.trim(); await adminRequest(`/api/admin/projects/${record.id}`, { method: 'PATCH', body: JSON.stringify({ name: nextName, slug: record.slug, description: nextDescription, status: record.status, accessLevel: record.access_level }) }); setAdminProject({ ...record, name: nextName, description: nextDescription }); onProjectChange({ ...project, name: nextName, description: nextDescription, imageUrl }); setEditingPart(null); setAdminMessage('') } catch (error) { setAdminMessage(error instanceof Error ? error.message : 'Could not save this project.') } }
  const saveImage = async (nextImageUrl: string) => { const record = await ensureAdminProject(); await adminRequest(`/api/admin/projects/${record.id}`, { method: 'PATCH', body: JSON.stringify({ dashboard: { imageUrl: nextImageUrl, userGoal: record.user_goal, costBudget: record.cost_budget, costActual: record.cost_actual, adoptionRate: record.adoption_rate, forecastPenetration: record.forecast_penetration, milestones: record.milestones, tasks: record.tasks } }) }); setImageUrl(nextImageUrl); setAdminProject({ ...record, image_url: nextImageUrl }); onProjectChange({ ...project, name, description, imageUrl: nextImageUrl }) }
  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; event.target.value = ''; if (!file) return; if (!['image/jpeg','image/png','image/webp'].includes(file.type)) { setAdminMessage('Use a JPG, PNG, or WebP image.'); return } if (file.size > 2 * 1024 * 1024) { setAdminMessage('Choose an image smaller than 2 MB.'); return } try { setAdminMessage('Uploading…'); const dataUrl = await new Promise<string>((resolve,reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error('Could not read the image.')); reader.readAsDataURL(file) }); await saveImage(dataUrl); setAdminMessage('') } catch (error) { setAdminMessage(error instanceof Error ? error.message : 'Could not upload the image.') } }
  const cover = <div className={`project-cover project-cover-${project.tone}${isAdmin?' admin-hover-edit':''}`}>{imageUrl?<div className="project-cover-image admin-hover-content" role="img" aria-label={`${name} project`} style={{backgroundImage:`url(${imageUrl})`}}/>:<span className={isAdmin?'admin-hover-content':undefined}><ImageIcon/><b>{project.initials}</b></span>}{isAdmin&&<div className="admin-hover-actions">{imageUrl&&<button type="button" onClick={()=>void saveImage('')}><Trash2/> Delete</button>}<label className="admin-hover-label"><ImageIcon/> {imageUrl?'Edit':'Upload'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event=>void uploadImage(event)}/></label></div>}</div>
  const title = isAdmin?(editingPart==='title'?<div className="admin-inline-editor"><input aria-label="Project title" maxLength={PROJECT_TITLE_MAX} value={name} onChange={event=>setName(event.target.value)}/><small>{name.length}/{PROJECT_TITLE_MAX}</small><button type="button" onClick={()=>void saveText()}>Save</button><button type="button" onClick={()=>{setName(adminProject?.name||project.name);setEditingPart(null)}}>Cancel</button></div>:<div className="admin-hover-edit admin-title-edit"><h1 className="admin-hover-content">{name}</h1><div className="admin-hover-actions"><button type="button" onClick={()=>setEditingPart('title')}><Pencil/> Edit</button></div></div>):<h1>{name}</h1>
  const projectDescription = description || 'No project brief has been added.'
  const descriptionContent = isAdmin?(editingPart==='description'?<div className="admin-inline-editor"><textarea aria-label="Project description" maxLength={PROJECT_DESCRIPTION_MAX} value={description} onChange={event=>setDescription(event.target.value)}/><small>{description.length}/{PROJECT_DESCRIPTION_MAX}</small><button type="button" onClick={()=>void saveText()}>Save</button><button type="button" onClick={()=>{setDescription(adminProject?.description||project.description);setEditingPart(null)}}>Cancel</button></div>:<div className="admin-hover-edit admin-description-edit"><p className="admin-hover-content">{projectDescription}</p><div className="admin-hover-actions"><button type="button" onClick={()=>setEditingPart('description')}><Pencil/> Edit</button></div></div>):<p>{projectDescription}</p>
  return <div className="project-detail member-project-detail">
    <nav className="project-section-links" aria-label="Project sections"><a href="/member/projects" onClick={event=>{event.preventDefault();onBack()}}>Projects</a><a href="#overview">Overview</a><a href="#milestones">Milestones</a><a href="#tasks">Tasks</a></nav>
    <section className={`project-identity${isAdmin?' admin-project-identity':''}`} id="overview">{cover}<div>{title}{descriptionContent}{adminMessage&&<small className="admin-edit-message" role="status">{adminMessage}</small>}</div></section>
    <section className="project-milestones" id="milestones"><header><div><h2>Milestones</h2><p>Published project stages will appear here.</p></div></header><div className="project-empty">No milestones have been published for members.</div></section>
    <section className="project-performance" id="analytics"><h2>Performance</h2><div className="performance-rail">{[
      {label:'Users',icon:Users,detail:'Goal and actual not published'},
      {label:'Cost vs Budget',icon:DollarSign,detail:'Not published'},
      {label:'Adoption Rate',icon:TrendingUp,detail:'Not published'},
      {label:'Forecasted Penetration',icon:Target,detail:'Not published'},
    ].map(({label,icon:Icon,detail})=><article key={label}><header><Icon/><span>{label}</span></header><strong>—</strong><small>{detail}</small><i><em style={{width:'0%'}}/></i></article>)}</div></section>
    <section className="project-tasks" id="tasks"><header><div><h2>Tasks</h2><p>Shared project work will appear here.</p></div></header><div className="project-empty"><ListTodo/> No tasks have been shared with members.</div></section>
  </div>
}

function ProjectsPage({ isAdmin }: { isAdmin: boolean }) {
  const initialSlug = window.location.pathname.split('/').filter(Boolean)[2]
  const [catalogProjects, setCatalogProjects] = useState<CatalogProject[]>(projects)
  const [selected, setSelected] = useState<CatalogProject | null>(() => projects.find(project => project.slug === initialSlug) || null)
  const [filter, setFilter] = useState('All projects')
  useEffect(() => { let active = true; void projectCatalogRequest().then(data => { if (!active) return; const managed = data.projects as Array<{slug:string;name:string;description:string;image_url:string}>; setCatalogProjects(projects.map(project => { const detail = managed.find(item => item.slug === project.slug); return detail ? { ...project, name: detail.name, description: detail.description, imageUrl: detail.image_url } : project })) }).catch(() => { /* Keep the approved catalog copy if managed data is unavailable. */ }); return () => { active = false } }, [isAdmin])
  const updateProject = (nextProject: CatalogProject) => { setCatalogProjects(current => current.map(item => item.slug === nextProject.slug ? nextProject : item)); setSelected(current => current?.slug === nextProject.slug ? nextProject : current) }
  const openProject = (project: CatalogProject) => { window.history.pushState({},'',`/member/projects/${project.slug}`); setSelected(project); window.scrollTo(0,0) }
  const closeProject = () => { window.history.pushState({},'','/member/projects'); setSelected(null); window.scrollTo(0,0) }
  useEffect(() => { const onPop = () => { const slug = window.location.pathname.split('/').filter(Boolean)[2]; setSelected(projects.find(project => project.slug === slug) || null) }; window.addEventListener('popstate', onPop); return () => window.removeEventListener('popstate', onPop) }, [])
  if (selected) return <MemberProjectDetailPage project={selected} onBack={closeProject} isAdmin={isAdmin} onProjectChange={updateProject}/>
  return <><div className="toolbar"><div className="filter-tabs">{['All projects','Available','Requested'].map(x=><button className={filter===x?'active':''} onClick={()=>setFilter(x)} key={x}>{x}</button>)}</div><label className="search"><Search size={18}/><input aria-label="Search projects" placeholder="Search projects" /></label></div><div className="project-catalog">{catalogProjects.map((p,i)=><article className="catalog-row" key={p.slug}><div className={`catalog-visual ${p.tone}`}>{p.imageUrl?<div className="catalog-visual-image" role="img" aria-label={`${p.name} project`} style={{backgroundImage:`url(${p.imageUrl})`}}/>:<span>{p.initials}</span>}</div><div><Status tone={p.tone}>{p.status}</Status><h2>{p.name}</h2><p>{p.description}</p><div className="meta-line"><span><Clock3/> {i===0?'Updated 2 days ago':'Updated this month'}</span><span><ShieldCheck/> {i===2?'General NDA required':'Member access'}</span></div></div><button className={i===2?'secondary-button':'text-button'} onClick={()=>i===2?undefined:openProject(p)}>{i===2?'Request access':'Open project'} <ArrowRight size={17}/></button></article>)}</div></>
}

type AgreementState = { configured: boolean; environment?: 'demo' | 'production'; status: string; completedAt?: string | null; error?: string }

async function memberAuthHeaders() {
  const { data, error } = await authClient.getSession()
  if (error || !data.session?.access_token) throw new Error('Your OSai session could not be verified. Please sign in again.')
  return { authorization: `Bearer ${data.session.access_token}` }
}

async function projectCatalogRequest() {
  const headers = await memberAuthHeaders()
  const response = await fetch('/api/projects', { cache: 'no-store', headers })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Could not load projects.')
  return data
}

function AgreementsPage() {
  const [agreement, setAgreement] = useState<AgreementState | null>(null)
  const [busy, setBusy] = useState(false)
  const loadAgreement = async () => {
    try {
      const headers = await memberAuthHeaders()
      const response = await fetch('/api/agreements', { cache: 'no-store', headers })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error === 'UNAUTHENTICATED' ? 'Your OSai session could not be verified. Please sign in again.' : data.error || 'We could not verify your agreement status.')
      setAgreement(data)
    } catch (error) {
      setAgreement({ configured: true, status: 'error', error: error instanceof Error ? error.message : 'We could not verify your agreement status.' })
    }
  }
  useEffect(() => { void loadAgreement() }, [])
  const signAgreement = async () => {
    setBusy(true)
    try {
      const headers = await memberAuthHeaders()
      const response = await fetch('/api/agreements/sign', { method: 'POST', headers })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error === 'DOCUSIGN_CONSENT_REQUIRED' ? 'DocuSign administrator consent is required before signing can begin.' : data.error || 'We could not open DocuSign.')
      window.location.assign(data.url)
    } catch (error) {
      setAgreement(current => ({ configured: current?.configured ?? true, status: 'error', error: error instanceof Error ? error.message : 'We could not open DocuSign.' }))
      setBusy(false)
    }
  }
  const signed = agreement?.status === 'general_nda_signed'
  const waiting = agreement?.status === 'general_nda_sent'
  const isDemo = agreement?.environment === 'demo'
  const completed = agreement?.completedAt ? new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(agreement.completedAt)) : '—'
  const bannerTitle = isDemo ? (signed ? 'Test agreement completed' : 'DocuSign sandbox connected') : signed ? 'Your access is current' : agreement?.configured === false ? 'DocuSign setup is required' : waiting ? 'Your signature is being verified' : 'Complete your General NDA'
  const bannerCopy = isDemo ? (signed ? 'This sandbox result does not grant access to confidential materials.' : 'This non-binding test verifies signing and status updates without granting real access.') : signed ? 'OSai verified this completed envelope with DocuSign.' : agreement?.configured === false ? 'Add the DocuSign developer-account credentials to connect this page.' : waiting ? 'Return to DocuSign if you still need to finish, or refresh this status after signing.' : 'Review and sign the current agreement in DocuSign before protected content is shown.'
  return <><PageHead title="Agreements" intro="Review the agreements connected to your OSai access." /><div className={`info-banner ${signed && !isDemo ? '' : 'agreement-action-needed'}`}><ShieldCheck/><span><strong>{bannerTitle}</strong><small>{bannerCopy}</small></span></div>{agreement?.error && <p className="agreement-error" role="alert">{agreement.error}</p>}<div className="data-list"><div className="data-head"><span>Agreement</span><span>Status</span><span>Completed</span><span></span></div><div className="data-row"><span className="title-cell"><FileCheck2/><span><strong>{isDemo ? 'General NDA test' : 'General NDA'}</strong><small>Version 1.0 · DocuSign{isDemo ? ' sandbox · TEST ONLY' : ''}</small></span></span>{agreement === null ? <Status tone="slate">Checking…</Status> : signed ? <Status>{isDemo ? 'Test completed' : 'Signed'}</Status> : waiting ? <Status tone="blue">{isDemo ? 'Test sent' : 'Sent'}</Status> : <Status tone="orange">{isDemo ? 'Test required' : 'Required'}</Status>}<span>{signed ? completed : '—'}</span>{signed ? <button className="text-button" onClick={loadAgreement}>Refresh status <ChevronRight/></button> : <button className="agreement-sign-button" onClick={signAgreement} disabled={busy || agreement === null || agreement?.configured === false}>{busy ? 'Opening DocuSign…' : waiting ? 'Continue signing' : isDemo ? 'Run signing test' : 'Review and sign'} <ChevronRight/></button>}</div><div className="data-row"><span className="title-cell"><FileText/><span><strong>Advanced Predictive Data acknowledgement</strong><small>Project agreement</small></span></span><Status tone="blue">Not required</Status><span>—</span><button className="text-button">About access <ChevronRight/></button></div></div></>
}

function BetaPage() { return <><PageHead title="Beta Programs" intro="Join invited previews and keep track of feedback you’ve shared." /><div className="split-feature"><div className="feature-copy"><Status tone="orange">Invitation</Status><h2>Career Pivot research preview</h2><p>Try an early guided experience and share what helps, what feels unclear, and what you would change.</p><ul><li><CalendarDays/> Invitation expires August 11, 2026</li><li><LockKeyhole/> Access is limited to invited participants</li></ul><div><button className="primary-button">Review invitation</button><button className="plain-button">Not now</button></div></div><div className="feature-panel"><FlaskConical/><strong>Your feedback stays connected</strong><p>Submissions remain linked to their original context and are reviewed by the project team.</p></div></div><section className="lower-section"><SectionHead title="Your participation"/><div className="empty-state"><MessageSquareText/><h3>No feedback submitted yet</h3><p>Your submissions and their review status will appear here.</p></div></section></> }

function UpdateList({limit=updates.length}:{limit?:number}) { return <div className="update-list">{updates.slice(0,limit).map(({title,detail,date,icon:Icon})=><a href="/member/updates" key={title}><span className="mini-icon"><Icon/></span><span><strong>{title}</strong><small>{detail}</small></span><time>{date}</time><ChevronRight/></a>)}</div> }
function UpdatesPage() { return <><PageHead title="Updates" intro="News and changes from the projects and programs you can access." /><div className="update-layout"><UpdateList/><aside><h3>Following</h3><p>You’re receiving updates for one project.</p><div className="following"><span className="project-avatar teal">AP</span><span><strong>Advanced Predictive Data</strong><small>Email and in-app updates</small></span></div><button className="secondary-button">Manage preferences</button></aside></div></> }
function NotificationsPage() { const [read,setRead]=useState<number[]>([]); const notes=['Your beta invitation is ready to review','Advanced Predictive Data published an update','Your General NDA was completed']; return <><PageHead title="Notifications" intro="Access, agreement, and project activity that needs your attention." /><div className="notification-actions"><button className="text-button" onClick={()=>setRead([0,1,2])}><Check/> Mark all as read</button></div><div className="notification-list">{notes.map((n,i)=><button onClick={()=>setRead([...read,i])} className={read.includes(i)?'read':''} key={n}><span className="notice-dot"/><span className="mini-icon">{i===0?<FlaskConical/>:i===1?<BookOpen/>:<FileCheck2/>}</span><span><strong>{n}</strong><small>{i===0?'Invitation expires August 11':i===1?'2 days ago':'July 18'}</small></span><ChevronRight/></button>)}</div></> }
type Milestone = { id: string; name: string; date: string; status: 'planned' | 'in_progress' | 'completed' }
type ProjectTask = { id: string; name: string; description: string; status: 'to_do' | 'in_progress' | 'completed'; dueDate: string }
type AdminProject = { id: string; name: string; slug: string; description: string; status: string; access_level: string }
type AdminProjectDetail = AdminProject & { image_url: string; user_goal: number; user_actual: number; cost_budget: number; cost_actual: number; adoption_rate: number; forecast_penetration: number; milestones: Milestone[]; tasks: ProjectTask[] }
type UserProject = { id: string; name: string; role: string; status: string }
type AdminProfile = { auth_user_id: string; email: string; display_name: string; role: 'member' | 'admin'; status: 'pending_approval' | 'approved' | 'declined' | 'revoked'; project_count: number; projects: UserProject[] }
const emptyProject = { name: '', slug: '', description: '', status: 'draft', accessLevel: 'member' }
function normalizeProjectSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

async function adminRequest(path: string, init?: RequestInit) {
  const headers = await memberAuthHeaders()
  const response = await fetch(path, { ...init, cache: 'no-store', headers: { ...headers, ...(init?.body ? { 'content-type': 'application/json' } : {}) } })
  const data = response.status === 204 ? null : await response.json()
  if (!response.ok) throw new Error(data?.error || 'The administrator action failed.')
  return data
}

function AdminUsersPage() {
  const [profiles, setProfiles] = useState<AdminProfile[]>([])
  const [message, setMessage] = useState('Loading profiles…')
  const load = async () => { try { const data = await adminRequest('/api/admin/profiles'); setProfiles(data.profiles); setMessage('') } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not load profiles.') } }
  useEffect(() => { void load() }, [])
  const changeRole = async (profile: AdminProfile, role: 'member' | 'admin') => { try { await adminRequest('/api/admin/profiles', { method: 'PATCH', body: JSON.stringify({ authUserId: profile.auth_user_id, role }) }); await load() } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not update the role.') } }
  return <><PageHead title="Users" intro="Review user access, administrator rights, and project involvement." />{message&&<p className="profile-message" role="status">{message}</p>}<div className="admin-table user-directory"><div className="admin-table-head"><span>User</span><span>Account status</span><span>Projects</span><span>Role</span></div>{profiles.map(profile=><article className="admin-person" key={profile.auth_user_id}><span className="user-identity"><strong>{profile.display_name}{profile.role==='admin'&&<em>Admin</em>}</strong><small>{profile.email}</small><code>{profile.auth_user_id}</code></span><Status tone={profile.status==='approved'?'teal':profile.status==='pending_approval'?'orange':'slate'}>{profile.status.replaceAll('_',' ')}</Status><span className="user-projects"><strong>{profile.project_count} {profile.project_count===1?'project':'projects'}</strong>{profile.projects.length?<ul>{profile.projects.map(project=><li key={project.id}><span><b>{project.name}</b><small>{project.role}</small></span><Status tone={project.status==='project_access_approved'?'teal':project.status.includes('declined')||project.status.includes('revoked')?'slate':'orange'}>{project.status.replace('project_','').replaceAll('_',' ')}</Status></li>)}</ul>:<small>No project involvement</small>}</span><select aria-label={`Role for ${profile.display_name}`} value={profile.role} onChange={event=>void changeRole(profile,event.target.value as 'member'|'admin')}><option value="member">Member</option><option value="admin">Administrator</option></select></article>)}</div></>
}

function progress(value: number, total = 100) { return total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0 }
function money(value: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value) }
function projectDetailFromApi(project: AdminProjectDetail): AdminProjectDetail {
  return { ...project, user_goal: Number(project.user_goal), user_actual: Number(project.user_actual), cost_budget: Number(project.cost_budget), cost_actual: Number(project.cost_actual), adoption_rate: Number(project.adoption_rate), forecast_penetration: Number(project.forecast_penetration), milestones: project.milestones || [], tasks: project.tasks || [] }
}

function AdminProjectDetailPage({ projectId, onBack }: { projectId: string; onBack: () => void }) {
  const [project, setProject] = useState<AdminProjectDetail | null>(null)
  const [draft, setDraft] = useState<AdminProjectDetail | null>(null)
  const [editing, setEditing] = useState(false)
  const [message, setMessage] = useState('Loading project…')
  useEffect(() => { let active = true; void adminRequest(`/api/admin/projects/${projectId}`).then(data => { if (!active) return; const next = projectDetailFromApi(data.project); setProject(next); setDraft(next); setMessage('') }).catch(error => { if (active) setMessage(error instanceof Error ? error.message : 'Could not load the project.') }); return () => { active = false } }, [projectId])
  if (!project || !draft) return <><button className="project-back" onClick={onBack}><ArrowLeft/> Manage Projects</button><p className="profile-message" role="status">{message}</p></>
  const setNumber = (key: 'user_goal' | 'cost_budget' | 'cost_actual' | 'adoption_rate' | 'forecast_penetration', value: string) => setDraft({ ...draft, [key]: Math.max(0, Number(value) || 0) })
  const save = async () => { try { setMessage('Saving…'); await adminRequest(`/api/admin/projects/${projectId}`, { method: 'PATCH', body: JSON.stringify({ name: draft.name, slug: draft.slug, description: draft.description, status: draft.status, accessLevel: draft.access_level }) }); await adminRequest(`/api/admin/projects/${projectId}`, { method: 'PATCH', body: JSON.stringify({ dashboard: { imageUrl: draft.image_url, userGoal: draft.user_goal, costBudget: draft.cost_budget, costActual: draft.cost_actual, adoptionRate: draft.adoption_rate, forecastPenetration: draft.forecast_penetration, milestones: draft.milestones, tasks: draft.tasks } }) }); setProject(draft); setEditing(false); setMessage('Project dashboard saved.') } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save the project dashboard.') } }
  const updateMilestone = (id: string, values: Partial<Milestone>) => setDraft({ ...draft, milestones: draft.milestones.map(item => item.id === id ? { ...item, ...values } : item) })
  const updateTask = (id: string, values: Partial<ProjectTask>) => setDraft({ ...draft, tasks: draft.tasks.map(item => item.id === id ? { ...item, ...values } : item) })
  const addMilestone = () => setDraft({ ...draft, milestones: [...draft.milestones, { id: crypto.randomUUID(), name: 'New milestone', date: '', status: 'planned' }] })
  const addTask = () => setDraft({ ...draft, tasks: [...draft.tasks, { id: crypto.randomUUID(), name: 'New task', description: '', status: 'to_do', dueDate: '' }] })
  const initials = project.name.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase()
  const metrics = [
    { label: 'Users', icon: Users, value: project.user_actual, detail: `Goal ${draft.user_goal.toLocaleString()} · Actual ${project.user_actual.toLocaleString()}`, percent: progress(project.user_actual, draft.user_goal), fields: editing ? <label>Goal<input type="number" min="0" value={draft.user_goal} onChange={event => setNumber('user_goal', event.target.value)}/></label> : null },
    { label: 'Cost vs Budget', icon: DollarSign, value: money(draft.cost_actual), detail: `${money(draft.cost_actual)} of ${money(draft.cost_budget)}`, percent: progress(draft.cost_actual, draft.cost_budget), fields: editing ? <><label>Cost<input type="number" min="0" value={draft.cost_actual} onChange={event => setNumber('cost_actual', event.target.value)}/></label><label>Budget<input type="number" min="0" value={draft.cost_budget} onChange={event => setNumber('cost_budget', event.target.value)}/></label></> : null },
    { label: 'Adoption Rate', icon: TrendingUp, value: `${draft.adoption_rate}%`, detail: 'of target users', percent: draft.adoption_rate, fields: editing ? <label>Rate<input type="number" min="0" max="100" value={draft.adoption_rate} onChange={event => setNumber('adoption_rate', event.target.value)}/></label> : null },
    { label: 'Forecasted Penetration', icon: Target, value: `${draft.forecast_penetration}%`, detail: 'of defined market', percent: draft.forecast_penetration, fields: editing ? <label>Forecast<input type="number" min="0" max="100" value={draft.forecast_penetration} onChange={event => setNumber('forecast_penetration', event.target.value)}/></label> : null },
  ]
  return <div className="project-detail">
    <nav className="project-section-links" aria-label="Project administration"><a href="/member/admin-projects" onClick={event=>{event.preventDefault();onBack()}}>Manage Projects</a><a href="#overview">Overview</a><a href="#tasks">Tasks</a><a href="#analytics">Analytics</a><a href="#reports">Reports</a><a href="/member/admin-users">Users</a><a href="#settings">Settings</a></nav>
    <div className="project-detail-nav"><a className="project-back" href="/member/admin-projects" onClick={event=>{event.preventDefault();onBack()}}><ArrowLeft/> All projects</a><div>{editing?<><button className="text-link" onClick={()=>{setDraft(project);setEditing(false)}}>Cancel</button><button className="text-link text-link-primary" onClick={()=>void save()}>Save project</button></>:<button className="text-link text-link-primary" onClick={()=>setEditing(true)}><Pencil/> Edit project</button>}</div></div>
    <section className="project-identity admin-project-identity" id="overview"><div className="project-cover admin-hover-edit">{draft.image_url?<div className="project-cover-image admin-hover-content" role="img" aria-label={`${project.name} project`} style={{backgroundImage:`url(${draft.image_url})`}}/>:<span className="admin-hover-content"><ImageIcon/><b>{initials}</b></span>}{!editing&&<div className="admin-hover-actions">{draft.image_url?<><button type="button" onClick={()=>setEditing(true)}><Pencil/> Edit</button><button type="button" onClick={()=>{setDraft({...draft,image_url:''});setEditing(true)}}><Trash2/> Delete</button></>:<button type="button" onClick={()=>setEditing(true)}><ImageIcon/> Upload</button>}</div>}</div><div>{editing?<><label>Title<input value={draft.name} onChange={event=>setDraft({...draft,name:event.target.value})}/></label><label>Brief<textarea value={draft.description} onChange={event=>setDraft({...draft,description:event.target.value})}/></label><label>Project image URL<input value={draft.image_url} onChange={event=>setDraft({...draft,image_url:event.target.value})}/></label></>:<><div className="admin-hover-edit admin-title-edit"><h1 className="admin-hover-content">{project.name}</h1><div className="admin-hover-actions"><button type="button" onClick={()=>setEditing(true)}><Pencil/> Edit</button></div></div><div className="admin-hover-edit admin-description-edit"><p className="admin-hover-content">{project.description||'No project brief has been added.'}</p><div className="admin-hover-actions"><button type="button" onClick={()=>setEditing(true)}><Pencil/> Edit</button></div></div></>}</div></section>
    {message&&<p className="profile-message" role="status">{message}</p>}
    <section className="project-milestones" id="reports"><header><div><h2>Milestones</h2><p>Track the stages that move this project forward.</p></div>{editing&&<button className="add-button" onClick={addMilestone}><Plus/> Add Milestone</button>}</header>{draft.milestones.length?<div className="milestone-track">{draft.milestones.map(item=><article className={`milestone-${item.status}`} key={item.id}><i/><div>{editing?<><input aria-label="Milestone name" value={item.name} onChange={event=>updateMilestone(item.id,{name:event.target.value})}/><input aria-label="Milestone date" type="date" value={item.date} onChange={event=>updateMilestone(item.id,{date:event.target.value})}/><select aria-label="Milestone status" value={item.status} onChange={event=>updateMilestone(item.id,{status:event.target.value as Milestone['status']})}><option value="planned">Planned</option><option value="in_progress">In progress</option><option value="completed">Completed</option></select><button className="icon-action danger-action" aria-label={`Remove ${item.name}`} onClick={()=>setDraft({...draft,milestones:draft.milestones.filter(value=>value.id!==item.id)})}><Trash2/></button></>:<><strong>{item.name}</strong><time>{item.date||'Date not set'}</time><Status tone={item.status==='completed'?'teal':item.status==='in_progress'?'blue':'slate'}>{item.status.replace('_',' ')}</Status></>}</div></article>)}</div>:<div className="project-empty">No milestones yet. Add the first stage for this project.</div>}</section>
    <section className="project-performance" id="analytics"><h2>Performance</h2><div className="performance-rail">{metrics.map(({label,icon:Icon,value,detail,percent,fields})=><article key={label}><header><Icon/><span>{label}</span></header><strong>{value}</strong><small>{detail}</small><i><em style={{width:`${percent}%`}}/></i>{fields&&<div className="metric-fields">{fields}</div>}</article>)}</div></section>
    <section className="project-tasks" id="tasks"><header><div><h2>Tasks</h2><p>Manage the work required to reach each milestone.</p></div>{editing&&<button className="add-button" onClick={addTask}><Plus/> Add task</button>}</header>{draft.tasks.length?<div className="task-list"><div className="task-head"><span>Task</span><span>Status</span><span>Due date</span><span/></div>{draft.tasks.map(item=><article key={item.id}><ListTodo/><div>{editing?<><input aria-label="Task name" value={item.name} onChange={event=>updateTask(item.id,{name:event.target.value})}/><input aria-label="Task description" value={item.description} onChange={event=>updateTask(item.id,{description:event.target.value})}/></>:<><strong>{item.name}</strong><small>{item.description||'No description added.'}</small></>}</div>{editing?<select aria-label={`Status for ${item.name}`} value={item.status} onChange={event=>updateTask(item.id,{status:event.target.value as ProjectTask['status']})}><option value="to_do">To do</option><option value="in_progress">In progress</option><option value="completed">Completed</option></select>:<Status tone={item.status==='completed'?'teal':item.status==='in_progress'?'blue':'orange'}>{item.status.replaceAll('_',' ')}</Status>}{editing?<input aria-label={`Due date for ${item.name}`} type="date" value={item.dueDate} onChange={event=>updateTask(item.id,{dueDate:event.target.value})}/>:<time>{item.dueDate||'Not set'}</time>}{editing&&<button className="icon-action danger-action" aria-label={`Remove ${item.name}`} onClick={()=>setDraft({...draft,tasks:draft.tasks.filter(value=>value.id!==item.id)})}><Trash2/></button>}</article>)}</div>:<div className="project-empty"><ListTodo/> No tasks yet. Add tasks to track work for this project.</div>}</section>
    <span id="settings"/>
  </div>
}

function AdminProjectsPage() {
  const [items, setItems] = useState<AdminProject[]>([])
  const initialProjectId = window.location.pathname.split('/').filter(Boolean)[2]
  const [selected, setSelected] = useState<string | null>(initialProjectId || null)
  const [editing, setEditing] = useState<string | 'new' | null>(null)
  const [form, setForm] = useState(emptyProject)
  const [message, setMessage] = useState('Loading projects…')
  const load = async () => { try { const data = await adminRequest('/api/admin/projects'); setItems(data.projects); setMessage('') } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not load projects.') } }
  useEffect(() => { void load() }, [])
  useEffect(() => { const onPop = () => setSelected(window.location.pathname.split('/').filter(Boolean)[2] || null); window.addEventListener('popstate', onPop); return () => window.removeEventListener('popstate', onPop) }, [])
  const beginEdit = (project: AdminProject) => { setEditing(project.id); setForm({ name: project.name, slug: project.slug, description: project.description, status: project.status, accessLevel: project.access_level }) }
  const save = async (event: FormEvent) => { event.preventDefault(); try { await adminRequest(editing === 'new' ? '/api/admin/projects' : `/api/admin/projects/${editing}`, { method: editing === 'new' ? 'POST' : 'PATCH', body: JSON.stringify(form) }); setEditing(null); setForm(emptyProject); await load() } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save the project.') } }
  const remove = async (project: AdminProject) => { if (!window.confirm(`Remove ${project.name}? This cannot be undone.`)) return; try { await adminRequest(`/api/admin/projects/${project.id}`, { method: 'DELETE' }); await load() } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not remove the project.') } }
  const openProject = (projectId: string) => { window.history.pushState({},'',`/member/admin-projects/${projectId}`); setSelected(projectId); window.scrollTo(0,0) }
  const closeProject = () => { window.history.pushState({},'','/member/admin-projects'); setSelected(null); window.scrollTo(0,0) }
  if (selected) return <AdminProjectDetailPage projectId={selected} onBack={closeProject}/>
  return <><div className="admin-actions"><button className="primary-button" onClick={()=>{setEditing('new');setForm(emptyProject)}}><Plus/> Add project</button></div>{message&&<p className="profile-message" role="status">{message}</p>}{editing&&<form className="admin-project-form" onSubmit={save}><label>Name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Slug<input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" title="Use lowercase letters, numbers, and hyphens." value={form.slug} onChange={e=>setForm({...form,slug:normalizeProjectSlug(e.target.value)})}/><small>Spaces and special characters are converted to hyphens.</small></label><label className="wide">Description<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label><label>Access level<select value={form.accessLevel} onChange={e=>setForm({...form,accessLevel:e.target.value})}><option value="public">Public</option><option value="member">Member</option><option value="general_nda">General NDA</option><option value="project_nda">Project NDA</option><option value="beta">Beta</option><option value="internal">Internal</option></select></label><div className="wide form-actions"><button className="primary-button">Save project</button><button type="button" className="plain-button" onClick={()=>setEditing(null)}>Cancel</button></div></form>}{!message&&!editing&&items.length===0?<div className="admin-project-empty"><ImageIcon/><h2>No managed projects yet</h2><p>Add a project to create its image, performance, milestone, and task dashboard.</p><button className="text-link text-link-primary" onClick={()=>{setEditing('new');setForm(emptyProject)}}><Plus/> Add the first project</button></div>:<div className="admin-project-list">{items.map(project=><article key={project.id}><button className="project-open" onClick={()=>openProject(project.id)}><span><strong>{project.name}</strong><small>/{project.slug} · {project.access_level.replace('_',' ')}</small><p>{project.description||'No description added.'}</p></span><ChevronRight/></button><Status tone={project.status==='published'?'teal':project.status==='archived'?'slate':'orange'}>{project.status}</Status><button aria-label={`Edit ${project.name}`} onClick={()=>beginEdit(project)}><Pencil/></button><button className="danger-action" aria-label={`Remove ${project.name}`} onClick={()=>void remove(project)}><Trash2/></button></article>)}</div>}</>
}

type MemberIdentity = { name: string, email: string, initials: string }

function identityFromUser(user?: { name?: string | null, email?: string | null }): MemberIdentity {
  const name = user?.name?.trim() || user?.email?.split('@')[0] || 'OSai member'
  const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'OS'
  return { name, email: user?.email || '', initials }
}

function ProfilePage({ identity, onSaved }: { identity: MemberIdentity, onSaved: (identity: MemberIdentity) => void }) {
  const nameParts = identity.name.split(/\s+/)
  const [firstName, setFirstName] = useState(nameParts[0] || '')
  const [lastName, setLastName] = useState(nameParts.slice(1).join(' '))
  const [email, setEmail] = useState(identity.email)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [securityPanel, setSecurityPanel] = useState<'password' | 'notifications' | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [notificationPreferences, setNotificationPreferences] = useState(() => {
    try {
      const stored = window.localStorage.getItem('osai.notification-preferences.v1')
      return stored ? JSON.parse(stored) as { email: boolean, inApp: boolean, projectUpdates: boolean, betaInvitations: boolean } : { email: true, inApp: true, projectUpdates: true, betaInvitations: true }
    } catch { return { email: true, inApp: true, projectUpdates: true, betaInvitations: true } }
  })
  const [preferencesSaved, setPreferencesSaved] = useState(false)
  useEffect(() => {
    const nextNameParts = identity.name.split(/\s+/)
    setFirstName(nextNameParts[0] || '')
    setLastName(nextNameParts.slice(1).join(' '))
  }, [identity.name])
  useEffect(() => setEmail(identity.email), [identity.email])
  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const first = firstName.trim()
    const last = lastName.trim()
    if (!first || !last) {
      setStatus('error')
      setMessage('Enter both your first and last name.')
      return
    }
    setStatus('saving')
    setMessage('')
    const nextEmail = email.trim().toLowerCase()
    if (!nextEmail) {
      setStatus('error')
      setMessage('Enter a valid email address.')
      return
    }
    const name = `${first} ${last}`
    const nameResult = await emailAuthClient.updateUser({ name })
    if (nameResult.error || !nameResult.data?.status) {
      setStatus('error')
      setMessage(nameResult.error?.message || 'We could not save your name. Please try again.')
      return
    }
    const updatedIdentity = identityFromUser({ name, email: identity.email })
    onSaved(updatedIdentity)
    if (nextEmail !== identity.email.toLowerCase()) {
      const emailResult = await emailAuthClient.changeEmail({
        newEmail: nextEmail,
        callbackURL: `${window.location.origin}/member/profile`,
      })
      if (emailResult.error || !emailResult.data?.status) {
        setStatus('error')
        setMessage(`Your name was saved, but we could not start the email change. ${emailResult.error?.message || 'Please try again.'}`)
        return
      }
      setStatus('saved')
      setMessage(`Your name was saved. Check ${nextEmail} to verify your new sign-in email.`)
      return
    }
    setStatus('saved')
    setMessage('Your profile changes have been saved.')
  }
  const clearStatus = () => { setStatus('idle'); setMessage('') }
  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (newPassword.length < 8) { setPasswordStatus('error'); setPasswordMessage('Use at least 8 characters for your new password.'); return }
    if (newPassword !== confirmPassword) { setPasswordStatus('error'); setPasswordMessage('The new passwords do not match.'); return }
    setPasswordStatus('saving'); setPasswordMessage('')
    const result = await emailAuthClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: false })
    if (result.error || !result.data?.user) { setPasswordStatus('error'); setPasswordMessage(result.error?.message || 'We could not update your password.'); return }
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setPasswordStatus('saved'); setPasswordMessage('Your password has been updated.')
  }
  const savePreferences = () => {
    try { window.localStorage.setItem('osai.notification-preferences.v1', JSON.stringify(notificationPreferences)) } catch { /* Preferences still apply for this session. */ }
    setPreferencesSaved(true)
  }
  const togglePreference = (key: keyof typeof notificationPreferences) => { setNotificationPreferences((current) => ({ ...current, [key]: !current[key] })); setPreferencesSaved(false) }
  return <><PageHead title="Profile & Security" intro="Manage your member profile, sign-in details, and notification preferences." /><div className="settings-layout"><section><h2>Profile</h2><div className="avatar-editor"><span>{identity.initials}</span><div><strong>{identity.name}</strong><small>OSai member</small></div></div><form onSubmit={saveProfile}><div className="form-grid"><label>First name<input required autoComplete="given-name" value={firstName} onChange={(event)=>{setFirstName(event.target.value);clearStatus()}}/></label><label>Last name<input required autoComplete="family-name" value={lastName} onChange={(event)=>{setLastName(event.target.value);clearStatus()}}/></label><label className="wide">Email<input type="email" required autoComplete="email" value={email} onChange={(event)=>{setEmail(event.target.value);clearStatus()}}/><small>Changing your sign-in email requires verification at the new address.</small></label></div>{message&&<p className={`profile-message ${status==='error'?'error':''}`} role={status==='error'?'alert':'status'}>{message}</p>}<button className="primary-button" disabled={status==='saving'}>{status==='saving'?'Saving…':status==='saved'?'Saved':'Save changes'}</button></form></section><aside><h2>Security</h2><button className="security-row" type="button" aria-expanded={securityPanel==='password'} onClick={()=>setSecurityPanel(securityPanel==='password'?null:'password')}><KeyRound/><span><strong>Password</strong><small>Update your password</small></span><ChevronRight/></button>{securityPanel==='password'&&<form className="security-panel" onSubmit={changePassword}><label>Current password<input type="password" required autoComplete="current-password" value={currentPassword} onChange={(event)=>{setCurrentPassword(event.target.value);setPasswordStatus('idle')}}/></label><label>New password<input type="password" required minLength={8} autoComplete="new-password" value={newPassword} onChange={(event)=>{setNewPassword(event.target.value);setPasswordStatus('idle')}}/></label><label>Confirm new password<input type="password" required minLength={8} autoComplete="new-password" value={confirmPassword} onChange={(event)=>{setConfirmPassword(event.target.value);setPasswordStatus('idle')}}/></label>{passwordMessage&&<p className={`profile-message ${passwordStatus==='error'?'error':''}`} role={passwordStatus==='error'?'alert':'status'}>{passwordMessage}</p>}<button className="primary-button" disabled={passwordStatus==='saving'}>{passwordStatus==='saving'?'Updating…':'Update password'}</button></form>}<button className="security-row" type="button" aria-expanded={securityPanel==='notifications'} onClick={()=>setSecurityPanel(securityPanel==='notifications'?null:'notifications')}><BellRing/><span><strong>Notification preferences</strong><small>Choose what OSai sends you</small></span><ChevronRight/></button>{securityPanel==='notifications'&&<div className="security-panel preference-panel"><label><input type="checkbox" checked={notificationPreferences.email} onChange={()=>togglePreference('email')}/><span><strong>Email notifications</strong><small>Receive enabled updates by email</small></span></label><label><input type="checkbox" checked={notificationPreferences.inApp} onChange={()=>togglePreference('inApp')}/><span><strong>In-app notifications</strong><small>Show enabled updates in the member hub</small></span></label><label><input type="checkbox" checked={notificationPreferences.projectUpdates} onChange={()=>togglePreference('projectUpdates')}/><span><strong>Project updates</strong><small>News from projects you follow</small></span></label><label><input type="checkbox" checked={notificationPreferences.betaInvitations} onChange={()=>togglePreference('betaInvitations')}/><span><strong>Beta invitations</strong><small>Invitations and beta-program reminders</small></span></label>{preferencesSaved&&<p className="profile-message" role="status">Your notification preferences have been saved.</p>}<button className="primary-button" type="button" onClick={savePreferences}>Save preferences</button></div>}</aside></div></> }

function PageHead({title,intro}:{title:string,intro:string}) { return <header className="member-page-head"><h1>{title}</h1><p>{intro}</p></header> }
function MemberHub() {
  const initial = window.location.pathname.split('/').filter(Boolean)[1] || 'dashboard'
  const [page,setPage]=useState(initial)
  const [navOpen,setNavOpen]=useState(false)
  const [userMenuOpen,setUserMenuOpen]=useState(false)
  const [identity,setIdentity]=useState<MemberIdentity>(()=>identityFromUser())
  const [role,setRole]=useState<'member'|'admin'>('member')
  useEffect(()=>{ const onPop=()=>setPage(window.location.pathname.split('/').filter(Boolean)[1]||'dashboard'); window.addEventListener('popstate',onPop); return()=>window.removeEventListener('popstate',onPop)},[])
  useEffect(()=>{ if(!userMenuOpen)return; const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setUserMenuOpen(false)}; window.addEventListener('keydown',close); return()=>window.removeEventListener('keydown',close)},[userMenuOpen])
  useEffect(()=>{ authClient.getSession().then(async({data})=>{ if(data?.session?.user)setIdentity(identityFromUser(data.session.user)); if(data?.session?.access_token){ const response=await fetch('/api/me',{headers:{authorization:`Bearer ${data.session.access_token}`}}); const result=await response.json(); if(response.ok&&result.profile?.role==='admin')setRole('admin') } }) },[])
  const navigate=(slug:string)=>{window.history.pushState({},'',`/member/${slug}`);setPage(slug);setNavOpen(false);window.scrollTo(0,0)}
  const signOut=async()=>{setUserMenuOpen(false);await authClient.signOut();window.location.assign('/auth/sign-in')}
  const screens:Record<string,ReactNode>={dashboard:<Dashboard/>,projects:<ProjectsPage isAdmin={role==='admin'}/>,agreements:<AgreementsPage/>,'beta-programs':<BetaPage/>,updates:<UpdatesPage/>,notifications:<NotificationsPage/>,profile:<ProfilePage identity={identity} onSaved={setIdentity}/>,...(role==='admin'?{'admin-users':<AdminUsersPage/>,'admin-projects':<AdminProjectsPage/>}:{})}
  const visibleNav = role === 'admin' ? [...memberNav, ...adminNav] : memberNav
  return <div className="member-shell"><aside className={`member-sidebar ${navOpen?'open':''}`}><div className="member-brand"><a href="/" aria-label="Orbit Systems home"><Image src="/osai-header-logo.png" alt="Orbit Systems — Augmented Intelligence" width={1196} height={399} priority /></a></div><nav aria-label="Member navigation">{visibleNav.map(({slug,label,icon:Icon,count})=><a href={`/member/${slug}`} className={`${page===slug?'active':''}${slug==='notifications'?' nav-bottom-start':''}`} onClick={(e)=>{e.preventDefault();navigate(slug)}} key={slug}><Icon/><span>{label}</span>{count?<b>{count}</b>:null}</a>)}</nav></aside><div className="member-main"><header className="member-topbar"><button className="member-menu" onClick={()=>setNavOpen(!navOpen)} aria-label="Open navigation"><Menu/></button><span className="topbar-title">{role==='admin'?'Admin Hub':'Member Hub'}</span><div><button aria-label="Help"><MessageSquareText/></button><a href="/member/notifications" onClick={(e)=>{e.preventDefault();navigate('notifications')}}><Bell/><b>3</b></a><div className="member-account"><button className="user-chip" type="button" aria-label="Open account menu" aria-expanded={userMenuOpen} aria-haspopup="menu" onClick={()=>setUserMenuOpen(!userMenuOpen)}><Menu/></button>{userMenuOpen&&<div className="member-account-menu" role="menu"><button type="button" role="menuitem" onClick={()=>{setUserMenuOpen(false);navigate('profile')}}><User/>Profile</button><button type="button" role="menuitem" onClick={()=>{setUserMenuOpen(false);navigate('notifications')}}><Bell/>Notifications</button><button type="button" role="menuitem" onClick={signOut}><LogOut/>Sign Out</button></div>}</div></div></header><main className="member-content">{screens[page]||<Dashboard/>}</main></div>{navOpen&&<button className="nav-scrim" onClick={()=>setNavOpen(false)} aria-label="Close navigation"/>}</div>
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
