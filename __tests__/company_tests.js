process.env.NODE_ENV = "test";

const app = require('../app');
const db = require('../db')
const request = require('supertest');


describe('Test company routes', function () {
    beforeEach(async function () {
        let results = await db.query(`INSERT INTO companies(name,code,description) VALUES ('test_company','test','company to be tested')`)
    })
    afterEach(async function () {
        let results = await db.query('DELETE FROM companies')
    })
    test('/companies GET', async function(){
        let results = await request(app).get('/companies')
        expect(results.statusCode).toBe(200)
        expect(results.body).toEqual({companies:[{name: 'test_company',code:'test',description: 'company to be tested'}]})
    })
    test('/companies POST',async function(){
        let results = await request(app).post('/companies').send({
            name:'test2',
            description:'test the post route'
        })
        expect(results.body).toEqual({created:{
            name:'test2',
            code:'test2',
            description:'test the post route'
        }})
    })
    test('/companies post failure',async function(){
        let results = await request(app).post('/companies').send({name:'test'})
        expect(results.body).toEqual({"error": {"message": "Name and description are required keys", "status": 400}})
        expect(results.statusCode).toBe(400)
    })
    test('/companies patch', async()=>{
        let company = {name:'testPatch',code:'test',description:'This was to test patch function'}
        let results = await request(app).patch('/companies/test').send(company)
        expect(results.statusCode).toEqual(200)
        expect(results.body).toEqual({company:company})
    })
    test('/companies patch fail', async()=>{
        let company = {name:'testPatch',}
        let results = await request(app).patch('/companies/test').send(company)
        expect(results.statusCode).toEqual(400)
        expect(results.body).toEqual({"error": {"message": "Name,code, and description are required", "status": 400}})
    })
    test('/companies delete',async()=>{
        let results = await request(app).delete('/companies/test')
        expect(results.statusCode).toEqual(200)
        expect(results.body).toEqual({message:'Deleted'})
    })
})


