import { z, ZodSchema } from "zod";
import RequestValidationError from "./errors/DeserializationError.js";
import _ from "lodash";

function validSchema<T extends ZodSchema>(
  schema: T,
  data: unknown
): z.infer<T> {
  const parsedData = schema.safeParse(data);
  if (!parsedData.success) {
    const [firstError] = parsedData.error.errors;
    throw new RequestValidationError("", firstError.message);
  }

  return parsedData.data;
}

const uuidSchema = (message?: string) =>
  z.string().uuid({ message: message ?? "L'UUID n'est pas valide" });
const _dateSchema = (message: string) =>
  z
    .string()
    .refine(
      (val) =>
        _.isDate(new Date(val)) && new Date(val).toString() !== "Invalid Date",
      { message }
    );

const dateSchema = (message?: string) =>
  _dateSchema(message).transform((val) => new Date(val));

const projectCategorySchema = z
  .string()
  .regex(/^[a-z]+$/, "La catégorie n'est pas valide");

const updateProjectSchema = z.object({
  name: z.string({ message: "Le nom n'est pas valide" }).optional(),
  target: z.number({ message: "L'objectif n'est pas valide" }).optional(),
});

const addProjectSchema = z.object({
  name: z.string({ message: "Le nom n'est pas valide" }),
  target: z.number({ message: "L'objectif' n'est pas valide" }),
  category: projectCategorySchema,
});

const addAmountProjectSchema = z.object({
  amount: z.number({ message: "Le montant n'est pas valide" }),
});

const outflowCreationSchema = z.object({
  label: z.string({ message: "Le label est obligatoire" }),
  amount: z.number({ message: "Le montant est obligatoire" }),
  pendingFrom: dateSchema().optional().nullable(),
});

const expenseCreationSchema = z.object({
  label: z.string({ message: "Le label est obligatoire" }),
  amount: z.number({ message: "Le montant est obligatoire" }),
  date: dateSchema("La date est obligatoire"),
});

const budgetCreationSchema = z.object({
  name: z.string({ message: "Le nom est obligatoire" }),
  pendingFrom: dateSchema().optional().nullable(),
  initialBalance: z.number({
    message: "Le solde initial est obligatoire",
  }),
  expenses: z.array(expenseCreationSchema).default([]).optional(),
});

const monthCreationSchema = z.object({
  month: dateSchema("La date est obligatoire"),
  startingBalance: z.number({
    message: "Le solde initial est obligatoire",
  }),
  outflows: z.array(outflowCreationSchema).default([]),
  weeklyBudgets: z.array(budgetCreationSchema).default([]),
});

export {
  validSchema,
  monthCreationSchema,
  uuidSchema,
  updateProjectSchema,
  addProjectSchema,
  addAmountProjectSchema,
  projectCategorySchema,
};
