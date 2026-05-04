import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

// next/link mock — render plain anchor in tests
vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: any) => {
    return (
      <a href={typeof href === 'string' ? href : '#'} {...rest}>
        {children}
      </a>
    );
  }
}));

// next/navigation mock
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn()
  }),
  useParams: () => ({}),
  usePathname: () => '/'
}));
