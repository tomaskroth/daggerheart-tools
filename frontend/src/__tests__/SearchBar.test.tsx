import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../components/SearchBar';

// Scenarios: PBI-006-frontend-test-infrastructure.feature — SearchBar @regression
describe('SearchBar', () => {
    it('calls the search callback when form is submitted', async () => {
        const onSearch = vi.fn();
        render(<SearchBar onSearch={onSearch} />);
        await userEvent.type(screen.getByPlaceholderText('Search compendium...'), 'warrior');
        await userEvent.click(screen.getByRole('button', { name: 'Search' }));
        expect(onSearch).toHaveBeenCalledWith('warrior');
    });

    it('does not call the search callback on empty submission', async () => {
        const onSearch = vi.fn();
        render(<SearchBar onSearch={onSearch} />);
        await userEvent.click(screen.getByRole('button', { name: 'Search' }));
        expect(onSearch).not.toHaveBeenCalled();
    });
});
