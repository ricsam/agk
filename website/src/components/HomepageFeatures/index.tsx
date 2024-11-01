import { SequenceViewer } from "@anocca/sequence-viewer";
import styles from "./styles.module.css";

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <SequenceViewer
        sequences={[
          {
            type: "dna",
            defaultLayout: "circular",
            title: "Some sequences",
            sequence:
              "TCCTCGCATAGGGCGGATCGGTATTCATGGGACGCCACACAACTCTTAGATTGATTGTCGCTTTCAGGCGTGTCATCCTGCGCCCCGGCACGAGCTCGTCCGGCGGTATAGTCGTATGTGCTTATACACATCAAAGCTAACAAATCTTTCTGCGGGCGGTCGTCACGACACACGTTCTTACG",
          },
          {
            type: "dna",
            defaultLayout: "circular",
            title: "Some sequences",
            sequence:
              "TCCTCGCATAGGGCGGATCGGTATTCATGGGACGCCACACAACTCTTAGATTGATTGTCGCTTTCAGGCGTGTCATCCTGCGCCCCGGCACGAGCTCGTCCGGCGGTATAGTCGTATGTGCTTATACACATCAAAGCTAACAAATCTTTCTGCGGGCGGTCGTCACGACACACGTTCTTACG",
          },

        ]}
      />
    </section>
  );
}
