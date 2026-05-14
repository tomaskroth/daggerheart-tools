import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ItemList from '../components/ItemList';
import { SrdItem } from '../types';

// Scenarios: PBI-006-frontend-test-infrastructure.feature — ItemList @regression
const mockItem = (id: string): SrdItem => ({
    id,
    slug: `item-${id}`,
    title: `Item ${id}`,
    type: 'armor',
    content: '<p>Content</p>',
});

describe('ItemList', () => {
    it('renders a card for each item in the list', () => {
        const items = [mockItem('1'), mockItem('2'), mockItem('3')];
        render(<ItemList items={items} onItemClick={() => {}} />);
        expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
    });

    it('renders nothing when given an empty list', () => {
        const { container } = render(<ItemList items={[]} onItemClick={() => {}} />);
        expect(container.querySelector('.item-card')).toBeNull();
    });
});
