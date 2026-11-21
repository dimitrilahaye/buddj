import { EntityManager } from "typeorm";
import SavingsAccount from "../../../core/models/savings-account/SavingsAccount.js";
import SavingsAccountOperation from "../../../core/models/savings-account/SavingsAccountOperation.js";
import SavingsAccountRepository from "../../../core/ports/repositories/SavingsAccountRepository.js";
import { SavingsAccountDao } from "../entities/SavingsAccount.js";
import { SavingsAccountOperationDao } from "../entities/SavingsAccountOperation.js";

const OPERATIONS_ORDER = { date: "DESC", createdAt: "DESC" } as const;

/** Recalcule le solde du compte à partir de toutes ses opérations */
async function recomputeAmount(
  manager: EntityManager,
  savingsAccountId: string
): Promise<void> {
  await manager.query(
    `UPDATE "savings_accounts"
     SET "amount" = COALESCE((
       SELECT SUM(CASE WHEN "type" = 'deposit' THEN "amount" ELSE -"amount" END)
       FROM "savings_account_operations"
       WHERE "savings_account_id" = $1
     ), 0)
     WHERE "id" = $1`,
    [savingsAccountId]
  );
}

export default class TypeormSavingsAccountRepository
  implements SavingsAccountRepository
{
  async findAll(): Promise<SavingsAccount[]> {
    const [accounts, operations] = await Promise.all([
      SavingsAccountDao.find({ order: { name: "ASC" } }),
      SavingsAccountOperationDao.find({ order: OPERATIONS_ORDER }),
    ]);
    return accounts.map((account) =>
      account.toDomain(
        operations
          .filter((operation) => operation.savingsAccountId === account.id)
          .map((operation) => operation.toDomain())
      )
    );
  }

  async findById(savingsAccountId: string): Promise<SavingsAccount | null> {
    const account = await SavingsAccountDao.findOneBy({ id: savingsAccountId });
    if (!account) {
      return null;
    }
    const operations = await SavingsAccountOperationDao.find({
      where: { savingsAccountId },
      order: OPERATIONS_ORDER,
    });
    return account.toDomain(operations.map((operation) => operation.toDomain()));
  }

  async saveOperation(operation: SavingsAccountOperation): Promise<void> {
    await SavingsAccountOperationDao.getRepository().manager.transaction(
      async (manager) => {
        await manager.save(SavingsAccountOperationDao.fromDomain(operation));
        await recomputeAmount(manager, operation.savingsAccountId);
      }
    );
  }

  async deleteOperation(
    savingsAccountId: string,
    operationId: string
  ): Promise<void> {
    await SavingsAccountOperationDao.getRepository().manager.transaction(
      async (manager) => {
        await manager.delete(SavingsAccountOperationDao, {
          id: operationId,
          savingsAccountId,
        });
        await recomputeAmount(manager, savingsAccountId);
      }
    );
  }
}
