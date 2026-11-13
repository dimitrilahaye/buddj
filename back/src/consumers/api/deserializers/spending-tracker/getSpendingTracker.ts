import { z } from "zod";
import GetSpendingTrackerCommand from "../../../../core/commands/GetSpendingTrackerCommand.js";
import ParisCalendar from "../../../../core/models/spending-tracker/ParisCalendar.js";
import { validSchema } from "../../schemas.js";

const calendarDaySchema = (message: string) =>
  z.string({ message }).refine(ParisCalendar.isCalendarDay, { message });

const getSpendingTrackerSchema = z
  .object({
    granularity: z.enum(["day", "week", "month"], {
      message: "La granularité doit valoir day, week ou month",
    }),
    from: calendarDaySchema("La date de début doit être au format YYYY-MM-DD"),
    to: calendarDaySchema("La date de fin doit être au format YYYY-MM-DD"),
  })
  .refine((query) => query.from <= query.to, {
    message: "La date de début doit précéder la date de fin",
  });

export type GetSpendingTrackerDeserializer = (
  query: any
) => GetSpendingTrackerCommand;

const deserializer: GetSpendingTrackerDeserializer = (query: any) => {
  const data = validSchema(getSpendingTrackerSchema, query);

  return {
    granularity: data.granularity,
    from: data.from,
    to: data.to,
  };
};

export default deserializer;
