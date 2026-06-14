import { SlotManager } from "@/components/lawyer/slot-manager";

export default function LawyerSlotsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Расписание</h1>
      <SlotManager />
    </div>
  );
}
