export function popFirstFromSet(s) {
  if (s.size === 0) return undefined;

  const firstEle = s.values().next().value;
  s.delete(firstEle)
  return firstEle
}
