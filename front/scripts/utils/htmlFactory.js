export default function (template) {
    const parser = new DOMParser();
    const html = parser.parseFromString(template, "text/html");
    return html.body.firstElementChild;
}
