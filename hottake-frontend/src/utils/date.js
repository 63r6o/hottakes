export const getReadableDateFrom = (dateString) => {
  const date = new Date(Date.parse(dateString));

  return date.toLocaleDateString();
};
