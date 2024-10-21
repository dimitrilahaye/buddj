import _ from "lodash";
import * as uuid from "uuid";

export class ValidatorError extends Error {
  constructor(message: string) {
    super("ValidatorError: " + message);
    this.name = "ValidatorError";
  }
}

class Validator {
  private readonly value: any;

  constructor(value: any) {
    this.value = value;
  }

  date() {
    if (
      !(
        _.isDate(new Date(this.value)) &&
        new Date(this.value).toString() !== "Invalid Date"
      )
    ) {
      throw new ValidatorError(`[${this.value}] is not a date`);
    }
    return this;
  }

  number() {
    if (!_.isNumber(this.value)) {
      throw new ValidatorError(`[${this.value}] is not a number`);
    }
    return this;
  }

  boolean() {
    if (!_.isBoolean(this.value)) {
      throw new ValidatorError(`[${this.value}] is not a boolean`);
    }
    return this;
  }

  array() {
    if (!_.isArray(this.value)) {
      throw new ValidatorError(`[${this.value}] is not an array`);
    }
    return this;
  }

  string() {
    if (!_.isString(this.value)) {
      throw new ValidatorError(`[${this.value}] is not a string`);
    }
    return this;
  }

  uuid() {
    if (!uuid.validate(this.value)) {
      throw new ValidatorError(`[${this.value}] is not an uuid`);
    }
    return this;
  }

  nil() {
    if (!_.isNil(this.value)) {
      throw new ValidatorError(`[${this.value}] is not null nor undefined`);
    }
    return this;
  }

  notNil() {
    if (_.isNil(this.value)) {
      throw new ValidatorError(`[${this.value}] is null or undefined`);
    }
    return this;
  }

  empty() {
    if (!_.isEmpty(this.value)) {
      throw new ValidatorError(`[${this.value}] is not empty`);
    }
    return this;
  }

  notEmpty() {
    if (_.isEmpty(this.value)) {
      throw new ValidatorError(`[${this.value}] is empty`);
    }
    return this;
  }

  object() {
    if (!_.isObject(this.value)) {
      throw new ValidatorError(`[${this.value}] is not an object`);
    }
    return this;
  }

  oneOf<T>(...values: T[]) {
    if (values.includes(this.value) === false) {
      throw new ValidatorError(
        `[${this.value}] is not contain in list [${values.join(", ")}]`
      );
    }
    return this;
  }
}

export default class Koi {
  static validate(value: any) {
    return new Validator(value);
  }
}
