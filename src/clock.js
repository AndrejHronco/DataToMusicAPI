/**
 * @fileOverview WebAudio buffer-based clock. Somewhat precise. But buggy.
 * @module clock
 */

/**
 * Creates a new instance of clock. Don't put "new".
 * @function module:clock.clock
 * @param [bpm=60] {number} Tempo in beats-per-minute. Recommended value range is around 60-140.
 * @param [subDiv=4] {integer} Sub division / tick speed. Recommended: 4, 8, 16, etc.
 * @returns {dtm.clock} a new clock object
 * @example
 *
 * var cl = dtm.clock(120);
 * cl.start();
 */
dtm.clock = function (bpm, subDiv, time) {
    var clock = {
        type: 'dtm.clock',

        interval: 1,

        time: [4, 4],
        beat: 0,

        list: [],

        params: {
            isOn: false,
            sync: false,
            bpm: 60,
            subDiv: 4,
            random: 0,
            swing: 0.5
        },

        // CHECK: just for debugging
        callbacks: []
    };

    clock.params.tempo = clock.params.bpm;

    // private
    var callbacks = [];

    // member?
    var curTime = 0.0;

    /**
     * Set the main parameters of the clock.
     * @function module:clock#set
     * @param bpm {number}
     * @param [subDiv] {number}
     * @returns {dtm.clock}
     */
    clock.set = function (bpm, subDiv) {
        if (typeof(bpm) !== 'undefined') {
            clock.params.bpm = bpm;
            clock.params.sync = false;
        }
        if (typeof(params.subDiv) !== 'undefined') {
            clock.params.subDiv = subDiv;
        }

        return clock;
    };

    /**
     * Sets the clock to be synced to the master clock. When set true, the tempo/BPM in itself is ignored.
     * @function module:clock#sync
     * @param [bool=true] {boolean}
     * @returns {dtm.clock}
     */
    clock.sync = function (bool) {
        if (typeof(bool) === 'undefined') {
            bool = true;
        }

        clock.params.sync = bool;
        return clock;
    };

    /**
     * Sets the speed of the clock in BPM,
     * @method module:clock#bpm
     * @param val {number} BPM value
     * @returns {dtm.clock} self
     * @chainable
     * @example
     *
     * var cl = dtm.createClock();
     * cl.setBpm(90);
     */
    clock.bpm = function (val) {
        if (!arguments || !val) {
            clock.params.bpm = 60;
            return clock;
        }
        clock.params.bpm = val;
        clock.tempo = val;
        return clock;
    };

    /**
     * Same as bpm().
     * @function module:clock#tempo
     */
    clock.tempo = clock.bpm;

    /**
     * Sets the subdivision of the clock.
     * @param [val=4] {integer} Note quality value. E.g. 4 = quarter note, 8 = eighth note.
     * @returns {dtm.clock}
     */
    clock.subDiv = function (val) {
        val = val || 4;
        clock.params.subDiv = val;
        return clock;
    };

    clock.div = clock.subdiv = clock.subDiv;

    clock.setTime = function (input) {
        if (typeof(input) === 'Array') {
            clock.time = input;
        } else if (typeof(input) === 'string') {
            clock.time = input.split('/');
        }
        return clock;
    };

    /**
     * Registers a callback function to selected or all ticks of the clock.
     * @function module:clock#add
     * @param cb {function} Callback function.
     * @param [name] {string}
     * @returns {dtm.clock} self
     */
    clock.add = function (cb, name) {
        // prevent adding identical functions
        var dupe = false;

        if (typeof(name) === 'string') {
            _.forEach(clock.callbacks, function (stored) {
                if (stored.name == name) {
                    dtm.log('clock.add(): identical function exists in the callback list');

                    dupe = true;
                }
            });

            if (!dupe) {
                dtm.log('adding a new callback function to clock');
                clock.callbacks.push(cb);
            }
        } else {
            _.forEach(clock.callbacks, function (stored) {
                if (_.isEqual(stored, cb)) {
                    dtm.log('clock.add(): identical function exists in the callback list');

                    dupe = true;
                }
            });

            if (!dupe) {
                dtm.log('adding a new callback function to clock');
                clock.callbacks.push(cb);
            }
        }

        return clock;
    };

    clock.register = clock.reg = clock.add;

    ///**
    // * Registers a callback function to selected or all ticks of the clock.
    // * @function module:clock#add
    // * @param cb {function} Callback function.
    // * @param [beats] {array} Sequence of beat numbers (int) on which the callback function should be called. The default is the every beat.
    // * @returns {dtm.clock} self
    // */
    //clock.addToBeats = function (cb, iArr) {
    //    if (arguments.length == 1) {
    //        // CHECK: broken - changing the subdiv later should change this too?
    //        // maybe disable the registration for certain beats
    //        beats = _.range((clock.params.subDiv * clock.time[0] / clock.time[1]));
    //    }
    ////        if (_.findKey(cb, 'modelName')) {
    ////            cb.addParentClock(clock); // CHECK: risky
    ////        }
    ////
    ////        console.log(_.findKey(cb, 'modelName'));
    //
    //    clock.callbacks.push([cb, beats]);
    //    return clock;
    //};

    /**
     * @function module:clock#remove
     * @param id {function|string}
     * @returns {dtm.clock}
     */
    clock.remove = function (id) {
        if (typeof(id) === 'function') {
            dtm.log('removing a calblack function');
            _.remove(clock.callbacks, function (cb) {
                return _.isEqual(cb, id);
            });
        } else if (typeof(id) === 'string') {
            dtm.log('removing a calblack function: ' + id);
            _.remove(clock.callbacks, function (cb) {
                return cb.name == id;
            });
        }

        return clock;
    };

    /**
     * @function module:clock#rem
     * @param id {function|string}
     * @returns {dtm.clock}
     */
    clock.rem = clock.remove;

    /**
     * Modifies or replaces the content of a callback function while the clock may be running. Note that the target callback needs to be a named function.
     * @function module:clock#modify
     * @param id {function|string}
     * @param [fn] {function}
     * @returns {dtm.clock}
     */
    clock.modify = function (id, fn) {
        if (typeof(id) === 'function') {
            dtm.log('modifying the callback: ' + id.name);
            clock.remove(id.name);
            clock.add(id);
        } else if (typeof(id) === 'string') {
            dtm.log('modifying the callback: ' + id);
            clock.remove(id);

            // CHECK: don't add if the same name doesn't already exist
            if (fn.name == '') {
                // fn.name is read-only!
                var temp = new Function(
                    'return function ' + id + fn.toString().slice(8)
                )();
                clock.add(temp);
            } else {
                clock.add(fn);
            }
        }
        return clock;
    };

    clock.replace = clock.mod = clock.modify;

    /**
     * Starts the clock.
     * @function module:clock#start
     * @returns {dtm.clock} self
     */
    clock.start = function (timeErr) {
        dtm.log('starting a clock');

        if (clock.params.isOn !== true) {
            clock.params.isOn = true;
            clock.tick();

            if (!clock.params.isMaster) {
                dtm.clocks.push(clock);
            }
        }
        return clock;
    };

    clock.run = clock.play = clock.start;

    var clockSrc;

    /**
     * Makes the clock tick once.
     * @param [timeErr=0] {float}
     * @returns clock {dtm.clock}
     */
    clock.tick = function (timeErr) {
        timeErr = timeErr || 0;
//            if (isNaN(timeErr)) {
//                timeErr = 0;
//            }
        if (clock.params.isOn) {

            if (!clock.params.sync && !clock.params.isMaster) {
                clockSrc = actx.createBufferSource();
                clockSrc.buffer = clockBuf;
                clockSrc.connect(out());

                var freq = clock.params.bpm / 60.0 * (clock.params.subDiv / 4.0);
                //var pbRate = 1/(1/freq - Math.abs(timeErr));

                clockSrc.playbackRate.value = freq * clMult;
                clockSrc.playbackRate.value += clockSrc.playbackRate.value * clock.params.random * _.sample([1, -1]);

                if (clock.beat % 2 == 0) {
                    clockSrc.playbackRate.value *= (1.0 - clock.params.swing) / 0.5;
                } else {
                    clockSrc.playbackRate.value *= clock.params.swing / 0.5;
                }

                clockSrc.start(now() + 0.0000001);

                clockSrc.onended = function () {
                    curTime += 1/freq;
                    var error = now() - curTime;
                    //clock.tick(error);
                    clock.tick();
//                curTime = now();
                };

                _.forEach(clock.callbacks, function (cb) {
                    cb(clock);
                });

                clock.beat = (clock.beat + 1) % (clock.params.subDiv * clock.time[0] / clock.time[1]);

                return clock;

            } else if (clock.params.sync && !clock.params.isMaster) {

                return clock;
            } else if (clock.params.isMaster) {
                clockSrc = actx.createBufferSource();
                clockSrc.buffer = clockBuf;
                clockSrc.connect(out());

                var freq = clock.params.bpm / 60.0 * (clock.params.subDiv / 4.0);

                clockSrc.playbackRate.value = freq * clMult;
                clockSrc.playbackRate.value += clockSrc.playbackRate.value * clock.params.random * _.sample([1, -1]);

                if (clock.beat % 2 == 0) {
                    clockSrc.playbackRate.value *= (1.0 - clock.params.swing) / 0.5;
                } else {
                    clockSrc.playbackRate.value *= clock.params.swing / 0.5;
                }

                clockSrc.start(now() + 0.0000001);

                clockSrc.onended = function () {
                    curTime += 1/freq;
                    var error = now() - curTime;
                    clock.tick();

                    //return function (cb) {
                    //    cb();
                    //};
                };

                _.forEach(clock.callbacks, function (cb) {
                    cb(clock);
                });

                clock.beat = (clock.beat + 1) % (clock.params.subDiv * clock.time[0] / clock.time[1]);
            }

        }
    };

    // TODO: stopping system should remove these callbacks?
    clock.tickSynced = function () {
        if (clock.params.sync && clock.params.isOn) {
            if (dtm.master.clock.beat % Math.round(480/clock.params.subDiv) === 0) {
                _.forEach(clock.callbacks, function (cb) {
                    cb(clock);
                });
            }
        }
        return clock;
    };

    /**
     * Stops the clock.
     * @function module:clock#stop
     * @returns {dtm.clock} self
     */
    clock.stop = function () {
        dtm.log('stopping a clock');
        if (clock.params.isOn === true) {
            clock.params.isOn = false;
        }
        return clock;
    };

    clock.clear = function () {
        clock.callbacks = [];
        return clock;
    };

    /**
     * Applies swing to the every 2nd beat. (E.g. The 2nd 16th note in a 8th note interval).
     * @function module:clock#swing
     * @param [amt=0.5] {number} Percentage of swing. (E.g. 0.5(50%): straight, 0.75: hard swing, 0.4: pushed)
     * @returns {dtm.clock}
     */
    clock.swing = function (amt) {
        clock.params.swing = amt || 0.5;
        return clock;
    };

    clock.shuffle = clock.swing;


    /**
     * Randomize the timings of the ticks.
     * @function module:clock#randomize
     * @param amt {number} Amount of randomization per beat (0-1).
     * @returns {dtm.clock}
     */
    clock.randomize = function (amt) {
        clock.params.random = amt || 0;
        return clock;
    };

    clock.random = clock.randomize;
    clock.rand = clock.randomize;

    clock.resetNextBeat = function () {
        clock.beat = 0;
        return clock;
    };

    clock.flush = function () {
        return clock;
    };

    clock.when = function (arr, cb) {
        if (typeof(arr) !== 'undefined') {
            if (arr.indexOf(clock.beat) > -1) {
                if (typeof(cb) !== 'undefined') {
                    cb(clock);
                }
            }
        }
        return clock;
    };

    clock.notWhen = function (arr, cb) {
        if (typeof(arr) !== 'undefined') {
            if (arr.indexOf(clock.beat) == -1) {
                if (typeof(cb) !== 'undefined') {
                    cb(clock);
                }
            }
        }
        return clock;
    };

    if (!clock.params.isMaster && typeof(dtm.master) !== 'undefined') {
        dtm.master.clock.add(clock.tickSynced);
    }

    if (typeof(bpm) === 'number') {
        clock.params.bpm = bpm;
        clock.params.sync = false;
    } else if (typeof(bpm) === 'boolean') {
        clock.params.sync = bpm;
    }

    if (typeof(subDiv) !== 'undefined') {
        clock.params.subDiv = subDiv;
    }

    if (typeof(time) !== 'undefined') {
        clock.params.time = time;
    }

    return clock;
};

dtm.c = dtm.clock;