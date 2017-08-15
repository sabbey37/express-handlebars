var express = require('express');
var router = express.Router();

const db = require('../db');

/* GET users listing. */
router.get('/:id', function(req, res, next) {
    db.one(`
        select * from cd.facilities where facid=${req.params.id};
      `)
        .then((result) => {
            res.render('facilities', { 
                facility: result,
                id: 'Facility Id: ' + result.facid,
                name: result.name,
                membercost: 'Member Cost: ' + result.membercost,
                guestcost: 'Guest Cost: ' + result.guestcost
            });
        })
      .catch((err) => {
          res.render('error', {
            message: err.message
          })
      })
});

module.exports = router;