class Hermes {
    constructor() {
        this.hasRendered = false;
    }
    log() {
        console.log('this', this);
    }
}

export { Hermes as default };
