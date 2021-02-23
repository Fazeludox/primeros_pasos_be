class EventEmitter {
    constructor() {
        this.emisiones = new Object();
    }

    emit(nombreEmisor, ...params) {
        return this.emisiones[`${nombreEmisor}`].forEach( (metodo) => {
            return metodo(...params)
        })
    }

    on(nombreEmisor, fx) {

        if (this.emisiones.hasOwnProperty(nombreEmisor)) {
            this.emisiones[`${nombreEmisor}`].push(fx);
        } else {
            this.emisiones[`${nombreEmisor}`] = [fx];
        }
    }

}

exports = module.exports = EventEmitter;