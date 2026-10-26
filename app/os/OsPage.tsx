import Link from 'next/link';
import { contactHref, type OsContent } from './content';
import { LoopDiagram, ReachChart, RoutingDiagram, SystemDiagram } from './diagrams';
import { ScreenPanels } from './screens';
import styles from './os.module.css';

export default function OsPage({ content }: { content: OsContent }) {
  const { nav, hero, problem, system, parts, screens, proof, fit, steps, founder, footer } = content;
  const contact = contactHref(content);

  return (
    <div className={styles.root} data-os-root lang={content.lang}>
      <header className={styles.header}>
        <Link href={content.lang === 'ko' ? '/os' : '/os/en'} className={styles.wordmark}>
          ConnectAX
          <span>AI {content.lang === 'ko' ? '마케팅' : 'Marketing'} OS</span>
        </Link>
        <nav className={styles.nav}>
          <Link href={nav.switchHref} hrefLang={content.lang === 'ko' ? 'en' : 'ko'}>
            {nav.switchLabel}
          </Link>
          <a href={contact} className={styles.navContact}>
            {nav.contact}
          </a>
        </nav>
      </header>

      <main>
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>{hero.title}</h1>
          <div className={styles.heroBody}>
            <p className={styles.lead}>{hero.lead}</p>
            <p className={styles.status}>{hero.status}</p>
            <a href={contact} className={styles.button}>
              {hero.cta}
            </a>
          </div>
          <RoutingDiagram diagram={content.diagram} />
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{problem.title}</h2>
          <div className={styles.problemGrid}>
            {problem.items.map((item) => (
              <div key={item.head}>
                <h3 className={styles.itemHead}>{item.head}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{system.title}</h2>
          <p className={styles.sectionLead}>{system.lead}</p>
          <SystemDiagram system={system} />

          <h3 className={styles.subTitle}>{parts.title}</h3>
          <div className={styles.parts}>
            <div className={styles.partsHeader} aria-hidden="true">
              <span />
              <span />
              <span>{parts.stopLabel}</span>
            </div>
            {parts.items.map((item) => (
              <div key={item.name} className={styles.partRow}>
                <h4 className={styles.partName}>{item.name}</h4>
                <p>{item.body}</p>
                <p className={styles.partStop}>
                  <span className={styles.stopLabelInline}>{parts.stopLabel}</span>
                  {item.stop}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.screensSection}`}>
          <div>
            <h2 className={styles.sectionTitle}>{screens.title}</h2>
            <p className={styles.sectionLead}>{screens.lead}</p>
          </div>
          <ScreenPanels screens={screens} />
        </section>

        <section className={styles.proofSection}>
          <div className={styles.proofInner}>
            <h2 className={styles.sectionTitle}>{proof.title}</h2>
            <div className={styles.proofIntro}>
              <p className={styles.sectionLead}>{proof.lead}</p>
              <dl className={styles.facts}>
                {proof.facts.map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <LoopDiagram proof={proof} />
            <ReachChart reach={proof.reach} lang={content.lang} />
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{fit.title}</h2>
          <dl className={styles.fit}>
            {fit.items.map((item) => (
              <div key={item.who}>
                <dt>{item.who}</dt>
                <dd>{item.body}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{steps.title}</h2>
          <ol className={styles.steps} role="list">
            {steps.items.map((item) => (
              <li key={item.name}>
                <h3 className={styles.itemHead}>{item.name}</h3>
                <p>{item.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={`${styles.section} ${styles.founder}`}>
          <div>
            <h2 className={styles.sectionTitle}>{founder.title}</h2>
            <p className={styles.founderName}>{founder.name}</p>
            <p className={styles.founderRole}>{founder.role}</p>
          </div>
          <div className={styles.founderText}>
            {founder.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
            <a href={contact} className={styles.button}>
              {hero.cta}
            </a>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p className={styles.footerCompany}>{footer.company}</p>
        <dl className={styles.footerList}>
          {footer.rows.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </footer>
    </div>
  );
}
