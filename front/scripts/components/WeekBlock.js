import Block from "../elements/Block.js";

export default class WeekBlock extends Block {
    /**
     *
     * @param {WeekBlockProps} props
     */
    constructor(props) {
        const content = `
            <span class="week">${props.week}</span>
            <span class="remaining">${props.remaining}€</span>
        `;
        super({
            color: props.color,
            size: props.size,
            content,
        });
        this.$element.classList.add('week-block');
    }
}
