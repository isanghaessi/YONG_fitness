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
            pool.query('select Member.mId, Member.name, birthDate, Member.type, startDate, endDate, Trainer.name trainer from Member, Trainer where Member.mId=Trainer.mId union select Member.mId, Member.name, birthDate, Member.type, startDate, endDate, null from Member, Trainer where (Member.mId) not in (select mId from Trainer) order by mId', function(err, results){
                if(err) throw err;
                res.locals.mFormat=function(date){
                    return moment(date).format('yyyy-MM-DD')
                };
                res.render('main_member', {data:results, warn:''});
            });
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
                res.render('login', {data: ''});
            }else{
                res.render('signin',{data:'type all data'});
            }
        }else{
            res.render('signin',{data:'wrong MASTER PW'});
        }
    });
});

router.get('/search_member', function(req, res, next){
    var input=req.param(input);
    pool.query('select * from (select Member.mId, Member.name, birthDate, Member.type, startDate, endDate, Trainer.name trainer from Member, Trainer where Member.mId=Trainer.mId union select Member.mId, Member.name, birthDate, Member.type, startDate, endDate, null from Member, Trainer where (Member.mId) not in (select mId from Trainer)) where ?=mId || ?=name || ?=birthDate || ?=type || ?=startDate || ?=endDate || ?=trainer order by mId', [input, input, input, input, input, input, input], function(err, results){
        if (err) throw err;
        if(results.length>0){
            res.render('main_member', {data: results, warn: ''})
        }
    });
});

router.get('/to_trainer', function(req, res, next){
    pool.query('select tId, Trainer.name, Trainer.type, Member.name mem from Trainer, Member where Trainer.mId=Member.mId or der by tId', function(err, results){
        if(results.length>0){
            res.render('main_trainer',{data: results, warn: ''});
        }
    });
});

router.get('/member_modify', function(req, res, next){
    var mId=req.param("mId");
    pool.query('select * from Member where mId=?', [mId], function(err, results){
        if(err) throw err;
        if(results.length>0){
            var name=results[0].name;
            var birthDate=req.param('birthDate');
            var type=req.param('type');
            var startDate=req.param('startDate');
            var endDate=req.param('endDate');
            var trainer=rew.param('trainer');
            if(type==null || startDate==null || endDate==null){
                pool.query('select distinct(*) from Train, Member where Train.mId=Member.mId', function(err, results){
                if(err) throw err;
                res.render('main_member',{data: results, warn: input_correnctly});
            });
            }
            pool.query('update Member set birthDate=?, type=?, startDate=?, endDate=? where (select * from Member from mId=?)',[birthDate, type, startDate, endDate, mId], function(err, results){
                if(err) throw err;
            });
            var tId;
             pool.query('select * from Trainer where name=?', [trainer], function(err, results){
                if(err) throw err;
                tId=results[0].tId;
            });
            pool.query('update Train set tId=?, trainer=?, mId=?, member=? where tId=? and mId=?',[tId, trainer, mId, name, tId, mid], function(err, results){
                if(err) throw err;
            })
            pool.query('select distinct(*) from Train, Member where Train.mId=Member.mId', function(err, results){
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
    pool.query('select distinct(*) from Train, Member where Train.mId=Member.mId', function(err, results){
        if(err) throw err;
        res.render('main_member',{data:results, warn:""});
    });
});

router.get('/new_member', function(req, res, next){
        var name=req.param("name");
        var birthDate=req.param('birthDate');
        var type=req.param('type');
        var startDate=req.param('startDate');
        var endDate=req.param('endDate');
        var trainer=rew.param('trainer');
        if(type==null || startDate==null || endDate==null){
            res.render('new_member',{data: results, warn: 'input correctly'});
        }
        var mId;
        pool.query('select count(*) from Member', function(err, results){
            if(err) throw err;
            mId=results[0]+1;
        });
        pool.query('insert into Member values (?, ?, ?, ?, ?)',[name, mId, birthDate, type, startDate, endDate], function(err, results){
            if(err) throw err;
        });
        poolquery('select * from Trainer name=?', [trainer], function(err, results){
            if(err) return err;
            if(results.length>0){
                pool.query('insert into Train values (?, ?, ?, ?, ?)', [results.tId, trainer, mId, name, type],function(err, results){
                    if(err) throw err;
                    pool.query('select distinct(*) from Train, Member where Train.mId=Member.mId', function(err, results){
                        if(err) throw err;
                        res.locals.mFormat=function(date){
                            return moment(date).format('yyyy-MM-DD')
                        };
                        res.render('main_member', {data:results, warn:''});
                    });
                })
            }else{
                res.render('new_member', {warn: "trainer doesn't exist"});
            }
        });
});

router.get('/search_trainer', function(req, res, next){
    var search=req.param(input);
    pool.query('select distince(*) from Trainer, Member where Trainer.mId=Member.mId and mId=? or name=? of type=? or trainer=?', [input, inout, input, input], function(err, results){
        if (err) throw err;
        if(results.length>0){
            res.render('main_trainer', {data: results, warn: ''})
        }
    });
});

router.get('/to_member', function(req, res, next){
    pool.query('select Member.mId, Member.name, birthDate, Member.type, startDate, endDate, Trainer.name trainer from Member, Trainer where Member.mId=Trainer.mId union select Member.mId, Member.name, birthDate, Member.type, startDate, endDate, null from Member, Trainer where (Member.mId) not in (select mId from Trainer) order by mId', function(err, results){
                if(err) throw err;
                res.locals.mFormat=function(date){
                    return moment(date).format('yyyy-MM-DD')
                };
                res.render('main_member', {data:results, warn:''});
            });
});

router.get('/trainer_modify', function(req, res, next){
    var tId=req.param("tId");
    pool.query('select * from Trainer where tId=?', [tId], function(err, results){
        if(err) throw err;
        if(results.length>0){
            var name=results[0].name;
            var type=req.param('type');
            var member=rew.param('member');
            if(type==null){
                pool.query('select distinct(*) from Train, Member where Train.mId=Member.mId', function(err, results){
                if(err) throw err;
                res.render('main_trainer',{data: results, warn: input_correnctly});
            });
            }
            pool.query('update Member tId=?, type=?, name=? where (select * from Member from mId=?)',[tId, type, name, mId], function(err, results){
                if(err) throw err;
            });
            pool.query('update Train set tId=?, trainer=?, mId=?, member=? where tId=? and mId=?',[tId, name, mId, member, tId, mid], function(err, results){
                if(err) throw err;
            })
            pool.query('select distinct(*) from Train, Member where Train.mId=Member.mId', function(err, results){
                if(err) throw err;
                res.render('main_member',{data: results, warn: ''});
            });
        }
    });
});


router.get('/trainer_delete', function(req, res, next){
    var tId=req.param("tId");
    pool.query('select distinct(*) from Train, Member where Train.mId=Member.mId', function(err, results){
        if(err) throw err;
        res.render('main_trainer',{data:results, warn:""});
    });
});

router.get('/new_trainer', function(req, res, next){
        var name=req.param("name");
        var type=req.param('type');
        var member=rew.param('member');
        if(type==null){
            res.render('new_member',{data: results, warn: 'input correctly'});
        }
        var tId;
        pool.query('select count(*) from Trainer', function(err, results){
            if(err) throw err;
            tId=results[0]+1;
        })
        pool.query('insert into Trainer values (?, ?, ?, ?, ?)',[name, tId, type], function(err, results){
            if(err) throw err;
        });
        poolquery('select * from member where name=?', [member], function(err, results){
            if(err) return err;
            if(results.length>0){
                pool.query('insert into Train values (?, ?, ?, ?, ?)', [results.tId, trainer, mId, name, type],function(err, results){
                    if(err) throw err;
                    pool.query('select distinct(*) from Train, Member where Train.mId=Member.mId', function(err, results){
                        if(err) throw err;
                        res.locals.mFormat=function(date){
                            return moment(date).format('yyyy-MM-DD')
                        };
                        res.render('main_trainer', {data:results, warn:''});
                    });
                })
            }else{
                res.render('new_member', {warn: "member doesn't exist"});
            }
        })
});

module.exports = router;