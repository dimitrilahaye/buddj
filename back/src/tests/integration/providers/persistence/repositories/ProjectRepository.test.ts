import { afterEach } from "mocha";
import { clearDB } from "../../test-helpers.js";
import expect from "../../../../test-helpers.js";
import Refund from "../../../../../core/models/project/Refund.js";
import ProjectName from "../../../../../core/models/project/ProjectName.js";
import ProjectTarget from "../../../../../core/models/project/ProjectTarget.js";
import TransferLogs from "../../../../../core/models/project/TransferLogs.js";
import TransferLog from "../../../../../core/models/project/TransferLog.js";
import ProjectAmount from "../../../../../core/models/project/ProjectAmount.js";
import TypeormProjectRepository from "../../../../../providers/persistence/repositories/ProjectRepository.js";
import { ProjectDao } from "../../../../../providers/persistence/entities/Project.js";
import Saving from "../../../../../core/models/project/Saving.js";

describe("Integration | Providers | Persistence | Repositories | ProjectRepository", function () {
  const repository = new TypeormProjectRepository();

  afterEach(async () => {
    await clearDB();
  });

  describe("#save", () => {
    it("should save the refund", async () => {
      // given
      const refund = new Refund(
        "55f5586c-1add-47cd-b34a-de1ef65e9559",
        new ProjectName("iPhone"),
        new ProjectTarget(250),
        new TransferLogs([new TransferLog(new ProjectAmount(10), new Date())])
      );

      // when
      await repository.save(refund);

      // then
      const persistedRefund = (
        await ProjectDao.findOneByOrFail({
          id: refund.id,
        })
      ).toDomain();
      expect(persistedRefund).to.deep.equal(refund);
    });

    it("should save the saving", async () => {
      // given
      const saving = new Saving(
        "55f5586c-1add-47cd-b34a-de1ef65e9559",
        new ProjectName("iPhone"),
        new ProjectTarget(250),
        new TransferLogs([new TransferLog(new ProjectAmount(10), new Date())])
      );

      // when
      await repository.save(saving);

      // then
      const persistedSaving = (
        await ProjectDao.findOneByOrFail({
          id: saving.id,
        })
      ).toDomain();
      expect(persistedSaving).to.deep.equal(saving);
    });
  });

  describe("#getById", () => {
    it("should return the right project", async () => {
      // given
      const saving = new Saving(
        "55f5586c-1add-47cd-b34a-de1ef65e9559",
        new ProjectName("iPhone"),
        new ProjectTarget(250),
        new TransferLogs([new TransferLog(new ProjectAmount(10), new Date())])
      );
      await repository.save(saving);

      // when
      const foundSaving = await repository.getById(saving.id);

      // then
      expect(foundSaving).to.deep.equal(saving);
    });

    it("should return null if project does not exist", async () => {
      // when
      const foundSaving = await repository.getById(
        "de25f45b-2126-4aba-874f-450d7dbdd58e"
      );

      // then
      expect(foundSaving).to.be.null;
    });
  });

  describe("#getAllByCategory", () => {
    it("should find all refunds", async () => {
      // given
      const refund = new Refund(
        "e03c7721-53af-4e13-ad78-9ae606cb0ef2",
        new ProjectName("iPhone"),
        new ProjectTarget(250),
        new TransferLogs([new TransferLog(new ProjectAmount(10), new Date())])
      );
      const saving = new Saving(
        "55f5586c-1add-47cd-b34a-de1ef65e9559",
        new ProjectName("iPhone"),
        new ProjectTarget(250),
        new TransferLogs([new TransferLog(new ProjectAmount(10), new Date())])
      );
      await repository.save(refund);
      await repository.save(saving);

      // when
      const [foundRefund] = await repository.getAllByCategory("refund");

      // then
      expect(foundRefund).to.deep.equal(refund);
    });

    it("should find all savings", async () => {
      // given
      const refund = new Refund(
        "e03c7721-53af-4e13-ad78-9ae606cb0ef2",
        new ProjectName("iPhone"),
        new ProjectTarget(250),
        new TransferLogs([new TransferLog(new ProjectAmount(10), new Date())])
      );
      const saving = new Saving(
        "55f5586c-1add-47cd-b34a-de1ef65e9559",
        new ProjectName("iPhone"),
        new ProjectTarget(250),
        new TransferLogs([new TransferLog(new ProjectAmount(10), new Date())])
      );
      await repository.save(refund);
      await repository.save(saving);

      // when
      const [foundSaving] = await repository.getAllByCategory("saving");

      // then
      expect(foundSaving).to.deep.equal(saving);
    });
  });

  describe("#update", () => {
    it("should update the name", async () => {
      // given
      const saving = new Saving(
        "55f5586c-1add-47cd-b34a-de1ef65e9559",
        new ProjectName("iPhone"),
        new ProjectTarget(250),
        new TransferLogs([new TransferLog(new ProjectAmount(10), new Date())])
      );
      await repository.save(saving);

      saving.updateName(new ProjectName("iPhone 12"));

      // when
      await repository.update(saving);

      // then
      const updatedSaving = await repository.getById(saving.id);
      expect(updatedSaving?.name.value).to.equal("iPhone 12");
    });

    it("should update the target", async () => {
      // given
      const saving = new Saving(
        "55f5586c-1add-47cd-b34a-de1ef65e9559",
        new ProjectName("iPhone"),
        new ProjectTarget(250),
        new TransferLogs([new TransferLog(new ProjectAmount(10), new Date())])
      );
      await repository.save(saving);

      saving.updateTarget(new ProjectTarget(225));

      // when
      await repository.update(saving);

      // then
      const updatedSaving = await repository.getById(saving.id);
      expect(updatedSaving?.target.value).to.equal(225);
    });
  });

  describe("#remove", () => {
    it("should remove the project", async () => {
      // given
      const saving = new Saving(
        "55f5586c-1add-47cd-b34a-de1ef65e9559",
        new ProjectName("iPhone"),
        new ProjectTarget(250),
        new TransferLogs([new TransferLog(new ProjectAmount(10), new Date())])
      );
      await repository.save(saving);

      // when
      await repository.remove(saving.id);

      // then
      const updatedSaving = await repository.getById(saving.id);
      expect(updatedSaving).to.be.null;
    });
  });
});
