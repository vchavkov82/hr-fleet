import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useOrgSettings, useUpdateOrgSettings } from "./hooks";

const orgSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  address: z.string().min(1, "Address is required"),
  tax_id: z.string().min(1, "Tax ID is required"),
  currency: z.string().min(3).max(3, "Currency must be a 3-letter code"),
  timezone: z.string().min(1, "Timezone is required"),
});

type OrgFormValues = z.infer<typeof orgSchema>;

const CURRENCIES = ["BGN", "EUR", "USD", "GBP"] as const;
const TIMEZONES = [
  "Europe/Sofia",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "UTC",
] as const;

export function OrgConfig() {
  const { data: settings, isLoading } = useOrgSettings();
  const updateMutation = useUpdateOrgSettings();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<OrgFormValues>({
    resolver: zodResolver(orgSchema as any),
    values: settings ?? {
      name: "",
      address: "",
      tax_id: "",
      currency: "BGN",
      timezone: "Europe/Sofia",
    },
  });

  const onSubmit = (values: OrgFormValues) => {
    updateMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 rounded bg-gray-200" />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Organization Name
        </label>
        <input
          {...register("name")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Address</label>
        <textarea
          {...register("address")}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.address && (
          <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tax ID</label>
        <input
          {...register("tax_id")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.tax_id && (
          <p className="mt-1 text-xs text-red-600">{errors.tax_id.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Currency</label>
          <select
            {...register("currency")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Timezone</label>
          <select
            {...register("timezone")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={!isDirty || updateMutation.isPending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {updateMutation.isPending ? "Saving..." : "Save Changes"}
      </button>

      {updateMutation.isSuccess && (
        <p className="text-sm text-green-600">Settings saved successfully.</p>
      )}
      {updateMutation.isError && (
        <p className="text-sm text-red-600">Failed to save settings.</p>
      )}
    </form>
  );
}
