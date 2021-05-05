const express = require('express');
const db = require('../db')
const router = express.Router();
const ExpressError = require('../expressError')


router.get('/',async(req,res,next) => {
    try{
        let results = await db.query('SELECT * FROM companies')
        return res.json({companies:results.rows})
    }catch(e){
        next(e)
    }

})
router.post('/', async (req, res, next) => {
    try{
        let {code, name, description} = req.body
        let results = await db.query('INSERT INTO companies (code, name, description) VALUES($1,$2,$3) RETURNING *',[code,name,description])
        return res.send({created:results.rows})
    } catch(e){
        next(e)
    }
})
router.get('/:code',async(req,res,next) => {
    try{
        let company = await db.query('SELECT * FROM companies WHERE code=$1',[req.params.code])
        let invoices = await db.query('SELECT * FROM invoices WHERE comp_code=$1',[req.params.code])
        if (company.rows.length ===0) throw new ExpressError(`Company with code ${req.params.code} does not exist.`,404)
        return res.json({company:company.rows[0], invoices:invoices.rows})
    }catch(e){
        next(e)
    }

})
router.patch('/:code',async(req,res,next) => {
    try{
        let {code, name, description} = req.body
        let results = await db.query('UPDATE companies SET code=$1, name=$2,description=$3 WHERE code=$4 RETURNING *',[code,name,description, req.params.code])
        if (results.rows.length ===0) throw new ExpressError(`Company with code ${req.params.code} does not exist.`,404)
        return res.json({company:results.rows[0]})
    }catch(e){
        next(e)
    }

})
router.delete('/:code',async(req,res,next) => {
    try{
        let results = await db.query('DELETE FROM companies WHERE code=$1',[req.params.code])
        if (results.rowCount === 0) throw new ExpressError(`Company with code ${req.params.code} does not exist.`,404)
        return res.json({status:results})
    } catch(e){
        next(e)
    }
})

module.exports = router