const https = require('https');
const fs = require('fs');
const cheerio = require('cheerio');
const express = require('express');
const bodyParser = require('body-parser');
const connection = require('./config/connection');
const Club = require('./models/club');
const ClubRoute = require('./routes/club');

var app = express();
const PORT = 8080;

// on defini le Body Parser
var urlencodedParser = bodyParser.urlencoded({
    extended: true
});
app.use(urlencodedParser);
app.use(bodyParser.json());

// on fait la Définition des CORS
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,charset=utf-8"');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});


const url = 'https://fr.uefa.com/uefachampionsleague/season=2019/clubs/';

connection.then(res => {
    console.log("Mongodb connecté");
    var path = getUEFALDCDOM(); // a éxécuter en premier
    var urlClubs = getClubsUrl('./uefa/uefa.html');
    getCLUBSDOM(urlClubs);
    getCLUBSLogo(urlClubs);
    addClubsToBdd();

    ClubRoute(app);

    app.listen(PORT, () => {
        console.log(`Serveur express écoutant le port ${PORT}...`)
    })



})

function getUEFALDCDOM() {
    var path = './uefa/uefa.html';
    https.get(url, (res) => {
        res.pipe(fs.createWriteStream(path));
        res.on('end', () => {
            console.log('Le fichier contenant les clubs qui participe a la LDC est enregistré');
        })
    })
    return path;
}

function getClubsUrl(path){

    var file = fs.readFileSync(path)

    const $ = cheerio.load(file.toString());
    var urlClubs = $('div.team-is-club a');

    return urlClubs;


}

function getCLUBSDOM(urlClubs) {
    Object.keys(urlClubs).forEach(function(key){
        if(urlClubs[key].attribs){
            var name = urlClubs[key].attribs.title;
            var href = urlClubs[key].attribs.href;
            var url = "https://fr.uefa.com" + href;

            https.get(url, (res) => {
            res.pipe(fs.createWriteStream('./uefa-club/'+ name +".html") );
            res.on('end', () => {
                console.log('Le dom du club : ' + name + " a été ajouté");
            })

        })

        }
    })
}

function getCLUBSLogo(urlClubs) {
    Object.keys(urlClubs).forEach(function(key){
        if(urlClubs[key].type === "tag") {
            var nameClub = urlClubs[key].attribs.title
            var urlLogoNotReplace = urlClubs[key].children[1].attribs.style;
            var urlLogo = urlLogoNotReplace.replace("background-image:url('",'').replace("')",'');

            https.get("" + urlLogo + "", (res) => {
                res.pipe(fs.createWriteStream('./uefa-club-image/'+ nameClub +".png") );
                res.on('end', () => {
                    console.log('Le logo du club : ' + nameClub + " a été ajouté ");
                })
            })
        }

    })
}

function getJoueursTable(list){

    var joueurTable = [];

    Object.keys(list).forEach(function(key) {
        if(list[key].attribs){
            var joueurTable2 = {};
            if(list[key].children[3].children[0].data !== "Entraîneur"){
                var postePlayer = list[key].children[3].children[0].data;
                var numberPlayer = parseInt(list[key].children[5].children[0].data);

                if(list[key].children[7].children[1]){
                    var lastnameAndfirstname = list[key].children[7].children[1].attribs.title;
                    var resSplit = lastnameAndfirstname.split(" ");
                    var lastNamePlayer =  resSplit[0];
                    var firstNamePlayer =  resSplit[1];
                }

                joueurTable2 = {
                    poste: postePlayer,
                    nom: lastNamePlayer,
                    prenom: firstNamePlayer,
                    numero: numberPlayer
                }

                joueurTable.push(joueurTable2);
            }
        }
    })
    return joueurTable;

}

function addClubsToBdd() {
    var pathDirClubDom = "./uefa-club/";
    var pathDirClubImage = "/uefa-club-image/";
    fs.readdir(pathDirClubDom, function(err, items) {
        items.forEach(function(file) {

            var pathClub = pathDirClubDom + file;
            var fileClub = fs.readFileSync(pathClub);
            const $ = cheerio.load(fileClub.toString());

            var urllogoClub;
            var nameClub;
            var countryClub;
            var playersClub;

            if($('h1.team-name.desktop').text()) nameClub =  $('h1.team-name.desktop').text();
            if($('span.team-country-name')) countryClub = $('span.team-country-name').text();

            var getNameFile = file.split('.html');

            urllogoClub = pathDirClubImage + getNameFile[0] + ".png";

            var listePlayers = $('li.squad--team-player');

            var playersClub = getJoueursTable(listePlayers);

            var clubJson = {
                logo: urllogoClub,
                nom: nameClub,
                pays: countryClub,
                joueurs: playersClub,
            }

            var club = new Club(clubJson);
            club.save().then(newClub => {
                console.log("club ajouté : " + newClub.nom);
            })


        })
    })
}
