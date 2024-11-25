/* eslint-disable @typescript-eslint/consistent-type-definitions */
export type YearlyOutflow = {
  id: string;
  month: number;
  label: string;
  amount: number;
};

export type YearlyOutflows = Record<number, YearlyOutflow[]>;
