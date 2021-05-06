process.env.NODE_ENV = "test";

const app = require('../app');
const db = require('../db')
const request = require('supertest');
var invoice = {
}

describe('Test invoice routes', function () {
    beforeEach(async function () {
        await db.query(`INSERT INTO companies(name,code,description) VALUES ('test_company','test','company to be tested')`)
        let result = await db.query(`INSERT INTO invoices (comp_Code, amt, paid, paid_date)
        VALUES ('test', 100, false, null) RETURNING *`)
        invoice = result.rows[0]
        invoice['add_date'] =expect.any(String)
    })
    afterEach(async function () {
        await db.query('DELETE FROM companies')
        await db.query('DELETE FROM invoices')
    })
    test('/invoices GET', async function(){
        let result = await request(app).get('/invoices')
        expect(result.statusCode).toBe(200)
        expect(result.body).toEqual({invoices:[invoice]})
    })
    test('/invoices POST', async()=>{
        let result = await request(app).post('/invoices').send({
            comp_code:'test',
            amt:37
        })
        console.log(result)
        expect(result.statusCode).toBe(201)
        expect(result.body['created']['amt']).toBe(37)
    })
    test('/invoice POST fail', async function(){
        let results = await request(app).post('/invoices').send({})
        expect(results.statusCode).toBe(400)
    })
})


