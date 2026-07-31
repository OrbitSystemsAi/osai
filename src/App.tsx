'use client'

import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import Image from 'next/image'
import {
  ArrowLeft, ArrowRight, Bell, BellRing, BookOpen, CalendarDays, Check,
  ChevronRight, Clock3, FileCheck2, FileText, FlaskConical,
  FolderKanban, Hourglass, KeyRound, LayoutDashboard, LockKeyhole, Mail, Menu,
  DollarSign, ImageIcon, ListTodo, MessageSquareText, Orbit, Pencil, Plus, Search,
  LogOut, ShieldCheck, Target, Trash2, TrendingUp, Upload, User, UserCog, Users, X,
} from 'lucide-react'
import AuthPage from './AuthPage'
import { authClient, emailAuthClient } from './auth'

const services = [
  { name: 'OSai Ventures', text: 'We co-build and back ventures with exceptional founders. From first conviction to scaling growth, we provide capital, hands-on partnership, and a network that accelerates what’s next.', icon: Orbit },
  { name: 'OSai Innovation', text: 'We help organizations turn bold ideas into real-world solutions. Our innovation programs blend strategy, design, and emerging technology to create products and ventures that drive lasting impact.', icon: Orbit },
  { name: 'OSai Consulting', text: 'We solve complex business and technology challenges. From market strategy to operating model and technology roadmaps, we deliver clarity and results that move your business forward.', icon: Orbit },
]

const stages = ['Discover', 'Validate', 'Define', 'Build', 'Launch', 'Advance']
const PROJECT_TITLE_MAX = 40
const PROJECT_DESCRIPTION_MAX = 300
type MemberNavItem = { slug: string; label: string; icon: typeof LayoutDashboard; count?: number }
const memberNav: MemberNavItem[] = [
  { slug: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { slug: 'projects', label: 'Projects', icon: FolderKanban },
  { slug: 'legal', label: 'Legal', icon: FileCheck2 },
  { slug: 'beta-programs', label: 'Beta Programs', icon: FlaskConical },
  { slug: 'updates', label: 'Updates', icon: BookOpen },
]
const sidebarUtilityNav: MemberNavItem[] = [
  { slug: 'profile', label: 'Profile', icon: User },
  { slug: 'notifications', label: 'Notifications', icon: Bell },
]
const adminNav: MemberNavItem[] = [
  { slug: 'admin-users', label: 'Users', icon: UserCog, count: 0 },
]

type CatalogProject = { id?: string; slug: string; name: string; description: string; status: string; tone: string; initials: string; imageUrl?: string; accessLevel?: string }
const projects: CatalogProject[] = []
const projectPitchSections = ['Control Panel', 'Problem', 'Solution', 'Competition', 'Market', 'Traction', 'Team', 'Business Model', 'Invest']
function ProjectPitchLinks({ active, onSelect }: { active?: string; onSelect?: (section: string) => void }) { return <nav className="project-pitch-links" aria-label="Project presentation sections">{projectPitchSections.map(label=><a className={active===label?'active':undefined} key={label} href={`#${label.toLowerCase().replaceAll(' ','-')}`} onClick={onSelect?event=>{event.preventDefault();onSelect(label)}:undefined}>{label}</a>)}</nav> }
const catalogProjectFromApi = (project: { id?:string; slug:string; name:string; description:string; image_url:string; access_level:string }, index: number, isAdmin: boolean): CatalogProject => ({
  id: project.id,
  slug: project.slug,
  name: project.name,
  description: project.description,
  imageUrl: project.image_url,
  accessLevel: project.access_level,
  status: isAdmin ? 'Full access' : ['public','member'].includes(project.access_level) ? 'Member overview' : 'Request access',
  tone: ['teal','blue','slate'][index % 3],
  initials: project.name.split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]).join('').toUpperCase() || 'OS',
})

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

function ProjectSnapshot({ project, available = false }: { project: CatalogProject, available?: boolean }) {
  return <a className="snapshot-tile" href="/member/projects">
    <span className={`snapshot-mark ${project.tone}`}>{project.initials}</span>
    <span className="snapshot-copy"><small>{available ? 'Available to you' : 'Current project'}</small><strong>{project.name}</strong><span>{project.description}</span></span>
    <span className="snapshot-foot"><Status tone={project.tone}>{project.status}</Status><ChevronRight /></span>
  </a>
}

function Dashboard() {
  const currentProjects = projects.filter(project => project.status !== 'Request access')
  const availableProjects = projects.filter(project => project.status === 'Request access')
  return <><PageHead title="Dashboard" intro="" />
    <div className="dashboard-page-header"><span>Overview</span></div>
    <div className="info-banner dashboard-notice"><LayoutDashboard/><span><strong>Dashboard overview</strong><small>Your project, invitation, and activity information is organized below.</small></span></div>
    <div className="modular-dashboard">
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
  </>
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
  const saveImage = async (nextImageUrl: string) => { const record = await ensureAdminProject(); await adminRequest(`/api/admin/projects/${record.id}`, { method: 'PATCH', body: JSON.stringify({ dashboard: { imageUrl: nextImageUrl, userGoal: record.user_goal, costBudget: record.cost_budget, costActual: record.cost_actual, adoptionRate: record.adoption_rate, forecastPenetration: record.forecast_penetration, milestones: record.milestones, tasks: record.tasks, problemContent:record.problem_content } }) }); setImageUrl(nextImageUrl); setAdminProject({ ...record, image_url: nextImageUrl }); onProjectChange({ ...project, name, description, imageUrl: nextImageUrl }) }
  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; event.target.value = ''; if (!file) return; if (!['image/jpeg','image/png','image/webp'].includes(file.type)) { setAdminMessage('Use a JPG, PNG, or WebP image.'); return } if (file.size > 2 * 1024 * 1024) { setAdminMessage('Choose an image smaller than 2 MB.'); return } try { setAdminMessage('Uploading…'); const dataUrl = await new Promise<string>((resolve,reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error('Could not read the image.')); reader.readAsDataURL(file) }); await saveImage(dataUrl); setAdminMessage('') } catch (error) { setAdminMessage(error instanceof Error ? error.message : 'Could not upload the image.') } }
  const openAdminSection = async (section: 'milestones' | 'tasks') => { try { const record = await ensureAdminProject(); window.location.href = `/member/projects?adminEdit=${record.id}&edit=${section}#${section === 'milestones' ? 'reports' : 'tasks'}` } catch (error) { setAdminMessage(error instanceof Error ? error.message : 'Could not open project editing.') } }
  const cover = <div className={`project-cover project-cover-${project.tone}${isAdmin?' admin-hover-edit':''}`}>{imageUrl?<div className="project-cover-image admin-hover-content" role="img" aria-label={`${name} project`} style={{backgroundImage:`url(${imageUrl})`}}/>:<span className={isAdmin?'admin-hover-content':undefined}><ImageIcon/><b>{project.initials}</b></span>}{isAdmin&&<div className="admin-hover-actions">{imageUrl&&<button type="button" onClick={()=>void saveImage('')}><Trash2/> Delete</button>}<label className="admin-hover-label"><ImageIcon/> {imageUrl?'Edit':'Upload'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event=>void uploadImage(event)}/></label></div>}</div>
  const title = isAdmin?(editingPart==='title'?<div className="admin-inline-editor"><input aria-label="Project title" maxLength={PROJECT_TITLE_MAX} value={name} onChange={event=>setName(event.target.value)}/><small>{name.length}/{PROJECT_TITLE_MAX}</small><button type="button" onClick={()=>void saveText()}>Save</button><button type="button" onClick={()=>{setName(adminProject?.name||project.name);setEditingPart(null)}}>Cancel</button></div>:<div className="admin-hover-edit admin-title-edit"><h1 className="admin-hover-content">{name}</h1><div className="admin-hover-actions"><button type="button" onClick={()=>setEditingPart('title')}><Pencil/> Edit</button></div></div>):<h1>{name}</h1>
  const projectDescription = description || 'No project brief has been added.'
  const descriptionContent = isAdmin?(editingPart==='description'?<div className="admin-inline-editor"><textarea aria-label="Project description" maxLength={PROJECT_DESCRIPTION_MAX} value={description} onChange={event=>setDescription(event.target.value)}/><small>{description.length}/{PROJECT_DESCRIPTION_MAX}</small><button type="button" onClick={()=>void saveText()}>Save</button><button type="button" onClick={()=>{setDescription(adminProject?.description||project.description);setEditingPart(null)}}>Cancel</button></div>:<div className="admin-hover-edit admin-description-edit"><p className="admin-hover-content">{projectDescription}</p><div className="admin-hover-actions"><button type="button" onClick={()=>setEditingPart('description')}><Pencil/> Edit</button></div></div>):<p>{projectDescription}</p>
  return <div className="project-detail member-project-detail">
    <nav className="project-section-links" aria-label="Project sections"><a href="/member/projects" onClick={event=>{event.preventDefault();onBack()}}>Projects</a><a href="#overview">Overview</a><a href="#milestones">Milestones</a><a href="#tasks">Tasks</a></nav>
    <section className={`project-identity${isAdmin?' admin-project-identity':''}`} id="overview">{cover}<div>{title}{descriptionContent}<ProjectPitchLinks/>{adminMessage&&<small className="admin-edit-message" role="status">{adminMessage}</small>}</div></section>
    <section className={`project-milestones${isAdmin?' admin-hover-edit admin-pane-edit':''}`} id="milestones"><div className={isAdmin?'admin-hover-content':undefined}><header><div><h2>Milestones</h2><p>Published project stages will appear here.</p></div></header><div className="project-empty">No milestones have been published for members.</div></div>{isAdmin&&<div className="admin-hover-actions"><button type="button" onClick={()=>void openAdminSection('milestones')}><Pencil/> Edit</button></div>}</section>
    <section className="project-performance" id="analytics"><h2>Performance</h2><div className="performance-rail">{[
      {label:'Users',icon:Users,detail:'Goal and actual not published'},
      {label:'Cost vs Budget',icon:DollarSign,detail:'Not published'},
      {label:'Adoption Rate',icon:TrendingUp,detail:'Not published'},
      {label:'Forecasted Penetration',icon:Target,detail:'Not published'},
    ].map(({label,icon:Icon,detail})=><article key={label}><header><Icon/><span>{label}</span></header><strong>—</strong><small>{detail}</small><i><em style={{width:'0%'}}/></i></article>)}</div></section>
    <section className={`project-tasks${isAdmin?' admin-hover-edit admin-pane-edit':''}`} id="tasks"><div className={isAdmin?'admin-hover-content':undefined}><header><div><h2>Tasks</h2><p>Shared project work will appear here.</p></div></header><div className="project-empty"><ListTodo/> No tasks have been shared with members.</div></div>{isAdmin&&<div className="admin-hover-actions"><button type="button" onClick={()=>void openAdminSection('tasks')}><Pencil/> Edit</button></div>}</section>
  </div>
}

function ProjectsPage({ isAdmin }: { isAdmin: boolean }) {
  const initialSlug = window.location.pathname.split('/').filter(Boolean)[2]
  const [catalogProjects, setCatalogProjects] = useState<CatalogProject[]>(projects)
  const [selected, setSelected] = useState<CatalogProject | null>(() => projects.find(project => project.slug === initialSlug) || null)
  const [filter, setFilter] = useState('All projects')
  const [searchQuery, setSearchQuery] = useState('')
  const [addingProject, setAddingProject] = useState(false)
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null)
  const [adminEditingProjectId, setAdminEditingProjectId] = useState<string | null>(() => isAdmin ? new URLSearchParams(window.location.search).get('adminEdit') : null)
  useEffect(() => { let active = true; void projectCatalogRequest().then(data => { if (!active) return; const managed = (data.projects as Array<{id:string;slug:string;name:string;description:string;image_url:string;access_level:string}>).map((project,index)=>catalogProjectFromApi(project,index,isAdmin)); setCatalogProjects(managed); if (initialSlug) setSelected(managed.find(project=>project.slug===initialSlug)||null) }).catch(() => { setCatalogProjects([]) }); return () => { active = false } }, [isAdmin, initialSlug])
  const updateProject = (nextProject: CatalogProject) => { setCatalogProjects(current => current.map(item => item.slug === nextProject.slug ? nextProject : item)); setSelected(current => current?.slug === nextProject.slug ? nextProject : current) }
  const openProject = (project: CatalogProject) => { window.history.pushState({},'',`/member/projects/${project.slug}`); setSelected(project); window.scrollTo(0,0) }
  const closeProject = () => { window.history.pushState({},'','/member/projects'); setSelected(null); setAdminEditingProjectId(null); window.scrollTo(0,0) }
  useEffect(() => { const onPop = () => { const slug = window.location.pathname.split('/').filter(Boolean)[2]; setSelected(catalogProjects.find(project => project.slug === slug) || null) }; window.addEventListener('popstate', onPop); return () => window.removeEventListener('popstate', onPop) }, [catalogProjects])
  const addBlankProject = async () => { if (addingProject) return; try { setAddingProject(true); const stamp = `${Date.now()}-${Math.random().toString(36).slice(2,7)}`; const data = await adminRequest('/api/admin/projects', { method:'POST', body:JSON.stringify({ name:'Project Title', slug:`project-${stamp}`, description:'', status:'draft', accessLevel:'member' }) }); const project = catalogProjectFromApi({ ...data.project, image_url:'' },0,true); setCatalogProjects(current => [project,...current]) } finally { setAddingProject(false) } }
  const deleteProject = async (project: CatalogProject) => { if (!project.id) return; try { await adminRequest(`/api/admin/projects/${project.id}`, { method:'DELETE' }); setCatalogProjects(current => current.filter(item => item.id !== project.id)); setDeletingProjectId(null) } catch { setDeletingProjectId(null) } }
  const syncAdminProject = (project: AdminProjectDetail) => setCatalogProjects(current => current.map(item => item.id === project.id ? { ...item, slug:project.slug, name:project.name, description:project.description, imageUrl:project.image_url, initials:project.name.split(/\s+/).map(part=>part[0]).slice(0,2).join('').toUpperCase() } : item))
  const visibleProjects = catalogProjects.filter(project => `${project.name} ${project.description}`.toLowerCase().includes(searchQuery.trim().toLowerCase()))
  if (isAdmin&&adminEditingProjectId) return <AdminProjectDetailPage key={adminEditingProjectId} projectId={adminEditingProjectId} onBack={closeProject} onProjectSaved={syncAdminProject}/>
  if (selected) return <MemberProjectDetailPage project={selected} onBack={closeProject} isAdmin={isAdmin} onProjectChange={updateProject}/>
  const directoryNotice = <div className="info-banner project-directory-notice"><FolderKanban/><span><strong>Project directory</strong><small>{isAdmin?'Select a project to view or manage its details.':'Select a project to view its details and available materials.'}</small></span></div>
  if (isAdmin) return <><PageHead title="Project Directory" intro="" /><div className="toolbar admin-project-toolbar"><span className="admin-project-toolbar-title">All projects</span><div className="admin-project-toolbar-actions"><button className="admin-add-project" type="button" disabled={addingProject} onClick={()=>void addBlankProject()}><Plus/> Add Project</button><label className="search"><Search size={18}/><input aria-label="Search projects" placeholder="Search projects" value={searchQuery} onChange={event=>setSearchQuery(event.target.value)}/></label></div></div>{directoryNotice}<div className="admin-project-tiles">{visibleProjects.map(project=><article className="admin-project-tile admin-hover-edit" key={project.slug} onMouseLeave={()=>setDeletingProjectId(current=>current===project.id?null:current)}><div className="admin-hover-content"><div className={`admin-project-tile-image ${project.tone}`}>{project.imageUrl?<div className="catalog-visual-image" role="img" aria-label={`${project.name} project`} style={{backgroundImage:`url(${project.imageUrl})`}}/>:<span><ImageIcon/></span>}</div><strong>{project.name}</strong></div><div className="admin-hover-actions">{project.id&&<><a href={`/member/projects?adminEdit=${project.id}&edit=overview#overview`} onClick={event=>{event.preventDefault();window.history.pushState({},'',`/member/projects?adminEdit=${project.id}&edit=overview#overview`);setAdminEditingProjectId(project.id||null);window.scrollTo(0,0)}}><Pencil/> Edit</a>{deletingProjectId===project.id?<button className="confirm-delete-project" type="button" onClick={()=>void deleteProject(project)}><Trash2/> Confirm Delete</button>:<button type="button" onClick={()=>setDeletingProjectId(project.id||null)}><Trash2/> Delete</button>}</>}</div></article>)}</div></>
  return <><PageHead title="Project Directory" intro="" /><div className="toolbar"><div className="filter-tabs">{['All projects','Available','Requested'].map(x=><button className={filter===x?'active':''} onClick={()=>setFilter(x)} key={x}>{x}</button>)}</div><div className="admin-project-toolbar-actions"><label className="search"><Search size={18}/><input aria-label="Search projects" placeholder="Search projects" value={searchQuery} onChange={event=>setSearchQuery(event.target.value)}/></label></div></div>{directoryNotice}<div className="project-catalog">{visibleProjects.map((p,i)=><article className="catalog-row" key={p.slug}><div className={`catalog-visual ${p.tone}`}>{p.imageUrl?<div className="catalog-visual-image" role="img" aria-label={`${p.name} project`} style={{backgroundImage:`url(${p.imageUrl})`}}/>:<span>{p.initials}</span>}</div><div><Status tone={p.tone}>{p.status}</Status><h2>{p.name}</h2><p>{p.description}</p><div className="meta-line"><span><Clock3/> {i===0?'Updated 2 days ago':'Updated this month'}</span><span><ShieldCheck/> {p.status==='Request access'?'Additional access required':'Member access'}</span></div></div><button className={p.status==='Request access'?'secondary-button':'text-button'} onClick={()=>p.status==='Request access'?undefined:openProject(p)}>{p.status==='Request access'?'Request access':'Open project'} <ArrowRight size={17}/></button></article>)}</div></>
}

type AgreementState = { configured: boolean; environment?: 'demo' | 'production'; status: string; completedAt?: string | null; error?: string }
type LegalDocument = { id: string; fileName: string; documentType: string; mimeType: string; fileSize: number; createdAt: string }
type LegalProjectGroup = { id: string; project_id: string; title: string; documents: LegalDocument[] }

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

function AgreementsPage({ isAdmin }: { isAdmin: boolean }) {
  const [agreement, setAgreement] = useState<AgreementState | null>(null)
  const [busy, setBusy] = useState(false)
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null)
  const [isDraggingDocument, setIsDraggingDocument] = useState(false)
  const [legalGroups, setLegalGroups] = useState<LegalProjectGroup[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [groupConfirmed, setGroupConfirmed] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')
  const selectDocument = (file?: File) => {
    if (!file) return
    setUploadedDocument(file)
    setGroupConfirmed(false)
    setUploadMessage('')
  }
  const loadLegalGroups = async () => {
    const headers = await memberAuthHeaders()
    const response = await fetch('/api/legal', { cache: 'no-store', headers })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Could not load project legal groups.')
    setLegalGroups(data.groups || [])
  }
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
  useEffect(() => { void loadAgreement(); void loadLegalGroups().catch(error => setUploadMessage(error instanceof Error ? error.message : 'Could not load project legal groups.')) }, [])
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
  const selectedGroup = legalGroups.find(group => group.id === selectedGroupId)
  const uploadLegalDocument = async () => {
    if (!uploadedDocument || !selectedGroup || !groupConfirmed) return
    setBusy(true); setUploadMessage('Uploading document…')
    try {
      const headers = await memberAuthHeaders()
      const form = new FormData()
      form.append('document', uploadedDocument)
      form.append('projectGroupId', selectedGroup.id)
      form.append('confirmedProjectGroupId', selectedGroup.id)
      const response = await fetch('/api/admin/legal/documents', { method: 'POST', headers, body: form })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not upload the legal document.')
      await loadLegalGroups()
      setUploadedDocument(null); setSelectedGroupId(''); setGroupConfirmed(false); setUploadMessage('Document uploaded.')
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : 'Could not upload the legal document.')
    } finally { setBusy(false) }
  }
  const downloadLegalDocument = async (document: LegalDocument) => {
    try {
      const headers = await memberAuthHeaders()
      const response = await fetch(`/api/legal/documents/${document.id}`, { headers, cache: 'no-store' })
      if (!response.ok) throw new Error('Could not download this document.')
      const url = URL.createObjectURL(await response.blob())
      const link = window.document.createElement('a'); link.href = url; link.download = document.fileName; link.click()
      URL.revokeObjectURL(url)
    } catch (error) { setUploadMessage(error instanceof Error ? error.message : 'Could not download this document.') }
  }
  return <>
    <PageHead title="Legal Documents & Agreements" intro="" />
    <div className="data-head legal-document-head"><span>Document</span><span>Type</span><span>Effective Date</span><span>Status</span><span /></div>
    <div className={`info-banner ${signed && !isDemo ? '' : 'agreement-action-needed'}`}><ShieldCheck/><span><strong>{bannerTitle}</strong><small>{bannerCopy}</small></span></div>
    {isAdmin && <><label
      className={`legal-document-upload${isDraggingDocument ? ' is-dragging' : ''}`}
      onDragEnter={(event) => { event.preventDefault(); setIsDraggingDocument(true) }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDraggingDocument(false) }}
      onDrop={(event) => {
        event.preventDefault()
        setIsDraggingDocument(false)
        selectDocument(event.dataTransfer.files[0])
      }}
    >
      <Upload aria-hidden="true" />
      <span>
        <strong>{uploadedDocument ? uploadedDocument.name : 'Drag and drop a document here'}</strong>
        <small>{uploadedDocument ? 'Document selected' : 'or click to upload'}</small>
      </span>
      <input
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={(event) => { selectDocument(event.target.files?.[0]); event.target.value = '' }}
        aria-label="Upload a legal document"
      />
    </label>{uploadedDocument && <section className="legal-upload-confirmation" aria-labelledby="legal-assignment-title">
      <h2 id="legal-assignment-title">Confirm Project Group Assignment</h2>
      <p><strong>{uploadedDocument.name}</strong> will be stored in the selected project’s Legal group.</p>
      <label>Project Group<select value={selectedGroupId} onChange={event => { setSelectedGroupId(event.target.value); setGroupConfirmed(false) }}><option value="">Select a project group</option>{legalGroups.map(group => <option value={group.id} key={group.id}>{group.title}</option>)}</select></label>
      {selectedGroup && <label className="legal-assignment-check"><input type="checkbox" checked={groupConfirmed} onChange={event => setGroupConfirmed(event.target.checked)} /><span>I confirm this document belongs to <strong>{selectedGroup.title}</strong>.</span></label>}
      <div><button className="agreement-sign-button" type="button" disabled={!selectedGroup || !groupConfirmed || busy} onClick={() => void uploadLegalDocument()}>{busy ? 'Uploading…' : 'Upload document'}</button><button className="plain-button" type="button" onClick={() => { setUploadedDocument(null); setSelectedGroupId(''); setGroupConfirmed(false); setUploadMessage('') }}>Cancel</button></div>
    </section>}</>}
    {uploadMessage && <p className="legal-upload-message" role="status">{uploadMessage}</p>}
    {agreement?.error && <p className="agreement-error" role="alert">{agreement.error}</p>}
    <div className="data-list legal-document-list">
      <h2 className="legal-document-group-title">Orbit Systems</h2>
      <div className="data-row legal-document-row">
        <span className="title-cell"><FileCheck2/><span><strong>{isDemo ? 'General NDA test' : 'General NDA'}</strong><small>Version 1.0 · DocuSign{isDemo ? ' sandbox · TEST ONLY' : ''}</small></span></span>
        <span className="legal-document-type">Non-Disclosure Agreement</span>
        <span className="legal-effective-date">{signed ? completed : '—'}</span>
        {agreement === null ? <Status tone="slate">Checking…</Status> : signed ? <Status>{isDemo ? 'Test completed' : 'Signed'}</Status> : waiting ? <Status tone="blue">{isDemo ? 'Test sent' : 'Sent'}</Status> : <Status tone="orange">{isDemo ? 'Test required' : 'Required'}</Status>}
        {signed ? <button className="text-button" onClick={loadAgreement}>Refresh status <ChevronRight/></button> : <button className="agreement-sign-button" onClick={signAgreement} disabled={busy || agreement === null || agreement?.configured === false}>{busy ? 'Opening DocuSign…' : waiting ? 'Continue signing' : isDemo ? 'Run signing test' : 'Review and sign'} <ChevronRight/></button>}
      </div>
      {legalGroups.map(group => <div className="legal-project-group" key={group.id}><h2 className="legal-document-group-title">{group.title}</h2>{group.documents.length ? group.documents.map(document => <div className="data-row legal-document-row" key={document.id}>
        <span className="title-cell"><FileText/><span><strong>{document.fileName}</strong><small>{Math.max(1, Math.round(document.fileSize / 1024))} KB</small></span></span>
        <span className="legal-document-type">{document.documentType}</span>
        <span className="legal-effective-date">{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(document.createdAt))}</span>
        <Status>Available</Status>
        <button className="text-button" type="button" onClick={() => void downloadLegalDocument(document)}>Download <ChevronRight/></button>
      </div>) : <div className="legal-group-empty">No legal documents have been uploaded for this project.</div>}</div>)}
    </div>
  </>
}

function BetaPage() { return <><PageHead title="Beta Programs" intro="Join invited previews and keep track of feedback you’ve shared." /><div className="split-feature"><div className="feature-copy"><Status tone="orange">Invitation</Status><h2>Career Pivot research preview</h2><p>Try an early guided experience and share what helps, what feels unclear, and what you would change.</p><ul><li><CalendarDays/> Invitation expires August 11, 2026</li><li><LockKeyhole/> Access is limited to invited participants</li></ul><div><button className="primary-button">Review invitation</button><button className="plain-button">Not now</button></div></div><div className="feature-panel"><FlaskConical/><strong>Your feedback stays connected</strong><p>Submissions remain linked to their original context and are reviewed by the project team.</p></div></div><section className="lower-section"><SectionHead title="Your participation"/><div className="empty-state"><MessageSquareText/><h3>No feedback submitted yet</h3><p>Your submissions and their review status will appear here.</p></div></section></> }

function UpdateList({limit=updates.length}:{limit?:number}) { return <div className="update-list">{updates.slice(0,limit).map(({title,detail,date,icon:Icon})=><a href="/member/updates" key={title}><span className="mini-icon"><Icon/></span><span><strong>{title}</strong><small>{detail}</small></span><time>{date}</time><ChevronRight/></a>)}</div> }
function UpdatesPage() { return <><PageHead title="Updates" intro="News and changes from the projects and programs you can access." /><div className="update-layout"><UpdateList/><aside><h3>Following</h3><p>You’re receiving updates for one project.</p><div className="following"><span className="project-avatar teal">AP</span><span><strong>Advanced Predictive Data</strong><small>Email and in-app updates</small></span></div><button className="secondary-button">Manage preferences</button></aside></div></> }
function NotificationsPage() { const [read,setRead]=useState<number[]>([]); const notes=['Your beta invitation is ready to review','Advanced Predictive Data published an update','Your General NDA was completed']; return <><PageHead title="Notifications" intro="Access, agreement, and project activity that needs your attention." /><div className="notification-actions"><button className="text-button" onClick={()=>setRead([0,1,2])}><Check/> Mark all as read</button></div><div className="notification-list">{notes.map((n,i)=><button onClick={()=>setRead([...read,i])} className={read.includes(i)?'read':''} key={n}><span className="notice-dot"/><span className="mini-icon">{i===0?<FlaskConical/>:i===1?<BookOpen/>:<FileCheck2/>}</span><span><strong>{n}</strong><small>{i===0?'Invitation expires August 11':i===1?'2 days ago':'July 18'}</small></span><ChevronRight/></button>)}</div></> }
type Milestone = { id: string; name: string; date: string; status: 'planned' | 'in_progress' | 'completed' }
type ProjectTask = { id: string; name: string; description: string; status: 'to_do' | 'in_progress' | 'completed'; dueDate: string }
type ProblemBlock = { id: string; rowId?: string; type: 'heading' | 'paragraph' | 'image' | 'quote' | 'list' | 'statistic'; text?: string; imageUrl?: string; caption?: string; alt?: string }
type AdminProject = { id: string; name: string; slug: string; description: string; status: string; access_level: string }
type AdminProjectDetail = AdminProject & { image_url: string; user_goal: number; user_actual: number; cost_budget: number; cost_actual: number; adoption_rate: number; forecast_penetration: number; milestones: Milestone[]; tasks: ProjectTask[]; problem_content: ProblemBlock[]; created_at?: string }
type UserProject = { id: string; name: string; role: string; status: string }
type AdminProjectOption = { id: string; name: string }
type AdminProfile = { auth_user_id: string; email: string; display_name: string; role: 'member' | 'admin'; status: 'pending_approval' | 'approved' | 'declined' | 'revoked'; project_count: number; projects: UserProject[] }
async function adminRequest(path: string, init?: RequestInit) {
  const headers = await memberAuthHeaders()
  const response = await fetch(path, { ...init, cache: 'no-store', headers: { ...headers, ...(init?.body ? { 'content-type': 'application/json' } : {}) } })
  const data = response.status === 204 ? null : await response.json()
  if (!response.ok) throw new Error(data?.error || 'The administrator action failed.')
  return data
}

function AdminUsersPage() {
  const [profiles, setProfiles] = useState<AdminProfile[]>([])
  const [projectOptions, setProjectOptions] = useState<AdminProjectOption[]>([])
  const [savingProjectsFor, setSavingProjectsFor] = useState('')
  const [message, setMessage] = useState('Loading profiles…')
  const load = async () => { try { const data = await adminRequest('/api/admin/profiles'); setProfiles(data.profiles); setProjectOptions(data.projects); setMessage('') } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not load profiles.') } }
  useEffect(() => { void load() }, [])
  const changeRole = async (profile: AdminProfile, role: 'member' | 'admin') => { try { await adminRequest('/api/admin/profiles', { method: 'PATCH', body: JSON.stringify({ authUserId: profile.auth_user_id, role }) }); await load() } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not update the role.') } }
  const toggleProject = async (profile: AdminProfile, projectId: string, checked: boolean) => {
    const assigned = profile.projects.map(project => project.id)
    const projectIds = checked ? [...new Set([...assigned, projectId])] : assigned.filter(id => id !== projectId)
    setSavingProjectsFor(profile.auth_user_id)
    try {
      await adminRequest('/api/admin/profiles', { method: 'PATCH', body: JSON.stringify({ authUserId: profile.auth_user_id, projectIds }) })
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update project assignments.')
    } finally {
      setSavingProjectsFor('')
    }
  }
  return <><PageHead title="Users" intro="Review user access, administrator rights, and project involvement." />{message&&<p className="profile-message" role="status">{message}</p>}<div className="admin-table user-directory"><div className="admin-table-head"><span>User</span><span>Account status</span><span>Projects</span><span>Role</span></div>{profiles.map(profile=><article className="admin-person" key={profile.auth_user_id}><span className="user-identity"><strong>{profile.display_name}{profile.role==='admin'&&<em>Admin</em>}</strong><small>{profile.email}</small><code>{profile.auth_user_id}</code></span><Status tone={profile.status==='approved'?'teal':profile.status==='pending_approval'?'orange':'slate'}>{profile.status.replaceAll('_',' ')}</Status><details className="project-assignment"><summary><span><strong>{profile.project_count} {profile.project_count===1?'project':'projects'}</strong><small>{profile.project_count?'Select project assignments':'No project involvement'}</small></span><ChevronRight aria-hidden="true" /></summary><div className="project-assignment-menu">{projectOptions.length?projectOptions.map(project=><label key={project.id}><input type="checkbox" checked={profile.projects.some(assigned=>assigned.id===project.id)} disabled={savingProjectsFor===profile.auth_user_id} onChange={event=>void toggleProject(profile,project.id,event.target.checked)} /><span>{project.name}</span></label>):<small>No projects are available.</small>}{savingProjectsFor===profile.auth_user_id&&<small role="status">Saving assignments…</small>}</div></details><select className="user-role-select" aria-label={`Role for ${profile.display_name}`} value={profile.role} onChange={event=>void changeRole(profile,event.target.value as 'member'|'admin')}><option value="member">Member</option><option value="admin">Administrator</option></select></article>)}</div></>
}

function projectDetailFromApi(project: AdminProjectDetail): AdminProjectDetail {
  return { ...project, user_goal: Number(project.user_goal), user_actual: Number(project.user_actual), cost_budget: Number(project.cost_budget), cost_actual: Number(project.cost_actual), adoption_rate: Number(project.adoption_rate), forecast_penetration: Number(project.forecast_penetration), milestones: project.milestones || [], tasks: project.tasks || [], problem_content:project.problem_content || [] }
}

function initialProjectTimeline(createdAt?: string): Milestone[] {
  const started = createdAt ? new Date(createdAt) : new Date()
  const stages = [
    ['Beta A', 0],
    ['Beta B', 42],
    ['Pre-seed Funding', 120],
    ['Series A', 270],
    ['Series B', 540],
  ] as const
  return stages.map(([name, days], index) => { const date = new Date(started); date.setUTCDate(date.getUTCDate() + days); return { id:`timeline-${index}`, name, date:date.toISOString().slice(0,10), status:'planned' } })
}

/* Uploaded project-story images are data URLs until object storage is introduced. */
/* eslint-disable @next/next/no-img-element */
function ProblemPageEditor({ blocks, onSave }: { blocks: ProblemBlock[]; onSave: (blocks: ProblemBlock[]) => Promise<void> }) {
  const [content,setContent] = useState<ProblemBlock[]>(blocks)
  const [editingId,setEditingId] = useState<string | null>(null)
  const [openSideMenu,setOpenSideMenu] = useState<string | null>(null)
  const [openAddMenu,setOpenAddMenu] = useState<number | null>(null)
  const [editingIntro,setEditingIntro] = useState<'title'|'description'|null>(null)
  const [introTitle,setIntroTitle] = useState('Tell the story of the problem.')
  const [introDescription,setIntroDescription] = useState('Add a description of what the problem is that this product is solving.')
  const [message,setMessage] = useState('')
  useEffect(()=>setContent(blocks),[blocks])
  useEffect(()=>{const close=()=>{setOpenSideMenu(null);setOpenAddMenu(null)};document.addEventListener('click',close);return()=>document.removeEventListener('click',close)},[])
  const nextId = (type: ProblemBlock['type']) => { let index=content.length+1; while(content.some(block=>block.id===`problem-${type}-${index}`)) index+=1; return `problem-${type}-${index}` }
  const commit = async (next: ProblemBlock[]) => { setContent(next); setMessage('Saving…'); try { await onSave(next); setMessage('') } catch (error) { setMessage(error instanceof Error?error.message:'Could not save the Problem page.') } }
  const saveIntro = async () => { const titleId='problem-title'; const descriptionId='problem-description'; await commit([{id:titleId,rowId:titleId,type:'heading',text:introTitle.trim()||'Tell the story of the problem.'},{id:descriptionId,rowId:descriptionId,type:'paragraph',text:introDescription.trim()||'Add a description of what the problem is that this product is solving.'}]);setEditingIntro(null) }
  const textBlock = (type: Exclude<ProblemBlock['type'],'image'>, rowId?:string):ProblemBlock => { const labels:Record<Exclude<ProblemBlock['type'],'image'>,string>={heading:'Section heading',paragraph:'Describe the problem…',quote:'Add a supporting quote…',list:'Add one item per line…',statistic:'Add a key statistic…'}; const id=nextId(type); return {id,rowId:rowId||id,type,text:labels[type]} }
  const addTextBlock = (type: Exclude<ProblemBlock['type'],'image'>, index: number) => { const block=textBlock(type); const next=[...content.slice(0,index),block,...content.slice(index)]; setContent(next); setEditingId(block.id) }
  const insertTextBeside = (type:Exclude<ProblemBlock['type'],'image'>, block:ProblemBlock, side:'left'|'right') => { const rowId=block.rowId||block.id; const index=content.findIndex(item=>item.id===block.id); const sibling=textBlock(type,rowId); const normalized=content.map(item=>item.id===block.id?{...item,rowId}:item); const insertion=index+(side==='right'?1:0); const next=[...normalized.slice(0,insertion),sibling,...normalized.slice(insertion)]; setContent(next);setEditingId(sibling.id) }
  const readImage = async (event:ChangeEvent<HTMLInputElement>) => { const file=event.target.files?.[0];event.target.value='';if(!file)return null;if(!['image/jpeg','image/png','image/webp'].includes(file.type)){setMessage('Use a JPG, PNG, or WebP image.');return null}if(file.size>2*1024*1024){setMessage('Choose an image smaller than 2 MB.');return null}const imageUrl=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('Could not read the image.'));reader.readAsDataURL(file)});return {file,imageUrl} }
  const addImageBlock = async (event: ChangeEvent<HTMLInputElement>, index: number) => { const upload=await readImage(event);if(!upload)return;const id=nextId('image');const block:ProblemBlock={id,rowId:id,type:'image',imageUrl:upload.imageUrl,caption:'',alt:upload.file.name.replace(/\.[^.]+$/,'')};const next=[...content.slice(0,index),block,...content.slice(index)];setEditingId(block.id);await commit(next) }
  const insertImageBeside = async (event:ChangeEvent<HTMLInputElement>,block:ProblemBlock,side:'left'|'right') => { const upload=await readImage(event);if(!upload)return;const rowId=block.rowId||block.id;const index=content.findIndex(item=>item.id===block.id);const id=nextId('image');const sibling:ProblemBlock={id,rowId,type:'image',imageUrl:upload.imageUrl,caption:'',alt:upload.file.name.replace(/\.[^.]+$/,'')};const normalized=content.map(item=>item.id===block.id?{...item,rowId}:item);const insertion=index+(side==='right'?1:0);const next=[...normalized.slice(0,insertion),sibling,...normalized.slice(insertion)];setEditingId(id);await commit(next) }
  const update = (id:string,changes:Partial<ProblemBlock>) => setContent(current=>current.map(block=>block.id===id?{...block,...changes}:block))
  const rowKey = (block:ProblemBlock) => block.rowId||block.id
  const rows = content.reduce<ProblemBlock[][]>((result,block)=>{const current=result[result.length-1];if(current&&rowKey(current[0])===rowKey(block))current.push(block);else result.push([block]);return result},[])
  const remove = (id:string) => { setEditingId(null); void commit(content.filter(block=>block.id!==id)) }
  const addTools = (index:number) => { const closeMenu=()=>setOpenAddMenu(null); return <div className={`problem-add-row${openAddMenu===index?' problem-add-row-open':''}`} onClick={event=>event.stopPropagation()}><button type="button" className="problem-add-trigger" aria-label="Add content block" aria-expanded={openAddMenu===index} onClick={()=>setOpenAddMenu(current=>current===index?null:index)}>+</button><div><button type="button" onClick={()=>{addTextBlock('heading',index);closeMenu()}}>Heading</button><button type="button" onClick={()=>{addTextBlock('paragraph',index);closeMenu()}}>Text</button><label>Image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event=>{void addImageBlock(event,index);closeMenu()}}/></label><button type="button" onClick={()=>{addTextBlock('quote',index);closeMenu()}}>Quote</button><button type="button" onClick={()=>{addTextBlock('list',index);closeMenu()}}>List</button><button type="button" onClick={()=>{addTextBlock('statistic',index);closeMenu()}}>Statistic</button></div></div> }
  const sideTools = (block:ProblemBlock,side:'left'|'right') => { const menuId=`${block.id}-${side}`; const closeMenu=()=>setOpenSideMenu(null); return <div className={`problem-side-add problem-side-add-${side}${openSideMenu===menuId?' problem-side-add-open':''}`} onClick={event=>event.stopPropagation()}><button type="button" className="problem-side-trigger" aria-label={`Add content to the ${side} of this block`} aria-expanded={openSideMenu===menuId} onClick={()=>setOpenSideMenu(current=>current===menuId?null:menuId)}>+</button><div><button type="button" onClick={()=>{insertTextBeside('heading',block,side);closeMenu()}}>Heading</button><button type="button" onClick={()=>{insertTextBeside('paragraph',block,side);closeMenu()}}>Text</button><label>Image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event=>{void insertImageBeside(event,block,side);closeMenu()}}/></label><button type="button" onClick={()=>{insertTextBeside('quote',block,side);closeMenu()}}>Quote</button><button type="button" onClick={()=>{insertTextBeside('list',block,side);closeMenu()}}>List</button><button type="button" onClick={()=>{insertTextBeside('statistic',block,side);closeMenu()}}>Statistic</button></div></div> }
  const renderBlockContent = (block:ProblemBlock) => block.type==='heading'?<h2>{block.text}</h2>:block.type==='paragraph'?<p>{block.text}</p>:block.type==='quote'?<blockquote>{block.text}</blockquote>:block.type==='list'?<ul>{(block.text||'').split('\n').filter(Boolean).map((item,itemIndex)=><li key={`${block.id}-${itemIndex}`}>{item}</li>)}</ul>:block.type==='statistic'?<strong>{block.text}</strong>:<figure><img src={block.imageUrl} alt={block.alt||''}/>{block.caption&&<figcaption>{block.caption}</figcaption>}</figure>
  const renderBlock = (block:ProblemBlock) => <div className={`problem-block problem-block-${block.type}`} key={block.id}>{sideTools(block,'left')}{sideTools(block,'right')}{editingId===block.id?<div className="problem-block-editor">{block.type==='image'?<><img src={block.imageUrl} alt=""/><label>Alternative text<input maxLength={160} value={block.alt||''} onChange={event=>update(block.id,{alt:event.target.value})}/></label><label>Caption<input maxLength={240} value={block.caption||''} onChange={event=>update(block.id,{caption:event.target.value})}/></label></>:<label>{block.type==='heading'?'Heading':block.type==='statistic'?'Statistic':block.type==='list'?'List items':block.type==='quote'?'Quote':'Paragraph'}{block.type==='heading'||block.type==='statistic'?<input maxLength={120} value={block.text||''} onChange={event=>update(block.id,{text:event.target.value})}/>:<textarea maxLength={block.type==='paragraph'?3000:1200} value={block.text||''} onChange={event=>update(block.id,{text:event.target.value})}/>}</label>}<div><button type="button" onClick={()=>{void commit(content);setEditingId(null)}}>Save</button><button type="button" onClick={()=>{setContent(blocks);setEditingId(null)}}>Cancel</button><button type="button" className="problem-delete" onClick={()=>remove(block.id)}>Delete</button></div></div>:<div className="problem-block-display admin-hover-edit"><div className="admin-hover-content">{renderBlockContent(block)}</div><div className="admin-hover-actions"><button type="button" onClick={()=>setEditingId(block.id)}><Pencil/> Edit</button></div></div>}</div>
  return <article className="problem-editor" aria-label="Problem page editor">
    {content.length===0?<div className="problem-intro">
      {editingIntro==='title'?<div className="problem-intro-editor problem-intro-title-editor"><input aria-label="Problem title" maxLength={120} value={introTitle} onChange={event=>setIntroTitle(event.target.value)}/><div><button type="button" onClick={()=>void saveIntro()}>Save</button><button type="button" onClick={()=>setEditingIntro(null)}>Cancel</button></div></div>:<section className="problem-intro-module problem-intro-title admin-hover-edit"><strong className="admin-hover-content">{introTitle}</strong><div className="admin-hover-actions"><button type="button" onClick={()=>setEditingIntro('title')}><Pencil/> Edit</button></div></section>}
      {editingIntro==='description'?<div className="problem-intro-editor problem-intro-description-editor"><textarea aria-label="Problem description" maxLength={3000} value={introDescription} onChange={event=>setIntroDescription(event.target.value)}/><div><button type="button" onClick={()=>void saveIntro()}>Save</button><button type="button" onClick={()=>setEditingIntro(null)}>Cancel</button></div></div>:<section className="problem-intro-module problem-intro-description admin-hover-edit"><p className="admin-hover-content">{introDescription}</p><div className="admin-hover-actions"><button type="button" onClick={()=>setEditingIntro('description')}><Pencil/> Edit</button></div></section>}
    </div>:addTools(0)}
    {rows.map((row,rowIndex)=><div className="problem-row-group" key={rowKey(row[0])}><div className={`problem-layout-row${row.length===1?' problem-layout-row-single':''}`}>{row.map(block=>renderBlock(block))}</div>{addTools(rows.slice(0,rowIndex+1).reduce((count,item)=>count+item.length,0))}</div>)}
    {message&&message!=='Saving…'&&<p className="problem-editor-message" role="status">{message}</p>}
  </article>
}
/* eslint-enable @next/next/no-img-element */

function AdminProjectDetailPage({ projectId, onBack, onProjectSaved }: { projectId: string; onBack: () => void; onProjectSaved?: (project: AdminProjectDetail) => void }) {
  const [project, setProject] = useState<AdminProjectDetail | null>(null)
  const [draft, setDraft] = useState<AdminProjectDetail | null>(null)
  const [editingPart, setEditingPart] = useState<'title' | 'description' | 'image' | null>(null)
  const [pitchSection, setPitchSection] = useState('Control Panel')
  const [milestoneEdit, setMilestoneEdit] = useState<Milestone | null>(null)
  const [milestoneEditAnchor, setMilestoneEditAnchor] = useState<string | null>(null)
  const [message, setMessage] = useState('Loading project…')
  useEffect(() => { let active = true; void adminRequest(`/api/admin/projects/${projectId}`).then(data => { if (!active) return; const next = projectDetailFromApi(data.project); setProject(next); setDraft(next); setMessage('') }).catch(error => { if (active) setMessage(error instanceof Error ? error.message : 'Could not load the project.') }); return () => { active = false } }, [projectId])
  if (!project || !draft) return <><PageHead title="Project Details" intro="" /><button className="project-back" onClick={onBack}><ArrowLeft/> All Projects</button><p className="profile-message" role="status">{message}</p></>
  const save = async () => { try { setMessage('Saving…'); const normalized = { ...draft, name: (draft.name.trim() || 'Project Title').slice(0, PROJECT_TITLE_MAX), description: draft.description.trim().slice(0, PROJECT_DESCRIPTION_MAX) }; await adminRequest(`/api/admin/projects/${projectId}`, { method: 'PATCH', body: JSON.stringify({ name: normalized.name, slug: normalized.slug, description: normalized.description, status: normalized.status, accessLevel: normalized.access_level }) }); await adminRequest(`/api/admin/projects/${projectId}`, { method: 'PATCH', body: JSON.stringify({ dashboard: { imageUrl: normalized.image_url, userGoal: normalized.user_goal, costBudget: normalized.cost_budget, costActual: normalized.cost_actual, adoptionRate: normalized.adoption_rate, forecastPenetration: normalized.forecast_penetration, milestones: normalized.milestones, tasks: normalized.tasks, problemContent:normalized.problem_content } }) }); setDraft(normalized); setProject(normalized); onProjectSaved?.(normalized); setEditingPart(null); setMessage('') } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save the project dashboard.') } }
  const saveProjectImage = async (imageUrl: string) => { try { setMessage('Saving…'); const next = { ...draft, image_url:imageUrl }; await adminRequest(`/api/admin/projects/${projectId}`, { method:'PATCH', body:JSON.stringify({ dashboard:{ imageUrl, userGoal:next.user_goal, costBudget:next.cost_budget, costActual:next.cost_actual, adoptionRate:next.adoption_rate, forecastPenetration:next.forecast_penetration, milestones:next.milestones, tasks:next.tasks, problemContent:next.problem_content } }) }); setDraft(next); setProject(next); onProjectSaved?.(next); setEditingPart(null); setMessage('') } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save the project image.') } }
  const saveTimeline = async (milestones: Milestone[]) => { try { const ordered = [...milestones].sort((a,b)=>a.date.localeCompare(b.date)); const next = { ...draft, milestones:ordered }; setDraft(next); await adminRequest(`/api/admin/projects/${projectId}`, { method:'PATCH', body:JSON.stringify({ dashboard:{ imageUrl:next.image_url, userGoal:next.user_goal, costBudget:next.cost_budget, costActual:next.cost_actual, adoptionRate:next.adoption_rate, forecastPenetration:next.forecast_penetration, milestones:ordered, tasks:next.tasks, problemContent:next.problem_content } }) }); setProject(next); onProjectSaved?.(next); setMessage('') } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save the project timeline.') } }
  const saveProblemContent = async (problemContent: ProblemBlock[]) => { const next={...draft,problem_content:problemContent}; await adminRequest(`/api/admin/projects/${projectId}`,{method:'PATCH',body:JSON.stringify({dashboard:{imageUrl:next.image_url,userGoal:next.user_goal,costBudget:next.cost_budget,costActual:next.cost_actual,adoptionRate:next.adoption_rate,forecastPenetration:next.forecast_penetration,milestones:next.milestones,tasks:next.tasks,problemContent}})}); setDraft(next);setProject(next);onProjectSaved?.(next) }
  const chooseProjectImage = async (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; event.target.value = ''; if (!file) return; if (!['image/jpeg','image/png','image/webp'].includes(file.type)) { setMessage('Use a JPG, PNG, or WebP image.'); return } if (file.size > 2 * 1024 * 1024) { setMessage('Choose an image smaller than 2 MB.'); return } try { const dataUrl = await new Promise<string>((resolve,reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error('Could not read the image.')); reader.readAsDataURL(file) }); await saveProjectImage(dataUrl) } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not read the image.') } }
  const initials = draft.name.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase()
  const timeline = [...(draft.milestones.length ? draft.milestones : initialProjectTimeline(draft.created_at))].sort((a,b)=>a.date.localeCompare(b.date))
  const openMilestoneEditor = (milestone: Milestone, anchor: string | null = null) => { setMilestoneEdit({...milestone}); setMilestoneEditAnchor(anchor) }
  const addMilestoneBetween = (current: Milestone, next: Milestone) => { const start = new Date(`${current.date}T00:00:00Z`).getTime(); const end = new Date(`${next.date}T00:00:00Z`).getTime(); const date = new Date(start + Math.max(86400000, Math.floor((end-start)/2))).toISOString().slice(0,10); openMilestoneEditor({id:`goal-${current.id}-${next.id}`,name:'New Goal',date,status:'planned'},current.id) }
  return <><PageHead title="Project Details" intro="" /><div className="project-detail admin-project-detail">
    <header className="project-page-header">
    <nav className="project-section-links" aria-label="Project administration"><a href="#overview">Overview</a><a href="#tasks">Tasks</a><a href="#analytics">Analytics</a><a href="#reports">Reports</a><a href="/member/admin-users">Users</a><a href="#settings">Settings</a></nav>
    <div className="project-detail-nav"><a className="project-back" href="/member/projects" onClick={event=>{event.preventDefault();onBack()}}><ArrowLeft/> All projects</a></div>
    <section className="project-identity admin-project-identity" id="overview"><div className="project-cover admin-hover-edit">{draft.image_url?<div className="project-cover-image admin-hover-content" role="img" aria-label={`${draft.name} project`} style={{backgroundImage:`url(${draft.image_url})`}}/>:<span className="admin-hover-content"><ImageIcon/><b>{initials}</b></span>}{editingPart==='image'?<label className="admin-project-image-picker"><ImageIcon/> {draft.image_url?'Change Image':'Upload Image'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event=>void chooseProjectImage(event)}/></label>:<div className="admin-hover-actions">{draft.image_url?<><button type="button" onClick={()=>setEditingPart('image')}><Pencil/> Edit</button><button type="button" onClick={()=>void saveProjectImage('')}><Trash2/> Delete</button></>:<button type="button" onClick={()=>setEditingPart('image')}><ImageIcon/> Upload</button>}</div>}</div><div>{editingPart==='title'?<div className="admin-inline-editor admin-title-inline-editor"><input aria-label="Project title" maxLength={PROJECT_TITLE_MAX} value={draft.name} onChange={event=>setDraft({...draft,name:event.target.value})}/><small>{draft.name.length}/{PROJECT_TITLE_MAX}</small><button type="button" onClick={()=>void save()}>Save</button></div>:<div className="admin-hover-edit admin-title-edit"><h1 className="admin-hover-content">{draft.name||'Project Title'}</h1><div className="admin-hover-actions"><button type="button" onClick={()=>setEditingPart('title')}><Pencil/> Edit</button></div></div>}{editingPart==='description'?<div className="admin-inline-editor admin-description-inline-editor"><textarea aria-label="Project description" maxLength={PROJECT_DESCRIPTION_MAX} value={draft.description} onChange={event=>setDraft({...draft,description:event.target.value})}/><small>{draft.description.length}/{PROJECT_DESCRIPTION_MAX}</small><button type="button" onClick={()=>void save()}>Save</button></div>:<div className="admin-hover-edit admin-description-edit"><p className="admin-hover-content">{draft.description||'Project Description'}</p><div className="admin-hover-actions"><button type="button" onClick={()=>setEditingPart('description')}><Pencil/> Edit</button></div></div>}<ProjectPitchLinks active={pitchSection} onSelect={setPitchSection}/></div></section>
    {message&&message!=='Loading project…'&&message!=='Saving…'&&<p className="profile-message" role="status">{message}</p>}
    </header>
    <section className="project-page-body" aria-live="polite">
    <section className={`project-pitch-page${pitchSection==='Control Panel'?' control-panel-page':''}`} id={pitchSection.toLowerCase().replaceAll(' ','-')}>{pitchSection==='Control Panel'?<div className="control-panel-timeline-scroll"><div className="control-panel-timeline">{timeline.map((milestone,index)=><article key={milestone.id}><button type="button" className={`timeline-point timeline-point-${milestone.status}`} aria-label={`Edit ${milestone.name}`} onClick={()=>openMilestoneEditor(milestone)}>{milestone.status==='completed'?<Check/>:<span/>}</button>{index<timeline.length-1&&<button type="button" className="timeline-add-point" aria-label={`Add goal between ${milestone.name} and ${timeline[index+1].name}`} onClick={()=>addMilestoneBetween(milestone,timeline[index+1])}>+</button>}<div className="timeline-goal-title admin-hover-edit"><strong className="admin-hover-content">{milestone.name}</strong><div className="admin-hover-actions"><button type="button" onClick={()=>openMilestoneEditor(milestone)}><Pencil/> Edit</button></div></div><time>{new Date(`${milestone.date}T00:00:00`).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</time><span className={`timeline-status timeline-status-${milestone.status}`}>{milestone.status.replace('_',' ')}</span>{milestoneEdit&&(milestoneEdit.id===milestone.id||milestoneEditAnchor===milestone.id)&&<div className="timeline-edit-popup"><label>Goal Title<input maxLength={40} value={milestoneEdit.name} onChange={event=>setMilestoneEdit({...milestoneEdit,name:event.target.value})}/></label><label>Goal Date<input type="date" value={milestoneEdit.date} onChange={event=>setMilestoneEdit({...milestoneEdit,date:event.target.value})}/></label><label>Goal Status<select value={milestoneEdit.status} onChange={event=>setMilestoneEdit({...milestoneEdit,status:event.target.value as Milestone['status']})}><option value="planned">Planned</option><option value="in_progress">In Progress</option><option value="completed">Completed</option></select></label><div><button type="button" onClick={()=>{const exists=timeline.some(item=>item.id===milestoneEdit.id);void saveTimeline(exists?timeline.map(item=>item.id===milestoneEdit.id?milestoneEdit:item):[...timeline,milestoneEdit]);setMilestoneEdit(null);setMilestoneEditAnchor(null)}}>Save</button><button type="button" onClick={()=>{setMilestoneEdit(null);setMilestoneEditAnchor(null)}}>Cancel</button><button type="button" className="timeline-delete-action" onClick={()=>{const exists=timeline.some(item=>item.id===milestoneEdit.id);if(exists)void saveTimeline(timeline.filter(item=>item.id!==milestoneEdit.id));setMilestoneEdit(null);setMilestoneEditAnchor(null)}}>Delete</button></div></div>}</article>)}</div></div>:pitchSection==='Problem'?<ProblemPageEditor blocks={draft.problem_content} onSave={saveProblemContent}/>:<h2>{pitchSection}</h2>}</section>
    </section>
  </div></>
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

const structuredPageContext: Record<string, { header: string; icon: ReactNode; noticeTitle: string; noticeCopy: string }> = {
  'Beta Programs': { header:'Programs', icon:<FlaskConical/>, noticeTitle:'Beta program access', noticeCopy:'Review invitations and participation information for beta programs available to you.' },
  Updates: { header:'Project Updates', icon:<BookOpen/>, noticeTitle:'Updates available to you', noticeCopy:'Review news and changes from projects and programs you can access.' },
  Users: { header:'User Directory', icon:<Users/>, noticeTitle:'User access administration', noticeCopy:'Review account status, project involvement, and administrator roles.' },
  'Profile & Security': { header:'Account Settings', icon:<User/>, noticeTitle:'Profile and security', noticeCopy:'Manage your member profile, sign-in details, and notification preferences.' },
  Notifications: { header:'Notification Center', icon:<Bell/>, noticeTitle:'Account activity', noticeCopy:'Access, agreement, and project activity that needs your attention appears below.' },
}
function PageContext({header,icon,noticeTitle,noticeCopy}:{header:string;icon:ReactNode;noticeTitle:string;noticeCopy:string}) { return <><div className="structured-page-header"><span>{header}</span></div><div className="info-banner structured-page-notice">{icon}<span><strong>{noticeTitle}</strong><small>{noticeCopy}</small></span></div></> }
function PageHead({title,intro}:{title:string,intro:string}) { const context=structuredPageContext[title]; return <><header className="member-page-head"><h1>{title}</h1>{intro&&!context&&<p>{intro}</p>}</header>{context&&<PageContext {...context}/>}</> }
function MemberHub() {
  const initial = window.location.pathname.split('/').filter(Boolean)[1] || 'dashboard'
  const [page,setPage]=useState(initial)
  const [navOpen,setNavOpen]=useState(false)
  const [identity,setIdentity]=useState<MemberIdentity>(()=>identityFromUser())
  const [role,setRole]=useState<'member'|'admin'>('member')
  useEffect(()=>{ const onPop=()=>setPage(window.location.pathname.split('/').filter(Boolean)[1]||'dashboard'); window.addEventListener('popstate',onPop); return()=>window.removeEventListener('popstate',onPop)},[])
  useEffect(()=>{ authClient.getSession().then(async({data})=>{ if(data?.session?.user)setIdentity(identityFromUser(data.session.user)); if(data?.session?.access_token){ const response=await fetch('/api/me',{headers:{authorization:`Bearer ${data.session.access_token}`}}); const result=await response.json(); if(response.ok&&result.profile?.role==='admin')setRole('admin') } }) },[])
  const navigate=(slug:string)=>{window.history.pushState({},'',`/member/${slug}`);setPage(slug);setNavOpen(false);window.scrollTo(0,0)}
  const signOut=async()=>{await authClient.signOut();window.location.assign('/auth/sign-in')}
  const screens:Record<string,ReactNode>={dashboard:<Dashboard/>,projects:<ProjectsPage isAdmin={role==='admin'}/>,legal:<AgreementsPage isAdmin={role==='admin'}/>,'beta-programs':<BetaPage/>,updates:<UpdatesPage/>,notifications:<NotificationsPage/>,profile:<ProfilePage identity={identity} onSaved={setIdentity}/>,...(role==='admin'?{'admin-users':<AdminUsersPage/>}:{})}
  const visibleNav = role === 'admin' ? [...memberNav, ...adminNav, ...sidebarUtilityNav] : [...memberNav, ...sidebarUtilityNav]
  const isDashboard = page==='dashboard'
  const isStructuredPage = ['beta-programs','updates','admin-users','profile','notifications'].includes(page)
  const isProjectEdit = page==='projects'&&new URLSearchParams(window.location.search).has('adminEdit')
  const isProjectsCatalog = page==='projects'&&!window.location.pathname.split('/').filter(Boolean)[2]&&!isProjectEdit
  return <div className="member-shell">
    <aside className={`member-sidebar ${navOpen?'open':''}`}>
      <div className="member-brand"><a href="/" aria-label="Orbit Systems home"><Image src="/osai-header-logo.png" alt="Orbit Systems — Augmented Intelligence" width={1196} height={399} priority /></a></div>
      <nav aria-label="Member navigation">
        {visibleNav.map(({slug,label,icon:Icon,count})=><a href={`/member/${slug}`} className={page===slug?'active':undefined} onClick={(e)=>{e.preventDefault();navigate(slug)}} key={slug}><Icon/><span>{label}</span>{count?<b>{count}</b>:null}</a>)}
        <button className="sidebar-signout" type="button" onClick={signOut}><LogOut/><span>Sign Out</span></button>
      </nav>
    </aside>
    <div className="member-main">
      {isDashboard||isStructuredPage||page==='legal'||isProjectsCatalog||isProjectEdit
        ? <header className="member-topbar agreements-mobile-topbar"><button className="member-menu" onClick={()=>setNavOpen(!navOpen)} aria-label="Open navigation"><Menu/></button></header>
        : <header className="member-topbar"><button className="member-menu" onClick={()=>setNavOpen(!navOpen)} aria-label="Open navigation"><Menu/></button><span className="topbar-title">{role==='admin'?'Admin Hub':'Member Hub'}</span></header>}
      <main className={`member-content${isDashboard?' dashboard-content':isStructuredPage?' structured-content':page==='legal'?' agreements-content':isProjectsCatalog?' projects-content':isProjectEdit?' project-details-content':''}`}>{screens[page]||<Dashboard/>}</main>
    </div>
    {navOpen&&<button className="nav-scrim" onClick={()=>setNavOpen(false)} aria-label="Close navigation"/>}
  </div>
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
