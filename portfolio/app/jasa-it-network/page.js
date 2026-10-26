import { readContent } from '@/backend/lib/content';
import ServicePage from '@/frontend/components/ServicePage';
import { services } from '@/frontend/lib/services';
import { pageMetadata } from '@/frontend/lib/site-metadata';

const service = services.find(item => item.slug === 'jasa-it-network');
export const revalidate = 3600;
export const metadata = pageMetadata(`/${service.slug}`, service);

export default async function ItServices() {
  return <ServicePage content={await readContent()} service={service} />;
}
