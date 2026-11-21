import { z } from "zod";
import { GetSavingsAccountTrackerCommand } from "../../../../core/commands/SavingsAccountCommands.js";
import ParisCalendar from "../../../../core/models/spending-tracker/ParisCalendar.js";
import { validSchema } from "../../schemas.js";

const calendarDaySchema = (message: string) =>
  z.string({ message }).refine(ParisCalendar.isCalendarDay, { message });

const getSavingsAccountTrackerSchema = z
  .object({
    savingsAccountId: z
      .string()
      .uuid({ message: "L'identifiant du compte épargne n'est pas valide" }),
    granularity: z.enum(["day", "week", "month"], {
      message: "La granularité doit valoir day, week ou month",
    }),
    from: calendarDaySchema("La date de début doit être au format YYYY-MM-DD"),
    to: calendarDaySchema("La date de fin doit être au format YYYY-MM-DD"),
  })
  .refine((query) => query.from <= query.to, {
    message: "La date de début doit précéder la date de fin",
  });

export type GetSavingsAccountTrackerDeserializer = (
  params: any,
  query: any
) => GetSavingsAccountTrackerCommand;

const deserializer: GetSavingsAccountTrackerDeserializer = (params, query) => {
  const data = validSchema(getSavingsAccountTrackerSchema, {
    ...query,
    savingsAccountId: params?.savingsAccountId,
  });

  return {
    savingsAccountId: data.savingsAccountId,
    granularity: data.granularity,
    from: data.from,
    to: data.to,
  };
};

export default deserializer;
