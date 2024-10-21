import Koi, {
  ValidatorError,
} from "../../../../consumers/api/validators/Koi.js";
import expect from "../../../test-helpers.js";

describe("Unit | Consumers | Validators | Koi", () => {
  describe("When validation is OK", () => {
    const testCases = [
      {
        when: "when we test an uuid",
        test: () => Koi.validate("9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d").uuid(),
      },
      {
        when: "when we test a date",
        test: () => Koi.validate(new Date()).date(),
      },
      {
        when: "when we test a boolean",
        test: () => Koi.validate(true).boolean(),
      },
      {
        when: "when we test a number",
        test: () => Koi.validate(123).number(),
      },
      {
        when: "when we test a string",
        test: () => Koi.validate("hello").string(),
      },
      {
        when: "when we test an array",
        test: () => Koi.validate([]).array(),
      },
      {
        when: "when we test an empty array",
        test: () => Koi.validate([]).array().empty(),
      },
      {
        when: "when we test a not empty array",
        test: () => Koi.validate([123]).array().notEmpty(),
      },
      {
        when: "when we test an object",
        test: () => Koi.validate({}).object(),
      },
      {
        when: "when we test an empty object",
        test: () => Koi.validate({}).object().empty(),
      },
      {
        when: "when we test a not empty object",
        test: () => Koi.validate({ hello: "world" }).object().notEmpty(),
      },
      {
        when: "when we test a null value",
        test: () => Koi.validate(null).nil(),
      },
      {
        when: "when we test an undefined value",
        test: () => Koi.validate(undefined).nil(),
      },
      {
        when: "when we test a not nil value",
        test: () => Koi.validate("whatever").notNil(),
      },
      {
        when: "when we test a list",
        test: () => Koi.validate("whenever").oneOf("wherever", "whenever"),
      },
    ];
    testCases.forEach((testCase) => {
      it(`should not throw error ${testCase.when}`, () => {
        expect(() => testCase.test()).not.throw(Error);
      });
    });
  });
  describe("When validation is KO", () => {
    const testCases = [
      {
        when: "when we test an uuid",
        test: () => Koi.validate("not an uuid").uuid(),
        message: "ValidatorError: [not an uuid] is not an uuid",
      },
      {
        when: "when we test a number",
        test: () => Koi.validate("not a number").number(),
        message: "ValidatorError: [not a number] is not a number",
      },
      {
        when: "when we test a boolean",
        test: () => Koi.validate("not a boolean").boolean(),
        message: "ValidatorError: [not a boolean] is not a boolean",
      },
      {
        when: "when we test a date",
        test: () => Koi.validate("not a date").date(),
        message: "ValidatorError: [not a date] is not a date",
      },
      {
        when: "when we test a string",
        test: () => Koi.validate(123).string(),
        message: "ValidatorError: [123] is not a string",
      },
      {
        when: "when we test an array",
        test: () => Koi.validate("not an array").array(),
        message: "ValidatorError: [not an array] is not an array",
      },
      {
        when: "when we test an empty array",
        test: () => Koi.validate(["i am not empty"]).array().empty(),
        message: "ValidatorError: [i am not empty] is not empty",
      },
      {
        when: "when we test a not empty array",
        test: () => Koi.validate([]).array().notEmpty(),
        message: "ValidatorError: [] is empty",
      },
      {
        when: "when we test an object",
        test: () => Koi.validate("not an object").object(),
        message: "ValidatorError: [not an object] is not an object",
      },
      {
        when: "when we test an empty object",
        test: () => Koi.validate({ hello: "world" }).object().empty(),
        message: "ValidatorError: [[object Object]] is not empty",
      },
      {
        when: "when we test a not empty object",
        test: () => Koi.validate({}).object().notEmpty(),
        message: "ValidatorError: [[object Object]] is empty",
      },
      {
        when: "when we test a null value",
        test: () => Koi.validate("not null").nil(),
        message: "ValidatorError: [not null] is not null nor undefined",
      },
      {
        when: "when we test an undefined value",
        test: () => Koi.validate("not undefined").nil(),
        message: "ValidatorError: [not undefined] is not null nor undefined",
      },
      {
        when: "when we test a not nil value which is null",
        test: () => Koi.validate(null).notNil(),
        message: "ValidatorError: [null] is null or undefined",
      },
      {
        when: "when we test a not nil value which is undefined",
        test: () => Koi.validate(undefined).notNil(),
        message: "ValidatorError: [undefined] is null or undefined",
      },
      {
        when: "when we test a value which is not in the list",
        test: () => Koi.validate("nope").oneOf<string>("wherever", "whenever"),
        message:
          "ValidatorError: [nope] is not contain in list [wherever, whenever]",
      },
    ];
    testCases.forEach((testCase) => {
      it(`should throw a ValidatorError ${testCase.when}`, () => {
        try {
          testCase.test();
          expect.fail("it should have throw an error");
        } catch (e: any) {
          expect(e).to.be.instanceof(ValidatorError);
          expect(e.message).to.be.equal(testCase.message);
        }
      });
    });
  });
});
