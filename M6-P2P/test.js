const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process')


const chai = require('chai');
const expect = chai.expect;
const should = chai.should()
const chaiHttp = require('chai-http');

const Browser = require('zombie');
Browser.localhost('http://localhost/', 8000);
const URL = 'http://localhost:8000'


const { Sequelize } = require('sequelize');
const sequelize = new Sequelize("sqlite:db.sqlite", { logging: false, operatorsAliases: false });

const Quiz = sequelize.define(
    'quiz', {
    question: Sequelize.STRING,
    answer: Sequelize.STRING
})

//Inializacion
const path_root = path.resolve(__dirname);
const path_server = path.join(path_root, "main.js");
const path_dbsqlite = path.resolve(path.join(path_root, "db.sqlite"));

const browser = new Browser({ waitDuration: '50000', silent: true });
chai.use(chaiHttp);

var server = null;


async function getId() {
    return await Quiz.findOne({})
}

//Comprobaciones

describe('Empezando comprobaciones', function () {
    this.timeout(800);
    it('Comprobando existencia de db.sqlite y realizando copia de seguridad.', function () {
        fs.access(path_dbsqlite, (err) => {
            if (err) {
                this.skip()
            } else {
                fs.renameSync(path_dbsqlite, `${path_dbsqlite}.bak`);
                expect(err).to.be.null
            }
        })
    });
    it('Inicializando el servidor.', function (done) {
        server = spawn("node", [path_server], { detached: true });
        setTimeout(function () {
            sequelize.sync() //Cargando datos.
            done();
        }, 300) //200ms minimo para que el servidor cargue
    });


    describe('Comprobando vistas.', function () {

        it("Se ha cargado '/Quizzes' correctamente.", function (done) {
            browser.visit(URL, function () {
                browser.assert.status(200);
                browser.assert.text('title', "Quiz");
                done()
            })
        })

        it("Se ha cargado '/Quizzes/1/play' correctamente.", function (done) {
            browser.visit(`${URL}/quizzes/1/play`, function () {
                browser.assert.status(200);
                browser.assert.text('h1', "Play Quiz");
                done()
            })
        })


        it("Se ha cargado '/Quizzes/1/check' correctamente.", function (done) {
            browser.visit(`${URL}/quizzes/1/check?response=Rome`, function () {
                browser.assert.status(200);
                browser.assert.text('h1', "Result");
                done()
            })
        })

        it("Se ha cargado '/Quizzes/1/edit' correctamente.", function (done) {
            browser.visit(`${URL}/quizzes/1/edit`, function () {
                browser.assert.status(200);
                browser.assert.text('h1', "Edit Quiz");
                done()
            })
        })

        it("Se ha cargado '/Quizzes/new' correctamente.", function (done) {
            browser.visit(`${URL}/quizzes/new`, function () {
                browser.assert.status(200);
                browser.assert.text('h1', "Create New Quiz");
                done()
            })
        })
    })

    describe('Comprobando formularios.', function () {
        before("Cargando '/quizzes/1/edit'.", function (done) {
            firstId = getId();
            browser.visit(URL, {}, function () {
                browser.assert.success()
                browser.clickLink('Edit', function () {
                    browser.wait();
                    browser.assert.success();
                    done()
                })
            })
        })

        it("Rellenando formulario '/quizzes/1/edit'.", function () {
            browser.assert.text('title', 'Edit Quiz')
            browser.fill('input[name="question"]', 'Mocha?');
            browser.fill('input[name="answer"]', 'yes');
            browser.pressButton("", function () {
                browser.wait().then(() => {
                    browser.assert.text('a', 'Mocha?') 
                });
            });
        })
    })

    describe("Comprobando los Middlewares.", function () {

        it("Comprobando el Middleware 'Check'.", async function () {
            const response = await chai.request(URL).get('/quizzes/1/check');
            expect(response).to.have.status(200);
        })
        it("Comprobando el Middleware 'Play'.", async function () {
            const response = await chai.request(URL).get('/quizzes/1/play');
            expect(response).to.have.status(200);
        })
        it("Comprobando el Middleware 'Edit'.", async function () {
            const response = await chai.request(URL).get('/quizzes/1/edit');
            expect(response).to.have.status(200);
        })
        it("Comprobando el Middleware 'New'.", async function () {
            const response = await chai.request(URL).get('/quizzes/new');
            expect(response).to.have.status(200);
        })
    })

    describe('Comprobando los controladores.', function () {
        it('Realizando peticion POST a "/Quizzes"', function (done) {
            chai.request(URL)
                .post('/quizzes')
                .set({ 'content-type': 'application/x-www-form-urlencoded' })
                .send({ question: 'POST?', answer: 'Yes' })
                .end(function (err, res) {
                    expect(res).to.have.status(200);
                    done();
                })
        })

        it('Realizando peticion PUT a "/Quizzes/2"', function (done) {
            chai.request(URL)
                .put('/quizzes/2')
                .set({ 'content-type': 'application/x-www-form-urlencoded' })
                .send({ question: 'Update?', answer: 'Yes' })
                .end(function (err, res) {
                    expect(res).to.have.status(200);
                    done();
                })
        })
    })

    describe('Comprobando conexion a la Base de datos.', function () {

        it('Obteniendo cantidad de datos de la BBDD.', async function () {
            let count = await Quiz.count();
            expect(count).to.equal(5);
        })
        it('Modificando la Base de datos.', async function () {

            await Quiz.create({ question: 'Add new data?', answer: 'Yes' });
            let found = await Quiz.findOne({ where: { question: 'Add new data?' } });

            expect(found).to.be.an('Object');
            found.should.have.property('question');
            found.should.have.property('answer');
        })

    })

    after('Cerrando servidor', function () {
        if (server) {
            server.kill()
            fs.unlinkSync(`${path_dbsqlite}`);
        }

        fs.access(`${path_dbsqlite}.bak`, (err) => {
            if (!err) {
                fs.renameSync(`${path_dbsqlite}.bak`, `${path_dbsqlite}`)
                expect(err).to.be.null;
            } else {
                throw err
            }
        })
    })
})