/**
 * Divides a raw time-and-place string into pairs of [time, place].
 */
export function timeAndPlaceDivider(str: string): string[][] {
  const result: string[][] = [];
  let index = 0;
  const len = str.length;

  while (index < len) {
    const pair: string[] = [];
    let lastIndex = index;

    while (index < len && str[index] !== "(") index++;
    pair.push(str.substring(lastIndex, index));
    index++;
    while (index < len && str[index] === " ") index++;
    lastIndex = index;

    while (index < len && str[index] !== ")") index++;
    pair.push(str.substring(lastIndex, index));
    index++;
    while (index < len && str[index] === " ") index++;

    result.push(pair);
  }

  return result;
}

/**
 * Appends a newline after closing parenthesis for better formatting.
 */
export function timeAndPlaceCorrector(str: string): string {
  return str.replace(")", ")\n");
}
