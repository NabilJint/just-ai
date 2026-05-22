let counter = 0;

export function generateNodeId(shape: string) {
  counter += 1;
  return `${shape}-${Date.now()}-${counter}`;
}
