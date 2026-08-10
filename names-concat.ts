interface NamedObject {
  name: string;
}
function formatNames(objects: NamedObject[], maxLength: number = 75): string {
  if (objects.length === 0) return '';
  const names = objects.map(obj => obj.name);
  let result = '';
  let includedCount = 0;
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const remaining = names.length - (i + 1);
    const suffixForRemaining = remaining > 0 ? `, +${remaining}` : '';
    const separator = includedCount > 0 ? ', ' : '';
    const potentialResult = result + separator + name;
    const potentialFinal = potentialResult + suffixForRemaining;
    if (potentialFinal.length <= maxLength) {
      result = potentialResult;
      includedCount++;
    } else {
      if (includedCount === 0) {
        const ellipsis = '…';
        const suffix = remaining > 0 ? `, +${remaining}` : '';
        const availableForName = maxLength - ellipsis.length - suffix.length;
        if (availableForName > 0) {
          return name.slice(0, availableForName) + ellipsis + suffix;
        }
        return name.slice(0, maxLength);
      } else {
        const remainingCount = names.length - includedCount;
        return result + `, +${remainingCount}`;
      }
    }
  }
  return result;
}
