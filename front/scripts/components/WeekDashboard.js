import Component from "./Component.js";
import htmlFactory from "../utils/htmlFactory";
import WeekBlock from "./WeekBlock";

export default class WeekDashboard extends Component {
    /**
     *
     * @param {WeekBlockProps[]} weekBlockProps
     */
    constructor(weekBlockProps) {
        super();

        this.$element = htmlFactory(`<div class="week-dashboard columns is-multiline is-mobile"></div>`);
        weekBlockProps.forEach((props) => {
            const weekBlock = new WeekBlock(props);
            this.$element.insertAdjacentElement('beforeend', weekBlock.$element);
        });
    }
}
