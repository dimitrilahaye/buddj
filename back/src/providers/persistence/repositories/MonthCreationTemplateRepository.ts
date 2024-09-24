import WeeklyBudgetTemplate from "../../../core/models/template/WeeklyBudgetTemplate.js";
import OutflowTemplate from "../../../core/models/template/OutflowTemplate.js";
import MonthCreationTemplate from "../../../core/models/template/MonthCreationTemplate.js";
import MonthCreationTemplateRepositoryInterface from '../../../core/ports/repositories/MonthCreationTemplateRepository.js'

export default class MonthCreationTemplateRepository implements MonthCreationTemplateRepositoryInterface {
    async getNewMonthTemplate() {
        const props = {
            weeklyBudgets: [
                new WeeklyBudgetTemplate({name: 'Semaine 1'}),
                new WeeklyBudgetTemplate({name: 'Semaine 2'}),
                new WeeklyBudgetTemplate({name: 'Semaine 3'}),
                new WeeklyBudgetTemplate({name: 'Semaine 4'}),
                new WeeklyBudgetTemplate({name: 'Semaine 5'}),
            ],
            outflows: [
                new OutflowTemplate({label: 'Loyer', amount: 699.41}),
                new OutflowTemplate({label: 'Bouygues', amount: 70.89}),
                new OutflowTemplate({label: 'EDF', amount: 114.62}),
                new OutflowTemplate({label: 'MACIF', amount: 92.06}),
                new OutflowTemplate({label: 'Mutuelle', amount: 63.11}),
                new OutflowTemplate({label: 'TAN', amount: 45.00}),
                new OutflowTemplate({label: 'Sandy mutuelle/telephone', amount: 27.50}),
                new OutflowTemplate({label: 'Argent de poche', amount: 20.00}),
                new OutflowTemplate({label: 'Liam', amount: 25.00}),
                new OutflowTemplate({label: 'JV Mag', amount: 5.89}),
                new OutflowTemplate({label: 'Podcloud', amount: 6.00}),
                new OutflowTemplate({label: 'PlanetHoster + BitD', amount: 18.00}),
                new OutflowTemplate({label: 'Disney+', amount: 11.99}),
                new OutflowTemplate({label: 'Netflix', amount: 13.49}),
                new OutflowTemplate({label: 'Prime', amount: 6.99}),
                new OutflowTemplate({label: 'Deezer', amount: 11.99}),
                new OutflowTemplate({label: 'Croix rouge', amount: 5.00}),
                new OutflowTemplate({label: 'Essence', amount: 80.00}),
                new OutflowTemplate({label: 'Adobe', amount: 26.21}),
                new OutflowTemplate({label: 'Projet mensuels', amount: 210.00}),
                new OutflowTemplate({label: 'Psy 1', amount: 60.00}),
                new OutflowTemplate({label: 'Psy 2', amount: 60.00}),
                new OutflowTemplate({label: 'Cours maths 1', amount: 36.00}),
                new OutflowTemplate({label: 'Cours maths 2', amount: 36.00}),
                new OutflowTemplate({label: 'A/R Paris', amount: 210.00}),
            ],
        };

        // when
        return new MonthCreationTemplate(props);
    }
}
