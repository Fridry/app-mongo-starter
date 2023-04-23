export function removeNullProperties(obj: any) {
  for (const prop in obj) {
    if (obj[prop] === null) {
      delete obj[prop];
    }
  }
  return obj;
}
