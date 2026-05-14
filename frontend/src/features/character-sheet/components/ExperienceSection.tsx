import React from 'react';
import { useCharacterHope } from '../hooks/useCharacterHope';

function ExperienceSection(): React.ReactElement {
  const { experience, setExperienceName, setExperienceModifier } = useCharacterHope();

  function handleModifierChange(index: number, rawValue: string): void {
    const parsed = parseInt(rawValue, 10);
    setExperienceModifier(index, isNaN(parsed) ? null : parsed);
  }

  return (
    <section
      className="character-sheet__section experience-section"
      data-testid="experience-section"
      aria-label="Experience"
    >
      <h2>Experience</h2>

      <div className="experience-section__lines">
        {experience.map((entry, index) => (
          <div key={index} className="experience-section__row">
            <input
              type="text"
              className="experience-section__line-input"
              aria-label={`Experience line ${index + 1} name`}
              data-testid={`experience-line-${index + 1}-name`}
              value={entry.name}
              onChange={(e) => setExperienceName(index, e.target.value)}
            />
            <input
              type="number"
              className="traits-section__score-input"
              aria-label={`Experience line ${index + 1} modifier`}
              data-testid={`experience-line-${index + 1}-modifier`}
              value={entry.modifier ?? ''}
              onChange={(e) => handleModifierChange(index, e.target.value)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

ExperienceSection.displayName = 'ExperienceSection';

export default ExperienceSection;
