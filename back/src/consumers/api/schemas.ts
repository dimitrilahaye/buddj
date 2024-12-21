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

const _dateSchema = (message: string) =>
  z
    .string()
    .refine(
      (val) =>
        _.isDate(new Date(val)) && new Date(val).toString() !== "Invalid Date",
      { message }
    );

const dateSchema = (message: string) =>
  _dateSchema(message).transform((val) => new Date(val));

const outflowCreationSchema = z.object({
  label: z.string({ message: "Outflow: Le label est obligatoire" }),
  amount: z.number({ message: "Outflow: Le montant est obligatoire" }),
});

const expenseCreationSchema = z.object({
  label: z.string({ message: "Expense: Le label est obligatoire" }),
  amount: z.number({ message: "Expense: Le montant est obligatoire" }),
  date: dateSchema("Expense: La date est obligatoire"),
});

const budgetCreationSchema = z.object({
  name: z.string({ message: "Budget: Le nom est obligatoire" }),
  initialBalance: z.number({
    message: "Budget: Le solde initial est obligatoire",
  }),
  expenses: z.array(expenseCreationSchema).default([]).optional(),
});

const monthCreationSchema = z.object({
  month: dateSchema("Month: La date est obligatoire"),
  startingBalance: z.number({
    message: "Month: Le solde initial est obligatoire",
  }),
  outflows: z.array(outflowCreationSchema).default([]),
  weeklyBudgets: z.array(budgetCreationSchema).default([]),
});

export { validSchema, monthCreationSchema };
