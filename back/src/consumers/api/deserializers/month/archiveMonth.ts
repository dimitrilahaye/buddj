import ArchiveMonthCommand from "../../../../core/commands/ArchiveMonthCommand.js";
import Koi from "../../validators/Koi.js";
import SerializationError from "../../errors/DeserializationError.js";

export type ArchiveMonthDeserializer = (params: any) => ArchiveMonthCommand;

const deserializer: ArchiveMonthDeserializer = (params: any) => {
  try {
    Koi.validate(params.monthId).uuid();
  } catch (e: any) {
    throw new SerializationError("archiveMonth", e.message);
  }

  return {
    monthId: params.monthId,
  };
};

export default deserializer;
