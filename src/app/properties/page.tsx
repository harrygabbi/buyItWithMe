import { PropertiesWorkspace } from "@/components/dashboard/properties-workspace";
import { requirePageUser } from "@/lib/server/auth";
export default async function PropertiesPage() {
  await requirePageUser();
  return <PropertiesWorkspace />;
}
