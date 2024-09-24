import Account from "../../../../core/models/month/account/Account.js";
import AccountOutflow from "../../../../core/models/month/account/AccountOutflow.js";
import WeeklyBudget from "../../../../core/models/month/account/WeeklyBudget.js";
import Month from "../../../../core/models/month/Month.js";
import expect, {Clock} from "../../../test-helpers.js";
import monthDto from "../../../../consumers/api/dtos/monthDto.js";
import WeeklyExpense from "../../../../core/models/month/account/WeeklyExpense.js";

describe("Unit | Consumers | Dtos | monthDto", function () {
    const monthDate = new Date('2024-01-01');
    let clock = new Clock();

    afterEach(() => {
        clock.restore();
    });

    it("should give a month DTO with right data", function () {
        // given
        clock.start(monthDate);
        const monthProps = {
            id: 'uuid',
            date: new Date(),
            account: new Account({
                id: 'uuid',
                currentBalance: 2000,
                outflows: [
                    new AccountOutflow({
                        id: 'uuid',
                        label: 'outlfow',
                        amount: 10.05,
                        isChecked: true,
                    }),
                ],
                weeklyBudgets: [
                    new WeeklyBudget({
                        id: 'uuid',
                        name: 'Semaine 1',
                        initialBalance: 200,
                        expenses: [
                            new WeeklyExpense({
                                id: 'uuid',
                                label: 'JOW',
                                amount: 10,
                                date: new Date(),
                                isChecked: true,
                            }),
                            new WeeklyExpense({
                                id: 'uuid',
                                label: 'JOW',
                                amount: 20,
                                date: new Date(),
                                isChecked: false,
                            }),
                        ]
                    }),
                    new WeeklyBudget({
                        id: 'uuid',
                        name: 'Semaine 2',
                        initialBalance: 200,
                    }),
                    new WeeklyBudget({
                        id: 'uuid',
                        name: 'Semaine 3',
                        initialBalance: 200,
                    }),
                    new WeeklyBudget({
                        id: 'uuid',
                        name: 'Semaine 4',
                        initialBalance: 200,
                    }),
                    new WeeklyBudget({
                        id: 'uuid',
                        name: 'Semaine 5',
                        initialBalance: 200,
                    }),
                ],
            }),
        };
        const month = new Month(monthProps);

        const expectedDto = {
            id: "uuid",
            date: new Date('2024-01-01'),
            dashboard: {
                account: {
                    currentBalance: 2000,
                    forecastBalance: 1010
                },
                weeks: {
                    forecastBalance: 970,
                    weeklyBudgets: [
                        {
                            weekName: "Semaine 1",
                            currentBalance: 170,
                        },
                        {
                            weekName: "Semaine 2",
                            currentBalance: 200,
                        },
                        {
                            weekName: "Semaine 3",
                            currentBalance: 200,
                        },
                        {
                            weekName: "Semaine 4",
                            currentBalance: 200,
                        },
                        {
                            weekName: "Semaine 5",
                            currentBalance: 200,
                        }
                    ],
                }
            },
            account: {
                id: "uuid",
                currentBalance: 2000,
                outflows: [
                    {
                        id: "uuid",
                        amount: 10.05,
                        label: "outlfow",
                        isChecked: true
                    }
                ],
                weeklyBudgets: [
                    {
                        id: "uuid",
                        name: "Semaine 1",
                        expenses: [
                            {
                                id: 'uuid',
                                label: 'JOW',
                                amount: 10,
                                isChecked: true,
                            },
                            {
                                id: 'uuid',
                                label: 'JOW',
                                amount: 20,
                                isChecked: false,
                            },
                        ],
                    },
                    {
                        id: "uuid",
                        name: "Semaine 2",
                        expenses: [],
                    },
                    {
                        id: "uuid",
                        name: "Semaine 3",
                        expenses: [],
                    },
                    {
                        id: "uuid",
                        name: "Semaine 4",
                        expenses: [],
                    },
                    {
                        id: "uuid",
                        name: "Semaine 5",
                        expenses: [],
                    }
                ]
            }
        };

        // when
        const dto = monthDto(month);

        // then
        expect(dto).to.deep.equal(expectedDto);
    });
});
