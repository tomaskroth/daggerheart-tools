import React from 'react';
import { useCharacterIdentity } from '../hooks/useCharacterIdentity';
import { useSrdClasses } from '../hooks/useSrdClasses';

function ClassFeatureSection(): React.ReactElement {
  const { classSlug } = useCharacterIdentity();
  const { classes } = useSrdClasses();

  const selectedClass = classSlug !== null
    ? classes.find((c) => c.slug === classSlug) ?? null
    : null;

  return (
    <section
      className="character-sheet__section class-feature-section"
      data-testid="class-feature-section"
      aria-label="Class Feature"
    >
      <h2>Class Feature</h2>
      {selectedClass !== null ? (
        <div
          className="class-feature-section__content"
          // Content is HTML from the backend, sanitised by Jsoup (ADR-002).
          // dangerouslySetInnerHTML is reviewed and approved per ADR-002 security notes.
          dangerouslySetInnerHTML={{ __html: selectedClass.content }}
        />
      ) : (
        <p className="class-feature-section__placeholder">
          Select a class to view its features.
        </p>
      )}
    </section>
  );
}

ClassFeatureSection.displayName = 'ClassFeatureSection';

export default ClassFeatureSection;
