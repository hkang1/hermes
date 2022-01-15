class Hermes {
  private hasRendered: boolean;

  constructor() {
    this.hasRendered = false;
  }

  log() {
    console.log('this', this);
  }
}

export default Hermes;

