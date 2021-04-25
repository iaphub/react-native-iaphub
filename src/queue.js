
export default class Queue {

  constructor(executor) {
    this.executor = executor;
    this.waiting = [];
    this.isRunning = false;
    this.isPaused = false;
  }
  
  add(item) {
    this.waiting.push(item);
    this.run();
  }

  pause() {
    this.isPaused = true;
  }

  async resume() {
    this.isPaused = false;
    await this.run();
  }

  async run() {
    if (this.isPaused || this.isRunning) return;
    // Get the items we're going to process, empty waiting list and mark the queue as running
    var items = [].concat(this.waiting);
    this.waiting = [];
    this.isRunning = true;
    // Execute items in the waiting list
    await items.reduce(async (promise, item) => {
      await promise;
      try {
        await this.executor(item);
      } catch (err) {
        console.error(err);
      }
    }, Promise.resolve());
    // Mark the queue as not running
    this.isRunning = false;
    // Run again if there's more items in the waiting list
    if (this.waiting.length) {
      await this.run();
    }
  }

}