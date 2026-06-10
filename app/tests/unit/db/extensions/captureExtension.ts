// Prisma's `defineExtension(obj)` returns a function `(client) => client.$extends(obj)`.
// To inspect the extension object without a real PrismaClient, pass it a stub client
// whose `$extends` simply records the argument.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function captureExtension(transform: any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let captured: any;
  const stubClient = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $extends(ext: any) {
      captured = ext;
      return stubClient;
    }
  };
  transform(stubClient);
  return captured;
}
