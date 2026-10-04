import styles from './SectionHeader.module.css';

export default function SectionHeader({ badge, title, highlight, description, centered = true, light = false }) {
  return (
    <div className={`${styles.header} ${centered ? styles.centered : ''} ${light ? styles.light : ''}`}>
      {badge && <span className={styles.badge}>{badge}</span>}
      <h2 className={styles.title}>
        {title}{' '}
        {highlight && <span className={styles.highlight}>{highlight}</span>}
      </h2>
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
}
