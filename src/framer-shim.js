export * from '../node_modules/unframer/dist/framer.js';

export function runTasksWithYield(tasks, context) {
  if (Array.isArray(tasks)) {
    return Promise.all(tasks.map((t) => (typeof t === 'function' ? t() : t)));
  }
  return Promise.resolve();
}
