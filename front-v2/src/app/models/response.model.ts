/* eslint-disable @typescript-eslint/consistent-type-definitions */
export type Response<T> = {
  success: boolean;
  data: T;
};
