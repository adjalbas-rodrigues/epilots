import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('frontend smoke', () => {
  it('renders a basic component', () => {
    render(<div data-testid="hello">hello world</div>);
    expect(screen.getByTestId('hello')).toHaveTextContent('hello world');
  });
});
