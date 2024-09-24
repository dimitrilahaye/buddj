
function getMonthName(month) {
    const event = new Date(month.date);
    const options = {
        month: 'long',
        year: 'numeric',
    };
    return event.toLocaleDateString('fr-FR', options);
}

export { getMonthName };
