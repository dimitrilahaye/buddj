import typeormConfig from "../../../providers/persistence/typeormConfig.js";

async function clearDB() {
    const entities = typeormConfig.entityMetadatas;
    for (const entity of entities) {
        const repository = typeormConfig.getRepository(entity.name);
        await repository.query(`TRUNCATE ${entity.tableName} RESTART IDENTITY CASCADE;`);
    }
}

export { clearDB };
