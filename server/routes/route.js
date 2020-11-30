var express = require('express');
var router = express.Router();

var mysql = require('mysql2');
var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'tmddyd',
    database: 'YONG_fitness',
    connectionLimit: 10
});
pool.getConnection(function (err, conn) {
    if (err) {
        if (conn) {
            conn.release();
        }

        throw err;
    }
});

var moment = require('moment');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('login', {
        data: ''
    });
});

router.get('/logout', function (req, res, nets) {
    res.render('login', {
        data: ''
    });
})

router.get('/login', function (req, res, next) {
    var Id = req.param("Id");
    var Pw = req.param("Pw");
    pool.query('select * from Administrator where Id=? and Pw=?', [Id, Pw], function (err, results) {
        if (err) throw err;
        if (results.length > 0) {
            pool.query('select Member.mId, Member.name, birthDate, Member.type, startDate, endDate, Trainer.name trainer from Member, Trainer where Member.mId=Trainer.mId union select Member.mId, Member.name, birthDate, Member.type, startDate, endDate, null from Member, Trainer where (Member.mId) not in (select mId from Trainer) order by mId', function (err, results) {
                if (err) throw err;
                res.locals.mFormat = function (date) {
                    return moment(date).format('yyyy-MM-DD')
                };
                res.render('main_member', {
                    data: results,
                    warn: ''
                });
            });
        } else {
            res.render('login', {
                data: 'wrong ID/PW'
            });
        }
    });
});

router.get('/signin', function (req, res, next) {
    res.render('signin', {
        data: ''
    });
});

router.get('/signin_add', function (req, res, next) {
    var MASTER_PW = req.param("MASTER_PW");
    var Id = req.param("Id");
    var Pw = req.param("Pw");
    var type = req.param("type");
    pool.query('select * from Master where Pw=?', [MASTER_PW], function (err, results) {
        if (err) throw err;
        if (results.length > 0) {
            if (Id != '' && Pw != '' && type != '') {
                pool.query('insert into Administrator values (?, ?, ?)', [Id, Pw, type], function (err, results) {
                    if (err) throw err;
                });
                res.render('login', {
                    data: ''
                });
            } else {
                res.render('signin', {
                    data: 'type all data'
                });
            }
        } else {
            res.render('signin', {
                data: 'wrong MASTER PW'
            });
        }
    });
});

router.get('/search_member', function (req, res, next) {
    var input = req.param('input');
    console.log(input);
    pool.query('select * from (select Member.mId, Member.name, birthDate, Member.type, startDate, endDate, Trainer.name trainer from Member, Trainer where Member.mId=Trainer.mId union select Member.mId, Member.name, birthDate, Member.type, startDate, endDate, null from Member, Trainer where (Member.mId) not in (select mId from Trainer))y where ?=mId or ?=name or ?=type or ?=trainer order by mId', [input, input, input, input], function (err, results) {
        if (err) throw err;
        if (results.length > 0) {
            res.locals.mFormat = function (date) {
                return moment(date).format('yyyy-MM-DD')
            };
            res.render('main_member', {
                data: results,
                warn: ''
            })
        } else {
            pool.query('select Member.mId, Member.name, birthDate, Member.type, startDate, endDate, Trainer.name trainer from Member, Trainer where Member.mId=Trainer.mId union select Member.mId, Member.name, birthDate, Member.type, startDate, endDate, null from Member, Trainer where (Member.mId) not in (select mId from Trainer) order by mId', function (err, results) {
                if (err) throw err;
                res.locals.mFormat = function (date) {
                    return moment(date).format('yyyy-MM-DD')
                };
                res.render('main_member', {
                    data: results,
                    warn: 'no data found'
                });
            });
        }
    });
});

router.get('/to_trainer', function (req, res, next) {
    pool.query('select tId, Trainer.name, Trainer.type, Member.name mem from Trainer, Member where Trainer.mId=Member.mId order by tId', function (err, results) {
        res.render('main_trainer', {
            data: results,
            warn: ''
        });
    });
});

router.get('/member_modify', function (req, res, next) {
    var mId = req.param("mId");
    var name = req.param('name');
    var type = req.param("type");
    var startDate = req.param("startDate");
    var endDate = req.param("endDate");
    var trainer = req.param("trainer");
    pool.query('update Member set type=?, startDate=?, endDate=? where ?=mId', [type, startDate, endDate, mId], function (err, results) {
        if (err) throw err;
        pool.query('update Trainer set type=?, mId=? where ?=name', [type, mId, trainer], function (err, results) {
            if (err) throw err;
            pool.query('select Member.mId, Member.name, birthDate, Member.type, startDate, endDate, Trainer.name trainer from Member, Trainer where Member.mId=Trainer.mId union select Member.mId, Member.name, birthDate, Member.type, startDate, endDate, null from Member, Trainer where (Member.mId) not in (select mId from Trainer) order by mId', function (err, results) {
                if (err) throw err;
                res.locals.mFormat = function (date) {
                    return moment(date).format('yyyy-MM-DD')
                };
                res.render('main_member', {
                    data: results,
                    warn: 'modified'
                });
            });
        })
    });
});


router.get('/member_delete', function (req, res, next) {
    var mId = req.param("mId");
    pool.query('delete from Member where mId=?', [mId], function (err, results) {
        if (err) throw err;
        pool.query('select Member.mId, Member.name, birthDate, Member.type, startDate, endDate, Trainer.name trainer from Member, Trainer where Member.mId=Trainer.mId union select Member.mId, Member.name, birthDate, Member.type, startDate, endDate, null from Member, Trainer where (Member.mId) not in (select mId from Trainer) order by mId', function (err, results) {
            if (err) throw err;
            res.locals.mFormat = function (date) {
                return moment(date).format('yyyy-MM-DD')
            };
            res.render('main_member', {
                data: results,
                warn: 'deleted'
            });
        });
    });
});

router.get('/new_member_ent', function (req, res, next) {
    res.render('new_member', {
        warn: ''
    });
});

router.get('/new_member', function (req, res, next) {
    var name = req.param("name");
    var birthDate = req.param('birthDate');
    var type = req.param('type');
    var startDate = req.param('startDate');
    var endDate = req.param('endDate');
    if (type == null || startDate == null || endDate == null) {
        res.render('new_member', {
            data: results,
            warn: 'input correctly'
        });
    }
    var mId;
    pool.query('select max(mId) max from Member', function (err, results) {
        if (err) throw err;
        mId = results[0].max + 1;
        pool.query('insert into Member values (?, ?, ?, ?, ?, ?)', [name, mId, birthDate, type, startDate, endDate], function (err, results) {
            if (err) throw err;
        });
        pool.query('select Member.mId, Member.name, birthDate, Member.type, startDate, endDate, Trainer.name trainer from Member, Trainer where Member.mId=Trainer.mId union select Member.mId, Member.name, birthDate, Member.type, startDate, endDate, null from Member, Trainer where (Member.mId) not in (select mId from Trainer) order by mId', function (err, results) {
            if (err) throw err;
            res.locals.mFormat = function (date) {
                return moment(date).format('yyyy-MM-DD')
            };
            res.render('main_member', {
                data: results,
                warn: 'added'
            });
        });
    });
});

router.get('/search_trainer', function (req, res, next) {
    var input = req.param('input');
    pool.query('select * from (select tId, Trainer.name, Trainer.type, Member.name mem from Trainer, Member where Trainer.mId=Member.mId order by tId)y where ?=name or ?=type or ?=mem order by tId', [input, input, input], function (err, results) {
        if (err) throw err;
        if (results.length > 0) {
            res.render('main_trainer', {
                data: results,
                warn: ''
            })
        } else {
            pool.query('select tId, Trainer.name, Trainer.type, Member.name mem from Trainer, Member where Trainer.mId=Member.mId or der by tId', function (err, results) {
                res.render('main_trainer', {
                    data: results,
                    warn: 'no found data'
                });
            });
        }
    });
});

router.get('/to_member', function (req, res, next) {
    pool.query('select Member.mId, Member.name, birthDate, Member.type, startDate, endDate, Trainer.name trainer from Member, Trainer where Member.mId=Trainer.mId union select Member.mId, Member.name, birthDate, Member.type, startDate, endDate, null from Member, Trainer where (Member.mId) not in (select mId from Trainer) order by mId', function (err, results) {
        if (err) throw err;
        res.locals.mFormat = function (date) {
            return moment(date).format('yyyy-MM-DD')
        };
        res.render('main_member', {
            data: results,
            warn: ''
        });
    });
});

router.get('/trainer_modify', function (req, res, next) {
    var tId = req.param("tId");
    var name = req.param('name');
    var type = req.param("type");
    var member = req.param("member");
    var mId;
    pool.query('select mId from Trainer where ?=tId', [tId], function (err, results) {
        if (err) throw err;
        if (results.length < 0) throw err;
        mId = results[0].mId;
        pool.query('update Trainer set name=?, type=?, mId=? where ?=tId', [name, type, mId, tId], function (err, results) {
            if (err) throw err;
            pool.query('select tId, Trainer.name, Trainer.type, Member.name mem from Trainer, Member where Trainer.mId=Member.mId order by tId', function (err, results) {
                res.render('main_trainer', {
                    data: results,
                    warn: 'modified'
                });
            });
        });
    });
});

router.get('/trainer_delete', function (req, res, next) {
    var tId = req.param("tId");
    console.log(tId);
    pool.query('delete from Trainer where ?=tId', [tId], function (err, results) {
        if (err) throw err;
        pool.query('select tId, Trainer.name, Trainer.type, Member.name mem from Trainer, Member where Trainer.mId=Member.mId order by tId', function (err, results) {
            res.render('main_trainer', {
                data: results,
                warn: 'deleted'
            });
        });
    });
});

router.get('/new_trainer_ent', function (req, res, next) {
    res.render('new_trainer', {
        warn: ''
    });
});

router.get('/new_trainer', function (req, res, next) {
    var name = req.param("name");
    var type = req.param('type');
    var member = req.param('member');
    if (name == '' || type == '') {
        res.render('new_trainer_ent', {
            data: results,
            warn: 'input correctly'
        });
    }
    var tId;
    pool.query('select max(tId) max from Trainer', function (err, results) {
        if (err) throw err;
        tId = results[0].max + 1;
        pool.query('insert into Trainer values (?, ?, ?, ?)', [name, tId, type, 0], function (err, results) {
            if (err) throw err;
            pool.query('select tId, Trainer.name, Trainer.type, Member.name mem from Trainer, Member where Trainer.mId=Member.mId order by tId', function (err, results) {
                res.render('main_trainer', {
                    data: results,
                    warn: 'added'
                });
            });
        });
    });
});

module.exports = router;