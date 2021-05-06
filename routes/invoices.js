const express = require('express');
const db = require('../db')
const router = express.Router();
const ExpressError = require('../expressError')



router.get('/',async(req,res,next) => {
    try{
        let results = await db.query('SELECT * FROM invoices')
        return res.json({invoices:results.rows})
    }catch(e){
        next(e)
    }

})
router.post('/', async (req, res, next) => {
    try{
        let {comp_code,amt} = req.body
        if(!comp_code || !amt) throw new ExpressError('Comp_code and amt are required.',400)
        let results = await db.query('INSERT INTO invoices (comp_code,amt) VALUES($1,$2) RETURNING *',[comp_code,amt])
        res.status(201)
        return res.send({created:results.rows[0]})
    } catch(e){
        next(e)
    }
})
router.get('/:id',async(req,res,next) => {
    try{
        let results = await db.query('SELECT * FROM invoices WHERE id=$1',[req.params.id])
        if (results.rows.length ===0) throw new ExpressError(`Invoice with id ${req.params.id} does not exist.`,404)
        return res.json({company:results.rows[0]})
    }catch(e){
        next(e)
    }

})
router.patch('/:id',async(req,res,next) => {
    try{
        let {amt,paid} = req.body;
        let base = await db.query('SELECT * FROM invoices WHERE id=$1',[req.params.id])
        amt = (amt)? amt:base.rows[0].amt;
        let results;

        if(!base.rows[0].paid && paid){
            let datetime = new Date();
            let date = datetime.toISOString().slice(0,10);
            results = await db.query('UPDATE invoices SET amt=$1,paid=$2,paid_date=$3 WHERE id=$4 RETURNING *',[amt, paid, date, req.params.id])

        }
        else if(base.rows[0].paid && paid==false){
            results = await db.query('UPDATE invoices SET amt=$1,paid=$2, paid_date=null WHERE id=$3 RETURNING *',[amt, paid, req.params.id])

        }
        else{
            results = await db.query('UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING *',[amt, req.params.id])

        }
        if (results.rows.length ===0) throw new ExpressError(`Company with code ${req.params.code} does not exist.`,404)
        return res.json({company:results.rows[0]})
    }catch(e){
        next(e)
    }

})
router.delete('/:id',async(req,res,next) => {
    try{
        let results = await db.query('DELETE FROM invoices WHERE id=$1',[req.params.id])
        if (results.rowCount === 0) throw new ExpressError(`Invoice with id ${req.params.id} does not exist.`,404)
        return res.json({status:results})
    } catch(e){
        next(e)
    }
})

module.exports = router