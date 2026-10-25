import { PropertyEditor } from "@/components/editor/property-editor";
import { requirePageUser } from "@/lib/server/auth";
export default async function EditProperty({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePageUser();
  return <PropertyEditor id={(await params).id} />;
}
