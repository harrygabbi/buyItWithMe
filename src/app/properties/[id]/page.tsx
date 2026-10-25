import { PropertyView } from "@/components/editor/property-view";
import { requirePageUser } from "@/lib/server/auth";
export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePageUser();
  return <PropertyView id={(await params).id} />;
}
