import PageHeader from "@/components/PageHeader";
import { ActivityRow, Empty } from "@/components/Rows";
import { useGet } from "@/lib/queries";

export default function Activity() {
  const { data = [], isPending } = useGet("/activity?limit=100");
  return (
    <div>
      <PageHeader title="Activity" back />
      <div className="space-y-2 px-5">
        {data.map((a) => <ActivityRow key={a.id} item={a} />)}
        {!isPending && !data.length && <Empty>Nothing yet.</Empty>}
      </div>
    </div>
  );
}
