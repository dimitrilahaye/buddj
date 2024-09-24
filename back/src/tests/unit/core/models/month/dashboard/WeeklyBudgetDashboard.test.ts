import expect from "../../../../../test-helpers.js";
import WeeklyBudgetDashboard from "../../../../../../core/models/dashboard/WeeklyBudgetDashboard.js";
import WeeklyBudget from "../../../../../../core/models/month/account/WeeklyBudget.js";
import WeeklyExpense from "../../../../../../core/models/month/account/WeeklyExpense.js";

describe('Unit | Core | Models | Dashboard | WeeklyBudgetDashboard', () => {
   describe('#constructor', () => {
      it('should return a weekly budget dashboard with right data when current balance is greater than 0', () => {
         // given
          const props = {
              weekName: 'Semaine 1',
              initialBalance: 200,
              weeklyBudget: new WeeklyBudget({
                  id: 'uuid',
                  initialBalance: 200,
                  name: 'Semaine 1',
                  expenses: [
                      new WeeklyExpense({
                          id: 'uuid',
                          label: 'JOW',
                          date: new Date(),
                          amount: 10,
                          isChecked: true,
                      }),
                      new WeeklyExpense({
                          id: 'uuid',
                          label: 'JOW',
                          date: new Date(),
                          amount: 20,
                          isChecked: false,
                      }),
                      new WeeklyExpense({
                          id: 'uuid',
                          label: 'JOW',
                          date: new Date(),
                          amount: 20,
                          isChecked: true,
                      }),
                      new WeeklyExpense({
                          id: 'uuid',
                          label: 'JOW',
                          date: new Date(),
                          amount: 10,
                          isChecked: false,
                      }),
                  ],
              }),
          };

         // when
          const weekly = new WeeklyBudgetDashboard(props);

         // then
          expect(weekly).to.deep.equal({
              weekName: props.weekName,
              currentBalance: 140,
          });
      });
      it('should return a weekly budget dashboard with right data when current balance is negative', () => {
         // given
          const props = {
              weekName: 'Semaine 1',
              initialBalance: 200,
              weeklyBudget: new WeeklyBudget({
                  id: 'uuid',
                  initialBalance: 200,
                  name: 'Semaine 1',
                  expenses: [
                      new WeeklyExpense({
                          id: 'uuid',
                          label: 'JOW',
                          date: new Date(),
                          amount: 210,
                          isChecked: true,
                      }),
                      new WeeklyExpense({
                          id: 'uuid',
                          label: 'JOW',
                          date: new Date(),
                          amount: 20,
                          isChecked: true,
                      }),
                      new WeeklyExpense({
                          id: 'uuid',
                          label: 'JOW',
                          date: new Date(),
                          amount: 20,
                          isChecked: false,
                      }),
                      new WeeklyExpense({
                          id: 'uuid',
                          label: 'JOW',
                          date: new Date(),
                          amount: 10,
                          isChecked: false,
                      }),
                  ],
              }),
          };

         // when
          const weekly = new WeeklyBudgetDashboard(props);

         // then
          expect(weekly).to.deep.equal({
              weekName: props.weekName,
              currentBalance: -60,
          });
      });
   });
});
