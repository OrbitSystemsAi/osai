import Image from 'next/image'
import type { ReactNode } from 'react'
import styles from './PublicLegalPage.module.css'

type LegalSection = {
  title: string
  content: ReactNode
}

type PublicLegalPageProps = {
  title: string
  effectiveDate: string
  introduction: ReactNode
  sections: LegalSection[]
}

export default function PublicLegalPage({ title, effectiveDate, introduction, sections }: PublicLegalPageProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a href="/" aria-label="Orbit Systems AI home">
            <Image
              className={styles.logo}
              src="/orbit-systems-logo-on-dark.png"
              alt="Orbit Systems AI"
              width={1196}
              height={399}
              priority
            />
          </a>
          <a className={styles.backLink} href="/contact">Contact OSai</a>
        </div>
      </header>

      <main>
        <article className={styles.article}>
          <p className={styles.eyebrow}>Orbit Systems AI, LLC</p>
          <h1>{title}</h1>
          <p className={styles.effective}>Effective {effectiveDate}</p>
          <div className={styles.intro}>{introduction}</div>

          {sections.map((section) => (
            <section className={styles.section} key={section.title}>
              <h2>{section.title}</h2>
              {section.content}
            </section>
          ))}
        </article>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p>© {new Date().getFullYear()} Orbit Systems AI, LLC</p>
          <nav aria-label="Legal information">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
