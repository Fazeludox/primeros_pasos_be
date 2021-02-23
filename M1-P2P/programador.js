
const EventEmitter = require('./events');
const later = require('later');


class Programador extends EventEmitter {


    constructor() {

        super();

        this.tempsDefault = [
            {
                "hora": "07:00",
                "temperatura": 22
            },
            {
                "hora": "08:30",
                "temperatura": 18
            },
            {
                "hora": "18:00",
                "temperatura": 22
            },
            {
                "hora": "23:00",
                "temperatura": 20
            }
        ];

    }

    aplicarTemp() {

        later.date.localTime();

        console.log("Aplicando horario de temperaturas.");

        for (let i = 0; i<this.tempsDefault.length; i++) {
            const horario = later.parse.text('at ' + this.tempsDefault[i].hora);
            
            later.setInterval(()=>{

                console.log("Son las "+this.tempsDefault[i].hora+" cambiando la temperatura a " + this.tempsDefault[i].temperatura+"ºC");
                this.emit("ideal", this.tempsDefault[i].temperatura);
            
            }, horario)
        }
    }
}

exports = module.exports = Programador;