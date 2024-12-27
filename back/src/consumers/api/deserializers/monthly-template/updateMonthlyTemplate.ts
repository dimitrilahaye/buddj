import { UpdateMonthlyTemplateCommand } from "../../../../core/usecases/monthly-template/UpdateMonthlyTemplate.js";
import Koi from "../../validators/Koi.js";
import SerializationError from "../../errors/DeserializationError.js";

export type UpdateMonthlyTemplateDeserializer = (
  params: any,
  body: any
) => UpdateMonthlyTemplateCommand;

const deserializer: UpdateMonthlyTemplateDeserializer = (
  params: any,
  body: any
) => {
  try {
    Koi.validate(params.id).uuid();
    Koi.validate(body.name).string();
    Koi.validate(body.isDefault).boolean();
  } catch (e: any) {
    throw new SerializationError("updateMonthlyTemplate", e.message);
  }

  return {
    id: params.id,
    name: body.name,
    isDefault: body.isDefault,
  };
};

export default deserializer;
