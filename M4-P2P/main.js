
const user = require("./cmds_user.js");
const quiz = require("./cmds_quiz.js");
const favs = require("./cmds_favs.js");
const readline = require('readline');
const net = require('net');

let clients = [];

const server = net.createServer((socketServer) => {

  socketServer.write('Bienvenido al servidor\n');

  const rl = readline.createInterface({
    input: socketServer, 
    output: socketServer,
    prompt: "> "
  });

  let clientExit;

  rl.prompt();

  clients.push(socketServer);

  socketServer.on('end', () => console.log("Un usuario se desconecto."));

  socketServer.on('error', (err) => {
    throw err;
  })

  rl.log = (msg) => {
    for (let i = 0; i < clients.length; i++) {
      if (clients[i] === socketServer) {

        if (msg === "Bye!") {
          clientExit = clients[i];
          clients[i].end('Bye!\n')
          rl.close();
        } else {
          clients[i].write(msg + "\n")
        }

      }
    }
  };  // Add log to rl interface

  rl.questionP = function (string) {   // Add questionP to rl interface
    return new Promise((resolve) => {
      this.question(`  ${string}: `, (answer) => resolve(answer.trim()))
    })
  };

  rl.on('line', async (line) => {
    try {
      let cmd = line.trim()

      if ('' === cmd) { }
      else if ('h' === cmd) { user.help(rl); }

      else if (['lu', 'ul', 'u'].includes(cmd)) { await user.list(rl); }
      else if (['cu', 'uc'].includes(cmd)) { await user.create(rl); }
      else if (['ru', 'ur', 'r'].includes(cmd)) { await user.read(rl); }
      else if (['uu'].includes(cmd)) { await user.update(rl); }
      else if (['du', 'ud'].includes(cmd)) { await user.delete(rl); }

      else if (['lq', 'ql', 'q'].includes(cmd)) { await quiz.list(rl); }
      else if (['cq', 'qc'].includes(cmd)) { await quiz.create(rl); }
      else if (['tq', 'qt', 't'].includes(cmd)) { await quiz.test(rl); }
      else if (['uq', 'qu'].includes(cmd)) { await quiz.update(rl); }
      else if (['dq', 'qd'].includes(cmd)) { await quiz.delete(rl); }

      else if (['lf', 'fl', 'f'].includes(cmd)) { await favs.list(rl); }
      else if (['cf', 'fc'].includes(cmd)) { await favs.create(rl); }
      else if (['df', 'fd'].includes(cmd)) { await favs.delete(rl); }

      else if ('e' === cmd) { rl.log('Bye!') }
      else {
        rl.log('UNSUPPORTED COMMAND!');
        user.help(rl);
      };
    } catch (err) { rl.log(`  ${err}`); }
    finally {
      if (clientExit !== socketServer) {
        rl.prompt()
      }
      clientExit = null;
    }
  });
});

server.listen('8080', () => {
  console.log("Servidor iniciado en el puerto 8080.");
})

server.on('error', (err) => {
  console.log("Hay un error al cerrar el servidor.");
  throw err
});

server.on('connection', () => {
  console.log("Se ha conectado un usuario");
})

