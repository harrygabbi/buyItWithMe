import { Dashboard } from "@/components/dashboard/dashboard";
import { requirePageUser } from "@/lib/server/auth";
export default async function DashboardPage() {
  await requirePageUser();
  return <Dashboard />;
}
