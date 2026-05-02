/**
 * Binary min-heap priority queue. `compare(a, b) < 0` means `a` has higher priority than `b` (comes out first).
 */
export class PriorityQueue<T> {
  private readonly heap: T[] = [];

  constructor(private readonly compare: (a: T, b: T) => number) {}

  get size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  peek(): T | undefined {
    return this.heap[0];
  }

  push(item: T): void {
    this.heap.push(item);
    this.siftUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    if (this.heap.length === 0) {
      return undefined;
    }
    const root = this.heap[0]!;
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.siftDown(0);
    }
    return root;
  }

  private siftUp(i: number): void {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.compare(this.heap[i]!, this.heap[p]!) >= 0) {
        break;
      }
      this.swap(i, p);
      i = p;
    }
  }

  private siftDown(i: number): void {
    const n = this.heap.length;
    for (;;) {
      const l = i * 2 + 1;
      const r = l + 1;
      let smallest = i;
      if (l < n && this.compare(this.heap[l]!, this.heap[smallest]!) < 0) {
        smallest = l;
      }
      if (r < n && this.compare(this.heap[r]!, this.heap[smallest]!) < 0) {
        smallest = r;
      }
      if (smallest === i) {
        break;
      }
      this.swap(i, smallest);
      i = smallest;
    }
  }

  private swap(a: number, b: number): void {
    const t = this.heap[a]!;
    this.heap[a] = this.heap[b]!;
    this.heap[b] = t;
  }
}
