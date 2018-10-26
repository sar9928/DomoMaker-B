const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const _ = require('underscore');

let DomoModel = {};

// mongoose.Types.ObjectID is a function that
// converts string ID to real mongo ID
const convertId = mongoose.Types.ObjectId;
const setName = (name) => _.escape(name).trim();

const models = require('../models');
const Domo = models.Domo;

const makeDomo = (req, res) => {
    if(!req.body.name || !req.body.age) {
        return res.status(400).json({ error: 'RAWR! Both name and age are required' });
    }

    const domoData = {
        name: req.body.name,
        age: req.body.age,
        owner: req.session.account._id,
    };

    const newDomo = new DomoModel(domoData);

    const domoPromise = newDomo.save();

    domoPromise.then(() => res.json({ redirect: '/maker' }));

    domoPromise.catch((err) => {
        console.log(err);
        if(err.code === 11000) {
            return res.status(400).json({ error: 'Domo already exists.' });
        }

        return res.status(400).json({ error: 'An error occured' });
    });

    return domoPromise;
};

const DomoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        set: setName,
    },

    age: {
        type: Number,
        min: 0,
        required: true,
    },

    owner: {
        type: mongoose.Schema.ObjectId,
        require: true,
        ref: 'Account',
    },

    createdData: {
        type: Date,
        default: Date.now,
    },
});

DomoSchema.statics.toAPI = (doc) => ({
    name: doc.name,
    age: doc.age,
});

DomoSchema.statics.findByOwner = (ownerId, callback) => {
    const search = {
        owner: convertId(ownerId),
    };

    return DomoModel.find(search).select('name age').exec(callback);
};

DomoModel = mongoose.model('Domo', DomoSchema);

const makerPage = (req, res) => {
    DomoModel.findByOwner(req.session.account._id, (err, docs) => {
        if(err) {
            console.log(err);
            return res.status(400).json({ error: 'An error occured' });
        }
        return res.render('app', { domos: docs });
    });
};



module.exports.make = makeDomo;
module.exports.makerPage = makerPage;
module.exports.DomoModel = DomoModel;
module.exports.DomoSchema = DomoSchema;



