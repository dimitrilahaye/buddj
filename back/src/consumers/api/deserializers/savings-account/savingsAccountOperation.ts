import { z } from "zod";
import {
  AddSavingsAccountOperationCommand,
  DeleteSavingsAccountOperationCommand,
  UpdateSavingsAccountOperationCommand,
} from "../../../../core/commands/SavingsAccountCommands.js";
import ParisCalendar from "../../../../core/models/spending-tracker/ParisCalendar.js";
import { validSchema } from "../../schemas.js";

const uuid = (message: string) => z.string({ message }).uuid({ message });

const accountParamsSchema = z.object({
  savingsAccountId: uuid("L'identifiant du compte épargne n'est pas valide"),
});

const operationParamsSchema = accountParamsSchema.extend({
  operationId: uuid("L'identifiant de l'opération n'est pas valide"),
});

const operationBodySchema = z.object({
  type: z.enum(["deposit", "withdrawal"], {
    message: "Le type doit valoir deposit ou withdrawal",
  }),
  amount: z
    .number({ message: "Le montant n'est pas valide" })
    .positive({ message: "Le montant doit être supérieur à zéro" }),
  date: z
    .string({ message: "La date doit être au format YYYY-MM-DD" })
    .refine(ParisCalendar.isCalendarDay, {
      message: "La date doit être au format YYYY-MM-DD",
    }),
  label: z
    .string({ message: "Le libellé n'est pas valide" })
    .nullable()
    .optional(),
});

export type AddSavingsAccountOperationDeserializer = (
  params: any,
  body: any
) => AddSavingsAccountOperationCommand;

export type UpdateSavingsAccountOperationDeserializer = (
  params: any,
  body: any
) => UpdateSavingsAccountOperationCommand;

export type DeleteSavingsAccountOperationDeserializer = (
  params: any
) => DeleteSavingsAccountOperationCommand;

function bodyToCommand(body: any) {
  const data = validSchema(operationBodySchema, body);
  return {
    type: data.type,
    amount: data.amount,
    date: data.date,
    label: data.label ?? null,
  };
}

export const addSavingsAccountOperationDeserializer: AddSavingsAccountOperationDeserializer =
  (params, body) => {
    const { savingsAccountId } = validSchema(accountParamsSchema, params);
    return { savingsAccountId, ...bodyToCommand(body) };
  };

export const updateSavingsAccountOperationDeserializer: UpdateSavingsAccountOperationDeserializer =
  (params, body) => {
    const { savingsAccountId, operationId } = validSchema(
      operationParamsSchema,
      params
    );
    return { savingsAccountId, operationId, ...bodyToCommand(body) };
  };

export const deleteSavingsAccountOperationDeserializer: DeleteSavingsAccountOperationDeserializer =
  (params) => {
    const { savingsAccountId, operationId } = validSchema(
      operationParamsSchema,
      params
    );
    return { savingsAccountId, operationId };
  };
