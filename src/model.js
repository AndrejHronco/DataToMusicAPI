/**
 * @fileOverview Used to create a new instrument / musical models. Hopefully.
 * @module model
 */

// TODO: modeling - sharing information...

/**
 * @function module:model.model
 * @param [name] {string} Give it a unique name.
 * @param [categ] {string}
 * @returns a new model instance
 */
dtm.model = function (name, categ) {
    var params = {
        name: null,
        categ: 'none',
        categories: []
    };

    var model = {
        type: 'dtm.model',

        // assigning array or data/coll???
        //array: null,
        //data: null,
        parents: {},

        params: {},
        models: {}
    };

    model.get = function (param) {
        var out = null;

        switch (param) {
            case 'name':
                out = params.name;
                break;

            case 'category':
            case 'categ':
                out = params.categ;
                break;

            default:
                out = model;
                break;
        }
        return out;
    };

    model.set = function (arg) {
        return model;
    };

    /**
     * Sets the category of the model.
     * @function module:model#categ
     * @param categ {string}
     * @returns {dtm.model}
     */
    model.categ = function (categ) {
        params.categ = categ;
        return model;
    };

    model.load = function (name) {
        if (typeof(name) === 'string') {
            var load = _.find(dtm.modelColl, {params: {name: name}});

            if (typeof(load) !== 'undefined') {
                dtm.log('overriding an existing model: ' + name);
                model = load;

            } else {
                if (typeof(categ) === 'string') {
                    params.categ = categ;
                }

                dtm.log('registering a new model: ' + name);
                params.name = name;
                dtm.modelColl.push(model);
            }
        }

        return model;
    };

    model.mod = function (val) {
        return model;
    };

    model.modulate = model.mod;

    // CHECK: mapping an automatic modulation source???
    model.map = function (arrobj) {

        return model;
    };

    // for instr-type models
    model.start = function () {
        return model;
    };

    model.stop = function () {
        return model;
    };

    model.morphArrays = function (arrObj1, arrObj2, midx) {
        return model;
    };

    model.clone = function () {
        return model;
    };

    model.load(name);

    return model;
};

dtm.m = dtm.model;