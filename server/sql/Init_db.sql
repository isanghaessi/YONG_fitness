drop table if exists Train;
drop table if exists Member;
drop table if exists Trainer;
drop table if exists Administrator;
drop table if exists Master;

create table Master(
	Pw text not null,
    primary key(Pw(255))
);

CREATE TABLE Administrator (
    Id TEXT not null,
    Pw TEXT not null,
    type text,
    PRIMARY KEY (Id(255), type(255))
);

create table Trainer(
	name text,
    tId int not null,
    type text,
    primary key (tId)
);

CREATE TABLE Member (
    name TEXT,
    mId INT NOT NULL,
    birthDate DATE,
    type TEXT,
    startDate DATE,
    endDate DATE,
    PRIMARY KEY (mId)
);

create table Train(
	tId int,
    trainer text,
    mId int not null,
    member text,
    type text,
    foreign key(tId) references Trainer(tId) on delete set null,
    foreign key(mId) references Member(mId) on delete cascade
);

delete from Train;
delete from Member;
delete from Trainer;
delete from Administrator;
delete from Master;

insert into Master values ('0000');

insert into Administrator values('yong', '0000', 'boss');
insert into Trainer values('Mike', 1, 'Weight');
insert into Trainer values('Susan', 2, 'Swim');
insert into Trainer values('Sam', 3, 'Squash');

insert into Member values('Alfred', 1, '1996-12-31', 'All', '2020-11-29', '2021-11-29');
insert into Member values('Son', 2, '1994-03-28', 'Weight', '2020-10-15', '2021-01-15');
insert into Member values('Son', 3, '1986-01-22', 'Swim', '2020-03-01', '2021-03-01');
insert into Member values('Minho', 4, '2000-02-13', 'Squash', '2019-05-01', '2022-05-01');