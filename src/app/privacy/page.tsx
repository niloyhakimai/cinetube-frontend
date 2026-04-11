import StaticContentPage from '@/components/shared/StaticContentPage';
import { publicPageContent } from '@/content/site';

export default function PrivacyPage() {
  return <StaticContentPage {...publicPageContent.privacy} />;
}
