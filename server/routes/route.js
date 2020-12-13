var express = require('express');
var router = express.Router();

//sql 연결------------------------------
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

//시간 포맷 맞추기 위한 moment
var moment = require('moment');
//------------------------------------------------------------------------------------------로그인------------------------------------------------------------------------------------------
//첫 로그인 페이지------------------------------
router.get('/', function (req, res, next) {
    res.render('login', {
        data: ''
    });
});

//로그아웃 눌럿을때 -> 첫 로그인 페이지------------------------------
router.get('/logout', function (req, res, nets) {
    res.render('login', {
        data: ''
    });
})

//로그인 시도------------------------------
router.get('/login', function (req, res, next) {
    var Id = req.param("Id");
    var Pw = req.param("Pw");
    pool.query('select * from Administrator where Id=? and Pw=?', [Id, Pw], function (err, results) {
        if (err) throw err;
        //로그인 성공 -> 메인페이지
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
            //로그인 실패
        } else {
            res.render('login', {
                data: 'wrong ID/PW'
            });
        }
    });
});

//사용자 등록 페이지------------------------------
router.get('/signin', function (req, res, next) {
    res.render('signin', {
        data: ''
    });
});

//사용자 등록------------------------------
router.get('/signin_add', function (req, res, next) {
    var MASTER_PW = req.param("MASTER_PW");
    var Id = req.param("Id");
    var Pw = req.param("Pw");
    var type = req.param("type");
    pool.query('select * from Master where Pw=?', [MASTER_PW], function (err, results) {
        if (err) throw err;
        //등록 ok
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
            //등록 fail
        } else {
            res.render('signin', {
                data: 'wrong MASTER PW'
            });
        }
    });
});

//------------------------------------------------------------------------------------------멤버------------------------------------------------------------------------------------------
//메인 페이지 search_member------------------------------
router.get('/search_member', function (req, res, next) {
    var input = req.param('input');
    console.log(input);
    pool.query('select * from (select Member.mId, Member.name, birthDate, Member.type, startDate, endDate, Trainer.name trainer from Member, Trainer where Member.mId=Trainer.mId union select Member.mId, Member.name, birthDate, Member.type, startDate, endDate, null from Member, Trainer where (Member.mId) not in (select mId from Trainer))y where ?=mId or ?=name or ?=type or ?=trainer order by mId', [input, input, input, input], function (err, results) {
        if (err) throw err;
        //검색 결과가 있음
        if (results.length > 0 && input!='') {
            res.locals.mFormat = function (date) {
                return moment(date).format('yyyy-MM-DD')
            };
            res.render('main_member', {
                data: results,
                warn: ''
            })
            //검색 결과가 없음
        } else {
            pool.query('select Member.mId, Member.name, birthDate, Member.type, startDate, endDate, Trainer.name trainer from Member, Trainer where Member.mId=Trainer.mId union select Member.mId, Member.name, birthDate, Member.type, startDate, endDate, null from Member, Trainer where (Member.mId) not in (select mId from Trainer) order by mId', function (err, results) {
                if (err) throw err;
                res.locals.mFormat = function (date) {
                    return moment(date).format('yyyy-MM-DD')
                };
                res.render('main_member', {
                    data: results,
                    warn: 'no data match'
                });
            });
        }
    });
});

//메인 페이지 to-trainer------------------------------
router.get('/to_trainer', function (req, res, next) {
    pool.query('select tId, Trainer.name, Trainer.type, Member.name mem from Trainer, Member where Trainer.mId=Member.mId order by tId', function (err, results) {
        res.render('main_trainer', {
            data: results,
            warn: ''
        });
    });
});

//메인 페이지 member_modify------------------------------
router.get('/member_modify', function (req, res, next) {
    var mId = req.param("mId");
    var name = req.param('name');
    var type = req.param("type");
    var startDate = req.param("startDate");
    var endDate = req.param("endDate");
    var trainer = req.param("trainer");
    //멤버 새로운 정보 업데이트
    pool.query('update Member set type=?, startDate=?, endDate=? where ?=mId', [type, startDate, endDate, mId], function (err, results) {
        if (err) throw err;
        pool.query('select Member.mId, Member.name, birthDate, Member.type, startDate, endDate, Trainer.name trainer from Member, Trainer where Member.mId=Trainer.mId union select Member.mId, Member.name, birthDate, Member.type, startDate, endDate, null from Member, Trainer where (Member.mId) not in (select mId from Trainer) order by mId', function (err, results) {
            if (err) throw err;
            res.locals.mFormat = function (date) {
                return moment(date).format('yyyy-MM-DD')
            };
            res.render('main_member', {
                data: results,
                warn: 'member modified'
            });
        });
    });
});

//메인 페이지 member_delete------------------------------
router.get('/member_delete', function (req, res, next) {
    var mId = req.param("mId");
    pool.query('delete from Member where mId=?', [mId], function (err, results) {
        if (err) throw err;
        //삭제 완료후 -> 새로고침
        pool.query('select Member.mId, Member.name, birthDate, Member.type, startDate, endDate, Trainer.name trainer from Member, Trainer where Member.mId=Trainer.mId union select Member.mId, Member.name, birthDate, Member.type, startDate, endDate, null from Member, Trainer where (Member.mId) not in (select mId from Trainer) order by mId', function (err, results) {
            if (err) throw err;
            res.locals.mFormat = function (date) {
                return moment(date).format('yyyy-MM-DD')
            };
            res.render('main_member', {
                data: results,
                warn: 'member deleted'
            });
        });
    });
});

//new_member 페이지------------------------------
router.get('/new_member_ent', function (req, res, next) {
    res.render('new_member', {
        warn: ''
    });
});

//new_member 등록------------------------------
router.get('/new_member', function (req, res, next) {
    var name = req.param("name");
    var birthDate = req.param('birthDate');
    var type = req.param('type');
    var startDate = req.param('startDate');
    var endDate = req.param('endDate');
    //필요 정보를 넣어주라고 warn
    if (name == null || type == null || startDate == null || endDate == null) {
        res.render('new_member', {
            data: results,
            warn: 'input correctly'
        });
    }
    //mId 계산해서 멤버 등록
    var mId;
    pool.query('select max(mId) max from Member', function (err, results) {
        if (err) throw err;
        mId = results[0].max + 1;
        pool.query('insert into Member values (?, ?, ?, ?, ?, ?)', [name, mId, birthDate, type, startDate, endDate], function (err, results) {
            if (err) throw err;
            //등록 완료 된후 -> 메인 페이지
            pool.query('select Member.mId, Member.name, birthDate, Member.type, startDate, endDate, Trainer.name trainer from Member, Trainer where Member.mId=Trainer.mId union select Member.mId, Member.name, birthDate, Member.type, startDate, endDate, null from Member, Trainer where (Member.mId) not in (select mId from Trainer) order by mId', function (err, results) {
                if (err) throw err;
                res.locals.mFormat = function (date) {
                    return moment(date).format('yyyy-MM-DD')
                };
                res.render('main_member', {
                    data: results,
                    warn: 'member added'
                });
            });
        });
    });
});

//------------------------------------------------------------------------------------------트레이너------------------------------------------------------------------------------------------
//메인페이지 search_trainer------------------------------
router.get('/search_trainer', function (req, res, next) {
    var input = req.param('input');
    pool.query('select * from (select tId, Trainer.name, Trainer.type, Member.name mem from Trainer, Member where Trainer.mId=Member.mId order by tId)y where ?=tId or ?=name or ?=type or ?=mem order by tId', [input, input, input, input], function (err, results) {
        if (err) throw err;
        //검색 결과가 있음
        if (results.length > 0 && input!='') {
            res.render('main_trainer', {
                data: results,
                warn: ''
            })
            //검색 결과가 없음
        } else {
            pool.query('select tId, Trainer.name, Trainer.type, Member.name mem from Trainer, Member where Trainer.mId=Member.mId order by tId', function (err, results) {
                res.render('main_trainer', {
                    data: results,
                    warn: 'no data match'
                });
            });
        }
    });
});

//메인 페이지 to_member------------------------------
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

//메인 페이지 trainer_modify------------------------------
router.get('/trainer_modify', function (req, res, next) {
    var tId = req.param("tId");
    var name;
    var type = req.param("type");
    var member = req.param("member");
    var mId;
    pool.query('select mId, name from Trainer where ?=tId', [tId], function (err, results) {
        if (err) throw err;
        if (results.length < 0) throw err;
        mId = results[0].mId;
        name = results[0].name;
        pool.query('update Trainer set name=?, type=?, mId=? where ?=tId', [name, type, mId, tId], function (err, results) {
            if (err) throw err;
            pool.query('select tId, Trainer.name, Trainer.type, Member.name mem from Trainer, Member where Trainer.mId=Member.mId order by tId', function (err, results) {
                res.render('main_trainer', {
                    data: results,
                    warn: 'trainer modified'
                });
            });
        });
    });
});

//메인 페이지 trainer_delete------------------------------
router.get('/trainer_delete', function (req, res, next) {
    var tId = req.param("tId");
    console.log(tId);
    pool.query('delete from Trainer where ?=tId', [tId], function (err, results) {
        if (err) throw err;
        pool.query('select tId, Trainer.name, Trainer.type, Member.name mem from Trainer, Member where Trainer.mId=Member.mId order by tId', function (err, results) {
            res.render('main_trainer', {
                data: results,
                warn: 'trainer deleted'
            });
        });
    });
});

//new_trainer 페이지------------------------------
router.get('/new_trainer_ent', function (req, res, next) {
    res.render('new_trainer', {
        warn: ''
    });
});

//new_treainer 등록------------------------------
router.get('/new_trainer', function (req, res, next) {
    var name = req.param("name");
    var type = req.param('type');
    var member = req.param('member');
    //필요 정보를 넣어주라고 warn
    if (name == '' || type == '') {
        res.render('new_trainer_ent', {
            data: results,
            warn: 'input correctly'
        });
    }
    //tId 계산해서 트레이너 등록
    var tId;
    pool.query('select max(tId) max from Trainer', function (err, results) {
        if (err) throw err;
        tId = results[0].max + 1;
        pool.query('insert into Trainer values (?, ?, ?, ?)', [name, tId, type, 0], function (err, results) {
            if (err) throw err;
            //등록후 -> 새로고침
            pool.query('select tId, Trainer.name, Trainer.type, Member.name mem from Trainer, Member where Trainer.mId=Member.mId order by tId', function (err, results) {
                res.render('main_trainer', {
                    data: results,
                    warn: 'trainer added'
                });
            });
        });
    });
});

module.exports = router;