import StaticContentPage from '@/components/shared/StaticContentPage';
import { publicPageContent } from '@/content/site';

export default function BlogPage() {
  return <StaticContentPage {...publicPageContent.blog} />;
}
