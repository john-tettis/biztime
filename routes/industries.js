const express = require('express');
const db = require('../db')
const slug = require('slugify')
const router = express.Router();
const ExpressError = require('../expressError')



router.get('/',async(req,res,next) => {
    try{
        let results = await db.query('SELECT i.code, i.industry, j.comp_code FROM industries AS i LEFT JOIN comp_industry AS j ON j.ind_code = i.code')
        let industries={}
        for(let obj of results.rows){
            console.log(obj.industry in industries)
            if( obj.industry in industries){
                console.log(industries)
                industries[obj.industry]['companies'].push(obj.comp_code)
                
            }
            else{
                industries[obj.industry] = {
                    industry: obj.industry, 
                    code: obj.code,
                    companies:[obj.comp_code]
                }
            }
        }
        let result=[]
        for (const [key, value] of Object.entries(industries)) {
            result.push(value)
        }
        return res.json({industries:result})
    }catch(e){
        next(e)
    }

})
router.post('/', async (req, res, next) => {
    try{
        let {industry} = req.body
        let code = slug(industry, {remove: /[*+~.()'"!:@]/g,
        replacement:'',
        lower: true})
        let results = await db.query('INSERT INTO industries (code,industry) VALUES($1,$2) RETURNING *',[code,industry])
        return res.send({created:results.rows})
    } catch(e){
        next(e)
    }
})
router.post('/link', async(req, res,next)=>{
    try{
        let {industry_code,company_code} = req.body
        let results = await db.query('INSERT INTO comp_industry (comp_code, ind_code) VALUES($1,$2) RETURNING *',[company_code,industry_code])
        res.send(results.rows[0])
    } catch(e){
        next(e)
    }


})



module.exports = router