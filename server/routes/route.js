var express = require('express');
var router = express.Router();

var mysql      = require('mysql2');
var pool = mysql.createPool({
    host     : 'localhost',
    user     : 'root',
    password : 'tmddyd',
    database : 'YONG_fitness',
    connectionLimit: 10
});
pool.getConnection(function(err, conn){
        if(err){
            if(conn){
                conn.release();
            }
            
            throw err;
        }
    });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login',{data:''});
});

router.get('/login', function(req, res, next){
    Id=req.param("Id");
    Pw=req.param("Pw");
    pool.query('select * from Administrator where Id=? and Pw=?', [Id, Pw], function(err, results){
        if(err) throw err;
        if(results.length>0){
            res.render('main');
        }else{
            res.render('login', {data:'wrong ID/PW'});
        }
    });
});

router.get('/signin', function(req, res, next) {
  res.render('signin', {data:''});
});

router.get('/signin_add', function(req, res, next) {
    MASTER_PW=req.param("MASTER_PW");
    Id=req.param("Id");
    Pw=req.param("Pw");
    type=req.param("type");
    pool.query('select * from Master where Pw=?', [MASTER_PW], function(err, results){
        if(err) throw err;
        if(results.length>0){
            if(Id!='' && Pw!='' && type!=''){
                pool.query('insert into Administrator values (?, ?, ?)', [Id, Pw, type], function(err, results){
                    if(err) throw err;
                });
                res.render('login',{data:''});
            }else{
                res.render('signin',{data:'type all data'});
            }
        }else{
            res.render('signin',{data:'wrong MASTER PW'});
        }
    });
});
    
module.exports = router;