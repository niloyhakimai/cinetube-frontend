import StaticContentPage from '@/components/shared/StaticContentPage';
import { publicPageContent } from '@/content/site';

export default function AboutPage() {
  return <StaticContentPage {...publicPageContent.about} />;
}
