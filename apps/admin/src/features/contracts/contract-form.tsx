import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateContract } from "./hooks";

const contractSchema = z
  .object({
    employee_id: z.coerce.number().min(1, "Employee is required"),
    name: z.string().min(1, "Contract name is required"),
    date_start: z.string().min(1, "Start date is required"),
    date_end: z.string().optional(),
    salary_leva: z.coerce.number().positive("Salary must be greater than 0"),
    department_id: z.coerce.number().optional(),
    structure_type_id: z.coerce.number().optional(),
  })
  .refine(
    (d) => {
      if (!d.date_end) return true;
      return new Date(d.date_end) > new Date(d.date_start);
    },
    { message: "End date must be after start date", path: ["date_end"] },
  );

type ContractFormValues = z.infer<typeof contractSchema>;

interface ContractFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ContractForm({ onSuccess, onCancel }: ContractFormProps) {
  const createContract = useCreateContract();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
  });

  const onSubmit = async (values: ContractFormValues) => {
    await createContract.mutateAsync({
      employee_id: values.employee_id,
      name: values.name,
      date_start: values.date_start,
      date_end: values.date_end,
      wage: Math.round(values.salary_leva * 100),
      department_id: values.department_id,
      structure_type_id: values.structure_type_id,
    });
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Employee ID
        </label>
        <input
          type="number"
          {...register("employee_id")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.employee_id && (
          <p className="mt-1 text-sm text-red-600">
            {errors.employee_id.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Contract Name
        </label>
        <input
          type="text"
          {...register("name")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            {...register("date_start")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {errors.date_start && (
            <p className="mt-1 text-sm text-red-600">
              {errors.date_start.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            {...register("date_end")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {errors.date_end && (
            <p className="mt-1 text-sm text-red-600">
              {errors.date_end.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Salary (leva)
        </label>
        <input
          type="number"
          step="0.01"
          {...register("salary_leva")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.salary_leva && (
          <p className="mt-1 text-sm text-red-600">
            {errors.salary_leva.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Department ID
          </label>
          <input
            type="number"
            {...register("department_id")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Structure Type ID
          </label>
          <input
            type="number"
            {...register("structure_type_id")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Creating..." : "Create Contract"}
        </button>
      </div>

      {createContract.error && (
        <p className="text-sm text-red-600">{createContract.error.message}</p>
      )}
    </form>
  );
}
