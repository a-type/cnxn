export class ManualPromise<T> extends Promise<T> {
  resolve: (value: T) => void = () => {
    throw new Error('Not ready yet');
  };
  reject: (error: Error) => void = () => {
    throw new Error('Not ready yet');
  };

  constructor() {
    super((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
