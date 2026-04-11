import StaticContentPage from '@/components/shared/StaticContentPage';
import { publicPageContent } from '@/content/site';

export default function FaqPage() {
  return <StaticContentPage {...publicPageContent.faq} />;
}
