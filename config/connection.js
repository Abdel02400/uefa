const mongoose = require('mongoose');

var connection = mongoose.connect(
    'mongodb://localhost:27017/TPVENDREDI', { useNewUrlParser:true }
);
mongoose.set('useFindAndModify', false);

module.exports = connection;
