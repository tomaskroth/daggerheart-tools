import React from 'react';
import { useCharacterHope } from '../hooks/useCharacterHope';
import { useCharacterIdentity } from '../hooks/useCharacterIdentity';
import { useSrdClasses } from '../hooks/useSrdClasses';
import { extractHopeFeatureHtml } from '../utils/classContentParsers';

function HopeSection(): React.ReactElement {
  const { hopeDiamonds, toggleHopeDiamond } = useCharacterHope();
  const { classSlug } = useCharacterIdentity();
  const { classes } = useSrdClasses();

  const selectedClass = classSlug !== null
    ? classes.find((c) => c.slug === classSlug) ?? null
    : null;

  const hopeFeatureHtml = selectedClass !== null
    ? extractHopeFeatureHtml(selectedClass.content)
    : null;

  return (
    <section
      className="character-sheet__section hope-section"
      data-testid="hope-section"
      aria-label="Hope"
    >
      <h2>Hope</h2>

      <div
        className="hope-section__diamonds"
        data-testid="hope-diamonds"
        aria-label="Hope diamonds"
      >
        {hopeDiamonds.map((isMarked, index) => (
          <button
            key={index}
            type="button"
            className={[
              'hope-section__diamond',
              isMarked ? 'hope-section__diamond--marked' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-label={`Hope diamond ${index + 1}${isMarked ? ' marked' : ''}`}
            aria-pressed={isMarked}
            data-testid={`hope-diamond-${index + 1}`}
            onClick={() => toggleHopeDiamond(index)}
          />
        ))}
      </div>

      <div
        className="hope-section__feature"
        data-testid="hope-feature-area"
        aria-label="Hope feature"
      >
        {hopeFeatureHtml !== null ? (
          // Hope feature HTML is extracted from backend-sanitised SRD content (ADR-002).
          // dangerouslySetInnerHTML is reviewed and approved per ADR-002 security notes.
          <div dangerouslySetInnerHTML={{ __html: hopeFeatureHtml }} />
        ) : null}
      </div>
    </section>
  );
}

HopeSection.displayName = 'HopeSection';

export default HopeSection;
