import Component from "./Component.js";
import htmlFactory from "../utils/htmlFactory";
import WeekBlock from "./WeekBlock";

export default class DiffDashboard extends Component {
    /**
     *
     * @param {*} weeks
     */
    constructor(weeks) {
        super();

        this.$element = htmlFactory(`<div class="week-dashboard columns is-multiline is-mobile"></div>`);

        // remaining month
        const label = 'État du budget hebdo à la fin du mois :'
        let result, color = 'is-outlined ';
        const forecastBalance = weeks.forecastBalance.toFixed(2);
        if (forecastBalance > 0) {
            color += 'is-success';
            result = `+${forecastBalance}`;
        }
        if (forecastBalance < 0) {
            color += 'is-danger';
            result = `${forecastBalance}`;
        }
        if (forecastBalance === 0) {
            color += 'is-link';
            result = forecastBalance;
        }
        this.$element.insertAdjacentElement('afterbegin', new WeekBlock({
            week: label,
            remaining: result,
            color,
        }).$element);
    }
}
