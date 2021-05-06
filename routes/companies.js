const express = require('express');
const db = require('../db')
const router = express.Router();
const ExpressError = require('../expressError')
const slug = require('slugify')


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
        let {name, description} = req.body
        let code = slug(name, {remove: /[*+~.()'"!:@]/g,
        replacement:'',
        lower: true})
        if(!name || !description){throw new ExpressError('Name and description are required keys', 400)}
        let results = await db.query('INSERT INTO companies (code, name, description) VALUES($1,$2,$3) RETURNING *',[code,name,description])
        return res.send({created:results.rows[0]})
    } catch(e){
        next(e)
    }
})
router.get('/:code',async(req,res,next) => {
    try{
        let company = await db.query(`SELECT c.code, c.name,c.description, i.industry FROM companies AS c 
        JOIN comp_industry AS ci ON ci.comp_code = c.code
        JOIN industries AS i on i.code = ci.ind_code
        WHERE c.code=$1`,[req.params.code])
        let invoices = await db.query('SELECT * FROM invoices WHERE comp_code=$1',[req.params.code])
        if (company.rows.length ===0) throw new ExpressError(`Company with code ${req.params.code} does not exist.`,404)
        let {name, code, description} = company.rows[0]
        let industries = company.rows.map((e)=>e.industry)
        return res.json({company:{name,code,description,industries,invoices:invoices.rows}})
    }catch(e){
        next(e)
    }

})
router.patch('/:code',async(req,res,next) => {
    try{
        let {code, name, description} = req.body
        if(!name || !description || !code){throw new ExpressError('Name,code, and description are required',400)}
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
        return res.json({message:'Deleted'})
    } catch(e){
        next(e)
    }
})

module.exports = router