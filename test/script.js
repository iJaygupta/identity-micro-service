process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
const should = chai.should();

chai.use(chaiHttp);

describe('Add User', function () {
    it(`should return success sign up message /api/v1/signup POST`, function (done) {
        chai.request(server)
            .post(`/api/v1/signup`)
            .send({ "email" : "dunzen@abc.com", "password" : "PassCode1234", "name" : "Dunzen"})
            .end(function (err, res) {
                res.should.have.status(201);
                done();
            });
    });
});

describe('Log in', function () {
    it('should return token /api/v1/login POST', function (done) {
        chai.request(server)
            .post('/api/v1/login')
            .send({ "email" : "dunzen@abc.com", "password" : "PassCode1234" })
            .end(function (err, res) {
                process.env.token = res.body && res.body.data  && res.body.data.token ? res.body.data.token : ""
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('data');
                res.body.data.should.be.a('object');
                done();
            });
    });
});


describe('Add Contact', function () {
    it('should return success message /api/v1/contact POST', function (done) {
        this.timeout(10000);
        chai.request(server)
            .post('/api/v1/contact')
            .set('authorization', process.env.token)
            .send({ "name": "harsh", "mobile": "919628799381" })
            .end(function (err, res) {
                process.env.token = res.body && res.body.data  && res.body.data.token ? res.body.data.token : ""
                res.should.have.status(201);
                done();
            });
    });
});


