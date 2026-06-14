import { ServiceForm } from "@/components/lawyer/service-form";

export default function NewServicePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Новая услуга</h1>
      <div className="rounded-2xl border bg-white p-6">
        <ServiceForm />
      </div>
    </div>
  );
}
