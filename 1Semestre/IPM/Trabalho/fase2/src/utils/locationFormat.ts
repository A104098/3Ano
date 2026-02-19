
export function capitalize(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatCityLabel(city: string) {
  return capitalize(city);
}

export function formatRegionLabel(region: string, city: string) {
  return `${capitalize(region)} (${capitalize(city)})`;
}
