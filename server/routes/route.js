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

var moment=require('moment');

/* GET home page. */
router.get('/', function(req, res, next){
  res.render('login',{data:''});
});

router.get('/logout', function(req, res, nets){
    res.render('login',{data:''});
})

router.get('/login', function(req, res, next){
    Id=req.param("Id");
    Pw=req.param("Pw");
    pool.query('select * from Administrator where Id=? and Pw=?', [Id, Pw], function(err, results){
        if(err) throw err;
        if(results.length>0){
            pool.query('select * from Member', function(err, results){
                if(err) throw err;
                res.locals.mFormat=function(date){
                    return moment(date).format('yyyy-MM-DD')
                };
                res.render('main_member', {data:results, warn:''});
            })
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
                res.render('main', {data:results});
            }else{
                res.render('signin',{data:'type all data'});
            }
        }else{
            res.render('signin',{data:'wrong MASTER PW'});
        }
    });
});

router.get('/to_tainer', function(req, res, next){
    pool.query('select * from Trainer', function(err, results){
        if(err) throw err;
        if(results.length>0){
            res.render('main_trainer',{data: results, warn:''});
        }
    });
})

router.get('/member_modify', function(req, res, next){
    var mId=req.param("mId");
    pool.query('select * from Member where mId=?', [mId], function(err, results){
        if(err) throw err;
        if(results.length>0){
            var mId=req.param('mId');
            var birthDate=req.param('birthDate');
            var type=req.param('type');
            var startDate=req.param('startDate');
            var endDate=req.param('endDate');
            var trainer=rew.param('trainer');
            if(type==null || startDate==null || endDate==null){
                pool.query('select * from Member where mId=?', [mId], function(err, results){
                    res.render('main_member',{data: results, warn: 'input correctly'});
                });
            }
            pool.query('update Member set birthDate=?, type=?, startDate=?, endDate=?, trainer=? where (select * from Member from mId=?)',[birthDate, type, startDate, endDate, trainer], function(err, results){
                if(err) throw err;
            });
            pool.query('select * from Member', function(err, results){
                if(err) throw err;
                res.render('main_member',{data: results, warn: ''});
            });
        }
    });
});


router.get('/member_delete', function(req, res, next){
    var mId=req.param("mId");
    pool.query('delete from Member where mId=?', [mId], function(err, results){
        if(err) throw err;
    });
});

router.get('/new_member', function(req, res, next){
        var birthDate=req.param('birthDate');
        var type=req.param('type');
        var startDate=req.param('startDate');
        var endDate=req.param('endDate');
        var trainer=rew.param('trainer');
        if(type==null || startDate==null || endDate==null){
            pool.query('select * from Member where mId=?', [mId], function(err, results){
                res.render('new_member',{data: results, warn: 'input correctly'});
            });
        }
        var mId;
        pool.query('select count(*) from Member', function(err, results){
            if(err) throw err;
            mId=results+1;
        })
        pool.query('insert into Member values (?, ?, ?, ?, ?, ?)',[mId, birthDate, type, startDate, endDate, trainer], function(err, results){
            if(err) throw err;
                pool.query('select * from Member', function(err, results){
            if(err) throw err;
                res.render('main_member',{data: results, warn: 'add complete'});
            });
        });
});






router.get('/trainer_modify', function(req, res, next){
    var tId=req.param("tId");
    pool.query('select * from Trainer where tId=?', [tId], function(err, results){
        if(err) throw err;
        if(results.length>0){
            var tId=req.param('tId');
            var type=req.param('type');
            var member=rew.param('member');
            if(type==null){
                pool.query('select * from Trainer where tId=?', [tId], function(err, results){
                    res.render('main_trainer',{data: results, warn: 'input correctly'});
                });
            }
            pool.query('update Member set birthDate=?, type=?, startDate=?, endDate=?, trainer=? where (select * from Member from mId=?)',[birthDate, type, startDate, endDate, trainer], function(err, results){
                if(err) throw err;
            });
            pool.query('select * from Member', function(err, results){
                if(err) throw err;
                res.render('main_member',{data: results, warn: ''});
            });
        }
    });
});


router.get('/member_delete', function(req, res, next){
    var mId=req.param("mId");
    pool.query('delete from Member where mId=?', [mId], function(err, results){
        if(err) throw err;
    });
});

router.get('/new_member', function(req, res, next){
        var birthDate=req.param('birthDate');
        var type=req.param('type');
        var startDate=req.param('startDate');
        var endDate=req.param('endDate');
        var trainer=rew.param('trainer');
        if(type==null || startDate==null || endDate==null){
            pool.query('select * from Member where mId=?', [mId], function(err, results){
                res.render('new_member',{data: results, warn: 'input correctly'});
            });
        }
        var mId;
        pool.query('select count(*) from Member', function(err, results){
            if(err) throw err;
            mId=results+1;
        })
        pool.query('insert into Member values (?, ?, ?, ?, ?, ?)',[mId, birthDate, type, startDate, endDate, trainer], function(err, results){
            if(err) throw err;
                pool.query('select * from Member', function(err, results){
            if(err) throw err;
                res.render('main_member',{data: results, warn: 'add complete'});
            });
        });
});

module.exports = router;