import { Container } from '@/components/Container';
import { ResourcesPage } from './ResourcesPage';

/** The Get help page, available without an account (safety information is never gated). */
export function PublicHelpPage() {
  return (
    <Container className="py-10 sm:py-14">
      <ResourcesPage />
    </Container>
  );
}

export default PublicHelpPage;
