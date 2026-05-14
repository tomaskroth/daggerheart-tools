import React from 'react';
import { useCharacterIdentity } from '../hooks/useCharacterIdentity';
import { useSrdClasses } from '../hooks/useSrdClasses';
import { useSrdCommunities } from '../hooks/useSrdCommunities';
import { useSrdSubclasses } from '../hooks/useSrdSubclasses';
import { extractDomains } from '../utils/classContentParsers';

function ClassHeader(): React.ReactElement {
  const {
    name,
    pronouns,
    classSlug,
    heritageSlug,
    subclassSlug,
    level,
    setName,
    setPronouns,
    setLevel,
    setIdentity,
  } = useCharacterIdentity();

  const { classes } = useSrdClasses();
  const { communities } = useSrdCommunities();
  const { subclasses } = useSrdSubclasses(classSlug);

  const selectedClass = classSlug !== null
    ? classes.find((c) => c.slug === classSlug) ?? null
    : null;

  const domains = selectedClass !== null
    ? extractDomains(selectedClass.content)
    : [];

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    // When class changes, clear subclass to prevent stale selection.
    setIdentity({ classSlug: value !== '' ? value : null, subclassSlug: null });
  };

  const handleHeritageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setIdentity({ heritageSlug: value !== '' ? value : null });
  };

  const handleSubclassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setIdentity({ subclassSlug: value !== '' ? value : null });
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    setLevel(isNaN(parsed) ? null : parsed);
  };

  return (
    <section className="class-header" data-testid="class-header">
      <div className="class-header__identity">
        <div className="class-header__field">
          <label htmlFor="character-name">Name</label>
          <input
            id="character-name"
            type="text"
            aria-label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="class-header__field">
          <label htmlFor="character-pronouns">Pronouns</label>
          <input
            id="character-pronouns"
            type="text"
            aria-label="Pronouns"
            value={pronouns}
            onChange={(e) => setPronouns(e.target.value)}
          />
        </div>
        <div className="class-header__field">
          <label htmlFor="character-class">Class</label>
          <select
            id="character-class"
            aria-label="Class"
            value={classSlug ?? ''}
            onChange={handleClassChange}
          >
            <option value="">— Select class —</option>
            {classes.map((cls) => (
              <option key={cls.slug} value={cls.slug}>
                {cls.title}
              </option>
            ))}
          </select>
        </div>
        <div className="class-header__field">
          <label htmlFor="character-heritage">Heritage</label>
          <select
            id="character-heritage"
            aria-label="Heritage"
            value={heritageSlug ?? ''}
            onChange={handleHeritageChange}
          >
            <option value="">— Select heritage —</option>
            {communities.map((community) => (
              <option key={community.slug} value={community.slug}>
                {community.title}
              </option>
            ))}
          </select>
        </div>
        <div className="class-header__field">
          <label htmlFor="character-subclass">Subclass</label>
          <select
            id="character-subclass"
            aria-label="Subclass"
            value={subclassSlug ?? ''}
            onChange={handleSubclassChange}
            disabled={classSlug === null || subclasses.length === 0}
          >
            <option value="">— Select subclass —</option>
            {subclasses.map((sub) => (
              <option key={sub.slug} value={sub.slug}>
                {sub.title}
              </option>
            ))}
          </select>
        </div>
        <div className="class-header__field">
          <label htmlFor="character-level">Level</label>
          <input
            id="character-level"
            type="number"
            aria-label="Level"
            value={level ?? ''}
            onChange={handleLevelChange}
            min={1}
            max={10}
          />
        </div>
      </div>
      <div className="class-header__badges" data-testid="class-badges">
        {domains.length > 0 ? (
          domains.map((domain) => (
            <span
              key={domain}
              className="class-header__badge class-header__badge--domain"
              data-testid={`domain-badge-${domain.toLowerCase()}`}
            >
              {domain}
            </span>
          ))
        ) : (
          <span className="class-header__badge class-header__badge--placeholder">
            Select a class to see domains
          </span>
        )}
      </div>
    </section>
  );
}

ClassHeader.displayName = 'ClassHeader';

export default ClassHeader;
