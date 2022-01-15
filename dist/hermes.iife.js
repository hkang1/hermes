var Hermes = (function () {
    'use strict';

    class Hermes {
        constructor() {
            this.hasRendered = false;
        }
        log() {
            console.log('this', this);
        }
    }

    return Hermes;

})();
