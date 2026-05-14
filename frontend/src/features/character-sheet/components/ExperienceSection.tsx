import React from 'react';
import { useCharacterHope } from '../hooks/useCharacterHope';

function ExperienceSection(): React.ReactElement {
  const { experience, setExperience } = useCharacterHope();

  return (
    <section
      className="character-sheet__section experience-section"
      data-testid="experience-section"
      aria-label="Experience"
    >
      <h2>Experience</h2>

      <div className="experience-section__lines">
        {experience.map((line, index) => (
          <input
            key={index}
            type="text"
            className="experience-section__line-input"
            aria-label={`Experience line ${index + 1}`}
            data-testid={`experience-line-${index + 1}`}
            value={line}
            onChange={(e) => setExperience(index, e.target.value)}
          />
        ))}
      </div>
    </section>
  );
}

ExperienceSection.displayName = 'ExperienceSection';

export default ExperienceSection;
