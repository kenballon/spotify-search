export default class ConsoleMessage {
  constructor(message) {
    this.message = message;
  }

  log(msg) {
    console.log(
      `%c${(this.message = msg)}`,
      `background-color: #D0F5BE; color:#333333;padding:0.5rem 1rem;border-radius:16px;text-transform:capitalize;`
    );
  }
}
