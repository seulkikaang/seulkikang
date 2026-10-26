import type { OsContent } from './content';
import styles from './os.module.css';

export function ScreenPanels({ screens }: { screens: OsContent['screens'] }) {
  const { menu } = screens;

  return (
    <div className={styles.screens}>
      <figure className={styles.panel}>
        <figcaption className={styles.panelBar}>{menu.title}</figcaption>
        <div className={styles.panelBody}>
          <p className={styles.menuPrompt}>{menu.prompt}</p>
          <ol className={styles.menuList} role="list">
            {menu.items.map((item, i) => (
              <li key={item} className={i === 0 ? styles.menuActive : undefined}>
                <span className={styles.menuKey}>{i + 1}</span>
                {item}
              </li>
            ))}
          </ol>
          <p className={styles.menuGuard}>{menu.guard}</p>
        </div>
      </figure>
    </div>
  );
}
