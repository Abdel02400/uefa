const Club = require('./../models/club');
const fs = require('fs');

module.exports = function ClubRoute(app) {

    app.get('/clubs', (req, res) => {
        Club.find({}, {"_id":0,"__v":0}).then(clubs => {
            res.status(200).send(clubs);
        })
    })

    app.get('/uefa-club-image/:img', (req, res) => {
        var url = req.params.img;
        var img = fs.readFileSync('./uefa-club-image/' + url);
        res.writeHead(200, {'Content-Type': 'image/gif' });
        res.end(img, 'binary');
    })

}