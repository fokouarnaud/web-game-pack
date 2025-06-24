/**
 * Object Pool for performance optimization
 * Prevents garbage collection by reusing objects
 */

export class ObjectPool<T> {
  private objects: T[] = [];
  private createFn: () => T;
  private resetFn?: (obj: T) => void;
  private maxSize: number;

  constructor(
    createFn: () => T,
    resetFn?: (obj: T) => void,
    maxSize: number = 100
  ) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
  }

  /**
   * Get an object from the pool or create a new one
   */
  get(): T {
    if (this.objects.length > 0) {
      const obj = this.objects.pop()!;
      if (this.resetFn) {
        this.resetFn(obj);
      }
      return obj;
    }
    return this.createFn();
  }

  /**
   * Return an object to the pool
   */
  release(obj: T): void {
    if (this.objects.length < this.maxSize) {
      this.objects.push(obj);
    }
  }

  /**
   * Get current pool size
   */
  get size(): number {
    return this.objects.length;
  }

  /**
   * Clear all objects in pool
   */
  clear(): void {
    this.objects.length = 0;
  }

  /**
   * Pre-fill the pool with objects
   */
  prefill(count: number): void {
    for (let i = 0; i < count && this.objects.length < this.maxSize; i++) {
      this.objects.push(this.createFn());
    }
  }
}