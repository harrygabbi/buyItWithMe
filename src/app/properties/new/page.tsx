import { PropertyEditor } from "@/components/editor/property-editor";
import { requirePageUser } from "@/lib/server/auth";
export default async function NewProperty() {
  await requirePageUser();
  return <PropertyEditor />;
}
