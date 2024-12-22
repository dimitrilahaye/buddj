function formatToYYYYMM(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');

  return `${year}-${month}`;
}

function shortDate(name: string, date: Date): string {
  const options = { year: 'numeric', month: 'short' };
  const formattedDate = date.toLocaleDateString(
    'fr-FR',
    options as Intl.DateTimeFormatOptions
  );
  return `${name} (${formattedDate})`;
}

export { formatToYYYYMM, shortDate };
