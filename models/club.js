const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClubSchema = new Schema({
    logo: String,
    nom: String,
    pays: String,
    joueurs: [],
});

const Club = mongoose.model('club', ClubSchema);

module.exports = Club;