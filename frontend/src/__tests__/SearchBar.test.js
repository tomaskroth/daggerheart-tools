import { describe, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import SearchBar from '../components/SearchBar';

// Scenarios: PBI-006-frontend-test-infrastructure.feature — SearchBar @regression stubs
// TODO PBI-005: replace stubs with real assertions when SearchBar contract is finalised
describe('SearchBar', () => {
    it('calls the search callback when form is submitted', () => {
        // stub — SearchBar final contract established in PBI-005
    });

    it('does not call the search callback on empty submission', () => {
        // stub — empty-submit guard will be added in PBI-005
    });
});
