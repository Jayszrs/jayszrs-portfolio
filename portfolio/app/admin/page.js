import AdminPageClient from "@/frontend/pages/AdminPageClient";

export const metadata = { title: 'Admin CMS', robots: { index: false, follow: false }, alternates: { canonical: null } };

export default function AdminPage() {
  return <AdminPageClient />;
}
