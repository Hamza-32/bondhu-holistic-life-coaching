import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { LanguageToggle } from '@/components/LanguageToggle';
import { renderWithRouter } from '@/test/render';
import { NotFoundPage } from './NotFoundPage';

function PageWithToggle() {
  return (
    <>
      <LanguageToggle />
      <NotFoundPage />
    </>
  );
}

describe('NotFoundPage', () => {
  it('renders a heading and links back into the app', () => {
    renderWithRouter(<NotFoundPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Go to dashboard' })).toHaveAttribute('href', '/app');
  });

  it('switches to Bangla with the language toggle and updates <html lang>', async () => {
    const user = userEvent.setup();
    renderWithRouter(<PageWithToggle />);

    await user.click(screen.getByRole('button', { name: /change language/i }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'পাতাটি খুঁজে পাওয়া যায়নি' }),
    ).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('bn');
    expect(localStorage.getItem('bondhu-lang')).toBe('bn');
  });
});
