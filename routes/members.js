var express = require('express');
var router = express.Router();
const db = require('../db');
const gm = require('gm');
const fs = require('fs');
const fileUpload = require('express-fileupload');

/* GET users listing. */
router.use(fileUpload());

router.get('/', function(req, res, next) {
    db.many(`
        select firstname, surname, memid from cd.members where memid > 0 order by surname;
      `)
        .then((result) => {
            res.render('members', {
                title: 'Members',
                subtitle: 'Click on a member to see their profile.', 
                members: result
            });
        })
});

router.get('/:id', function(req, res, next) {
    db.one(`
        select * from cd.members where memid=${req.params.id};
      `)
        .then((result) => {
            var picture=JSON.parse(result.picture);
            picture = new Buffer.from(picture);
            picture = picture.toString('base64');
            picture = "data:image/png;base64," + picture;
    
            res.render('member', { 
                member: result,
                picture: picture
            });
        })
      .catch((err) => {
          res.render('error', {
            message: err.message
          })
      })
});

router.get('/:id/edit', function(req, res, next) {
    db.one(`
        select * from cd.members where memid=${req.params.id};
      `)
        .then((result) => {
            res.render('member-form', { 
                member: result
            });
        })
      .catch((err) => {
          res.render('error', {
            message: err.message
          })
      })
});


router.post('/:id/edit', function(req, res, next) {
    if(!req.files) {
        return res.status(400).send('No files were uploaded.');
    }

    let picture = req.files.profile_picture.data;
    picture = gm(picture, `${res.memid}.png`).resize(25, 25).toBuffer(`PNG`, (err, buffer) => {
            if(err) return handle(err);
            return buffer;
        })
    
    picture = picture.sourceBuffer;  
    picture = picture.toJSON(picture);
    picture = JSON.stringify(picture);

    db.result(`
        update cd.members
            set
            firstname = '${req.body.firstname}', 
            surname = '${req.body.surname}',
            address = '${req.body.address}',
            zipcode = '${req.body.zipcode}',
            telephone = '${req.body.telephone}',
            picture =  '${picture}'
            where memid=${req.params.id};
      `)
        .then((result) => {
            db.one(`
        select * from cd.members where memid=${req.params.id};
        `)
        })
        .then((result) => {
            res.render('member-form', { 
                member: result
            });
        })
      
      .catch((err) => {
          res.render('error', {
            message: err.message
          })
      })
});

module.exports = router;
