"use client";

import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight, Bell, BellRing, BookOpen, CalendarDays, Check, ChevronRight, Clock3, FileCheck2, FileText, FlaskConical, FolderKanban, Hourglass, KeyRound, LayoutDashboard, LockKeyhole, Mail, Menu, Activity, DollarSign, ImageIcon, ListTodo, MessageSquareText, Orbit, Pencil, Plus, Search, LogOut, ShieldCheck, Tags, Target, Trash2, TrendingUp, Upload, User, UserCog, Users, X } from "lucide-react";
import AuthPage from "./AuthPage";

const PROJECT_TITLE_MAX = 40;
const PROJECT_DESCRIPTION_MAX = 300;
type MemberNavItem = {
  slug: string;
  label: string;
  icon: typeof LayoutDashboard;
  count?: number;
};
const memberNav: MemberNavItem[] = [
  { slug: "pulse", label: "Pulse", icon: Activity },
  { slug: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { slug: "projects", label: "Projects", icon: FolderKanban },
  { slug: "legal", label: "Legal", icon: FileCheck2 },
  { slug: "beta-programs", label: "Beta Programs", icon: FlaskConical },
  { slug: "updates", label: "Updates", icon: BookOpen },
];
const sidebarUtilityNav: MemberNavItem[] = [
  { slug: "profile", label: "Profile", icon: User },
  { slug: "notifications", label: "Notifications", icon: Bell },
];
const adminNav: MemberNavItem[] = [
  { slug: "admin-profile", label: "Profile", icon: User },
  { slug: "admin-labels", label: "Labels", icon: Tags },
  { slug: "admin-users", label: "Users", icon: UserCog },
  { slug: "admin-teams", label: "Teams", icon: Users },
  { slug: "admin-roles", label: "Roles", icon: ShieldCheck },
  { slug: "admin-legal", label: "Legal", icon: FileCheck2 },
  { slug: "admin-beta", label: "Beta", icon: FlaskConical },
  { slug: "admin-communication", label: "Communication", icon: MessageSquareText },
];

type Milestone = {
  id: string;
  name: string;
  date: string;
  status: "planned" | "in_progress" | "completed";
};
type CatalogProject = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  status: string;
  tone: string;
  initials: string;
  imageUrl?: string;
  accessLevel?: string;
  membershipStatus?: string;
  industry?: string;
  category?: string;
  subCategory?: string;
  industryImageUrl?: string;
  industryBriefDescription?: string;
  industryLongDescription?: string;
  categoryImageUrl?: string;
  categoryBriefDescription?: string;
  categoryLongDescription?: string;
  subCategoryImageUrl?: string;
  subCategoryBriefDescription?: string;
  subCategoryLongDescription?: string;
  milestones: Milestone[];
};
const projects: CatalogProject[] = [];
const projectPitchSections = ["Timeline", "Problem", "Solution", "Competition", "Market", "Traction", "Team", "Business Model", "Invest"] as const;
const adminProjectPitchSections = [...projectPitchSections, "Access"] as const;
function ProjectPitchLinks({ active, onSelect, sections = projectPitchSections }: { active?: string; onSelect?: (section: string) => void; sections?: readonly string[] }) {
  return (
    <nav className="project-pitch-links" aria-label="Project presentation sections">
      {sections.map((label) => (
        <a
          className={active === label ? "active" : undefined}
          key={label}
          href={`#${label.toLowerCase().replaceAll(" ", "-")}`}
          onClick={
            onSelect
              ? (event) => {
                  event.preventDefault();
                  onSelect(label);
                }
              : undefined
          }
        >
          {label}
        </a>
      ))}
    </nav>
  );
}
const activeProjectAccess = new Set(["project_agreement_signed", "project_access_approved"]);
const pendingProjectAccess = new Set(["project_access_requested", "project_review_pending", "project_information_required", "project_agreement_pending"]);
const catalogProjectFromApi = (
  project: {
    id?: string;
    slug: string;
    name: string;
    description: string;
    image_url: string;
    access_level: string;
    membership_status?: string;
    industry?: string;
    category?: string;
    sub_category?: string;
    industry_image_url?: string;
    industry_brief_description?: string;
    industry_long_description?: string;
    category_image_url?: string;
    category_brief_description?: string;
    category_long_description?: string;
    subcategory_image_url?: string;
    subcategory_brief_description?: string;
    subcategory_long_description?: string;
    milestones?: Milestone[];
  },
  index: number,
  isAdmin: boolean,
): CatalogProject => ({
  id: project.id,
  slug: project.slug,
  name: project.name,
  description: project.description,
  imageUrl: project.image_url,
  accessLevel: project.access_level,
  membershipStatus: project.membership_status,
  industry: project.industry?.trim() || "Uncategorized",
  category: project.category?.trim() || "",
  subCategory: project.sub_category?.trim() || "",
  industryImageUrl: project.industry_image_url?.trim() || "",
  industryBriefDescription: project.industry_brief_description?.trim() || "",
  industryLongDescription: project.industry_long_description?.trim() || "",
  categoryImageUrl: project.category_image_url?.trim() || "",
  categoryBriefDescription: project.category_brief_description?.trim() || "",
  categoryLongDescription: project.category_long_description?.trim() || "",
  subCategoryImageUrl: project.subcategory_image_url?.trim() || "",
  subCategoryBriefDescription: project.subcategory_brief_description?.trim() || "",
  subCategoryLongDescription: project.subcategory_long_description?.trim() || "",
  milestones: Array.isArray(project.milestones) ? project.milestones : [],
  status: isAdmin || activeProjectAccess.has(project.membership_status || "") ? "Full access" : pendingProjectAccess.has(project.membership_status || "") ? "Access requested" : "Preview",
  tone: ["teal", "blue", "slate"][index % 3],
  initials:
    project.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "OS",
});

function Brand({ light = true }: { light?: boolean }) {
  return (
    <a className={`brand ${light ? "brand-light" : ""}`} href="/" aria-label="Orbit Systems home">
      <span className="brand-logo-image" aria-hidden="true">
        <img className="brand-logo-base" src="/OSAI_Main-Logo.png?v=20260731" alt="" />
        <img className="brand-logo-accent" src="/OSAI_Main-Logo.png?v=20260731" alt="" />
      </span>
    </a>
  );
}

const publicNav = [
  { label: "Home", href: "/" },
  { label: "Venture", href: "/venture" },
  { label: "Innovation", href: "/innovation" },
  { label: "Consulting", href: "/consulting" },
  { label: "Insights", href: "/insights" },
  { label: "Contact", href: "/contact" },
];

function PublicHeader({ current }: { current: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    document.body.classList.toggle("public-menu-open", menuOpen);
    return () => document.body.classList.remove("public-menu-open");
  }, [menuOpen]);
  return (
    <>
      <header className="public-header">
        <div className="page-wrap site-header">
          <Brand />
          <nav id="public-navigation" className={menuOpen ? "open" : ""} aria-label="Primary navigation">
            {publicNav.map((item) => (
              <a key={item.href} className={current === item.href ? "active" : undefined} href={item.href} onClick={() => setMenuOpen(false)}>
                {item.label}
              </a>
            ))}
            <a className="nav-sign-in" href="/auth/sign-in" onClick={() => setMenuOpen(false)}>
              <LockKeyhole aria-hidden="true" />
              Client Portal
            </a>
          </nav>
          <button className="menu-button" type="button" aria-expanded={menuOpen} aria-controls="public-navigation" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Close menu" : "Open menu"}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>
    </>
  );
}

function HomePage() {
  return (
    <section className="hero public-page-hero">
      <div className="hero-art" aria-hidden="true" />
      <div className="hero-content page-wrap">
        <div className="hero-copy">
          <h1>We turn ideas into market-ready businesses and products.</h1>
          <p>OSai brings strategy, product development, technology, and commercialization together—so promising ideas can move from possibility to progress.</p>
          <div className="hero-actions">
            <a className="button button-orange" href="/contact">
              Start a conversation
            </a>
            <a className="button button-outline" href="/venture">
              Explore what we do
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

const pageContent: Record<
  string,
  {
    title: string;
    titleClassName?: string;
    intro: string;
    heading: string;
    body: string;
    points: string[];
    action: string;
    actionHref: string;
  }
> = {
  "/venture": {
    title: "Build the right venture—with conviction.",
    intro: "OSai Ventures works alongside founders to move promising ideas from first conviction toward a durable, market-ready business.",
    heading: "A hands-on partner for the venture journey.",
    body: "We connect strategy, product decisions, technology, and commercialization so the venture stays focused on evidence, momentum, and the next meaningful milestone.",
    points: ["Opportunity framing", "Product and market validation", "Build and launch planning", "Growth and commercialization"],
    action: "Start a venture conversation",
    actionHref: "/contact",
  },
  "/innovation": {
    title: "Turn bold ideas into practical innovation.",
    intro: "OSai Innovation helps organizations explore opportunities, test assumptions, and create solutions grounded in real customer and business needs.",
    heading: "Innovation designed to become real.",
    body: "Our programs bring strategy, design, and emerging technology into one disciplined process—from discovery through tested concepts and implementation direction.",
    points: ["Opportunity discovery", "Rapid concept development", "Customer-centered validation", "Implementation roadmaps"],
    action: "Explore an innovation program",
    actionHref: "/contact",
  },
  "/consulting": {
    title: "Provide clarity for complex business\nand technology decisions",
    titleClassName: "consulting-title",
    intro: "OSai Consulting helps leaders connect strategy, operations, product, and technology around outcomes that matter.",
    heading: "Focused expertise, connected execution.",
    body: "We work across the decisions that frequently become disconnected—market direction, operating models, product priorities, and technology roadmaps.",
    points: ["Business and market strategy", "Product and portfolio direction", "Operating-model design", "Technology planning"],
    action: "Discuss a consulting need",
    actionHref: "/contact",
  },
  "/insights": {
    title: "Ideas for moving from possibility to progress.",
    intro: "Perspectives from the work of shaping opportunities, building products, and bringing new ventures to market.",
    heading: "What we are learning.",
    body: "OSai Insights will share practical thinking from venture building, innovation programs, and consulting work. New perspectives will be published here as they are ready.",
    points: ["Venture building", "Practical innovation", "Product strategy", "Technology and commercialization"],
    action: "Start a conversation",
    actionHref: "/contact",
  },
};

function DetailPage({ content }: { content: (typeof pageContent)[string] }) {
  return (
    <main className="public-detail">
      <section className="detail-hero">
        <div className="page-wrap">
          <h1 className={content.titleClassName}>{content.title}</h1>
          <p>{content.intro}</p>
        </div>
      </section>
      <section className="detail-body page-wrap">
        <div>
          <h2>{content.heading}</h2>
          <p>{content.body}</p>
          <a className="button button-orange" href={content.actionHref}>
            {content.action}
          </a>
        </div>
        <ul>
          {content.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function ContactPage() {
  return (
    <main className="public-detail contact-page">
      <section className="detail-hero">
        <div className="page-wrap">
          <h1>Let’s move a worthwhile idea forward.</h1>
          <p>Tell us what you’re building, where you’re stuck, or what opportunity you want to explore.</p>
        </div>
      </section>
      <section className="contact-body page-wrap">
        <div>
          <h2>Start a conversation.</h2>
          <p>Share a short description of the opportunity and the kind of help you are looking for. We’ll respond with the most useful next step.</p>
        </div>
        <a className="contact-email" href="mailto:hello@osai.com">
          <span>Email OSai</span>
          <strong>hello@osai.com</strong>
          <ArrowRight />
        </a>
      </section>
    </main>
  );
}

function PublicSite() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  const content = pageContent[path];
  return (
    <div className="public-site">
      <PublicHeader current={path} />
      {path === "/" ? <HomePage /> : path === "/contact" ? <ContactPage /> : content ? <DetailPage content={content} /> : <HomePage />}
    </div>
  );
}

function Status({ children, tone = "teal" }: { children: ReactNode; tone?: string }) {
  return <span className={`status status-${tone}`}>{children}</span>;
}
function SectionHead({ title, action, to }: { title: string; action?: string; to?: string }) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      {action && (
        <a href={to}>
          {action}
          <ChevronRight size={18} />
        </a>
      )}
    </div>
  );
}

const urgentDashboardItems: Array<{
  title: string;
  detail: string;
  href: string;
}> = [];
const pendingDashboardItems: Array<{
  title: string;
  detail: string;
  href: string;
}> = [];

function ProjectSnapshot({ project, available = false }: { project: CatalogProject; available?: boolean }) {
  return (
    <a className="snapshot-tile" href="/member/projects">
      <span className={`snapshot-mark ${project.tone}`}>{project.initials}</span>
      <span className="snapshot-copy">
        <small>{available ? "Available to you" : "Current project"}</small>
        <strong>{project.name}</strong>
        <span>{project.description}</span>
      </span>
      <span className="snapshot-foot">
        <Status tone={project.tone}>{project.status}</Status>
        <ChevronRight />
      </span>
    </a>
  );
}

function Dashboard() {
  const currentProjects = projects.filter((project) => project.status !== "Request access");
  const availableProjects = projects.filter((project) => project.status === "Request access");
  return (
    <>
      <PageHead title="Dashboard" intro="" />
      <div className="dashboard-page-header">
        <span>Overview</span>
      </div>
      <div className="info-banner dashboard-notice">
        <LayoutDashboard />
        <span>
          <strong>Dashboard overview</strong>
          <small>Your project, invitation, and activity information is organized below.</small>
        </span>
      </div>
      <div className="modular-dashboard">
        <section className="dashboard-module analytics-module" aria-label="Financial forecasts">
          <div className="analytics-grid">
            <article className="analytic analytic-line">
              <header>
                <h2>Projected portfolio value</h2>
                <strong>$1.24M</strong>
                <span>+18.6% forecast</span>
              </header>
              <svg viewBox="0 0 340 132" role="img" aria-label="Projected portfolio value rises from 760 thousand dollars to 1.24 million dollars over five quarters">
                <g className="chart-grid">
                  <path d="M12 18H328M12 64H328M12 110H328" />
                </g>
                <path className="area-fill" d="M12 104L75 90L138 96L201 62L264 50L328 22V120H12Z" />
                <path className="line-stroke" d="M12 104L75 90L138 96L201 62L264 50L328 22" />
                <g className="line-dots">
                  <circle cx="12" cy="104" r="3" />
                  <circle cx="75" cy="90" r="3" />
                  <circle cx="138" cy="96" r="3" />
                  <circle cx="201" cy="62" r="3" />
                  <circle cx="264" cy="50" r="3" />
                  <circle cx="328" cy="22" r="4" />
                </g>
              </svg>
              <div className="chart-axis" aria-hidden="true">
                <span>Q3</span>
                <span>Q4</span>
                <span>Q1</span>
                <span>Q2</span>
                <span>Q3</span>
                <span>Q4</span>
              </div>
            </article>

            <article className="analytic analytic-bars">
              <header>
                <h2>Expected ROI by project</h2>
                <strong>24.8%</strong>
                <span>Blended forecast</span>
              </header>
              <div className="vertical-bars" role="img" aria-label="Expected return on investment: APD 31 percent, Career Pivot 24 percent, Social Encounter 15 percent">
                <span>
                  <i style={{ height: "88%" }} />
                  <small>APD</small>
                  <b>31%</b>
                </span>
                <span>
                  <i style={{ height: "68%" }} />
                  <small>CP</small>
                  <b>24%</b>
                </span>
                <span>
                  <i style={{ height: "43%" }} />
                  <small>SE</small>
                  <b>15%</b>
                </span>
              </div>
            </article>

            <article className="analytic analytic-donut">
              <header>
                <h2>My projects</h2>
                <strong>{currentProjects.length}</strong>
                <span>Active forecasts</span>
              </header>
              <div className="donut-wrap">
                <div className="donut-chart" role="img" aria-label="Active project forecast mix: 63 percent Advanced Predictive Data and 37 percent Career Pivot">
                  <span>
                    <strong>{currentProjects.length}</strong>
                    <small>Projects</small>
                  </span>
                </div>
                <ul>
                  <li>
                    <i className="teal" />
                    APD <b>63%</b>
                  </li>
                  <li>
                    <i className="blue" />
                    Career Pivot <b>37%</b>
                  </li>
                </ul>
              </div>
            </article>

            <article className="analytic analytic-allocation">
              <header>
                <h2>12-month capital forecast</h2>
                <strong>$420K</strong>
                <span>Planned allocation</span>
              </header>
              <div className="allocation-list">
                <span>
                  <small>Product development</small>
                  <b>$189K</b>
                  <i>
                    <em style={{ width: "45%" }} />
                  </i>
                </span>
                <span>
                  <small>Go-to-market</small>
                  <b>$126K</b>
                  <i>
                    <em style={{ width: "30%" }} />
                  </i>
                </span>
                <span>
                  <small>Operations</small>
                  <b>$105K</b>
                  <i>
                    <em style={{ width: "25%" }} />
                  </i>
                </span>
              </div>
            </article>
          </div>
          <p className="forecast-note">Illustrative forecasts for planning purposes; not verified performance or an investment offer.</p>
        </section>

        {urgentDashboardItems.length > 0 && (
          <section className="dashboard-module action-module urgent-module">
            <SectionHead title="Urgent" />
            {urgentDashboardItems.map((item) => (
              <a href={item.href} key={item.title}>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                </span>
                <ChevronRight />
              </a>
            ))}
          </section>
        )}

        <section className="dashboard-module invitation-module" aria-labelledby="invitations-title">
          <div className="module-heading compact">
            <span className="module-icon orange">
              <Mail />
            </span>
            <div>
              <h2 id="invitations-title">Invitations</h2>
              <p>Opportunities waiting for your response.</p>
            </div>
          </div>
          <a className="invitation-row" href="/member/beta-programs">
            <span className="round-icon orange">
              <FlaskConical />
            </span>
            <span>
              <strong>Career Pivot research preview</strong>
              <small>Help test a guided career clarity experience.</small>
              <em>Expires Aug 11</em>
            </span>
            <button>View invitation</button>
          </a>
        </section>

        {pendingDashboardItems.length > 0 && (
          <section className="dashboard-module action-module pending-module">
            <div className="module-heading compact">
              <span className="module-icon blue">
                <Hourglass />
              </span>
              <div>
                <h2>Pending</h2>
                <p>Items currently awaiting completion or approval.</p>
              </div>
            </div>
            {pendingDashboardItems.map((item) => (
              <a href={item.href} key={item.title}>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                </span>
                <ChevronRight />
              </a>
            ))}
          </section>
        )}

        <section className="dashboard-module projects-module">
          <SectionHead title="Current Projects" action="View all projects" to="/member/projects" />
          <div className="snapshot-grid">
            {currentProjects.map((project) => (
              <ProjectSnapshot project={project} key={project.name} />
            ))}
          </div>
        </section>
        <section className="dashboard-module projects-module">
          <SectionHead title="Available Projects" action="Explore projects" to="/member/projects" />
          <div className="snapshot-grid">
            {availableProjects.map((project) => (
              <ProjectSnapshot project={project} available key={project.name} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function UserPostingEditor({ onBack, contributorName }: { onBack: () => void; contributorName: string }) {
  type PostingRecord = {
    id: string; section: string; title: string; summary: string; body: string; contributorName: string;
    topics: string[]; citations: { label: string; url: string }[]; distribution: { channels: string[]; audience: string };
    submissionStatus: "local_draft" | "submitting" | "submitted" | "failed"; submissionAttempts: number;
    lastSubmissionError?: string | null; nextRetryAt?: string | null; updatedAt: string;
  };
  const [postId, setPostId] = useState("");
  const [section, setSection] = useState("OSai Briefing");
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [contributor, setContributor] = useState(contributorName);
  const [tags, setTags] = useState("");
  const [citations, setCitations] = useState("");
  const [audience, setAudience] = useState("public");
  const [submissionStatus, setSubmissionStatus] = useState<PostingRecord["submissionStatus"]>("local_draft");
  const [status, setStatus] = useState("Loading your latest local draft…");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const postingPayload = () => ({
    section, title: headline, summary, body, contributorName: contributor,
    topics: tags.split(",").map(tag => tag.trim()).filter(Boolean),
    citations: citations.split("\n").map(line => line.trim()).filter(Boolean).map(line => {
      const [label, ...urlParts] = line.split("|");
      return { label: label.trim(), url: urlParts.join("|").trim() };
    }),
    distribution: { channels: ["onn"], audience },
  });
  const applyPost = useCallback((post: PostingRecord) => {
    setPostId(post.id); setSection(post.section); setHeadline(post.title); setSummary(post.summary); setBody(post.body);
    setContributor(post.contributorName); setTags(post.topics.join(", "));
    setCitations(post.citations.map(citation => `${citation.label} | ${citation.url}`).join("\n"));
    setAudience(post.distribution.audience); setSubmissionStatus(post.submissionStatus);
    if (post.submissionStatus === "submitted") setStatus("Submitted to ONN");
    else if (post.submissionStatus === "failed") setStatus(`Saved locally · ONN submission failed${post.submissionAttempts ? ` (attempt ${post.submissionAttempts})` : ""}`);
    else setStatus(`Saved locally · ${new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(post.updatedAt))}`);
  }, []);
  useEffect(() => { if (!contributor.trim() && contributorName.trim()) setContributor(contributorName); }, [contributor, contributorName]);
  useEffect(() => {
    let active = true;
    memberRequest("/api/posts").then(data => {
      if (!active) return;
      const latest = (data.posts as PostingRecord[])[0];
      if (latest && latest.submissionStatus !== "submitted") applyPost(latest);
      else setStatus("Not yet saved · local OSai draft");
    }).catch(loadError => active && setStatus(loadError instanceof Error ? loadError.message : "Could not load drafts."));
    return () => { active = false; };
  }, [applyPost]);
  const saveDraft = async () => {
    setBusy(true); setError("");
    try {
      const data = await memberRequest(postId ? `/api/posts/${postId}` : "/api/posts", { method: postId ? "PATCH" : "POST", body: JSON.stringify(postingPayload()) });
      applyPost(data.post as PostingRecord);
      return data.post as PostingRecord;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save this draft.");
      return null;
    } finally { setBusy(false); }
  };
  const submitPost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const saved = await saveDraft();
      if (!saved) return;
      const id = saved.id;
      setStatus("Saved locally · submitting to ONN…");
      const data = await memberRequest(`/api/posts/${id}/submit`, { method: "POST" });
      applyPost(data.post as PostingRecord);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "ONN submission failed.";
      setSubmissionStatus("failed"); setStatus("Saved locally · not submitted to ONN"); setError(`${message} Your OSai draft is safe; you can retry.`);
    } finally { setBusy(false); }
  };
  return (
    <section className="posting-editor" aria-label="User Posting Editor">
      <header className="posting-editor-header">
        <button type="button" onClick={onBack}><ArrowLeft /> Back to The Pulse</button>
        <div>
          <span>{status}</span>
          <button type="button" onClick={() => void saveDraft()} disabled={busy || submissionStatus === "submitted"}>Save Draft</button>
          <button type="submit" form="pulse-post-form" disabled={busy || submissionStatus === "submitted"}>{submissionStatus === "failed" ? "Retry ONN" : submissionStatus === "submitted" ? "Submitted" : "Submit to ONN"}</button>
        </div>
      </header>
      <div className="posting-editor-title">
        <h1>User Posting Editor</h1>
        <p>Compose an OSai story, save it locally, and explicitly submit the validated version to ONN.</p>
        {error ? <p className="posting-editor-error" role="alert">{error}</p> : null}
      </div>
      <div className="posting-editor-layout">
        <form id="pulse-post-form" className="posting-editor-form" onSubmit={submitPost}>
          <label>
            Section
            <select value={section} onChange={(event) => setSection(event.target.value)}>
              <option>OSai Briefing</option>
              <option>Portfolio Notes</option>
              <option>Inside OSai</option>
              <option>From the Lab</option>
            </select>
          </label>
          <label>
            Contributor
            <input value={contributor} onChange={(event) => setContributor(event.target.value)} placeholder="Contributor or editorial desk" maxLength={100} required />
          </label>
          <label>
            Headline
            <input value={headline} onChange={(event) => setHeadline(event.target.value)} placeholder="Write a clear, specific headline" maxLength={100} required />
            <span>{headline.length}/100</span>
          </label>
          <label>
            Summary
            <textarea className="posting-summary" value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Summarize the story in one or two sentences" maxLength={220} required />
            <span>{summary.length}/220</span>
          </label>
          <label>
            Story
            <textarea className="posting-body" value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write the story here…" required />
          </label>
          <label>
            Topics
            <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="Separate tags with commas" />
          </label>
          <label>
            Citations
            <textarea className="posting-citations" value={citations} onChange={(event) => setCitations(event.target.value)} placeholder={"Source name | https://example.com/source\nOne citation per line"} />
          </label>
          <fieldset className="posting-distribution">
            <legend>Distribution settings</legend>
            <label><input type="checkbox" checked readOnly /> OSai News Network</label>
            <label>Audience<select value={audience} onChange={(event) => setAudience(event.target.value)}><option value="public">Public</option><option value="members">OSai members</option></select></label>
          </fieldset>
        </form>
        <aside className="posting-preview" aria-label="Post preview">
          <header><span>Live preview</span><strong>OSai News Network</strong></header>
          <div className="posting-preview-art" aria-hidden="true"><span>OS</span><i /></div>
          <div className="posting-preview-copy">
            <span>{section}</span>
            <h2>{headline.trim() || "Your headline will appear here"}</h2>
            <p>{summary.trim() || "Your story summary will appear here as you write."}</p>
            <small>{contributor.trim() || "Contributor"} · OSai local preview</small>
            {body.trim() ? <div>{body}</div> : null}
            {tags.trim() ? <ul>{tags.split(",").map((tag) => tag.trim()).filter(Boolean).map((tag) => <li key={tag}>{tag}</li>)}</ul> : null}
          </div>
        </aside>
      </div>
    </section>
  );
}

function PulsePage({ onCreatePost }: { onCreatePost: () => void }) {
  const pulsePosts = [
    {
      id: "pulse-welcome",
      category: "OSai Briefing",
      title: "Welcome to Today’s Pulse",
      summary: "A sample front page for sharing portfolio notes, project updates, and useful signals from across the OSai network.",
      author: "OSai Editorial",
      published: "8:30 AM",
      readTime: "3 min read",
      tone: "teal",
    },
    {
      id: "portfolio-notes",
      category: "Portfolio Notes",
      title: "What we are learning across the portfolio",
      summary: "A mock roundup showing how The Pulse can connect observations from projects without exposing protected details.",
      author: "Portfolio Desk",
      published: "7:45 AM",
      readTime: "4 min read",
      tone: "navy",
    },
    {
      id: "work-hub",
      category: "Inside OSai",
      title: "A clearer path through project access",
      summary: "Sample coverage of the member experience, from discovering a project to understanding its access requirements.",
      author: "Member Experience",
      published: "Yesterday",
      readTime: "2 min read",
      tone: "orange",
    },
    {
      id: "feedback-loop",
      category: "From the Lab",
      title: "Keeping every insight connected to its source",
      summary: "A demonstration story about traceable feedback, human review, and learning across independently deployed products.",
      author: "Research Desk",
      published: "Yesterday",
      readTime: "5 min read",
      tone: "blue",
    },
  ];
  const today = new Date();
  const editionYear = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    timeZone: "America/New_York",
  }).format(today);
  const editionMonth = new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: "America/New_York",
  })
    .format(today)
    .toUpperCase();
  const editionMonthNumber = new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    timeZone: "America/New_York",
  }).format(today);
  const editionDay = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    timeZone: "America/New_York",
  }).format(today);
  const [leadPost, ...latestPosts] = pulsePosts;
  return (
    <>
      <PageHead title="Today’s Pulse" intro="" />
      <div className="pulse-edition-bar">
        <time dateTime={`${editionYear}-${editionMonthNumber}-${editionDay}`}>
          {editionYear} Edition: {editionMonth} {editionDay}
        </time>
        <span>OSai News Network</span>
      </div>
      <div className="pulse-toolbar">
        <p>Sample content for layout review</p>
        <button className="pulse-create-post" type="button" onClick={onCreatePost}>Create Post</button>
      </div>
      <section className="pulse-feed" aria-label="Mock news feed">
        <article className={`pulse-lead pulse-tone-${leadPost.tone}`}>
          <div className="pulse-story-art" aria-hidden="true">
            <span>OS</span>
            <i />
          </div>
          <div className="pulse-lead-copy">
            <span className="pulse-category">{leadPost.category}</span>
            <h2>{leadPost.title}</h2>
            <p>{leadPost.summary}</p>
            <div className="pulse-byline">
              <strong>{leadPost.author}</strong>
              <span>{leadPost.published}</span>
              <span>{leadPost.readTime}</span>
            </div>
            <button type="button" aria-label={`Read ${leadPost.title}`}>Read story <ArrowRight /></button>
          </div>
        </article>
        <aside className="pulse-latest" aria-label="Latest sample stories">
          <header>
            <h2>Latest</h2>
            <span>{latestPosts.length} stories</span>
          </header>
          <div>
            {latestPosts.map((post, index) => (
              <article key={post.id}>
                <span className={`pulse-story-number pulse-tone-${post.tone}`}>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <span className="pulse-category">{post.category}</span>
                  <h3>{post.title}</h3>
                  <p>{post.summary}</p>
                  <div className="pulse-byline"><span>{post.published}</span><span>{post.readTime}</span></div>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </section>
    </>
  );
}

const memberPitchSubtitles: Record<string, string> = {
  Problem: "The problem this project is working to solve.",
  Solution: "How the project addresses the identified problem.",
  Competition: "The competitive landscape and the project’s differentiation.",
  Market: "The audience, market, and opportunity for this project.",
  Traction: "Signals of project progress and adoption.",
  Team: "The people building and supporting this project.",
  "Business Model": "How the project creates, delivers, and captures value.",
  Invest: "Investment information for approved participants.",
};

function MemberLimitedProjectDetail({ project, onBack, onProjectChange }: { project: CatalogProject; onBack: () => void; onProjectChange: (project: CatalogProject) => void }) {
  const [activeSection, setActiveSection] = useState("Timeline");
  const [requesting, setRequesting] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const membershipStatus = project.membershipStatus || "";
  const hasAccess = activeProjectAccess.has(membershipStatus);
  const requestPending = pendingProjectAccess.has(membershipStatus);
  const requestAccess = async () => {
    if (!project.id || requesting || hasAccess || requestPending) return;
    try {
      setRequesting(true);
      setRequestMessage("");
      const data = await projectAccessRequest(project.id);
      onProjectChange({
        ...project,
        membershipStatus: data.status,
        status: "Access requested",
      });
      setRequestMessage(data.emailDelivery === "sent" ? "Your request has been sent to the OSai administrators." : "Your access request has been recorded for administrator review.");
    } catch (error) {
      setRequestMessage(error instanceof Error ? error.message : "Could not send the access request.");
    } finally {
      setRequesting(false);
    }
  };
  const milestones = [...project.milestones].sort((a, b) => a.date.localeCompare(b.date));
  const cover = (
    <div className={`project-cover project-cover-${project.tone}`}>
      {project.imageUrl ? (
        <div className="project-cover-image" role="img" aria-label={`${project.name} project`} style={{ backgroundImage: `url(${project.imageUrl})` }} />
      ) : (
        <span>
          <ImageIcon />
          <b>{project.initials}</b>
        </span>
      )}
    </div>
  );
  return (
    <div className="project-detail member-project-detail member-limited-project">
      <button className="project-back" type="button" onClick={onBack}>
        <ArrowLeft /> All projects
      </button>
      <section className="project-identity">
        {cover}
        <div>
          <div className="member-project-title-row">
            <h1>{project.name}</h1>
            <button className="request-access-pill" type="button" disabled={requesting || hasAccess || requestPending} onClick={() => void requestAccess()}>
              {requesting ? "Sending…" : hasAccess ? "Access Granted" : requestPending ? "Access Requested" : "Request Access"}
            </button>
          </div>
          <p>{project.description || "No project brief has been added."}</p>
          <ProjectPitchLinks active={activeSection} onSelect={setActiveSection} />
          {requestMessage && (
            <small className="member-access-message" role="status">
              {requestMessage}
            </small>
          )}
        </div>
      </section>
      <section className="member-project-preview-body" aria-live="polite">
        {activeSection === "Timeline" ? (
          <div className="member-readonly-timeline">
            {milestones.length ? (
              <div className="control-panel-timeline-scroll">
                <div className="control-panel-timeline">
                  {milestones.map((milestone) => (
                    <article key={milestone.id}>
                      <span className={`timeline-point timeline-point-${milestone.status}`} aria-hidden="true">
                        {milestone.status === "completed" ? <Check /> : <span />}
                      </span>
                      <strong>{milestone.name}</strong>
                      <time dateTime={milestone.date}>
                        {new Intl.DateTimeFormat("en-US", {
                          dateStyle: "medium",
                        }).format(new Date(`${milestone.date}T12:00:00`))}
                      </time>
                      <span className={`timeline-status timeline-status-${milestone.status}`}>{milestone.status.replace("_", " ")}</span>
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <div className="member-project-preview-empty">No timeline has been published for this project.</div>
            )}
          </div>
        ) : (
          <p className="member-pitch-subtitle">{memberPitchSubtitles[activeSection]}</p>
        )}
      </section>
    </div>
  );
}

function MemberProjectDetailPage({ project, onBack, isAdmin, onProjectChange }: { project: CatalogProject; onBack: () => void; isAdmin: boolean; onProjectChange: (project: CatalogProject) => void }) {
  const [adminProject, setAdminProject] = useState<AdminProjectDetail | null>(null);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [imageUrl, setImageUrl] = useState(project.imageUrl || "");
  const [editingPart, setEditingPart] = useState<"title" | "description" | null>(null);
  const [adminMessage, setAdminMessage] = useState("");
  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    void adminRequest("/api/admin/projects")
      .then(async (data) => {
        const match = (data.projects as AdminProject[]).find((item) => item.slug === project.slug);
        if (!match) return;
        const detail = projectDetailFromApi((await adminRequest(`/api/admin/projects/${match.id}`)).project);
        if (active) {
          setAdminProject(detail);
          setName(detail.name);
          setDescription(detail.description);
          setImageUrl(detail.image_url);
        }
      })
      .catch((error) => {
        if (active) setAdminMessage(error instanceof Error ? error.message : "Could not load project editing.");
      });
    return () => {
      active = false;
    };
  }, [isAdmin, project.slug]);
  const ensureAdminProject = async () => {
    if (adminProject) return adminProject;
    const current = await adminRequest("/api/admin/projects");
    const existing = (current.projects as AdminProject[]).find((item) => item.slug === project.slug);
    if (existing) {
      const detail = projectDetailFromApi((await adminRequest(`/api/admin/projects/${existing.id}`)).project);
      setAdminProject(detail);
      setImageUrl(detail.image_url);
      return detail;
    }
    const created = await adminRequest("/api/admin/projects", {
      method: "POST",
      body: JSON.stringify({
        name,
        slug: project.slug,
        description,
        status: "published",
        accessLevel: "member",
      }),
    });
    const detail = projectDetailFromApi((await adminRequest(`/api/admin/projects/${created.project.id}`)).project);
    setAdminProject(detail);
    return detail;
  };
  const saveText = async () => {
    try {
      setAdminMessage("Saving…");
      const record = await ensureAdminProject();
      const nextName = name.trim();
      const nextDescription = description.trim();
      await adminRequest(`/api/admin/projects/${record.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: nextName,
          slug: record.slug,
          description: nextDescription,
          status: record.status,
          accessLevel: record.access_level,
        }),
      });
      setAdminProject({
        ...record,
        name: nextName,
        description: nextDescription,
      });
      onProjectChange({
        ...project,
        name: nextName,
        description: nextDescription,
        imageUrl,
      });
      setEditingPart(null);
      setAdminMessage("");
    } catch (error) {
      setAdminMessage(error instanceof Error ? error.message : "Could not save this project.");
    }
  };
  const saveImage = async (nextImageUrl: string) => {
    const record = await ensureAdminProject();
    await adminRequest(`/api/admin/projects/${record.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        dashboard: {
          imageUrl: nextImageUrl,
          userGoal: record.user_goal,
          costBudget: record.cost_budget,
          costActual: record.cost_actual,
          adoptionRate: record.adoption_rate,
          forecastPenetration: record.forecast_penetration,
          milestones: record.milestones,
          tasks: record.tasks,
          ...storyContentPayload(record),
        },
      }),
    });
    setImageUrl(nextImageUrl);
    setAdminProject({ ...record, image_url: nextImageUrl });
    onProjectChange({ ...project, name, description, imageUrl: nextImageUrl });
  };
  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAdminMessage("Use a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAdminMessage("Choose an image smaller than 2 MB.");
      return;
    }
    try {
      setAdminMessage("Uploading…");
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Could not read the image."));
        reader.readAsDataURL(file);
      });
      await saveImage(dataUrl);
      setAdminMessage("");
    } catch (error) {
      setAdminMessage(error instanceof Error ? error.message : "Could not upload the image.");
    }
  };
  const openAdminSection = async (section: "milestones" | "tasks") => {
    try {
      const record = await ensureAdminProject();
      window.location.href = `/member/projects?adminEdit=${record.id}&edit=${section}#${section === "milestones" ? "reports" : "tasks"}`;
    } catch (error) {
      setAdminMessage(error instanceof Error ? error.message : "Could not open project editing.");
    }
  };
  if (!isAdmin) return <MemberLimitedProjectDetail project={project} onBack={onBack} onProjectChange={onProjectChange} />;
  const cover = (
    <div className={`project-cover project-cover-${project.tone}${isAdmin ? " admin-hover-edit" : ""}`}>
      {imageUrl ? (
        <div className="project-cover-image admin-hover-content" role="img" aria-label={`${name} project`} style={{ backgroundImage: `url(${imageUrl})` }} />
      ) : (
        <span className={isAdmin ? "admin-hover-content" : undefined}>
          <ImageIcon />
          <b>{project.initials}</b>
        </span>
      )}
      {isAdmin && (
        <div className="admin-hover-actions">
          {imageUrl && (
            <button type="button" onClick={() => void saveImage("")}>
              <Trash2 /> Delete
            </button>
          )}
          <label className="admin-hover-label">
            <ImageIcon /> {imageUrl ? "Edit" : "Upload"}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void uploadImage(event)} />
          </label>
        </div>
      )}
    </div>
  );
  const title = isAdmin ? (
    editingPart === "title" ? (
      <div className="admin-inline-editor">
        <input aria-label="Project title" maxLength={PROJECT_TITLE_MAX} value={name} onChange={(event) => setName(event.target.value)} />
        <small>
          {name.length}/{PROJECT_TITLE_MAX}
        </small>
        <button type="button" onClick={() => void saveText()}>
          Save
        </button>
        <button
          type="button"
          onClick={() => {
            setName(adminProject?.name || project.name);
            setEditingPart(null);
          }}
        >
          Cancel
        </button>
      </div>
    ) : (
      <div className="admin-hover-edit admin-title-edit">
        <h1 className="admin-hover-content">{name}</h1>
        <div className="admin-hover-actions">
          <button type="button" onClick={() => setEditingPart("title")}>
            <Pencil /> Edit
          </button>
        </div>
      </div>
    )
  ) : (
    <h1>{name}</h1>
  );
  const projectDescription = description || "No project brief has been added.";
  const descriptionContent = isAdmin ? (
    editingPart === "description" ? (
      <div className="admin-inline-editor">
        <textarea aria-label="Project description" maxLength={PROJECT_DESCRIPTION_MAX} value={description} onChange={(event) => setDescription(event.target.value)} />
        <small>
          {description.length}/{PROJECT_DESCRIPTION_MAX}
        </small>
        <button type="button" onClick={() => void saveText()}>
          Save
        </button>
        <button
          type="button"
          onClick={() => {
            setDescription(adminProject?.description || project.description);
            setEditingPart(null);
          }}
        >
          Cancel
        </button>
      </div>
    ) : (
      <div className="admin-hover-edit admin-description-edit">
        <p className="admin-hover-content">{projectDescription}</p>
        <div className="admin-hover-actions">
          <button type="button" onClick={() => setEditingPart("description")}>
            <Pencil /> Edit
          </button>
        </div>
      </div>
    )
  ) : (
    <p>{projectDescription}</p>
  );
  return (
    <div className="project-detail member-project-detail">
      <nav className="project-section-links" aria-label="Project sections">
        <a
          href="/member/projects"
          onClick={(event) => {
            event.preventDefault();
            onBack();
          }}
        >
          Projects
        </a>
        <a href="#overview">Overview</a>
        <a href="#milestones">Milestones</a>
        <a href="#tasks">Tasks</a>
      </nav>
      <section className={`project-identity${isAdmin ? " admin-project-identity" : ""}`} id="overview">
        {cover}
        <div>
          {title}
          {descriptionContent}
          <ProjectPitchLinks />
          {adminMessage && (
            <small className="admin-edit-message" role="status">
              {adminMessage}
            </small>
          )}
        </div>
      </section>
      <section className={`project-milestones${isAdmin ? " admin-hover-edit admin-pane-edit" : ""}`} id="milestones">
        <div className={isAdmin ? "admin-hover-content" : undefined}>
          <header>
            <div>
              <h2>Milestones</h2>
              <p>Published project stages will appear here.</p>
            </div>
          </header>
          <div className="project-empty">No milestones have been published for members.</div>
        </div>
        {isAdmin && (
          <div className="admin-hover-actions">
            <button type="button" onClick={() => void openAdminSection("milestones")}>
              <Pencil /> Edit
            </button>
          </div>
        )}
      </section>
      <section className="project-performance" id="analytics">
        <h2>Performance</h2>
        <div className="performance-rail">
          {[
            {
              label: "Users",
              icon: Users,
              detail: "Goal and actual not published",
            },
            {
              label: "Cost vs Budget",
              icon: DollarSign,
              detail: "Not published",
            },
            {
              label: "Adoption Rate",
              icon: TrendingUp,
              detail: "Not published",
            },
            {
              label: "Forecasted Penetration",
              icon: Target,
              detail: "Not published",
            },
          ].map(({ label, icon: Icon, detail }) => (
            <article key={label}>
              <header>
                <Icon />
                <span>{label}</span>
              </header>
              <strong>—</strong>
              <small>{detail}</small>
              <i>
                <em style={{ width: "0%" }} />
              </i>
            </article>
          ))}
        </div>
      </section>
      <section className={`project-tasks${isAdmin ? " admin-hover-edit admin-pane-edit" : ""}`} id="tasks">
        <div className={isAdmin ? "admin-hover-content" : undefined}>
          <header>
            <div>
              <h2>Tasks</h2>
              <p>Shared project work will appear here.</p>
            </div>
          </header>
          <div className="project-empty">
            <ListTodo /> No tasks have been shared with members.
          </div>
        </div>
        {isAdmin && (
          <div className="admin-hover-actions">
            <button type="button" onClick={() => void openAdminSection("tasks")}>
              <Pencil /> Edit
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function IndustryHoverField({ value, fallback, kind, canEdit, onSave }: { value: string; fallback: string; kind: "title" | "brief" | "long"; canEdit: boolean; onSave: (value: string) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const save = async () => {
    await onSave(draft.trim());
    setEditing(false);
  };
  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };
  if (editing) {
    return (
      <div className={`industry-field industry-field-${kind} industry-field-editor`}>
        {kind === "long" ? (
          <textarea
            autoFocus
            aria-label="Long description"
            maxLength={10000}
            value={draft}
            onBlur={cancel}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") cancel();
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void save();
              }
            }}
          />
        ) : (
          <input
            autoFocus
            aria-label={kind === "title" ? "Industry title" : "Brief description"}
            maxLength={kind === "title" ? 80 : 300}
            value={draft}
            onBlur={cancel}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") cancel();
              if (event.key === "Enter") {
                event.preventDefault();
                void save();
              }
            }}
          />
        )}
      </div>
    );
  }
  return (
    <div className={`industry-field industry-field-${kind}${canEdit ? " admin-hover-edit" : ""}`}>
      <div className={canEdit ? "admin-hover-content" : undefined}>{value || fallback}</div>
      {canEdit && <div className="admin-hover-actions"><button type="button" onClick={() => setEditing(true)}><Pencil /> Edit</button></div>}
    </div>
  );
}

function ClassificationDetail({ name, type, projects, isAdmin, onSave, onOpenProject }: { name: string; type: "industry" | "category" | "subcategory"; projects: CatalogProject[]; isAdmin: boolean; onSave: (currentName: string, update: { name?: string; briefDescription?: string; longDescription?: string }) => Promise<void>; onOpenProject?: (project: CatalogProject) => void }) {
  const record = projects[0];
  const brief = type === "industry" ? record?.industryBriefDescription || "" : type === "category" ? record?.categoryBriefDescription || "" : record?.subCategoryBriefDescription || "";
  const long = type === "industry" ? record?.industryLongDescription || "" : type === "category" ? record?.categoryLongDescription || "" : record?.subCategoryLongDescription || "";
  const label = type === "subcategory" ? "SubCategory" : `${type[0].toUpperCase()}${type.slice(1)}`;
  return (
    <section className="industry-page" aria-label={`${name} ${label}`}>
      <header>
        <IndustryHoverField value={name} fallback={`${label} Title`} kind="title" canEdit={isAdmin} onSave={(nextName) => onSave(name, { name: nextName })} />
        <IndustryHoverField value={brief} fallback="Brief Description" kind="brief" canEdit={isAdmin} onSave={(briefDescription) => onSave(name, { briefDescription })} />
        <IndustryHoverField value={long} fallback="Long Description" kind="long" canEdit={isAdmin} onSave={(longDescription) => onSave(name, { longDescription })} />
      </header>
      <div className="industry-project-grid" aria-label={`${name} projects`}>
        {projects.map((project) => (
          <article key={project.slug}>
            {isAdmin ? (
              <button className="industry-project-title" type="button" onClick={() => onOpenProject?.(project)}>{project.name}</button>
            ) : (
              <strong>{project.name}</strong>
            )}
            <small>{project.category || "Category not assigned"}{project.subCategory ? ` / ${project.subCategory}` : ""}</small>
            <p>{project.description || "Pitch brief has not been added."}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

const IndustryDetail = (props: Omit<Parameters<typeof ClassificationDetail>[0], "name" | "type"> & { industry: string }) => (
  <ClassificationDetail {...props} name={props.industry} type="industry" />
);

function ProjectsPage({ isAdmin }: { isAdmin: boolean }) {
  const initialSlug = window.location.pathname.split("/").filter(Boolean)[2];
  const [catalogProjects, setCatalogProjects] = useState<CatalogProject[]>(projects);
  const [selected, setSelected] = useState<CatalogProject | null>(() => projects.find((project) => project.slug === initialSlug) || null);
  const [filter, setFilter] = useState(isAdmin ? "All projects" : "Industry");
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(() => new URLSearchParams(window.location.search).get("industry"));
  const [selectedCategory, setSelectedCategory] = useState<string | null>(() => new URLSearchParams(window.location.search).get("category"));
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(() => new URLSearchParams(window.location.search).get("subcategory"));
  const [searchQuery, setSearchQuery] = useState("");
  const [addingProject, setAddingProject] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [adminEditingProjectId, setAdminEditingProjectId] = useState<string | null>(() => (isAdmin ? new URLSearchParams(window.location.search).get("adminEdit") : null));
  const [adminDirectoryMode, setAdminDirectoryMode] = useState<"projects" | "industries" | "categories" | "subcategories">("projects");
  useEffect(() => {
    let active = true;
    void projectCatalogRequest()
      .then((data) => {
        if (!active) return;
        const managed = (
          data.projects as Array<{
            id: string;
            slug: string;
            name: string;
            description: string;
            image_url: string;
            access_level: string;
            membership_status?: string;
            industry?: string;
            category?: string;
            sub_category?: string;
            industry_image_url?: string;
            industry_brief_description?: string;
            industry_long_description?: string;
            category_image_url?: string;
            category_brief_description?: string;
            category_long_description?: string;
            subcategory_image_url?: string;
            subcategory_brief_description?: string;
            subcategory_long_description?: string;
            milestones?: Milestone[];
          }>
        ).map((project, index) => catalogProjectFromApi(project, index, isAdmin));
        setCatalogProjects(managed);
        if (initialSlug) setSelected(managed.find((project) => project.slug === initialSlug) || null);
      })
      .catch(() => {
        setCatalogProjects([]);
      });
    return () => {
      active = false;
    };
  }, [isAdmin, initialSlug]);
  const updateProject = (nextProject: CatalogProject) => {
    setCatalogProjects((current) => current.map((item) => (item.slug === nextProject.slug ? nextProject : item)));
    setSelected((current) => (current?.slug === nextProject.slug ? nextProject : current));
  };
  const openProject = (project: CatalogProject) => {
    window.history.pushState({}, "", `/member/projects/${project.slug}`);
    setSelected(project);
    window.scrollTo(0, 0);
  };
  const openIndustry = (industry: string) => {
    const query = new URLSearchParams({ industry });
    window.history.pushState({}, "", `/member/projects?${query.toString()}`);
    setSelectedIndustry(industry);
    window.scrollTo(0, 0);
  };
  const openClassification = (type: "category" | "subcategory", name: string) => {
    const query = new URLSearchParams({ [type]: name });
    window.history.pushState({}, "", `/member/projects?${query.toString()}`);
    if (type === "category") setSelectedCategory(name);
    else setSelectedSubCategory(name);
    window.scrollTo(0, 0);
  };
  const openAdminDirectory = (mode: "projects" | "industries" | "categories" | "subcategories") => {
    window.history.pushState({}, "", "/member/projects");
    setSelectedIndustry(null);
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setAdminDirectoryMode(mode);
    window.scrollTo(0, 0);
  };
  const openAdminProject = (project: CatalogProject) => {
    if (!project.id) return;
    window.history.pushState({}, "", `/member/projects?adminEdit=${project.id}&edit=overview#overview`);
    setAdminEditingProjectId(project.id);
    window.scrollTo(0, 0);
  };
  const closeProject = () => {
    window.history.pushState({}, "", "/member/projects");
    setSelected(null);
    setAdminEditingProjectId(null);
    window.scrollTo(0, 0);
  };
  useEffect(() => {
    const onPop = () => {
      const slug = window.location.pathname.split("/").filter(Boolean)[2];
      setSelected(catalogProjects.find((project) => project.slug === slug) || null);
      setSelectedIndustry(new URLSearchParams(window.location.search).get("industry"));
      setSelectedCategory(new URLSearchParams(window.location.search).get("category"));
      setSelectedSubCategory(new URLSearchParams(window.location.search).get("subcategory"));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [catalogProjects]);
  const addBlankProject = async () => {
    if (addingProject) return;
    try {
      setAddingProject(true);
      const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const data = await adminRequest("/api/admin/projects", {
        method: "POST",
        body: JSON.stringify({
          name: "Project Title",
          slug: `project-${stamp}`,
          description: "",
          status: "draft",
          accessLevel: "member",
        }),
      });
      const project = catalogProjectFromApi({ ...data.project, image_url: "" }, 0, true);
      setCatalogProjects((current) => [project, ...current]);
    } finally {
      setAddingProject(false);
    }
  };
  const deleteProject = async (project: CatalogProject) => {
    if (!project.id) return;
    try {
      await adminRequest(`/api/admin/projects/${project.id}`, {
        method: "DELETE",
      });
      setCatalogProjects((current) => current.filter((item) => item.id !== project.id));
      setDeletingProjectId(null);
    } catch {
      setDeletingProjectId(null);
    }
  };
  const syncAdminProject = (project: AdminProjectDetail) =>
    setCatalogProjects((current) =>
      current.map((item) =>
        item.id === project.id
          ? {
              ...item,
              slug: project.slug,
              name: project.name,
              description: project.description,
              imageUrl: project.image_url,
              initials: project.name
                .split(/\s+/)
                .map((part) => part[0])
                .slice(0, 2)
                .join("")
                .toUpperCase(),
            }
          : item,
      ),
    );
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const searchedProjects = catalogProjects.filter((project) =>
    `${project.name} ${project.description} ${project.industry || ""} ${project.category || ""} ${project.subCategory || ""}`.toLowerCase().includes(normalizedSearch),
  );
  const visibleProjects = searchedProjects.filter((project) =>
    filter === "Requested"
      ? pendingProjectAccess.has(project.membershipStatus || "")
      : filter === "Available"
        ? activeProjectAccess.has(project.membershipStatus || "")
        : true,
  );
  const industryGroups = Array.from(
    searchedProjects.reduce((groups, project) => {
      const industry = project.industry || "Uncategorized";
      groups.set(industry, [...(groups.get(industry) || []), project]);
      return groups;
    }, new Map<string, CatalogProject[]>()),
  ).sort(([left], [right]) => left.localeCompare(right));
  const categoryGroups = Array.from(
    searchedProjects.reduce((groups, project) => {
      const category = project.category || "Uncategorized";
      groups.set(category, [...(groups.get(category) || []), project]);
      return groups;
    }, new Map<string, CatalogProject[]>()),
  ).sort(([left], [right]) => left.localeCompare(right));
  const subCategoryGroups = Array.from(
    searchedProjects.reduce((groups, project) => {
      const subCategory = project.subCategory || "Uncategorized";
      groups.set(subCategory, [...(groups.get(subCategory) || []), project]);
      return groups;
    }, new Map<string, CatalogProject[]>()),
  ).sort(([left], [right]) => left.localeCompare(right));
  const selectedIndustryProjects = selectedIndustry ? industryGroups.find(([industry]) => industry === selectedIndustry)?.[1] || [] : [];
  const selectedCategoryProjects = selectedCategory ? categoryGroups.find(([category]) => category === selectedCategory)?.[1] || [] : [];
  const selectedSubCategoryProjects = selectedSubCategory ? subCategoryGroups.find(([subCategory]) => subCategory === selectedSubCategory)?.[1] || [] : [];
  const saveIndustryImage = async (industry: string, file: File) => {
    if (!isAdmin) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return;
    if (file.size > 2 * 1024 * 1024) return;
    const imageUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Could not read the image."));
      reader.readAsDataURL(file);
    });
    await adminRequest("/api/admin/industries", {
      method: "PATCH",
      body: JSON.stringify({ name: industry, imageUrl }),
    });
    setCatalogProjects((current) => current.map((project) => (project.industry === industry ? { ...project, industryImageUrl: imageUrl } : project)));
  };
  const saveIndustryDetails = async (currentName: string, update: { name?: string; briefDescription?: string; longDescription?: string }) => {
    if (!isAdmin) return;
    const nextName = update.name?.trim() || currentName;
    const data = await adminRequest("/api/admin/industries", {
      method: "PATCH",
      body: JSON.stringify({ currentName, ...update, name: nextName }),
    });
    setCatalogProjects((current) =>
      current.map((project) =>
        project.industry === currentName
          ? {
              ...project,
              industry: data.industry.name,
              industryBriefDescription: data.industry.brief_description,
              industryLongDescription: data.industry.long_description,
            }
          : project,
      ),
    );
    if (nextName !== currentName) {
      setSelectedIndustry(nextName);
      window.history.replaceState({}, "", `/member/projects?${new URLSearchParams({ industry: nextName }).toString()}`);
    }
  };
  const saveClassificationImage = async (type: "category" | "subcategory", name: string, file: File) => {
    if (!isAdmin || !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024) return;
    const imageUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Could not read the image."));
      reader.readAsDataURL(file);
    });
    await adminRequest("/api/admin/classifications", { method: "PATCH", body: JSON.stringify({ type, name, imageUrl }) });
    setCatalogProjects((current) => current.map((project) => {
      const matches = type === "category" ? project.category === name : project.subCategory === name;
      return matches ? { ...project, ...(type === "category" ? { categoryImageUrl: imageUrl } : { subCategoryImageUrl: imageUrl }) } : project;
    }));
  };
  const saveClassificationDetails = async (type: "category" | "subcategory", currentName: string, update: { name?: string; briefDescription?: string; longDescription?: string }) => {
    if (!isAdmin) return;
    const nextName = update.name?.trim() || currentName;
    const data = await adminRequest("/api/admin/classifications", { method: "PATCH", body: JSON.stringify({ type, currentName, ...update, name: nextName }) });
    setCatalogProjects((current) => current.map((project) => {
      const matches = type === "category" ? project.category === currentName : project.subCategory === currentName;
      if (!matches) return project;
      return type === "category"
        ? { ...project, category: data.classification.name, categoryBriefDescription: data.classification.brief_description, categoryLongDescription: data.classification.long_description }
        : { ...project, subCategory: data.classification.name, subCategoryBriefDescription: data.classification.brief_description, subCategoryLongDescription: data.classification.long_description };
    }));
    if (nextName !== currentName) {
      if (type === "category") setSelectedCategory(nextName);
      else setSelectedSubCategory(nextName);
      window.history.replaceState({}, "", `/member/projects?${new URLSearchParams({ [type]: nextName }).toString()}`);
    }
  };
  if (isAdmin && adminEditingProjectId) return <AdminProjectDetailPage key={adminEditingProjectId} projectId={adminEditingProjectId} onBack={closeProject} onProjectSaved={syncAdminProject} />;
  if (isAdmin && selectedIndustry)
    return (
      <>
        <PageHead title="Project Directory" intro="" />
        <div className="toolbar admin-project-toolbar industry-toolbar">
          <div className="admin-directory-tabs" aria-label="Project directory views">
            <button className="active" type="button" onClick={() => openAdminDirectory("industries")}>Industry</button>
            <span aria-hidden="true">/</span>
            <button type="button" onClick={() => openAdminDirectory("categories")}>Category</button>
            <span aria-hidden="true">/</span>
            <button type="button" onClick={() => openAdminDirectory("subcategories")}>SubCategory</button>
            <span aria-hidden="true">/</span>
            <button type="button" onClick={() => openAdminDirectory("projects")}>Projects</button>
          </div>
          <div className="admin-project-toolbar-actions">
            <button className="admin-add-project" type="button" disabled={addingProject} onClick={() => void addBlankProject()}>
              <Plus /> Add Project
            </button>
          </div>
        </div>
        <IndustryDetail industry={selectedIndustry} projects={selectedIndustryProjects} isAdmin onSave={saveIndustryDetails} onOpenProject={openAdminProject} />
      </>
    );
  const selectedClassification = selectedCategory
    ? { type: "category" as const, name: selectedCategory, projects: selectedCategoryProjects, mode: "categories" as const }
    : selectedSubCategory
      ? { type: "subcategory" as const, name: selectedSubCategory, projects: selectedSubCategoryProjects, mode: "subcategories" as const }
      : null;
  if (isAdmin && selectedClassification)
    return (
      <>
        <PageHead title="Project Directory" intro="" />
        <div className="toolbar admin-project-toolbar industry-toolbar">
          <div className="admin-directory-tabs" aria-label="Project directory views">
            <button type="button" onClick={() => openAdminDirectory("industries")}>Industry</button><span aria-hidden="true">/</span>
            <button className={selectedClassification.type === "category" ? "active" : ""} type="button" onClick={() => openAdminDirectory("categories")}>Category</button><span aria-hidden="true">/</span>
            <button className={selectedClassification.type === "subcategory" ? "active" : ""} type="button" onClick={() => openAdminDirectory("subcategories")}>SubCategory</button><span aria-hidden="true">/</span>
            <button type="button" onClick={() => openAdminDirectory("projects")}>Projects</button>
          </div>
          <div className="admin-project-toolbar-actions"><button className="admin-add-project" type="button" disabled={addingProject} onClick={() => void addBlankProject()}><Plus /> Add Project</button></div>
        </div>
        <ClassificationDetail name={selectedClassification.name} type={selectedClassification.type} projects={selectedClassification.projects} isAdmin onSave={(currentName, update) => saveClassificationDetails(selectedClassification.type, currentName, update)} onOpenProject={openAdminProject} />
      </>
    );
  if (selected) return <MemberProjectDetailPage project={selected} onBack={closeProject} isAdmin={isAdmin} onProjectChange={updateProject} />;
  if (isAdmin)
    return (
      <>
        <PageHead title="Project Directory" intro="" />
        <div className="toolbar admin-project-toolbar">
          <div className="admin-directory-tabs" aria-label="Project directory views">
            <button className={adminDirectoryMode === "industries" ? "active" : ""} type="button" onClick={() => setAdminDirectoryMode("industries")}>Industry</button>
            <span aria-hidden="true">/</span>
            <button className={adminDirectoryMode === "categories" ? "active" : ""} type="button" onClick={() => setAdminDirectoryMode("categories")}>Category</button>
            <span aria-hidden="true">/</span>
            <button className={adminDirectoryMode === "subcategories" ? "active" : ""} type="button" onClick={() => setAdminDirectoryMode("subcategories")}>SubCategory</button>
            <span aria-hidden="true">/</span>
            <button className={adminDirectoryMode === "projects" ? "active" : ""} type="button" onClick={() => setAdminDirectoryMode("projects")}>Projects</button>
          </div>
          <div className="admin-project-toolbar-actions">
            <button className="admin-add-project" type="button" disabled={addingProject} onClick={() => void addBlankProject()}>
              <Plus /> Add Project
            </button>
            <label className="search">
              <Search size={18} />
              <input aria-label="Search projects" placeholder="Search projects" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
            </label>
          </div>
        </div>
        {adminDirectoryMode === "industries" ? (
          <div className="industry-directory" aria-label="Industries">
            {industryGroups.map(([industry, industryProjects], index) => {
              const imageUrl = industryProjects.find((project) => project.industryImageUrl)?.industryImageUrl;
              return (
                <article className="industry-directory-item industry-admin-tile admin-hover-edit" key={industry}>
                  <button type="button" className={`industry-tile ${["teal", "blue", "slate"][index % 3]}${imageUrl ? " has-image" : ""} admin-hover-content`} onClick={() => openIndustry(industry)} aria-label={`Open ${industry} industry`}>
                    {imageUrl && <img className="industry-tile-image" src={imageUrl} alt="" />}
                  </button>
                  <strong className="industry-tile-title">{industry}</strong>
                  <div className="admin-hover-actions">
                    <label className="admin-hover-label">
                      <ImageIcon /> {imageUrl ? "Edit" : "Upload"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          event.target.value = "";
                          if (file) void saveIndustryImage(industry, file);
                        }}
                      />
                    </label>
                  </div>
                </article>
              );
            })}
          </div>
        ) : adminDirectoryMode === "categories" || adminDirectoryMode === "subcategories" ? (
          <div className="industry-directory classification-directory" aria-label={adminDirectoryMode === "categories" ? "Categories" : "Subcategories"}>
            {(adminDirectoryMode === "categories" ? categoryGroups : subCategoryGroups).map(([label, classificationProjects], index) => {
              const type = adminDirectoryMode === "categories" ? "category" as const : "subcategory" as const;
              const imageUrl = type === "category"
                ? classificationProjects.find((project) => project.categoryImageUrl)?.categoryImageUrl
                : classificationProjects.find((project) => project.subCategoryImageUrl)?.subCategoryImageUrl;
              return (
              <article className="industry-directory-item industry-admin-tile admin-hover-edit" key={label}>
                <button className={`industry-tile classification-tile ${["teal", "blue", "slate"][index % 3]}${imageUrl ? " has-image" : ""} admin-hover-content`} type="button" onClick={() => openClassification(type, label)} aria-label={`Open ${label} ${type}`}>
                  {imageUrl && <img className="industry-tile-image" src={imageUrl} alt="" />}
                </button>
                <strong className="industry-tile-title">{label}</strong>
                <div className="admin-hover-actions">
                  <label className="admin-hover-label"><ImageIcon /> {imageUrl ? "Edit" : "Upload"}
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      if (file) void saveClassificationImage(type, label, file);
                    }} />
                  </label>
                </div>
              </article>
              );
            })}
          </div>
        ) : (
        <div className="admin-project-tiles">
          {visibleProjects.map((project) => (
            <article className="admin-project-tile admin-hover-edit" key={project.slug} onMouseLeave={() => setDeletingProjectId((current) => (current === project.id ? null : current))}>
              <button className="admin-project-tile-open admin-hover-content" type="button" disabled={!project.id} aria-label={`Open ${project.name} editor`} onClick={() => openAdminProject(project)}>
                <div className={`admin-project-tile-image ${project.tone}`}>
                  {project.imageUrl ? (
                    <div className="catalog-visual-image" role="img" aria-label={`${project.name} project`} style={{ backgroundImage: `url(${project.imageUrl})` }} />
                  ) : (
                    <span>
                      <ImageIcon />
                    </span>
                  )}
                </div>
                <strong>{project.name}</strong>
              </button>
              <div className="admin-hover-actions">
                {project.id && (
                  <>
                    <a
                      href={`/member/projects?adminEdit=${project.id}&edit=overview#overview`}
                      onClick={(event) => {
                        event.preventDefault();
                        openAdminProject(project);
                      }}
                    >
                      <Pencil /> Edit
                    </a>
                    {deletingProjectId === project.id ? (
                      <button className="confirm-delete-project" type="button" onClick={() => void deleteProject(project)}>
                        <Trash2 /> Confirm Delete
                      </button>
                    ) : (
                      <button type="button" onClick={() => setDeletingProjectId(project.id || null)}>
                        <Trash2 /> Delete
                      </button>
                    )}
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
        )}
      </>
    );
  return (
    <>
      <PageHead title="Project Directory" intro="" />
      <div className={`toolbar${selectedIndustry ? " industry-toolbar" : ""}`}>
        <div className="filter-tabs">
          {["Industry", "Available", "Requested"].map((x) => (
            <button
              className={filter === x ? "active" : ""}
              onClick={() => {
                setFilter(x);
                setSelectedIndustry(null);
              }}
              key={x}
            >
              {x}
            </button>
          ))}
        </div>
        {!selectedIndustry && (
          <div className="admin-project-toolbar-actions">
            <label className="search">
              <Search size={18} />
              <input aria-label="Search projects" placeholder="Search projects" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
            </label>
          </div>
        )}
      </div>
      {filter === "Industry" && !selectedIndustry ? (
        <div className="industry-directory" aria-label="Industries">
          {industryGroups.map(([industry, industryProjects], index) => {
            const imageUrl = industryProjects.find((project) => project.industryImageUrl)?.industryImageUrl;
            return (
              <article className="industry-directory-item" key={industry}>
                <button
                  className={`industry-tile ${["teal", "blue", "slate"][index % 3]}${imageUrl ? " has-image" : ""}`}
                  type="button"
                  onClick={() => openIndustry(industry)}
                  aria-label={`Open ${industry} industry`}
                >
                  {imageUrl && <img className="industry-tile-image" src={imageUrl} alt="" />}
                </button>
                <strong className="industry-tile-title">{industry}</strong>
              </article>
            );
          })}
          {industryGroups.length === 0 && <p className="project-directory-empty">No industries match your search.</p>}
        </div>
      ) : filter === "Industry" && selectedIndustry ? (
        <IndustryDetail industry={selectedIndustry} projects={selectedIndustryProjects} isAdmin={false} onSave={saveIndustryDetails} />
      ) : (
      <div className="project-catalog">
        {visibleProjects.map((p, i) => (
          <article className="catalog-row" key={p.slug}>
            <div className={`catalog-visual ${p.tone}`}>{p.imageUrl ? <div className="catalog-visual-image" role="img" aria-label={`${p.name} project`} style={{ backgroundImage: `url(${p.imageUrl})` }} /> : <span>{p.initials}</span>}</div>
            <div>
              <Status tone={p.tone}>{p.status}</Status>
              <h2>{p.name}</h2>
              <p>{p.description}</p>
              <div className="meta-line">
                <span>
                  <Clock3 /> {i === 0 ? "Updated 2 days ago" : "Updated this month"}
                </span>
                <span>
                  <ShieldCheck /> {activeProjectAccess.has(p.membershipStatus || "") ? "Member access" : pendingProjectAccess.has(p.membershipStatus || "") ? "Access requested" : "Preview access"}
                </span>
              </div>
            </div>
            <button className="text-button" onClick={() => openProject(p)}>
              Open project <ArrowRight size={17} />
            </button>
          </article>
        ))}
        {visibleProjects.length === 0 && (
          <p className="project-directory-empty">{filter === "Available" ? "You do not have access to any projects yet." : "You have not requested access to any projects."}</p>
        )}
      </div>
      )}
    </>
  );
}

type AgreementState = {
  configured: boolean;
  environment?: "demo" | "production";
  status: string;
  completedAt?: string | null;
  error?: string;
};
type LegalDocument = {
  id: string;
  fileName: string;
  documentType: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
};
type LegalProjectGroup = {
  id: string;
  project_id: string;
  title: string;
  documents: LegalDocument[];
};

async function memberAuthHeaders() {
  return {};
}

async function projectCatalogRequest() {
  const headers = await memberAuthHeaders();
  const response = await fetch("/api/projects", { cache: "no-store", headers });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Could not load projects.");
  return data;
}

async function projectAccessRequest(projectId: string) {
  const headers = await memberAuthHeaders();
  const response = await fetch(`/api/projects/${projectId}/access-request`, {
    method: "POST",
    headers,
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Could not request project access.");
  return data as { status: string; emailDelivery: string };
}

function AgreementsPage({ isAdmin }: { isAdmin: boolean }) {
  const [agreement, setAgreement] = useState<AgreementState | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  const [isDraggingDocument, setIsDraggingDocument] = useState(false);
  const [legalGroups, setLegalGroups] = useState<LegalProjectGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [groupConfirmed, setGroupConfirmed] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const selectDocument = (file?: File) => {
    if (!file) return;
    setUploadedDocument(file);
    setGroupConfirmed(false);
    setUploadMessage("");
  };
  const loadLegalGroups = async () => {
    const headers = await memberAuthHeaders();
    const response = await fetch("/api/legal", { cache: "no-store", headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not load project legal groups.");
    setLegalGroups(data.groups || []);
  };
  const loadAgreement = async () => {
    try {
      const headers = await memberAuthHeaders();
      const response = await fetch("/api/agreements", {
        cache: "no-store",
        headers,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error === "UNAUTHENTICATED" ? "Your OSai session could not be verified. Please sign in again." : data.error || "We could not verify your agreement status.");
      setAgreement(data);
    } catch (error) {
      setAgreement({
        configured: true,
        status: "error",
        error: error instanceof Error ? error.message : "We could not verify your agreement status.",
      });
    }
  };
  useEffect(() => {
    void loadAgreement();
    void loadLegalGroups().catch((error) => setUploadMessage(error instanceof Error ? error.message : "Could not load project legal groups."));
  }, []);
  const signAgreement = async () => {
    setBusy(true);
    try {
      const headers = await memberAuthHeaders();
      const response = await fetch("/api/agreements/sign", {
        method: "POST",
        headers,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error === "DOCUSIGN_CONSENT_REQUIRED" ? "DocuSign administrator consent is required before signing can begin." : data.error || "We could not open DocuSign.");
      window.location.assign(data.url);
    } catch (error) {
      setAgreement((current) => ({
        configured: current?.configured ?? true,
        status: "error",
        error: error instanceof Error ? error.message : "We could not open DocuSign.",
      }));
      setBusy(false);
    }
  };
  const signed = agreement?.status === "general_nda_signed";
  const waiting = agreement?.status === "general_nda_sent";
  const isDemo = agreement?.environment === "demo";
  const completed = agreement?.completedAt ? new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(new Date(agreement.completedAt)) : "—";
  const bannerTitle = isDemo ? (signed ? "General MNDA test completed" : "Complete the General MNDA test first") : signed ? "Your General MNDA is current" : agreement?.configured === false ? "DocuSign setup is required" : waiting ? "Your General MNDA signature is being verified" : "Complete your General MNDA first";
  const bannerCopy = isDemo ? (signed ? "Project legal documents are now available for this test flow. This sandbox result does not grant real project access." : "Complete this non-binding DocuSign test before opening or downloading any project legal document.") : signed ? "OSai verified this completed envelope with DocuSign. You may now continue to project legal documents." : agreement?.configured === false ? "Add the DocuSign developer-account credentials to connect this page." : waiting ? "Return to DocuSign if needed, then refresh this status before continuing to another legal document." : "Review and sign the current General MNDA before continuing to any project legal document.";
  const canUseProjectLegalDocuments = isAdmin || signed;
  const selectedGroup = legalGroups.find((group) => group.id === selectedGroupId);
  const uploadLegalDocument = async () => {
    if (!uploadedDocument || !selectedGroup || !groupConfirmed) return;
    setBusy(true);
    setUploadMessage("Uploading document…");
    try {
      const headers = await memberAuthHeaders();
      const form = new FormData();
      form.append("document", uploadedDocument);
      form.append("projectGroupId", selectedGroup.id);
      form.append("confirmedProjectGroupId", selectedGroup.id);
      const response = await fetch("/api/admin/legal/documents", {
        method: "POST",
        headers,
        body: form,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not upload the legal document.");
      await loadLegalGroups();
      setUploadedDocument(null);
      setSelectedGroupId("");
      setGroupConfirmed(false);
      setUploadMessage("Document uploaded.");
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : "Could not upload the legal document.");
    } finally {
      setBusy(false);
    }
  };
  const downloadLegalDocument = async (document: LegalDocument) => {
    if (!canUseProjectLegalDocuments) {
      setUploadMessage("Complete the General MNDA before opening project legal documents.");
      return;
    }
    try {
      const headers = await memberAuthHeaders();
      const response = await fetch(`/api/legal/documents/${document.id}`, {
        headers,
        cache: "no-store",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error === "GENERAL_MNDA_REQUIRED" ? "Complete the General MNDA before opening project legal documents." : "Could not download this document.");
      }
      const url = URL.createObjectURL(await response.blob());
      const link = window.document.createElement("a");
      link.href = url;
      link.download = document.fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : "Could not download this document.");
    }
  };
  return (
    <>
      <PageHead title="Legal Documents & Agreements" intro="" />
      <div className="data-head legal-document-head">
        <span>Document</span>
        <span>Type</span>
        <span>Effective Date</span>
        <span>Status</span>
        <span />
      </div>
      <div className={`info-banner ${signed && !isDemo ? "" : "agreement-action-needed"}`}>
        <ShieldCheck />
        <span>
          <strong>{bannerTitle}</strong>
          <small>{bannerCopy}</small>
        </span>
      </div>
      {isAdmin && (
        <>
          <label
            className={`legal-document-upload${isDraggingDocument ? " is-dragging" : ""}`}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDraggingDocument(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDraggingDocument(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setIsDraggingDocument(false);
              selectDocument(event.dataTransfer.files[0]);
            }}
          >
            <Upload aria-hidden="true" />
            <span>
              <strong>{uploadedDocument ? uploadedDocument.name : "Drag and drop a document here"}</strong>
              <small>{uploadedDocument ? "Document selected" : "or click to upload"}</small>
            </span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(event) => {
                selectDocument(event.target.files?.[0]);
                event.target.value = "";
              }}
              aria-label="Upload a legal document"
            />
          </label>
          {uploadedDocument && (
            <section className="legal-upload-confirmation" aria-labelledby="legal-assignment-title">
              <h2 id="legal-assignment-title">Confirm Project Group Assignment</h2>
              <p>
                <strong>{uploadedDocument.name}</strong> will be stored in the selected project’s Legal group.
              </p>
              <label>
                Project Group
                <select
                  value={selectedGroupId}
                  onChange={(event) => {
                    setSelectedGroupId(event.target.value);
                    setGroupConfirmed(false);
                  }}
                >
                  <option value="">Select a project group</option>
                  {legalGroups.map((group) => (
                    <option value={group.id} key={group.id}>
                      {group.title}
                    </option>
                  ))}
                </select>
              </label>
              {selectedGroup && (
                <label className="legal-assignment-check">
                  <input type="checkbox" checked={groupConfirmed} onChange={(event) => setGroupConfirmed(event.target.checked)} />
                  <span>
                    I confirm this document belongs to <strong>{selectedGroup.title}</strong>.
                  </span>
                </label>
              )}
              <div>
                <button className="agreement-sign-button" type="button" disabled={!selectedGroup || !groupConfirmed || busy} onClick={() => void uploadLegalDocument()}>
                  {busy ? "Uploading…" : "Upload document"}
                </button>
                <button
                  className="plain-button"
                  type="button"
                  onClick={() => {
                    setUploadedDocument(null);
                    setSelectedGroupId("");
                    setGroupConfirmed(false);
                    setUploadMessage("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </section>
          )}
        </>
      )}
      {uploadMessage && (
        <p className="legal-upload-message" role="status">
          {uploadMessage}
        </p>
      )}
      {agreement?.error && (
        <p className="agreement-error" role="alert">
          {agreement.error}
        </p>
      )}
      <div className="data-list legal-document-list">
        <h2 className="legal-document-group-title">Orbit Systems</h2>
        <div className="data-row legal-document-row">
          <span className="title-cell">
            <FileCheck2 />
            <span>
              <strong>{isDemo ? "General MNDA test" : "General MNDA"}</strong>
              <small>Version 1.0 · DocuSign{isDemo ? " sandbox · TEST ONLY" : ""}</small>
            </span>
          </span>
          <span className="legal-document-type">Non-Disclosure Agreement</span>
          <span className="legal-effective-date">{signed ? completed : "—"}</span>
          {agreement === null ? <Status tone="slate">Checking…</Status> : signed ? <Status>{isDemo ? "Test completed" : "Signed"}</Status> : waiting ? <Status tone="blue">{isDemo ? "Test sent" : "Sent"}</Status> : <Status tone="orange">{isDemo ? "Test required" : "Required"}</Status>}
          {signed ? (
            <button className="text-button" onClick={loadAgreement}>
              Refresh status <ChevronRight />
            </button>
          ) : (
            <button className="agreement-sign-button" onClick={signAgreement} disabled={busy || agreement === null || agreement?.configured === false}>
              {busy ? "Opening DocuSign…" : waiting ? "Continue signing" : isDemo ? "Run signing test" : "Review and sign"} <ChevronRight />
            </button>
          )}
        </div>
        {legalGroups.map((group) => (
          <div className="legal-project-group" key={group.id}>
            <h2 className="legal-document-group-title">{group.title}</h2>
            {group.documents.length ? (
              group.documents.map((document) => (
                <div className="data-row legal-document-row" key={document.id}>
                  <span className="title-cell">
                    <FileText />
                    <span>
                      <strong>{document.fileName}</strong>
                      <small>{Math.max(1, Math.round(document.fileSize / 1024))} KB</small>
                    </span>
                  </span>
                  <span className="legal-document-type">{document.documentType}</span>
                  <span className="legal-effective-date">
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                    }).format(new Date(document.createdAt))}
                  </span>
                  <Status tone={canUseProjectLegalDocuments ? "teal" : "slate"}>{canUseProjectLegalDocuments ? "Available" : "Locked"}</Status>
                  <button
                    className={`text-button${canUseProjectLegalDocuments ? "" : " legal-document-locked"}`}
                    type="button"
                    disabled={!canUseProjectLegalDocuments}
                    title={canUseProjectLegalDocuments ? `Download ${document.fileName}` : "Complete the General MNDA first"}
                    onClick={() => void downloadLegalDocument(document)}
                  >
                    {canUseProjectLegalDocuments ? "Download" : "Complete General MNDA first"} {canUseProjectLegalDocuments ? <ChevronRight /> : <LockKeyhole />}
                  </button>
                </div>
              ))
            ) : (
              <div className="legal-group-empty">No legal documents have been uploaded for this project.</div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function BetaPage() {
  return (
    <>
      <PageHead title="Beta Programs" intro="Join invited previews and keep track of feedback you’ve shared." />
      <div className="split-feature">
        <div className="feature-copy">
          <Status tone="orange">Invitation</Status>
          <h2>Career Pivot research preview</h2>
          <p>Try an early guided experience and share what helps, what feels unclear, and what you would change.</p>
          <ul>
            <li>
              <CalendarDays /> Invitation expires August 11, 2026
            </li>
            <li>
              <LockKeyhole /> Access is limited to invited participants
            </li>
          </ul>
          <div>
            <button className="primary-button">Review invitation</button>
            <button className="plain-button">Not now</button>
          </div>
        </div>
        <div className="feature-panel">
          <FlaskConical />
          <strong>Your feedback stays connected</strong>
          <p>Submissions remain linked to their original context and are reviewed by the project team.</p>
        </div>
      </div>
      <section className="lower-section">
        <SectionHead title="Your participation" />
        <div className="empty-state">
          <MessageSquareText />
          <h3>No feedback submitted yet</h3>
          <p>Your submissions and their review status will appear here.</p>
        </div>
      </section>
    </>
  );
}

type MemberUpdate = {
  title: string;
  detail: string;
  date: string;
  icon: typeof FileText;
  href: string;
};

function UpdateList({ updates }: { updates: MemberUpdate[] }) {
  return (
    <div className="update-list">
      {updates.map(({ title, detail, date, icon: Icon, href }) => (
        <a href={href} key={title}>
          <span className="mini-icon">
            <Icon />
          </span>
          <span>
            <strong>{title}</strong>
            <small>{detail}</small>
          </span>
          <time>{date}</time>
          <ChevronRight />
        </a>
      ))}
    </div>
  );
}
function UpdatesPage() {
  const [updates, setUpdates] = useState<MemberUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const loadUpdates = async () => {
      try {
        const headers = await memberAuthHeaders();
        const [projectResponse, agreementResponse] = await Promise.all([
          fetch("/api/projects", { cache: "no-store", headers }),
          fetch("/api/agreements", { cache: "no-store", headers }),
        ]);
        const projectData = await projectResponse.json();
        const agreementData = (await agreementResponse.json()) as AgreementState;
        if (!projectResponse.ok) throw new Error(projectData.error || "Could not load your project updates.");
        if (!agreementResponse.ok) throw new Error(agreementData.error || "Could not verify your agreement status.");

        const memberUpdates: MemberUpdate[] = [];
        if (agreementData.status === "general_nda_signed" && agreementData.completedAt) {
          memberUpdates.push({
            title: "General MNDA completed",
            detail: "Your completed agreement is available in Legal.",
            date: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(agreementData.completedAt)),
            icon: FileCheck2,
            href: "/member/legal",
          });
        } else if (agreementData.configured !== false && ["general_nda_pending", "general_nda_sent", "general_nda_expired"].includes(agreementData.status)) {
          memberUpdates.push({
            title: agreementData.status === "general_nda_sent" ? "General MNDA awaiting completion" : "General MNDA requires your signature",
            detail: "Review the current agreement in Legal.",
            date: "Action needed",
            icon: FileCheck2,
            href: "/member/legal",
          });
        }

        for (const project of (projectData.projects || []) as Array<{ slug: string; name: string; membership_status?: string }>) {
          const status = project.membership_status || "";
          if (activeProjectAccess.has(status)) {
            memberUpdates.push({
              title: "Project access available",
              detail: project.name,
              date: "Current",
              icon: FileText,
              href: `/member/projects/${project.slug}`,
            });
          } else if (pendingProjectAccess.has(status)) {
            memberUpdates.push({
              title: "Project access request pending",
              detail: project.name,
              date: "Pending",
              icon: Hourglass,
              href: `/member/projects/${project.slug}`,
            });
          }
        }
        setUpdates(memberUpdates);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load your updates.");
      } finally {
        setLoading(false);
      }
    };
    void loadUpdates();
  }, []);
  return (
    <>
      <PageHead title="Updates" intro="News and changes from the projects and programs you can access." />
      <div className="update-layout">
        <section aria-live="polite">
          {loading ? (
            <div className="empty-state"><Hourglass /><h3>Loading your updates…</h3></div>
          ) : error ? (
            <div className="empty-state"><BookOpen /><h3>Updates are unavailable</h3><p>{error}</p></div>
          ) : updates.length ? (
            <UpdateList updates={updates} />
          ) : (
            <div className="empty-state"><BookOpen /><h3>No updates available</h3><p>Updates for your agreements and authorized projects will appear here.</p></div>
          )}
        </section>
        <aside>
          <h3>Notification settings</h3>
          <p>Choose how OSai sends updates that are available to your account.</p>
          <a className="secondary-button preference-link" href="/member/profile?panel=notifications">
            Manage preferences
          </a>
        </aside>
      </div>
    </>
  );
}
function NotificationsPage() {
  const [read, setRead] = useState<number[]>([]);
  const notes = ["Your beta invitation is ready to review", "Advanced Predictive Data published an update", "Your General NDA was completed"];
  return (
    <>
      <PageHead title="Notifications" intro="Access, agreement, and project activity that needs your attention." />
      <div className="notification-actions">
        <button className="text-button" onClick={() => setRead([0, 1, 2])}>
          <Check /> Mark all as read
        </button>
      </div>
      <div className="notification-list">
        {notes.map((n, i) => (
          <button onClick={() => setRead([...read, i])} className={read.includes(i) ? "read" : ""} key={n}>
            <span className="notice-dot" />
            <span className="mini-icon">{i === 0 ? <FlaskConical /> : i === 1 ? <BookOpen /> : <FileCheck2 />}</span>
            <span>
              <strong>{n}</strong>
              <small>{i === 0 ? "Invitation expires August 11" : i === 1 ? "2 days ago" : "July 18"}</small>
            </span>
            <ChevronRight />
          </button>
        ))}
      </div>
    </>
  );
}
type ProjectTask = {
  id: string;
  name: string;
  description: string;
  status: "to_do" | "in_progress" | "completed";
  dueDate: string;
};
type StoryBlock = {
  id: string;
  rowId?: string;
  type: "heading" | "paragraph" | "image" | "quote" | "list" | "statistic";
  text?: string;
  imageUrl?: string;
  caption?: string;
  alt?: string;
};
type AdminProject = {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  access_level: string;
};
type AdminProjectDetail = AdminProject & {
  image_url: string;
  industry: string;
  category: string;
  sub_category: string;
  user_goal: number;
  user_actual: number;
  cost_budget: number;
  cost_actual: number;
  adoption_rate: number;
  forecast_penetration: number;
  milestones: Milestone[];
  tasks: ProjectTask[];
  problem_content: StoryBlock[];
  solution_content: StoryBlock[];
  competition_content: StoryBlock[];
  market_content: StoryBlock[];
  business_model_content: StoryBlock[];
  created_at?: string;
};
type UserLegalDocument = { id: string; fileName: string; documentType: string };
type UserProject = {
  id: string;
  name: string;
  role: string;
  status: string;
  legalDocuments: UserLegalDocument[];
};
type AdminProjectOption = { id: string; name: string };
type AdminProfile = {
  auth_user_id: string;
  email: string;
  display_name: string;
  role: "member" | "admin";
  status: "pending_approval" | "approved" | "declined" | "revoked";
  membership_role: "Administrator" | "Site Member" | "Pending Approval" | "Pending Membership" | "Member";
  membership_status: string;
  project_count: number;
  projects: UserProject[];
};
const isActiveUserProject = (project: UserProject) => activeProjectAccess.has(project.status);
const isPendingUserProject = (project: UserProject) => pendingProjectAccess.has(project.status);
async function adminRequest(path: string, init?: RequestInit) {
  const headers = await memberAuthHeaders();
  const response = await fetch(path, {
    ...init,
    cache: "no-store",
    headers: {
      ...headers,
      ...(init?.body ? { "content-type": "application/json" } : {}),
    },
  });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.error || "The administrator action failed.");
  return data;
}

async function memberRequest(path: string, init?: RequestInit) {
  const headers = await memberAuthHeaders();
  const response = await fetch(path, {
    ...init,
    cache: "no-store",
    headers: { ...headers, ...(init?.body ? { "content-type": "application/json" } : {}) },
  });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.error || "The posting action failed.");
  return data;
}

function AdminUsersPage({ currentAuthUserId }: { currentAuthUserId: string }) {
  const identity = { id: currentAuthUserId };
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [projectOptions, setProjectOptions] = useState<AdminProjectOption[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [savingProjectsFor, setSavingProjectsFor] = useState("");
  const [savingRoleFor, setSavingRoleFor] = useState("");
  const [deletingProfileId, setDeletingProfileId] = useState("");
  const [message, setMessage] = useState("Loading profiles…");
  const load = async () => {
    try {
      const data = await adminRequest("/api/admin/profiles");
      setProfiles(data.profiles);
      setProjectOptions(data.projects);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load profiles.");
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const changeRole = async (profile: AdminProfile, role: "member" | "admin") => {
    setSavingRoleFor(profile.auth_user_id);
    try {
      await adminRequest("/api/admin/profiles", {
        method: "PATCH",
        body: JSON.stringify({ authUserId: profile.auth_user_id, role }),
      });
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update the role.");
    } finally {
      setSavingRoleFor("");
    }
  };
  const deleteProfile = async (profile: AdminProfile) => {
    try {
      await adminRequest("/api/admin/profiles", {
        method: "DELETE",
        body: JSON.stringify({ authUserId: profile.auth_user_id }),
      });
      setDeletingProfileId("");
      await load();
      setMessage(`${profile.display_name} was deleted.`);
    } catch (error) {
      setDeletingProfileId("");
      const code = error instanceof Error ? error.message : "";
      setMessage(code === "PROFILE_HAS_OWNED_RECORDS" ? "This member owns project or Legal records. Reassign those records before deleting the account." : code || "Could not delete the member.");
    }
  };
  const toggleProject = async (profile: AdminProfile, projectId: string, checked: boolean) => {
    const assigned = profile.projects.filter(isActiveUserProject).map((project) => project.id);
    const projectIds = checked ? [...new Set([...assigned, projectId])] : assigned.filter((id) => id !== projectId);
    setSavingProjectsFor(profile.auth_user_id);
    try {
      await adminRequest("/api/admin/profiles", {
        method: "PATCH",
        body: JSON.stringify({ authUserId: profile.auth_user_id, projectIds }),
      });
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update project assignments.");
    } finally {
      setSavingProjectsFor("");
    }
  };
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleProfiles = profiles.filter((profile) => !normalizedQuery || [profile.display_name, profile.email, profile.auth_user_id, profile.status, profile.role, profile.membership_role, profile.membership_status, ...profile.projects.flatMap((project) => [project.name, ...project.legalDocuments.map((document) => document.fileName)])].join(" ").toLowerCase().includes(normalizedQuery));
  const collaboratorsFor = (profile: AdminProfile) => profiles.filter((other) => other.auth_user_id !== profile.auth_user_id && other.projects.filter(isActiveUserProject).some((project) => profile.projects.filter(isActiveUserProject).some((assigned) => assigned.id === project.id)));
  return (
    <>
      <PageHead title="Users" intro="Review user access, required legal documents, project teams, and administrator rights." />
      <div className="toolbar admin-users-toolbar">
        <span className="admin-project-toolbar-title">User Directory</span>
        <label className="search">
          <Search size={18} />
          <input aria-label="Search users" placeholder="Search users" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
        </label>
      </div>
      {message && (
        <p className="profile-message" role="status">
          {message}
        </p>
      )}
      <div className="admin-table user-directory">
        <div className="admin-table-head">
          <span>User</span>
          <span>Status</span>
          <span>Legal</span>
          <span>Projects</span>
          <span>Teams</span>
          <span>Role</span>
        </div>
        {visibleProfiles.map((profile) => {
          const documents = profile.projects.flatMap((project) =>
            project.legalDocuments.map((document) => ({
              ...document,
              projectName: project.name,
            })),
          );
          const collaborators = collaboratorsFor(profile);
          const activeProjects = profile.projects.filter(isActiveUserProject);
          const pendingProjects = profile.projects.filter(isPendingUserProject);
          const confirmingDelete = deletingProfileId === profile.auth_user_id;
          return (
            <article className="admin-person" key={profile.auth_user_id}>
              <span className="user-identity">
                <strong>
                  {profile.display_name}
                  {profile.role === "admin" && <em>Admin</em>}
                </strong>
                <small>{profile.email}</small>
                <code>{profile.auth_user_id}</code>
              </span>
              <Status tone={profile.membership_status === "Approved" ? "teal" : profile.membership_status.startsWith("Pending") ? "orange" : "slate"}>{profile.membership_status}</Status>
              <details className="project-assignment user-legal-dropdown">
                <summary>
                  <span>
                    <strong>
                      {documents.length} {documents.length === 1 ? "document" : "documents"}
                    </strong>
                    <small>{documents.length ? "View required documents" : "No required documents"}</small>
                  </span>
                  <ChevronRight aria-hidden="true" />
                </summary>
                <div className="project-assignment-menu legal-assignment-menu">
                  {documents.length ? (
                    documents.map((document) => (
                      <span className="legal-dropdown-item" key={document.id}>
                        <FileText aria-hidden="true" />
                        <span>
                          <strong>{document.fileName}</strong>
                          <small>{document.projectName}</small>
                        </span>
                      </span>
                    ))
                  ) : (
                    <small>No required documents.</small>
                  )}
                </div>
              </details>
              <details className="project-assignment">
                <summary>
                  <span>
                    <strong>
                      {activeProjects.length} {activeProjects.length === 1 ? "project" : "projects"}
                    </strong>
                    <small>{pendingProjects.length ? `${pendingProjects.length} access ${pendingProjects.length === 1 ? "request" : "requests"}` : activeProjects.length ? "Select project assignments" : "No project involvement"}</small>
                  </span>
                  <ChevronRight aria-hidden="true" />
                </summary>
                <div className="project-assignment-menu">
                  {projectOptions.length ? (
                    projectOptions.map((project) => {
                      const assignment = profile.projects.find((assigned) => assigned.id === project.id);
                      const requested = assignment ? isPendingUserProject(assignment) : false;
                      return (
                        <label className={requested ? "project-option-requested" : undefined} key={project.id}>
                          <input type="checkbox" checked={Boolean(assignment && isActiveUserProject(assignment))} disabled={savingProjectsFor === profile.auth_user_id} onChange={(event) => void toggleProject(profile, project.id, event.target.checked)} />
                          <span>{project.name}</span>
                          {requested && <em>Requested</em>}
                        </label>
                      );
                    })
                  ) : (
                    <small>No projects are available.</small>
                  )}
                  {savingProjectsFor === profile.auth_user_id && <small role="status">Saving assignments…</small>}
                </div>
              </details>
              <details className="project-assignment user-teams-dropdown">
                <summary>
                  <span>
                    <strong>
                      {activeProjects.length} {activeProjects.length === 1 ? "team" : "teams"}
                    </strong>
                    <small>{activeProjects.length ? "View project teams" : "No project teams"}</small>
                  </span>
                  <ChevronRight aria-hidden="true" />
                </summary>
                <div className="project-assignment-menu teams-assignment-menu">
                  {activeProjects.length ? (
                    activeProjects.map((project) => (
                      <span className="team-dropdown-item" key={project.id}>
                        <Users aria-hidden="true" />
                        <span>
                          <strong>{project.name}</strong>
                          <small>{collaborators.filter((other) => other.projects.filter(isActiveUserProject).some((assigned) => assigned.id === project.id)).length} collaborators</small>
                        </span>
                      </span>
                    ))
                  ) : (
                    <small>No project teams.</small>
                  )}
                </div>
              </details>
              <details className="project-assignment user-role-dropdown">
                <summary aria-label={`Role and account actions for ${profile.display_name}`}>
                  <span>
                    <strong>{profile.membership_role}</strong>
                  </span>
                  <ChevronRight aria-hidden="true" />
                </summary>
                <div className="project-assignment-menu role-assignment-menu">
                  {(["member", "admin"] as const).map((role) => (
                    <button
                      type="button"
                      className={profile.role === role ? "selected" : undefined}
                      disabled={savingRoleFor === profile.auth_user_id}
                      onClick={(event) => {
                        event.currentTarget.closest("details")?.removeAttribute("open");
                        if (role !== profile.role) void changeRole(profile, role);
                      }}
                      key={role}
                    >
                      <span className="role-check" aria-hidden="true">
                        {profile.role === role ? <Check /> : null}
                      </span>
                      {role === "admin" ? "Administrator" : "Member"}
                    </button>
                  ))}
                  <span className="role-menu-divider" />
                  {confirmingDelete ? (
                    <>
                      <p className="delete-member-warning">Delete this account, sessions, and project assignments?</p>
                      <button
                        type="button"
                        className="delete-member-confirm"
                        onClick={(event) => {
                          event.currentTarget.closest("details")?.removeAttribute("open");
                          void deleteProfile(profile);
                        }}
                      >
                        <Trash2 /> Confirm delete
                      </button>
                      <button type="button" onClick={() => setDeletingProfileId("")}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button type="button" className="delete-member-action" disabled={profile.auth_user_id === identity.id} onClick={() => setDeletingProfileId(profile.auth_user_id)}>
                      <Trash2 /> Delete member
                    </button>
                  )}
                  {savingRoleFor === profile.auth_user_id && <small role="status">Saving role…</small>}
                </div>
              </details>
            </article>
          );
        })}
        {!message && !visibleProfiles.length && <p className="user-directory-empty">No users match “{searchQuery}”.</p>}
      </div>
    </>
  );
}

function projectDetailFromApi(project: AdminProjectDetail): AdminProjectDetail {
  return {
    ...project,
    industry: project.industry || "",
    category: project.category || "",
    sub_category: project.sub_category || "",
    user_goal: Number(project.user_goal),
    user_actual: Number(project.user_actual),
    cost_budget: Number(project.cost_budget),
    cost_actual: Number(project.cost_actual),
    adoption_rate: Number(project.adoption_rate),
    forecast_penetration: Number(project.forecast_penetration),
    milestones: project.milestones || [],
    tasks: project.tasks || [],
    problem_content: project.problem_content || [],
    solution_content: project.solution_content || [],
    competition_content: project.competition_content || [],
    market_content: project.market_content || [],
    business_model_content: project.business_model_content || [],
  };
}

function storyContentPayload(project: AdminProjectDetail) {
  return {
    industry: project.industry,
    category: project.category,
    subCategory: project.sub_category,
    problemContent: project.problem_content,
    solutionContent: project.solution_content,
    competitionContent: project.competition_content,
    marketContent: project.market_content,
    businessModelContent: project.business_model_content,
  };
}

function initialProjectTimeline(createdAt?: string): Milestone[] {
  const started = createdAt ? new Date(createdAt) : new Date();
  const stages = [
    ["Beta A", 0],
    ["Beta B", 42],
    ["Pre-seed Funding", 120],
    ["Series A", 270],
    ["Series B", 540],
  ] as const;
  return stages.map(([name, days], index) => {
    const date = new Date(started);
    date.setUTCDate(date.getUTCDate() + days);
    return {
      id: `timeline-${index}`,
      name,
      date: date.toISOString().slice(0, 10),
      status: "planned",
    };
  });
}

/* Uploaded project-story images are data URLs until object storage is introduced. */
/* eslint-disable @next/next/no-img-element */
type StorySection = "Problem" | "Solution" | "Competition" | "Market" | "Business Model";

function ProjectStoryPageEditor({ section, blocks, onSave }: { section: StorySection; blocks: StoryBlock[]; onSave: (blocks: StoryBlock[]) => Promise<void> }) {
  const sectionKey = section.toLowerCase().replaceAll(" ", "-");
  const sectionDefaults: Record<StorySection, { title: string; description: string }> = {
    Problem: {
      title: "Tell the story of the problem.",
      description: "Add a description of what the problem is that this product is solving.",
    },
    Solution: {
      title: "Explain the solution.",
      description: "Add a description of how this product solves the problem.",
    },
    Competition: {
      title: "Competition",
      description: "Describe the competitive landscape and how this project is differentiated.",
    },
    Market: {
      title: "Market",
      description: "Describe the target market, audience, and opportunity.",
    },
    "Business Model": {
      title: "Business Model",
      description: "Explain how this project creates, delivers, and captures value.",
    },
  };
  const { title: defaultTitle, description: defaultDescription } = sectionDefaults[section];
  const [content, setContent] = useState<StoryBlock[]>(blocks);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openSideMenu, setOpenSideMenu] = useState<string | null>(null);
  const [openAddMenu, setOpenAddMenu] = useState<number | null>(null);
  const [editingIntro, setEditingIntro] = useState<"title" | "description" | null>(null);
  const [introTitle, setIntroTitle] = useState(defaultTitle);
  const [introDescription, setIntroDescription] = useState(defaultDescription);
  const [message, setMessage] = useState("");
  useEffect(() => setContent(blocks), [blocks]);
  useEffect(() => {
    const close = () => {
      setOpenSideMenu(null);
      setOpenAddMenu(null);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);
  const nextId = (type: StoryBlock["type"]) => {
    let index = content.length + 1;
    while (content.some((block) => block.id === `${sectionKey}-${type}-${index}`)) index += 1;
    return `${sectionKey}-${type}-${index}`;
  };
  const commit = async (next: StoryBlock[]) => {
    setContent(next);
    setMessage("Saving…");
    try {
      await onSave(next);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : `Could not save the ${section} page.`);
    }
  };
  const saveIntro = async () => {
    const titleId = `${sectionKey}-title`;
    const descriptionId = `${sectionKey}-description`;
    await commit([
      {
        id: titleId,
        rowId: titleId,
        type: "heading",
        text: introTitle.trim() || defaultTitle,
      },
      {
        id: descriptionId,
        rowId: descriptionId,
        type: "paragraph",
        text: introDescription.trim() || defaultDescription,
      },
    ]);
    setEditingIntro(null);
  };
  const textBlock = (type: Exclude<StoryBlock["type"], "image">, rowId?: string): StoryBlock => {
    const labels: Record<Exclude<StoryBlock["type"], "image">, string> = {
      heading: "Section heading",
      paragraph: `Describe the ${section.toLowerCase()}…`,
      quote: "Add a supporting quote…",
      list: "Add one item per line…",
      statistic: "Add a key statistic…",
    };
    const id = nextId(type);
    return { id, rowId: rowId || id, type, text: labels[type] };
  };
  const addTextBlock = (type: Exclude<StoryBlock["type"], "image">, index: number) => {
    const block = textBlock(type);
    const next = [...content.slice(0, index), block, ...content.slice(index)];
    setContent(next);
    setEditingId(block.id);
  };
  const insertTextBeside = (type: Exclude<StoryBlock["type"], "image">, block: StoryBlock, side: "left" | "right") => {
    const rowId = block.rowId || block.id;
    const index = content.findIndex((item) => item.id === block.id);
    const sibling = textBlock(type, rowId);
    const normalized = content.map((item) => (item.id === block.id ? { ...item, rowId } : item));
    const insertion = index + (side === "right" ? 1 : 0);
    const next = [...normalized.slice(0, insertion), sibling, ...normalized.slice(insertion)];
    setContent(next);
    setEditingId(sibling.id);
  };
  const readImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return null;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setMessage("Use a JPG, PNG, or WebP image.");
      return null;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage("Choose an image smaller than 2 MB.");
      return null;
    }
    const imageUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Could not read the image."));
      reader.readAsDataURL(file);
    });
    return { file, imageUrl };
  };
  const addImageBlock = async (event: ChangeEvent<HTMLInputElement>, index: number) => {
    const upload = await readImage(event);
    if (!upload) return;
    const id = nextId("image");
    const block: StoryBlock = {
      id,
      rowId: id,
      type: "image",
      imageUrl: upload.imageUrl,
      caption: "",
      alt: upload.file.name.replace(/\.[^.]+$/, ""),
    };
    const next = [...content.slice(0, index), block, ...content.slice(index)];
    setEditingId(block.id);
    await commit(next);
  };
  const insertImageBeside = async (event: ChangeEvent<HTMLInputElement>, block: StoryBlock, side: "left" | "right") => {
    const upload = await readImage(event);
    if (!upload) return;
    const rowId = block.rowId || block.id;
    const index = content.findIndex((item) => item.id === block.id);
    const id = nextId("image");
    const sibling: StoryBlock = {
      id,
      rowId,
      type: "image",
      imageUrl: upload.imageUrl,
      caption: "",
      alt: upload.file.name.replace(/\.[^.]+$/, ""),
    };
    const normalized = content.map((item) => (item.id === block.id ? { ...item, rowId } : item));
    const insertion = index + (side === "right" ? 1 : 0);
    const next = [...normalized.slice(0, insertion), sibling, ...normalized.slice(insertion)];
    setEditingId(id);
    await commit(next);
  };
  const update = (id: string, changes: Partial<StoryBlock>) => setContent((current) => current.map((block) => (block.id === id ? { ...block, ...changes } : block)));
  const rowKey = (block: StoryBlock) => block.rowId || block.id;
  const rows = content.reduce<StoryBlock[][]>((result, block) => {
    const current = result[result.length - 1];
    if (current && rowKey(current[0]) === rowKey(block)) current.push(block);
    else result.push([block]);
    return result;
  }, []);
  const pageTitleBlockId = content[0]?.type === "heading" ? content[0].id : `${sectionKey}-title`;
  const remove = (id: string) => {
    setEditingId(null);
    void commit(content.filter((block) => block.id !== id));
  };
  const addTools = (index: number) => {
    const closeMenu = () => setOpenAddMenu(null);
    return (
      <div className={`problem-add-row${openAddMenu === index ? " problem-add-row-open" : ""}`} onClick={(event) => event.stopPropagation()}>
        <button type="button" className="problem-add-trigger" aria-label="Add content block" aria-expanded={openAddMenu === index} onClick={() => setOpenAddMenu((current) => (current === index ? null : index))}>
          +
        </button>
        <div>
          <button
            type="button"
            onClick={() => {
              addTextBlock("heading", index);
              closeMenu();
            }}
          >
            Heading
          </button>
          <button
            type="button"
            onClick={() => {
              addTextBlock("paragraph", index);
              closeMenu();
            }}
          >
            Text
          </button>
          <label>
            Image
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                void addImageBlock(event, index);
                closeMenu();
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => {
              addTextBlock("quote", index);
              closeMenu();
            }}
          >
            Quote
          </button>
          <button
            type="button"
            onClick={() => {
              addTextBlock("list", index);
              closeMenu();
            }}
          >
            List
          </button>
          <button
            type="button"
            onClick={() => {
              addTextBlock("statistic", index);
              closeMenu();
            }}
          >
            Statistic
          </button>
        </div>
      </div>
    );
  };
  const sideTools = (block: StoryBlock, side: "left" | "right") => {
    const menuId = `${block.id}-${side}`;
    const closeMenu = () => setOpenSideMenu(null);
    return (
      <div className={`problem-side-add problem-side-add-${side}${openSideMenu === menuId ? " problem-side-add-open" : ""}`} onClick={(event) => event.stopPropagation()}>
        <button type="button" className="problem-side-trigger" aria-label={`Add content to the ${side} of this block`} aria-expanded={openSideMenu === menuId} onClick={() => setOpenSideMenu((current) => (current === menuId ? null : menuId))}>
          +
        </button>
        <div>
          <button
            type="button"
            onClick={() => {
              insertTextBeside("heading", block, side);
              closeMenu();
            }}
          >
            Heading
          </button>
          <button
            type="button"
            onClick={() => {
              insertTextBeside("paragraph", block, side);
              closeMenu();
            }}
          >
            Text
          </button>
          <label>
            Image
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                void insertImageBeside(event, block, side);
                closeMenu();
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => {
              insertTextBeside("quote", block, side);
              closeMenu();
            }}
          >
            Quote
          </button>
          <button
            type="button"
            onClick={() => {
              insertTextBeside("list", block, side);
              closeMenu();
            }}
          >
            List
          </button>
          <button
            type="button"
            onClick={() => {
              insertTextBeside("statistic", block, side);
              closeMenu();
            }}
          >
            Statistic
          </button>
        </div>
      </div>
    );
  };
  const renderBlockContent = (block: StoryBlock) =>
    block.type === "heading" ? (
      <h2>{block.text}</h2>
    ) : block.type === "paragraph" ? (
      <p>{block.text}</p>
    ) : block.type === "quote" ? (
      <blockquote>{block.text}</blockquote>
    ) : block.type === "list" ? (
      <ul>
        {(block.text || "")
          .split("\n")
          .filter(Boolean)
          .map((item, itemIndex) => (
            <li key={`${block.id}-${itemIndex}`}>{item}</li>
          ))}
      </ul>
    ) : block.type === "statistic" ? (
      <strong>{block.text}</strong>
    ) : (
      <figure>
        <img src={block.imageUrl} alt={block.alt || ""} />
        {block.caption && <figcaption>{block.caption}</figcaption>}
      </figure>
    );
  const renderBlock = (block: StoryBlock) => (
    <div className={`problem-block problem-block-${block.type}${block.id === pageTitleBlockId ? " problem-block-story-title" : ""}`} key={block.id}>
      {sideTools(block, "left")}
      {sideTools(block, "right")}
      {editingId === block.id ? (
        <div className="problem-block-editor">
          {block.type === "image" ? (
            <>
              <img src={block.imageUrl} alt="" />
              <label>
                Alternative text
                <input maxLength={160} value={block.alt || ""} onChange={(event) => update(block.id, { alt: event.target.value })} />
              </label>
              <label>
                Caption
                <input maxLength={240} value={block.caption || ""} onChange={(event) => update(block.id, { caption: event.target.value })} />
              </label>
            </>
          ) : (
            <label>
              {block.type === "heading" ? "Heading" : block.type === "statistic" ? "Statistic" : block.type === "list" ? "List items" : block.type === "quote" ? "Quote" : "Paragraph"}
              {block.type === "heading" || block.type === "statistic" ? <input maxLength={120} value={block.text || ""} onChange={(event) => update(block.id, { text: event.target.value })} /> : <textarea maxLength={block.type === "paragraph" ? 3000 : 1200} value={block.text || ""} onChange={(event) => update(block.id, { text: event.target.value })} />}
            </label>
          )}
          <div>
            <button
              type="button"
              onClick={() => {
                void commit(content);
                setEditingId(null);
              }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setContent(blocks);
                setEditingId(null);
              }}
            >
              Cancel
            </button>
            <button type="button" className="problem-delete" onClick={() => remove(block.id)}>
              Delete
            </button>
          </div>
        </div>
      ) : (
        <div className="problem-block-display admin-hover-edit">
          <div className="admin-hover-content">{renderBlockContent(block)}</div>
          <div className="admin-hover-actions">
            <button type="button" onClick={() => setEditingId(block.id)}>
              <Pencil /> Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
  return (
    <article className="problem-editor" aria-label={`${section} page editor`}>
      {content.length === 0 ? (
        <div className="problem-intro">
          {editingIntro === "title" ? (
            <div className="problem-intro-editor problem-intro-title-editor">
              <input aria-label={`${section} title`} maxLength={120} value={introTitle} onChange={(event) => setIntroTitle(event.target.value)} />
              <div>
                <button type="button" onClick={() => void saveIntro()}>
                  Save
                </button>
                <button type="button" onClick={() => setEditingIntro(null)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <section className="problem-intro-module problem-intro-title admin-hover-edit">
              <strong className="admin-hover-content">{introTitle}</strong>
              <div className="admin-hover-actions">
                <button type="button" onClick={() => setEditingIntro("title")}>
                  <Pencil /> Edit
                </button>
              </div>
            </section>
          )}
          {editingIntro === "description" ? (
            <div className="problem-intro-editor problem-intro-description-editor">
              <textarea aria-label={`${section} description`} maxLength={3000} value={introDescription} onChange={(event) => setIntroDescription(event.target.value)} />
              <div>
                <button type="button" onClick={() => void saveIntro()}>
                  Save
                </button>
                <button type="button" onClick={() => setEditingIntro(null)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <section className="problem-intro-module problem-intro-description admin-hover-edit">
              <p className="admin-hover-content">{introDescription}</p>
              <div className="admin-hover-actions">
                <button type="button" onClick={() => setEditingIntro("description")}>
                  <Pencil /> Edit
                </button>
              </div>
            </section>
          )}
        </div>
      ) : (
        addTools(0)
      )}
      {rows.map((row, rowIndex) => (
        <div className="problem-row-group" key={rowKey(row[0])}>
          <div className={`problem-layout-row${row.length === 1 ? " problem-layout-row-single" : ""}`}>{row.map((block) => renderBlock(block))}</div>
          {addTools(rows.slice(0, rowIndex + 1).reduce((count, item) => count + item.length, 0))}
        </div>
      ))}
      {message && message !== "Saving…" && (
        <p className="problem-editor-message" role="status">
          {message}
        </p>
      )}
    </article>
  );
}
/* eslint-enable @next/next/no-img-element */

function AdminProjectDetailPage({ projectId, onBack, onProjectSaved }: { projectId: string; onBack: () => void; onProjectSaved?: (project: AdminProjectDetail) => void }) {
  const [project, setProject] = useState<AdminProjectDetail | null>(null);
  const [draft, setDraft] = useState<AdminProjectDetail | null>(null);
  const [editingPart, setEditingPart] = useState<"title" | "description" | "image" | null>(null);
  const [editingClassification, setEditingClassification] = useState<"industry" | "category" | "sub_category" | null>(null);
  const [pitchSection, setPitchSection] = useState("Timeline");
  const [milestoneEdit, setMilestoneEdit] = useState<Milestone | null>(null);
  const [milestoneEditAnchor, setMilestoneEditAnchor] = useState<string | null>(null);
  const [message, setMessage] = useState("Loading project…");
  useEffect(() => {
    let active = true;
    void adminRequest(`/api/admin/projects/${projectId}`)
      .then((data) => {
        if (!active) return;
        const next = projectDetailFromApi(data.project);
        setProject(next);
        setDraft(next);
        setMessage("");
      })
      .catch((error) => {
        if (active) setMessage(error instanceof Error ? error.message : "Could not load the project.");
      });
    return () => {
      active = false;
    };
  }, [projectId]);
  if (!project || !draft)
    return (
      <>
        <PageHead title="Project Details" intro="" />
        <button className="project-back" onClick={onBack}>
          <ArrowLeft /> All Projects
        </button>
        <p className="profile-message" role="status">
          {message}
        </p>
      </>
    );
  const saveOverview = async (field: "title" | "description") => {
    try {
      const normalized = {
        ...draft,
        name: (draft.name.trim() || "Project Title").slice(0, PROJECT_TITLE_MAX),
        description: draft.description.trim().slice(0, PROJECT_DESCRIPTION_MAX),
      };
      await adminRequest(`/api/admin/projects/${projectId}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: normalized.name,
          slug: normalized.slug,
          description: normalized.description,
          status: normalized.status,
          accessLevel: normalized.access_level,
        }),
      });
      setDraft(normalized);
      setProject(normalized);
      onProjectSaved?.(normalized);
      setEditingPart(null);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : `Could not save the project ${field}.`);
    }
  };
  const saveProjectImage = async (imageUrl: string) => {
    try {
      setMessage("Saving…");
      const next = { ...draft, image_url: imageUrl };
      await adminRequest(`/api/admin/projects/${projectId}`, {
        method: "PATCH",
        body: JSON.stringify({
          dashboard: {
            imageUrl,
            userGoal: next.user_goal,
            costBudget: next.cost_budget,
            costActual: next.cost_actual,
            adoptionRate: next.adoption_rate,
            forecastPenetration: next.forecast_penetration,
            milestones: next.milestones,
            tasks: next.tasks,
            ...storyContentPayload(next),
          },
        }),
      });
      setDraft(next);
      setProject(next);
      onProjectSaved?.(next);
      setEditingPart(null);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save the project image.");
    }
  };
  const saveTimeline = async (milestones: Milestone[]) => {
    try {
      const ordered = [...milestones].sort((a, b) => a.date.localeCompare(b.date));
      const next = { ...draft, milestones: ordered };
      setDraft(next);
      await adminRequest(`/api/admin/projects/${projectId}`, {
        method: "PATCH",
        body: JSON.stringify({
          dashboard: {
            imageUrl: next.image_url,
            userGoal: next.user_goal,
            costBudget: next.cost_budget,
            costActual: next.cost_actual,
            adoptionRate: next.adoption_rate,
            forecastPenetration: next.forecast_penetration,
            milestones: ordered,
            tasks: next.tasks,
            ...storyContentPayload(next),
          },
        }),
      });
      setProject(next);
      onProjectSaved?.(next);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save the project timeline.");
    }
  };
  const saveStoryContent = async (field: "problem_content" | "solution_content" | "competition_content" | "market_content" | "business_model_content", content: StoryBlock[]) => {
    const next = { ...draft, [field]: content };
    await adminRequest(`/api/admin/projects/${projectId}`, {
      method: "PATCH",
      body: JSON.stringify({
        dashboard: {
          imageUrl: next.image_url,
          userGoal: next.user_goal,
          costBudget: next.cost_budget,
          costActual: next.cost_actual,
          adoptionRate: next.adoption_rate,
          forecastPenetration: next.forecast_penetration,
          milestones: next.milestones,
          tasks: next.tasks,
          ...storyContentPayload(next),
        },
      }),
    });
    setDraft(next);
    setProject(next);
    onProjectSaved?.(next);
  };
  const saveClassification = async (field: "industry" | "category" | "sub_category") => {
    const next = { ...draft, [field]: draft[field].trim().slice(0, 80) };
    try {
      await adminRequest(`/api/admin/projects/${projectId}`, {
        method: "PATCH",
        body: JSON.stringify({
          dashboard: {
            imageUrl: next.image_url,
            userGoal: next.user_goal,
            costBudget: next.cost_budget,
            costActual: next.cost_actual,
            adoptionRate: next.adoption_rate,
            forecastPenetration: next.forecast_penetration,
            milestones: next.milestones,
            tasks: next.tasks,
            ...storyContentPayload(next),
          },
        }),
      });
      setDraft(next);
      setProject(next);
      onProjectSaved?.(next);
      setEditingClassification(null);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save the project classification.");
    }
  };
  const chooseProjectImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setMessage("Use a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage("Choose an image smaller than 2 MB.");
      return;
    }
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Could not read the image."));
        reader.readAsDataURL(file);
      });
      await saveProjectImage(dataUrl);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not read the image.");
    }
  };
  const initials = draft.name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const timeline = [...(draft.milestones.length ? draft.milestones : initialProjectTimeline(draft.created_at))].sort((a, b) => a.date.localeCompare(b.date));
  const openMilestoneEditor = (milestone: Milestone, anchor: string | null = null) => {
    setMilestoneEdit({ ...milestone });
    setMilestoneEditAnchor(anchor);
  };
  const addMilestoneBetween = (current: Milestone, next: Milestone) => {
    const start = new Date(`${current.date}T00:00:00Z`).getTime();
    const end = new Date(`${next.date}T00:00:00Z`).getTime();
    const date = new Date(start + Math.max(86400000, Math.floor((end - start) / 2))).toISOString().slice(0, 10);
    openMilestoneEditor(
      {
        id: `goal-${current.id}-${next.id}`,
        name: "New Goal",
        date,
        status: "planned",
      },
      current.id,
    );
  };
  return (
    <>
      <PageHead title="Project Details" intro="" />
      <div className="project-detail admin-project-detail">
        <header className="project-page-header">
          <nav className="project-section-links" aria-label="Project administration">
            <a href="#overview">Overview</a>
            <a href="#tasks">Tasks</a>
            <a href="#analytics">Analytics</a>
            <a href="#reports">Reports</a>
            <a href="/member/admin-users">Users</a>
            <a href="#settings">Settings</a>
          </nav>
          <div className="project-detail-nav">
            <a
              className="project-back"
              href="/member/projects"
              onClick={(event) => {
                event.preventDefault();
                onBack();
              }}
            >
              <ArrowLeft /> All projects
            </a>
          </div>
          <section className="project-identity admin-project-identity" id="overview">
            <div className="project-cover admin-hover-edit">
              {draft.image_url ? (
                <div className="project-cover-image admin-hover-content" role="img" aria-label={`${draft.name} project`} style={{ backgroundImage: `url(${draft.image_url})` }} />
              ) : (
                <span className="admin-hover-content">
                  <ImageIcon />
                  <b>{initials}</b>
                </span>
              )}
              {editingPart === "image" ? (
                <label className="admin-project-image-picker">
                  <ImageIcon /> {draft.image_url ? "Change Image" : "Upload Image"}
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void chooseProjectImage(event)} />
                </label>
              ) : (
                <div className="admin-hover-actions">
                  {draft.image_url ? (
                    <>
                      <button type="button" onClick={() => setEditingPart("image")}>
                        <Pencil /> Edit
                      </button>
                      <button type="button" onClick={() => void saveProjectImage("")}>
                        <Trash2 /> Delete
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={() => setEditingPart("image")}>
                      <ImageIcon /> Upload
                    </button>
                  )}
                </div>
              )}
            </div>
            <div>
              {editingPart === "title" ? (
                <div className="admin-inline-editor admin-title-inline-editor">
                  <input
                    autoFocus
                    aria-label="Project title"
                    maxLength={PROJECT_TITLE_MAX}
                    value={draft.name}
                    onBlur={() => {
                      setDraft({ ...draft, name: project.name });
                      setEditingPart(null);
                    }}
                    onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void saveOverview("title");
                      }
                      if (event.key === "Escape") {
                        setDraft({ ...draft, name: project.name });
                        setEditingPart(null);
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="admin-hover-edit admin-title-edit">
                  <h1 className="admin-hover-content">{draft.name || "Project Title"}</h1>
                  <div className="admin-hover-actions">
                    <button type="button" onClick={() => setEditingPart("title")}>
                      <Pencil /> Edit
                    </button>
                  </div>
                </div>
              )}
              {editingPart === "description" ? (
                <div className="admin-inline-editor admin-description-inline-editor">
                  <textarea
                    autoFocus
                    aria-label="Project description"
                    maxLength={PROJECT_DESCRIPTION_MAX}
                    value={draft.description}
                    onBlur={() => {
                      setDraft({ ...draft, description: project.description });
                      setEditingPart(null);
                    }}
                    onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void saveOverview("description");
                      }
                      if (event.key === "Escape") {
                        setDraft({ ...draft, description: project.description });
                        setEditingPart(null);
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="admin-hover-edit admin-description-edit">
                  <p className="admin-hover-content">{draft.description || "Project Description"}</p>
                  <div className="admin-hover-actions">
                    <button type="button" onClick={() => setEditingPart("description")}>
                      <Pencil /> Edit
                    </button>
                  </div>
                </div>
              )}
              <div className="project-classification" aria-label="Project classification">
                {(
                  [
                    ["industry", "Industry"],
                    ["category", "Category"],
                    ["sub_category", "Sub-Category"],
                  ] as const
                ).map(([field, placeholder], index) => (
                  <span className="project-classification-segment" key={field}>
                    {index > 0 && <span className="project-classification-divider" aria-hidden="true">/</span>}
                    {editingClassification === field ? (
                      <input
                        autoFocus
                        aria-label={placeholder}
                        maxLength={80}
                        value={draft[field]}
                        onBlur={() => {
                          setDraft({ ...draft, [field]: project[field] });
                          setEditingClassification(null);
                        }}
                        onChange={(event) => setDraft({ ...draft, [field]: event.target.value })}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            void saveClassification(field);
                          }
                          if (event.key === "Escape") {
                            setDraft({ ...draft, [field]: project[field] });
                            setEditingClassification(null);
                          }
                        }}
                      />
                    ) : (
                      <button className="project-classification-field admin-hover-edit" type="button" onClick={() => setEditingClassification(field)}>
                        <strong className="admin-hover-content">{draft[field] || placeholder}</strong>
                        <span className="admin-hover-actions" aria-hidden="true"><Pencil /> Edit</span>
                      </button>
                    )}
                  </span>
                ))}
              </div>
              <ProjectPitchLinks active={pitchSection} onSelect={setPitchSection} sections={adminProjectPitchSections} />
            </div>
          </section>
          {message && message !== "Loading project…" && message !== "Saving…" && (
            <p className="profile-message" role="status">
              {message}
            </p>
          )}
        </header>
        <section className="project-page-body" aria-live="polite">
          <section className={`project-pitch-page${pitchSection === "Timeline" ? " control-panel-page" : ""}`} id={pitchSection.toLowerCase().replaceAll(" ", "-")}>
            {pitchSection === "Timeline" ? (
              <div className="control-panel-timeline-scroll">
                <div className="control-panel-timeline">
                  {timeline.map((milestone, index) => (
                    <article key={milestone.id}>
                      <button type="button" className={`timeline-point timeline-point-${milestone.status}`} aria-label={`Edit ${milestone.name}`} onClick={() => openMilestoneEditor(milestone)}>
                        {milestone.status === "completed" ? <Check /> : <span />}
                      </button>
                      {index < timeline.length - 1 && (
                        <button type="button" className="timeline-add-point" aria-label={`Add goal between ${milestone.name} and ${timeline[index + 1].name}`} onClick={() => addMilestoneBetween(milestone, timeline[index + 1])}>
                          +
                        </button>
                      )}
                      <div className="timeline-goal-title admin-hover-edit">
                        <strong className="admin-hover-content">{milestone.name}</strong>
                        <div className="admin-hover-actions">
                          <button type="button" onClick={() => openMilestoneEditor(milestone)}>
                            <Pencil /> Edit
                          </button>
                        </div>
                      </div>
                      <time>
                        {new Date(`${milestone.date}T00:00:00`).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </time>
                      <span className={`timeline-status timeline-status-${milestone.status}`}>{milestone.status.replace("_", " ")}</span>
                      {milestoneEdit && (milestoneEdit.id === milestone.id || milestoneEditAnchor === milestone.id) && (
                        <div className="timeline-edit-popup">
                          <label>
                            Goal Title
                            <input
                              maxLength={40}
                              value={milestoneEdit.name}
                              onChange={(event) =>
                                setMilestoneEdit({
                                  ...milestoneEdit,
                                  name: event.target.value,
                                })
                              }
                            />
                          </label>
                          <label>
                            Goal Date
                            <input
                              type="date"
                              value={milestoneEdit.date}
                              onChange={(event) =>
                                setMilestoneEdit({
                                  ...milestoneEdit,
                                  date: event.target.value,
                                })
                              }
                            />
                          </label>
                          <label>
                            Goal Status
                            <select
                              value={milestoneEdit.status}
                              onChange={(event) =>
                                setMilestoneEdit({
                                  ...milestoneEdit,
                                  status: event.target.value as Milestone["status"],
                                })
                              }
                            >
                              <option value="planned">Planned</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </label>
                          <div>
                            <button
                              type="button"
                              onClick={() => {
                                const exists = timeline.some((item) => item.id === milestoneEdit.id);
                                void saveTimeline(exists ? timeline.map((item) => (item.id === milestoneEdit.id ? milestoneEdit : item)) : [...timeline, milestoneEdit]);
                                setMilestoneEdit(null);
                                setMilestoneEditAnchor(null);
                              }}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setMilestoneEdit(null);
                                setMilestoneEditAnchor(null);
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="timeline-delete-action"
                              onClick={() => {
                                const exists = timeline.some((item) => item.id === milestoneEdit.id);
                                if (exists) void saveTimeline(timeline.filter((item) => item.id !== milestoneEdit.id));
                                setMilestoneEdit(null);
                                setMilestoneEditAnchor(null);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            ) : pitchSection === "Problem" ? (
              <ProjectStoryPageEditor section="Problem" blocks={draft.problem_content} onSave={(content) => saveStoryContent("problem_content", content)} />
            ) : pitchSection === "Solution" ? (
              <ProjectStoryPageEditor section="Solution" blocks={draft.solution_content} onSave={(content) => saveStoryContent("solution_content", content)} />
            ) : pitchSection === "Competition" ? (
              <ProjectStoryPageEditor section="Competition" blocks={draft.competition_content} onSave={(content) => saveStoryContent("competition_content", content)} />
            ) : pitchSection === "Market" ? (
              <ProjectStoryPageEditor section="Market" blocks={draft.market_content} onSave={(content) => saveStoryContent("market_content", content)} />
            ) : pitchSection === "Business Model" ? (
              <ProjectStoryPageEditor section="Business Model" blocks={draft.business_model_content} onSave={(content) => saveStoryContent("business_model_content", content)} />
            ) : (
              <h2>{pitchSection}</h2>
            )}
          </section>
        </section>
      </div>
    </>
  );
}

type MemberIdentity = {
  id: string;
  name: string;
  email: string;
  initials: string;
};

function identityFromUser(user?: { id?: string | null; name?: string | null; email?: string | null }): MemberIdentity {
  const name = user?.name?.trim() || user?.email?.split("@")[0] || "OSai member";
  const initials =
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "OS";
  return { id: user?.id || "", name, email: user?.email || "", initials };
}

function ProfilePage({ identity, role, onSaved }: { identity: MemberIdentity; role: "member" | "admin"; onSaved: (identity: MemberIdentity) => void }) {
  const { user } = useUser();
  const nameParts = identity.name.split(/\s+/);
  const [firstName, setFirstName] = useState(nameParts[0] || "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" "));
  const [email, setEmail] = useState(identity.email);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  const [securityPanel, setSecurityPanel] = useState<"password" | "notifications" | null>(() =>
    new URLSearchParams(window.location.search).get("panel") === "notifications" ? "notifications" : null,
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [notificationPreferences, setNotificationPreferences] = useState(() => {
    try {
      const stored = window.localStorage.getItem("osai.notification-preferences.v1");
      return stored
        ? (JSON.parse(stored) as {
            email: boolean;
            inApp: boolean;
            projectUpdates: boolean;
            betaInvitations: boolean;
          })
        : {
            email: true,
            inApp: true,
            projectUpdates: true,
            betaInvitations: true,
          };
    } catch {
      return {
        email: true,
        inApp: true,
        projectUpdates: true,
        betaInvitations: true,
      };
    }
  });
  const [preferencesSaved, setPreferencesSaved] = useState(false);
  const profilePhotoKey = `osai.profile-photo.${identity.email || "preview"}`;
  const [profilePhoto, setProfilePhoto] = useState(() => {
    try {
      return window.localStorage.getItem(profilePhotoKey) || "";
    } catch {
      return "";
    }
  });
  useEffect(() => {
    const nextNameParts = identity.name.split(/\s+/);
    setFirstName(nextNameParts[0] || "");
    setLastName(nextNameParts.slice(1).join(" "));
  }, [identity.name]);
  useEffect(() => setEmail(identity.email), [identity.email]);
  useEffect(() => {
    try {
      setProfilePhoto(window.localStorage.getItem(profilePhotoKey) || "");
    } catch {
      setProfilePhoto("");
    }
  }, [profilePhotoKey]);
  const updateProfilePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 2_000_000) {
      setStatus("error");
      setMessage("Choose an image smaller than 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      try {
        window.localStorage.setItem(profilePhotoKey, reader.result);
      } catch {
        setStatus("error");
        setMessage("We could not save that image in this browser.");
        return;
      }
      setProfilePhoto(reader.result);
      setStatus("saved");
      setMessage("Your profile image has been updated.");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };
  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const first = firstName.trim();
    const last = lastName.trim();
    if (!first || !last) {
      setStatus("error");
      setMessage("Enter both your first and last name.");
      return;
    }
    setStatus("saving");
    setMessage("");
    const nextEmail = email.trim().toLowerCase();
    if (!nextEmail) {
      setStatus("error");
      setMessage("Enter a valid email address.");
      return;
    }
    const name = `${first} ${last}`;
    try {
      await user?.update({ firstName: first, lastName: last });
    } catch (profileError) {
      setStatus("error");
      setMessage(profileError instanceof Error ? profileError.message : "We could not save your name. Please try again.");
      return;
    }
    const updatedIdentity = identityFromUser({
      id: identity.id,
      name,
      email: identity.email,
    });
    onSaved(updatedIdentity);
    if (nextEmail !== identity.email.toLowerCase()) {
      try {
        const address = await user?.createEmailAddress({ email: nextEmail });
        await address?.prepareVerification({ strategy: "email_code" });
      } catch (emailError) {
        setStatus("error");
        setMessage(`Your name was saved, but we could not start the email change. ${emailError instanceof Error ? emailError.message : "Please try again."}`);
        return;
      }
      setStatus("saved");
      setMessage(`Your name was saved. Check ${nextEmail} to verify your new sign-in email.`);
      return;
    }
    setStatus("saved");
    setMessage("Your profile changes have been saved.");
  };
  const clearStatus = () => {
    setStatus("idle");
    setMessage("");
  };
  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      setPasswordStatus("error");
      setPasswordMessage("Use at least 8 characters for your new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus("error");
      setPasswordMessage("The new passwords do not match.");
      return;
    }
    setPasswordStatus("saving");
    setPasswordMessage("");
    try {
      await user?.updatePassword({ currentPassword, newPassword, signOutOfOtherSessions: false });
    } catch (passwordError) {
      setPasswordStatus("error");
      setPasswordMessage(passwordError instanceof Error ? passwordError.message : "We could not update your password.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordStatus("saved");
    setPasswordMessage("Your password has been updated.");
  };
  const savePreferences = () => {
    try {
      window.localStorage.setItem("osai.notification-preferences.v1", JSON.stringify(notificationPreferences));
    } catch {
      /* Preferences still apply for this session. */
    }
    setPreferencesSaved(true);
  };
  const togglePreference = (key: keyof typeof notificationPreferences) => {
    setNotificationPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));
    setPreferencesSaved(false);
  };
  return (
    <>
      <PageHead title="Profile & Security" intro="Manage your member profile, sign-in details, and notification preferences." />
      <div className="settings-layout">
        <section>
          <h2>Profile</h2>
          <div className="avatar-editor">
            <label className="profile-portrait">
              {profilePhoto ? <img src={profilePhoto} alt={`${identity.name} profile`} /> : <span>{identity.initials}</span>}
              <span className="profile-portrait-overlay">
                <Pencil /> Edit
              </span>
              <input type="file" accept="image/*" aria-label="Edit profile image" onChange={updateProfilePhoto} />
            </label>
            <div>
              <strong>{identity.name}</strong>
            </div>
          </div>
          <form onSubmit={saveProfile}>
            <div className="form-grid">
              <label>
                First name
                <input
                  required
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(event) => {
                    setFirstName(event.target.value);
                    clearStatus();
                  }}
                />
              </label>
              <label>
                Last name
                <input
                  required
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(event) => {
                    setLastName(event.target.value);
                    clearStatus();
                  }}
                />
              </label>
              <label className="wide">
                Email
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    clearStatus();
                  }}
                />
                <small>Changing your sign-in email requires verification at the new address.</small>
              </label>
            </div>
            {message && (
              <p className={`profile-message ${status === "error" ? "error" : ""}`} role={status === "error" ? "alert" : "status"}>
                {message}
              </p>
            )}
            <button className="primary-button" disabled={status === "saving"}>
              {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : "Save changes"}
            </button>
          </form>
        </section>
        <aside>
          <h2>Security</h2>
          <button className="security-row" type="button" aria-expanded={securityPanel === "password"} onClick={() => setSecurityPanel(securityPanel === "password" ? null : "password")}>
            <KeyRound />
            <span>
              <strong>Password</strong>
              <small>Update your password</small>
            </span>
            <ChevronRight />
          </button>
          {securityPanel === "password" && (
            <form className="security-panel" onSubmit={changePassword}>
              <label>
                Current password
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) => {
                    setCurrentPassword(event.target.value);
                    setPasswordStatus("idle");
                  }}
                />
              </label>
              <label>
                New password
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value);
                    setPasswordStatus("idle");
                  }}
                />
              </label>
              <label>
                Confirm new password
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setPasswordStatus("idle");
                  }}
                />
              </label>
              {passwordMessage && (
                <p className={`profile-message ${passwordStatus === "error" ? "error" : ""}`} role={passwordStatus === "error" ? "alert" : "status"}>
                  {passwordMessage}
                </p>
              )}
              <button className="primary-button" disabled={passwordStatus === "saving"}>
                {passwordStatus === "saving" ? "Updating…" : "Update password"}
              </button>
            </form>
          )}
          <button className="security-row" type="button" aria-expanded={securityPanel === "notifications"} onClick={() => setSecurityPanel(securityPanel === "notifications" ? null : "notifications")}>
            <BellRing />
            <span>
              <strong>Notification preferences</strong>
              <small>Choose what OSai sends you</small>
            </span>
            <ChevronRight />
          </button>
          {securityPanel === "notifications" && (
            <div className="security-panel preference-panel">
              <label>
                <input type="checkbox" checked={notificationPreferences.email} onChange={() => togglePreference("email")} />
                <span>
                  <strong>Email notifications</strong>
                  <small>Receive enabled updates by email</small>
                </span>
              </label>
              <label>
                <input type="checkbox" checked={notificationPreferences.inApp} onChange={() => togglePreference("inApp")} />
                <span>
                  <strong>In-app notifications</strong>
                  <small>Show enabled updates in the member hub</small>
                </span>
              </label>
              <label>
                <input type="checkbox" checked={notificationPreferences.projectUpdates} onChange={() => togglePreference("projectUpdates")} />
                <span>
                  <strong>Project updates</strong>
                  <small>News from projects you follow</small>
                </span>
              </label>
              <label>
                <input type="checkbox" checked={notificationPreferences.betaInvitations} onChange={() => togglePreference("betaInvitations")} />
                <span>
                  <strong>Beta invitations</strong>
                  <small>Invitations and beta-program reminders</small>
                </span>
              </label>
              {preferencesSaved && (
                <p className="profile-message" role="status">
                  Your notification preferences have been saved.
                </p>
              )}
              <button className="primary-button" type="button" onClick={savePreferences}>
                Save preferences
              </button>
            </div>
          )}
          <section className="clearance-level" aria-labelledby="clearance-level-title">
            <ShieldCheck />
            <div>
              <h3 id="clearance-level-title">Clearance Level</h3>
              <strong>{role === "admin" ? "Administrator" : "Site Member"}</strong>
              <p>Your clearance is assigned by OSai and controls access to protected areas.</p>
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}

const structuredPageContext: Record<string, { header: string; icon: ReactNode; noticeTitle: string; noticeCopy: string }> = {
  "Beta Programs": {
    header: "Programs",
    icon: <FlaskConical />,
    noticeTitle: "Beta program access",
    noticeCopy: "Review invitations and participation information for beta programs available to you.",
  },
  Updates: {
    header: "Project Updates",
    icon: <BookOpen />,
    noticeTitle: "Updates available to you",
    noticeCopy: "Review news and changes from projects and programs you can access.",
  },
  Users: {
    header: "User Directory",
    icon: <Users />,
    noticeTitle: "User access administration",
    noticeCopy: "Review status, required legal documents, project collaboration, and administrator roles.",
  },
  "Profile & Security": {
    header: "Account Settings",
    icon: <User />,
    noticeTitle: "Profile and security",
    noticeCopy: "Manage your member profile, sign-in details, and notification preferences.",
  },
  Notifications: {
    header: "Notification Center",
    icon: <Bell />,
    noticeTitle: "Account activity",
    noticeCopy: "Access, agreement, and project activity that needs your attention appears below.",
  },
};
function PageContext({ header, icon, noticeTitle, noticeCopy }: { header: string; icon: ReactNode; noticeTitle: string; noticeCopy: string }) {
  return (
    <>
      <div className="structured-page-header">
        <span>{header}</span>
      </div>
      <div className="info-banner structured-page-notice">
        {icon}
        <span>
          <strong>{noticeTitle}</strong>
          <small>{noticeCopy}</small>
        </span>
      </div>
    </>
  );
}
function PageHead({ title, intro }: { title: string; intro: string }) {
  const context = structuredPageContext[title];
  return (
    <>
      <header className="member-page-head">
        <h1>{title}</h1>
        {intro && !context && <p>{intro}</p>}
      </header>
      {context && <PageContext {...context} />}
    </>
  );
}
function AdminSectionPage({ title, description }: { title: string; description: string }) {
  return (
    <>
      <PageHead title={title} intro="" />
      <section className="admin-section-empty">
        <h2>{title}</h2>
        <p>{description}</p>
      </section>
    </>
  );
}
type AdminLabel = { type: "category" | "subcategory"; name: string; parent_name: string };
function AdminLabelsPage() {
  const [industries, setIndustries] = useState<string[]>([]);
  const [classifications, setClassifications] = useState<AdminLabel[]>([]);
  const [industryName, setIndustryName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categoryIndustry, setCategoryIndustry] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [subCategoryCategory, setSubCategoryCategory] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingIndustry, setDeletingIndustry] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const [selectedSubCategoryLabel, setSelectedSubCategoryLabel] = useState("");
  const [deletingSubCategory, setDeletingSubCategory] = useState<string | null>(null);
  const categories = useMemo(() => classifications.filter(({ type }) => type === "category"), [classifications]);
  const visibleCategories = useMemo(() => categories.filter(({ parent_name }) => parent_name.trim().toLowerCase() === categoryIndustry.trim().toLowerCase()), [categories, categoryIndustry]);
  const subCategories = useMemo(() => classifications.filter(({ type }) => type === "subcategory"), [classifications]);
  const visibleSubCategories = useMemo(() => subCategories.filter(({ parent_name }) => parent_name.trim().toLowerCase() === subCategoryCategory.trim().toLowerCase()), [subCategories, subCategoryCategory]);
  const loadLabels = async () => {
    const data = await adminRequest("/api/admin/labels");
    setIndustries((data.industries || []).map((item: { name: string }) => item.name));
    setClassifications((data.classifications || []).map((item: { classification_type: "category" | "subcategory"; name: string; parent_name: string }) => ({ type: item.classification_type, name: item.name, parent_name: item.parent_name })));
  };
  useEffect(() => { void loadLabels().catch(() => setError("Could not load labels.")); }, []);
  useEffect(() => { if (!categoryIndustry && industries[0]) setCategoryIndustry(industries[0]); }, [industries, categoryIndustry]);
  useEffect(() => {
    if (!visibleCategories.some(({ name }) => name === subCategoryCategory)) setSubCategoryCategory(visibleCategories[0]?.name || "");
  }, [categoryIndustry, classifications, subCategoryCategory, visibleCategories]);
  useEffect(() => {
    if (!visibleSubCategories.some(({ name }) => name === selectedSubCategoryLabel)) setSelectedSubCategoryLabel("");
  }, [selectedSubCategoryLabel, visibleSubCategories]);
  const createLabel = async (type: "industry" | "category" | "subcategory", name: string, parentName = "") => {
    if (!name.trim() || (type !== "industry" && !parentName.trim()) || saving) return;
    setSaving(true);
    setError("");
    try {
      await adminRequest("/api/admin/labels", { method: "POST", body: JSON.stringify({ type, name, parentName }) });
      if (type === "industry") setIndustryName("");
      if (type === "category") setCategoryName("");
      if (type === "subcategory") setSubCategoryName("");
      await loadLabels();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save the label.");
    } finally {
      setSaving(false);
    }
  };
  const deleteIndustry = async (name: string) => {
    setError("");
    try {
      await adminRequest("/api/admin/labels", { method: "DELETE", body: JSON.stringify({ type: "industry", name }) });
      if (categoryIndustry === name) setCategoryIndustry("");
      setDeletingIndustry(null);
      await loadLabels();
    } catch (caught) {
      setDeletingIndustry(null);
      setError(caught instanceof Error && caught.message === "INDUSTRY_IN_USE" ? "This Industry cannot be deleted while it has projects or assigned Categories." : caught instanceof Error ? caught.message : "Could not delete the Industry.");
    }
  };
  const deleteCategory = async (name: string) => {
    setError("");
    try {
      await adminRequest("/api/admin/labels", { method: "DELETE", body: JSON.stringify({ type: "category", name }) });
      if (subCategoryCategory === name) setSubCategoryCategory("");
      setDeletingCategory(null);
      await loadLabels();
    } catch (caught) {
      setDeletingCategory(null);
      setError(caught instanceof Error && caught.message === "CATEGORY_IN_USE" ? "This Category cannot be deleted while it has projects or assigned SubCategories." : caught instanceof Error ? caught.message : "Could not delete the Category.");
    }
  };
  const deleteSubCategory = async (name: string) => {
    setError("");
    try {
      await adminRequest("/api/admin/labels", { method: "DELETE", body: JSON.stringify({ type: "subcategory", name }) });
      if (selectedSubCategoryLabel === name) setSelectedSubCategoryLabel("");
      setDeletingSubCategory(null);
      await loadLabels();
    } catch (caught) {
      setDeletingSubCategory(null);
      setError(caught instanceof Error && caught.message === "SUBCATEGORY_IN_USE" ? "This SubCategory cannot be deleted while projects use it." : caught instanceof Error ? caught.message : "Could not delete the SubCategory.");
    }
  };
  return (
    <>
      <PageHead title="Labels" intro="" />
      <section className="admin-label-manager" aria-label="Industry, category, and subcategory labels">
        <div className="admin-label-column">
          <h2>Industry</h2>
          <p>Create the top-level groups used in the Project Directory, then select one to assign Categories.</p>
          <form onSubmit={(event) => { event.preventDefault(); void createLabel("industry", industryName); }}>
            <input
              aria-label="Add Industry"
              maxLength={80}
              placeholder="Add Industry"
              value={industryName}
              onChange={(event) => setIndustryName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") event.preventDefault();
              }}
            />
          </form>
          <ul className="admin-label-selection-list" aria-label="Select an Industry">
            {industries.map((industry) => (
              <li key={industry}>
                <button className={`admin-label-row-name${categoryIndustry === industry ? " selected" : ""}`} type="button" onClick={() => setCategoryIndustry(industry)}>{industry}</button>
                <span className="admin-label-row-actions">
                  <button className={`admin-label-select${categoryIndustry === industry ? " selected" : ""}`} type="button" onClick={() => setCategoryIndustry(industry)} aria-label={`Select ${industry}`} aria-pressed={categoryIndustry === industry}><Check /></button>
                  {deletingIndustry === industry ? (
                    <button className="admin-label-confirm-delete" type="button" onClick={() => void deleteIndustry(industry)}>Confirm Delete</button>
                  ) : (
                    <button className="admin-label-delete" type="button" onClick={() => setDeletingIndustry(industry)} aria-label={`Delete ${industry}`}><X /></button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="admin-label-column">
          <h2>Category</h2>
          <p>Create a Category and assign it to an Industry.</p>
          <form onSubmit={(event) => { event.preventDefault(); void createLabel("category", categoryName, categoryIndustry); }}>
            <input aria-label="Add Category" maxLength={80} placeholder="Add Category" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") event.preventDefault(); }} />
          </form>
          <ul className="admin-label-selection-list" aria-label="Select a Category">
            {visibleCategories.map((category) => (
              <li key={category.name}>
                <button className={`admin-label-row-name${subCategoryCategory === category.name ? " selected" : ""}`} type="button" onClick={() => setSubCategoryCategory(category.name)}>{category.name}</button>
                <span className="admin-label-row-actions">
                  <button className={`admin-label-select${subCategoryCategory === category.name ? " selected" : ""}`} type="button" onClick={() => setSubCategoryCategory(category.name)} aria-label={`Select ${category.name}`} aria-pressed={subCategoryCategory === category.name}><Check /></button>
                  {deletingCategory === category.name ? (
                    <button className="admin-label-confirm-delete" type="button" onClick={() => void deleteCategory(category.name)}>Confirm Delete</button>
                  ) : (
                    <button className="admin-label-delete" type="button" onClick={() => setDeletingCategory(category.name)} aria-label={`Delete ${category.name}`}><X /></button>
                  )}
                </span>
              </li>
            ))}
            {categoryIndustry && visibleCategories.length === 0 && <li className="admin-label-list-empty">No Categories assigned to this Industry.</li>}
          </ul>
        </div>
        <div className="admin-label-column">
          <h2>SubCategory</h2>
          <p>Create a SubCategory and assign it to a Category.</p>
          <form onSubmit={(event) => { event.preventDefault(); void createLabel("subcategory", subCategoryName, subCategoryCategory); }}>
            <input aria-label="Add SubCategory" maxLength={80} placeholder="Add SubCategory" value={subCategoryName} onChange={(event) => setSubCategoryName(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") event.preventDefault(); }} />
          </form>
          <ul className="admin-label-selection-list" aria-label="Select a SubCategory">
            {visibleSubCategories.map((subCategory) => (
              <li key={subCategory.name}>
                <button className={`admin-label-row-name${selectedSubCategoryLabel === subCategory.name ? " selected" : ""}`} type="button" onClick={() => setSelectedSubCategoryLabel(subCategory.name)}>{subCategory.name}</button>
                <span className="admin-label-row-actions">
                  <button className={`admin-label-select${selectedSubCategoryLabel === subCategory.name ? " selected" : ""}`} type="button" onClick={() => setSelectedSubCategoryLabel(subCategory.name)} aria-label={`Select ${subCategory.name}`} aria-pressed={selectedSubCategoryLabel === subCategory.name}><Check /></button>
                  {deletingSubCategory === subCategory.name ? (
                    <button className="admin-label-confirm-delete" type="button" onClick={() => void deleteSubCategory(subCategory.name)}>Confirm Delete</button>
                  ) : (
                    <button className="admin-label-delete" type="button" onClick={() => setDeletingSubCategory(subCategory.name)} aria-label={`Delete ${subCategory.name}`}><X /></button>
                  )}
                </span>
              </li>
            ))}
            {subCategoryCategory && visibleSubCategories.length === 0 && <li className="admin-label-list-empty">No SubCategories assigned to this Category.</li>}
          </ul>
        </div>
      </section>
      {error && <p className="admin-label-error" role="alert">{error}</p>}
    </>
  );
}
function AdminHeaderNav({ active, onNavigate }: { active: string; onNavigate: (slug: string) => void }) {
  return (
    <nav className="admin-header-nav" aria-label="Admin navigation">
      {adminNav.map(({ slug, label }) => (
        <a
          className={active === slug ? "active" : undefined}
          href={`/member/${slug}`}
          key={slug}
          onClick={(event) => {
            event.preventDefault();
            onNavigate(slug);
          }}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}
function MemberHub() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const pageFromLocation = () => {
    const segments = window.location.pathname.split("/").filter(Boolean);
    return segments[1] === "pulse" && segments[2] === "editor" ? "pulse-editor" : segments[1] || "dashboard";
  };
  const initial = pageFromLocation();
  const [page, setPage] = useState(initial);
  const [navOpen, setNavOpen] = useState(false);
  const [identity, setIdentity] = useState<MemberIdentity>(() => identityFromUser());
  const [role, setRole] = useState<"member" | "admin">("member");
  useEffect(() => {
    const onPop = () => setPage(pageFromLocation());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  useEffect(() => {
    if (user) setIdentity(identityFromUser({ id: user.externalId || user.id, name: user.fullName, email: user.primaryEmailAddress?.emailAddress }));
    fetch("/api/me").then(async (response) => ({ response, result: await response.json() })).then(({ response, result }) => {
      if (response.ok && result.profile) {
        setIdentity(identityFromUser({ id: result.profile.authUserId, name: result.profile.displayName, email: result.profile.email }));
        if (result.profile.role === "admin") setRole("admin");
      }
    }).catch(() => undefined);
  }, [user]);
  const navigate = (slug: string) => {
    window.history.pushState({}, "", slug === "pulse-editor" ? "/member/pulse/editor" : `/member/${slug}`);
    setPage(slug);
    setNavOpen(false);
    window.scrollTo(0, 0);
  };
  const leave = async () => { await signOut({ redirectUrl: "/" }); };
  const screens: Record<string, ReactNode> = {
    pulse: <PulsePage onCreatePost={() => navigate("pulse-editor")} />,
    "pulse-editor": <UserPostingEditor onBack={() => navigate("pulse")} contributorName={identity.name} />,
    dashboard: <Dashboard />,
    projects: <ProjectsPage isAdmin={role === "admin"} />,
    legal: <AgreementsPage isAdmin={role === "admin"} />,
    "beta-programs": <BetaPage />,
    updates: <UpdatesPage />,
    notifications: <NotificationsPage />,
    profile: <ProfilePage identity={identity} role={role} onSaved={setIdentity} />,
    ...(role === "admin" ? {
      "admin-profile": <ProfilePage identity={identity} role={role} onSaved={setIdentity} />,
      "admin-users": <AdminUsersPage currentAuthUserId={identity.id} />,
      "admin-legal": <AgreementsPage isAdmin />,
      "admin-beta": <BetaPage />,
      "admin-labels": <AdminLabelsPage />,
      "admin-teams": <AdminSectionPage title="Teams" description="Organize project teams and review their membership." />,
      "admin-roles": <AdminSectionPage title="Roles" description="Review administrative and project role definitions." />,
      "admin-communication": <AdminSectionPage title="Communication" description="Manage administrative communication workflows." />,
    } : {}),
  };
  const adminPrimaryNav = memberNav.filter(({ slug }) => !["legal", "beta-programs"].includes(slug));
  const visibleNav = role === "admin" ? [...adminPrimaryNav, ...sidebarUtilityNav.filter(({ slug }) => slug !== "profile")] : [...memberNav, ...sidebarUtilityNav];
  const isAdminPage = role === "admin" && adminNav.some(({ slug }) => slug === page);
  const adminPageTitle = page === "admin-profile" ? "Profile & Security" : adminNav.find(({ slug }) => slug === page)?.label || "Admin";
  const isDashboard = page === "dashboard";
  const isStructuredPage = ["pulse", "pulse-editor", "beta-programs", "updates", "profile", "notifications", ...adminNav.map(({ slug }) => slug)].includes(page);
  const isProjectEdit = page === "projects" && new URLSearchParams(window.location.search).has("adminEdit");
  const isProjectsCatalog = page === "projects" && !window.location.pathname.split("/").filter(Boolean)[2] && !isProjectEdit;
  return (
    <div className="member-shell">
      <aside className={`member-sidebar ${navOpen ? "open" : ""}`}>
        <div className="member-brand">
          <a href="/" aria-label="Orbit Systems home">
            <img src="/OSAI_Main-Logo.png?v=20260731" alt="Orbit Systems — Augmented Intelligence" width="1280" height="640" />
          </a>
        </div>
        <nav aria-label="Member navigation">
          {visibleNav.map(({ slug, label, icon: Icon, count }) => (
            <a
              href={`/member/${slug}`}
              className={page === slug || (slug === "pulse" && page === "pulse-editor") ? "active" : undefined}
              onClick={(e) => {
                e.preventDefault();
                navigate(slug);
              }}
              key={slug}
            >
              <Icon />
              <span>{label}</span>
              {count ? <b>{count}</b> : null}
            </a>
          ))}
          {role === "admin" && (
            <a href="/member/admin-profile" className={isAdminPage ? "active sidebar-admin-link" : "sidebar-admin-link"} onClick={(event) => { event.preventDefault(); navigate("admin-profile"); }}>
              <UserCog />
              <span>Admin</span>
            </a>
          )}
          <button className="sidebar-signout" type="button" onClick={leave}>
            <LogOut />
            <span>Sign Out</span>
          </button>
        </nav>
      </aside>
      <div className="member-main">
        {isDashboard || isStructuredPage || page === "legal" || isProjectsCatalog || isProjectEdit ? (
          <header className="member-topbar agreements-mobile-topbar">
            <button className="member-menu" onClick={() => setNavOpen(!navOpen)} aria-label="Open navigation">
              <Menu />
            </button>
          </header>
        ) : (
          <header className="member-topbar">
            <button className="member-menu" onClick={() => setNavOpen(!navOpen)} aria-label="Open navigation">
              <Menu />
            </button>
            <span className="topbar-title">{role === "admin" ? "Admin Hub" : "Member Hub"}</span>
          </header>
        )}
        <main className={`member-content${isDashboard ? " dashboard-content" : isStructuredPage ? " structured-content" : page === "legal" || page === "admin-legal" ? " agreements-content" : isProjectsCatalog ? " projects-content" : isProjectEdit ? " project-details-content" : ""}`}>
          {isAdminPage && (
            <div className="admin-page-header">
              <header className="member-page-head"><h1>{adminPageTitle}</h1></header>
              <AdminHeaderNav active={page} onNavigate={navigate} />
            </div>
          )}
          {screens[page] || <Dashboard />}
        </main>
      </div>
      {navOpen && <button className="nav-scrim" onClick={() => setNavOpen(false)} aria-label="Close navigation" />}
    </div>
  );
}

function ProtectedMemberHub() {
  const { isLoaded, isSignedIn } = useAuth();
  const isDevelopmentPreview = process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_MEMBER_PREVIEW === "true";
  useEffect(() => {
    if (isLoaded && !isSignedIn && !isDevelopmentPreview) window.location.replace("/auth/sign-in");
  }, [isDevelopmentPreview, isLoaded, isSignedIn]);
  if (isDevelopmentPreview) return <MemberHub />;
  if (!isLoaded)
    return (
      <main className="session-check">
        <ShieldCheck />
        <p>Checking your secure session…</p>
      </main>
    );
  if (!isSignedIn)
    return (
      <main className="session-check">
        <ShieldCheck />
        <p>Taking you to sign in…</p>
      </main>
    );
  return <MemberHub />;
}

export default function App() {
  const pathname = usePathname();
  if (pathname.startsWith("/auth/")) return <AuthPage />;
  return pathname.startsWith("/member") ? <ProtectedMemberHub /> : <PublicSite />;
}
