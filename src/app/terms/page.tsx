import StaticContentPage from '@/components/shared/StaticContentPage';
import { publicPageContent } from '@/content/site';

export default function TermsPage() {
  return <StaticContentPage {...publicPageContent.terms} />;
}
