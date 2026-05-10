import { ImportForm } from "@/components/admin/import-form";

export default function ImportPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Importar via JSON</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Cole o JSON do cliente para cadastrá-lo automaticamente.
        </p>
      </div>
      <ImportForm />
    </div>
  );
}
