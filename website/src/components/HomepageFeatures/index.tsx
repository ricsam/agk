import { SequenceViewer } from '@anocca/sequence-viewer';
import styles from './styles.module.css';

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <SequenceViewer sequence='TCCTCGCATAGGGCGGATCGGTATTCATGGGACGCCACACAACTCTTAGATTGATTGTCGCTTTCAGGCGTGTCATCCTGCGCCCCGGCACGAGCTCGTCCGGCGGTATAGTCGTATGTGCTTATACACATCAAAGCTAACAAATCTTTCTGCGGGCGGTCGTCACGACACACGTTCTTACG' />
    </section>
  );
}
