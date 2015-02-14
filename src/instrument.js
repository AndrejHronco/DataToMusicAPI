/**
 * @fileOverview The instrument object that makes some complex musical gestures. It can contain multiple models, and be modulated in various ways.
 * @module instr
 */

/**
 * Creates a new instance of dtm.instr object. If given a name, it either creates a new instrument with the name, or loads from the pre-registered instrument model collection.
 * @function module:instr.instr
 * @param [arg] {string|dtm.model}
 * @returns {dtm.instr}
 */
dtm.instr = function (arg) {
    var params = {
        name: null,
        isPlaying: false,
        poly: false,

        modDest: [],

        sync: true,
        clock: dtm.clock(true, 16),
        subDivision: 16,

        // default model coll
        models: {
            voice: dtm.synth(),
            volume: dtm.array(1),
            scale: dtm.array().fill('seq', 12),
            rhythm: dtm.array(1),
            pitch: dtm.array(0.5),
            transpose: dtm.array([0, 1]),
            chord: dtm.array(0)
        },

        instrModel: null,

        callbacks: []
    };

    var instr = {
        type: 'dtm.instrument',
        params: {}
    };

    /**
     * Returns a parameter of the instrument object.
     * @function module:instr#get
     * @param param {string}
     * @returns {*}
     */
    instr.get = function (param) {
        //return params[key];

        switch (param) {
            case 'name':
                return params.name;

            case 'isPlaying':
                return params.isPlaying;

            case 'c':
            case 'clock':
                return params.clock;

            case 'm':
            case 'model':
                return params.models[arguments[1]];

            default:
                break;
        }
    };

    // CHECK: when giving an array, should I clone it? ...probably yes
    instr.set = function (dest, src) {
        if (typeof(src) === 'number') {
            params.models[dest] = dtm.array(src);
        } else {
            if (src instanceof Array) {
                params.models[dest] = dtm.array(src);
            } else if (src.type === 'dtm.array') {
                //if (src.get('type') === 'string') {
                //    params.models[dest] = src.clone().classId();
                //} else {
                //}
                params.models[dest] = src.clone();
            } else if (src.type === 'dtm.model') {

            } else if (src.type === 'dtm.synth') {
                params.models[dest] = src;
            }
        }

        switch (dest) {
            case 'bpm':
            case 'tempo':
                break;

            case 'div':
            case 'subdiv':
            case 'subDiv':
                break;

            default:
                break;
        }
        return instr;
    };

    instr.load = function (arg) {
        if (typeof(arg) === 'string') {
            var model = _.find(dtm.modelColl, {params: {
                name: arg,
                categ: 'instr'
            }});

            if (typeof(model) !== 'undefined') {
                dtm.log('loading instrument model: ' + arg);
                params.instrModel = model;
                params.name = arg;
                //params.models = model.models;
                instr.model(model);
                //instr.play = params.instrModel.play;
                //instr.run = params.instrModel.run;

                // CHECK: not good
                params.modDest.push(model);
            } else {
                dtm.log('registering a new instrument: ' + arg);
                params.name = arg;
                params.categ = 'instr';
                dtm.modelColl.push(instr);
            }

        } else if (typeof(arg) !== 'undefined') {
            if (arg.params.categ === 'instr') {
                params.instrModel = arg; // TODO: check the class name
                instr.model(arg);
            }
        }

        return instr;
    };

    // TODO: implement
    instr.clone = function () {
        return instr;
    };

    /**
     * Sets a model for one of the parameters of the instrument.
     * @function module:instr#model
     * @param model {string|dtm.model|dtm.array}
     * @param [target='none'] {string}
     * @returns {dtm.instr}
     */
    instr.model = function () {
        var arg = arguments[0];
        var categ = 'none'; // TODO: WIP

        if (typeof(arguments[1]) === 'string') {
            categ = arguments[1];
        }

        // TODO: refactor...
        if (arg instanceof Array) {
            if (categ) {
                params.models[categ] = dtm.array(arg);
            } else {
                params.models['none'] = dtm.array(arg);
            }
        } else if (typeof(arg) === 'object') {
            if (arg.type === 'dtm.model') {
                if (arg.get('categ') === 'instr') {
                    // CHECK: ...
                    dtm.log('assigning model "' + arg.params.name + '" to category "' + categ + '"');
                    params.models[categ] = arg;
                    params.modDest.push(arg);
                } else if (arg.get('categ')) {
                    dtm.log('assigning model "' + arg.params.name + '" to category "' + arg.params.categ + '"');
                    params.models[arg.params.categ] = arg;
                    params.modDest.push(arg);
                } else if (categ) {
                    dtm.log('assigning model "' + arg.params.name + '" to category "' + categ + '"');
                    params.models[categ] = arg;
                    params.modDest.push(arg);
                }

            } else if (arg.type === 'dtm.array') {
                params.models[categ] = arg;
            }
        } else if (typeof(arg) === 'string') {
            var model = _.find(dtm.modelColl, {params: {
                name: arg
            }});

            if (typeof(model) !== 'undefined') {
                if (!categ) {
                    categ = model.params.categ;
                }

                dtm.log('assigning model "' + model.params.name + '" to category "' + categ + '"');
                params.models[categ] = model;
                params.modDest.push(model);
            }
        }

        return instr;
    };

    instr.map = function (src, dest) {
        if (src instanceof Array) {
            params.models[dest] = dtm.array(src).normalize();
        } else if (src.type === 'dtm.array') {
            // CHECK: assigning an array here is maybe not so smart...
            params.models[dest] = src.normalize();
        } else if (src.type === 'dtm.model') {

        }
        // use global index from the master

        return instr;
    };

    // CHECK: this is pretty memory-inefficient
    function defaultInstr(c) {
        var v = params.models.voice;
        var vol = params.models.volume.rescale(0.1, 1).get('next');
        var r = params.models.rhythm.normalize().round();
        var p = params.models.pitch.normalize().get('next');
        var sc = params.models.scale.normalize().scale(0,11).round().unique().sort().get();
        var tr = params.models.transpose.scale(-12, 12).get('mean');
        var ct = params.models.chord.normalize().scale(0, 12).round().unique().sort();

        if (ct.get('len') > 4) {
            ct.fit(4).round().unique().sort();
        }

        ct = ct.get();

        var nn = dtm.val.pq(dtm.val.rescale(p, 60, 96), sc) + Math.round(tr);

        _.forEach(params.callbacks, function (cb) {
            cb();
        });

        if (r.get('next')) {
            _.forEach(ct, function (val) {
                v.nn(nn + val).amp(vol).play();
            });
        }
    }

    /**
     * Starts performing the instrument.
     * @function module:instr#play
     * @returns {dtm.instr}
     */
    instr.play = function () {
        // should only play single voice / part / instance
        if (params.isPlaying !== true) {
            params.isPlaying = true;
            dtm.log('playing instr: ' + params.name);

            if (!params.instrModel) {
                // CHECK: ???
                params.clock.add(defaultInstr).start();
            }

            if (params.instrModel) {
                if (params.instrModel.get('categ') === 'instr') {
                    params.instrModel.stop();
                    params.instrModel.play();
                }
            }

            // register to the active instr list?
            dtm.master.activeInstrs.push(instr);
        } else {
            dtm.log('instrument ' + params.name + ' is already playing!');
        }

        return instr;
    };

    instr.start = instr.run = instr.play;

    instr.stop = function () {
        if (params.isPlaying === true) {
            params.isPlaying = false;
            dtm.log('stopping: ' + params.name);

            if (params.instrModel) {
                if (params.instrModel.params.categ === 'instr') {
                    params.instrModel.stop();
                }
            }

            params.clock.stop();
            params.clock.clear();

            params.callbacks = [];
        }
        return instr;
    };


    /**
     * Modulates the parameter(s) of the instrument.
     * @function module:instr#mod
     * @arg {number}
     * @returns {dtm.instr}
     */
    instr.mod = function () {
        params.transpose = dtm.val.rescale(modHandler(arguments[0]), -12, 12, true);

        if (typeof(arguments[0]) === 'number') {
            if (arguments.length === 1) {
                var val = arguments[0];
                _.forEach(params.modDest, function (dest) {
                    // MEMO: don't use arguments[n] in forEach
                    dest.mod(val);
                });

                //modHandler(dtm.val.rescale(val, -12, 12, true), params.transpose);

            } else {
                _.forEach(arguments, function (val, idx) {
                    if (params.modDest[idx]) {
                        params.modDest[idx].mod(val);
                    }
                });
            }

        } else if (typeof(arguments[0]) === 'string') {
            if (typeof(arguments[1] === 'number') && typeof(instr.params[arguments[0]]) !== 'undefined') {
                params[arguments[0]] = arguments[1]; // CHECK: ???????
            }

        } else if (typeof(arguments[0]) === 'object') {
            var keys = _.keys(arguments[0]);
            console.log(keys);
        }

        return instr;
    };

    function modHandler(src) {
        if (typeof(src) === 'number') {
            return src;
        } else if (typeof(src) === 'object') {
            if (src instanceof Array) {
                var a = dtm.array(src).normalize();
                return a.get('next');
            } else if (src.type === 'dtm.array') {
                return src.get('next');
            } else if (src.type === 'dtm.model') {

            }
        }
    }

    instr.modulate = instr.mod;



    /**
     * Sets the main voice / WebAudio synthesizer for the instrument.
     * @param arg {string|dtm.synth}
     * @returns {dtm.instr}
     */
    instr.voice = function (arg) {
        if (typeof(arg) === 'string') {
            params.models.voice.set(arg);
        }
        return instr;
    };

    instr.rhythm = function (arg) {
        return instr;
    };

    instr.clock = function (bpm, subDiv, time) {
        params.clock.bpm(bpm);
        params.clock.subDiv(subDiv);
        return instr;
    };

    instr.bpm = function (val) {
        params.clock.bpm(val);
        return instr;
    };

    instr.tempo = instr.bpm;

    instr.subDiv = function (val) {
        params.clock.subDiv(val);
        return instr;
    };

    instr.div = instr.subdiv = instr.subDiv;

    instr.sync = function (bool) {
        if (typeof(bool) === 'undefined') {
            bool = true;
        }
        params.clock.sync(bool);
        params.sync = bool;
        return instr;
    };

    instr.on = function (arg, cb) {
        switch (arg) {
            case 'note':
                params.callbacks.push(cb);
                break;
            default:
                break;
        }
        return instr;
    };

    instr.when = instr.on;

    instr.load(arg);

    return instr;
};

dtm.i = dtm.instrument = dtm.instr;
dtm.voice = dtm.instr;