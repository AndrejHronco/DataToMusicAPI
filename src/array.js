/**
 * @fileOverview Single dimensional array with built-in transformation functions.
 * @module array
 */

/**
 * Creates a new single dimensional array object with various transformation functions. The same helper functions from dtm.array can be used - but make sure to skip the first argument (the input array) and start from the second argument.
 *
 * @function module:array.array
 * @param arr {array}
 * @param [name] {string}
 * @returns array object {{value: null, normalized: null, length: null, min: null, max: null, mean: null}}
 */
dtm.array = function (arr, name) {
    var array = {
        type: 'dtm.array',

        params: {
            /**
             * The name of the array object.
             * @name module:array#name
             * @type {string}
             */
            name: '', // or key?

            /**
             * Value type of the array object.
             * @name module:array#type
             * @type {string}
             */
            type: null, // int, float, string, coll, mixed, date

            /**
             * Length of the array.
             * @name module:array#length
             * @type {integer}
             */
            length: null,

            /**
             * Minimum value of the array.
             * @name module:array#min
             * @type {number}
             */
            min: null,

            /**
             * Maximum value of the array.
             * @name module:array#max
             * @type {number}
             */
            max: null,

            /**
             * Mean value of the array.
             * @name module:array#mean
             * @type {number}
             */
            mean: null,

            /**
             * Standard deviation.
             * @name module:array#std
             * @type {number}
             */
            std: null,

            /**
             * The most frequent value or class.
             * @name module:array#mode
             */
            mode: null,

            original: null
        },


        /**
         * Numerical values of the array.
         * @name module:array#value
         * @type {array}
         */
        value: [],
        values: [],

        /**
         * Numerical values of the array rescaled to 0-1.
         * @name module:array#normalized
         * @type {array}
         */
        normalized: [],

        /**
         * When the data type is nominal / string, the string values are stored in this.
         * @name module:array#classes
         * @type array
         */
        classes: null,

        /**
         * Number of occurances per class.
         * @name module:array#histogram
         */
        histogram: null,
        numClasses: null,

        colls: null,

        index: 0
    };

    /**
     * Sets or overwrites the contents of the array object.
     * @function module:array#set
     * @param input {array}
     * @param [name] {string}
     * @returns {dtm.array}
     */
    array.set = function (input, name) {
        if (typeof(name) !== 'undefined') {
            array.setName(name);
        }

        // TODO: error checking
        array.value = input;
        array.values = input;

        // CHECK: kind of ugly
        if (typeof(array.params.original) === 'undefined') {
            array.params.original = input;
        }

        // CHECK: type checking - may be redundant
        checkType(input);

        if (array.params.type === 'number' || array.params.type === 'int' || array.params.type === 'float') {
            _.forEach(array.value, function (val, idx) {
                array.value[idx] = Number.parseFloat(val);
            });

            array.normalized = dtm.transform.normalize(input);
            array.params.min = dtm.analyzer.min(input);
            array.params.max = dtm.analyzer.max(input);
            array.params.mean = dtm.analyzer.mean(input);
            array.params.std = dtm.analyzer.std(input);
            array.params.mode = dtm.analyzer.mode(input);
        }

        if (array.params.type === 'string') {
            histo();
            array.params.mode = dtm.analyzer.mode(array.classes);
        }

        array.params.length = input.length;

        return array;
    };

    /**
     * Sets the name of the array object.
     * @function module:array#setName
     * @param name {string}
     * @returns {dtm.array}
     */
    array.setName = function (name) {
        array.params.name = name.toString();
        return array;
    };

    if (typeof(arr) !== 'undefined') {
        if (typeof(arr) === 'string') {
            arr = arr.split('');
        }

        checkType(arr);
        array.set(arr, name);
    }

    function checkType(arr) {
        //var summed = dtm.analyzer.sum(arr);
        //var res;
        //
        //if (isNaN(summed)) {
        //    res = 'string';
        //} else {
        //    if (summed.toString().indexOf('.') > -1) {
        //        res = 'float';
        //    } else {
        //        res = 'int';
        //    }
        //}

        // TODO: workaround for a missing value
        if (isNaN(arr[0])) {
            if (typeof(arr[0]) === 'object') {
                array.params.type = 'collection';
            } else {
                array.params.type = typeof(arr[0]);
            }
        } else {
            array.params.type = 'number';
        }

        //array.type = res;
    }


    // TODO: need this in transformer???
    ///**
    // * Generates a histogram from a nominal array, such as the string type.
    // * @function module:array#histo
    // * @returns {dtm.array}
    // */
    array.histo = histo;

    function histo() {
        array.classes = _.clone(array.value);
        array.histogram = _.countBy(array.value);
        //array.numClasses =

        _.forEach(array.classes, function (val, idx) {
            array.value[idx] = array.histogram[val];
        });

        array.set(array.value);
        array.params.type = 'string'; // re-set the type to string from number... hacky!

        return array;
    }

    /**
     * Returns a clone of the array object. It can be used when you don't want to reference the same array object from different places.
     * @function module:array#clone
     * @returns {dtm.array}
     */
    array.clone = function () {
        // this doesn't work
        //return dtm.clone(array);

        var newArr = dtm.array(array.values, array.params.name);
        if (array.params.type === 'string') {
            newArr.classes = array.classes;
            newArr.histogram = _.clone(array.histogram);
            newArr.params.type = 'string';
        }
        return newArr;
    };


    // CHECK: is this only for the array ojbect?
    /**
     * Fills the contents of the array with
     * @function module:array#fill
     * @param type {string} Choices: 'line', 'noise'/'random', 'gaussian'/'gauss'/'normal', 'sin'/'sine', 'cos'/'cosine', 'zeroes', 'ones'
     * @param [len=8] {integer}
     * @param [min=0] {number}
     * @param [max=1] {number}
     * @returns {dtm.array}
     */
    array.fill = function (type, len, min, max) {
        array.value = dtm.transform.generate(type, len, min, max);
        array.set(array.value);
        return array;
    };

    /**
     * Same as the fill() function.
     * @function module:array#generate
     * @param type {string} Choices: 'line', 'noise'/'random', 'sin'/'sine', 'cos'/'cosine', 'zeroes', 'ones'
     * @param [len=2] {integer}
     * @param [min=0] {number}
     * @param [max=1] {number}
     * @returns {dtm.array}
     */
    array.generate = array.fill;


    /**
     * Rescales the range of the numerical values to 0-1.
     * @function module:array#normalize
     * @param [min] {number}
     * @param [max] {number}
     * @returns {dtm.array}
     */
    array.normalize = function (min, max) {
        array.value = dtm.transform.normalize(array.value, min, max);
        array.set(array.value);
        return array;
    };

    /**
     * Modifies the range of the array.
     * @function module:array#rescale
     * @param min {number}
     * @param max {number}
     * @returns {dtm.array}
     */
    array.rescale = function (min, max) {
        array.value = dtm.transform.rescale(array.value, min, max);
        array.set(array.value);
        return array;
    };

    /**
     * Same as array.rescale().
     * @function module:array#range
     * @type {Function}
     */
    array.range = array.scale = array.rescale;

    // TODO: implement this
    array.limit = function (min, max) {
        return array;
    };

    /**
     * Adds a value to all the array elements.
     * @function module:array#add
     * @param val {number}
     * @returns {dtm.array}
     */
    array.add = function (val) {
        array.set(dtm.transform.add(array.value, val));
        return array;
    };

    /**
     * Scales the numerical array contents.
     * @function module:array#mult
     * @param val {number}
     * @returns {dtm.array}
     */
    array.mult = function (val) {
        array.set(dtm.transform.mult(array.value, val));
        return array;
    };

    /**
     * Flips the array contents horizontally.
     * @function module:array#mirror
     * @returns {dtm.array}
     */
    array.mirror = function () {
        array.value = dtm.transform.mirror(array.value);
        array.set(array.value);
        return array;
    };

    /**
     * Same as array.mirror().
     * @function module:array#reverse
     * @type {Function}
     */
    array.reverse = array.mirror;

    /**
     * Flips the numerical values vertically at the given center point.
     * @function module:array#invert
     * @param [center=meanVal] {number}
     * @returns {dtm.array}
     */
    array.invert = function (center) {
        array.value = dtm.transform.invert(array.value, center);
        array.set(array.value);
        return array;
    };

    /**
     * Same as array.invert().
     * @function module:array#flip
     * @type {Function}
     */
    array.flip = array.invert;

    /**
     * Randomizes the order of the array.
     * @function module:array#shuffle
     * @returns {dtm.array}
     */
    array.shuffle = function () {
        array.value = dtm.transform.shuffle(array.value);
        array.set(array.value);
        return array;
    };

    /**
     * Same as array.shuffle().
     * @function module:array#randomize
     * @type {Function}
     */
    array.randomize = array.shuffle;

    /**
     * Sorts the contents of numerical array.
     * @function module:array#sort
     * @returns {dtm.array}
     */
    array.sort = function () {
        array.value = dtm.transform.sort(array.value);
        array.set(array.value);
        return array;
    };

    /**
     * Concatenates new values to the contents.
     * @function module:array#concat
     * @param arr {array | dtm.array} A regular array or a dtm.array object.
     * @returns {dtm.array}
     */
    array.concat = function (arr) {
        arr = arr || [];
        var temp = array.value;
        if (arr instanceof Array) {
            temp = temp.concat(arr);
        } else if (arr.type === 'dtm.array') {
            temp = temp.concat(arr.value);
        }
        array.set(temp);
        return array;
    };

    /**
     * Repeats the contents of the current array.
     * @function module:array#repeat
     * @param count {integer}
     * @returns {dtm.array}
     */
    array.repeat = function (count) {
        array.value = dtm.transform.repeat(array.value, count);
        array.set(array.value);
        return array;
    };

    /**
     * Same as array.repeat().
     * @function module:array#rep
     * @type {Function}
     */
    array.rep = array.repeat;

    /**
     * Truncates some values either at the end or both at the beginning and the end.
     * @param arg1 {integer} Start bits to truncate. If the arg2 is not present, it will be the End bits to truncate.
     * @param [arg2] {integer} End bits to truncate.
     * @function module:array#truncate
     * @returns {dtm.array}
     */
    array.truncate = function (arg1, arg2) {
        array.value = dtm.transform.truncate(array.value, arg1, arg2);
        array.set(array.value);
        return array;
    };

    /**
     * Rounds float values of the array to integer values.
     * @function module:array#round
     * @returns {dtm.array}
     */
    array.round = function () {
        array.value = dtm.transform.round(array.value);
        array.set(array.value);
        return array;
    };

    /**
     * Quantizes float numbers to integer by flooring.
     * @function module:array#floor
     * @returns {dtm.array}
     */
    array.floor = function () {
        return array.set(dtm.transform.floor(array.value));
    };

    /**
     * Quantizes float numbers to integer by ceiling.
     * @function module:array#ceil
     * @returns {dtm.array}
     */
    array.ceil = function () {
        return array.set(dtm.transform.ceil(array.value));
    };

    /**
     * Shifts the indexing position of the array by the amount.
     * @function module:array#shift
     * @param amount {integer}
     * @returns {dtm.array}
     */
    array.shift = function (amount) {
        array.value = dtm.transform.shift(array.value, amount);
        array.set(array.value);
        return array;
    };

    /**
     * Scales the array with an exponential curve.
     * @function module:array#expCurve
     * @param factor {number}
     * @returns {dtm.array}
     */
    array.expCurve = function (factor) {
        var min = array.params.min;
        var max = array.params.max;
        var arr = dtm.transform.expCurve(array.normalized, factor);
        array.set(dtm.transform.rescale(arr, min, max));
        return array;
    };

    /**
     * Applies a logarithmic scaling to the array.
     * @function module:array#logCurve
     * @param factor {number}
     * @returns {dtm.array}
     */
    array.logCurve = function (factor) {
        var min = array.params.min;
        var max = array.params.max;
        var arr = dtm.transform.logCurve(array.normalized, factor);
        array.set(dtm.transform.rescale(arr, min, max));
        return array;
    };

    // TODO: there might be a memory leak / some inefficiency
    /**
     * Stretches or shrinks the length of the array into the specified length.
     * @function module:array#fit
     * @param len {integer}
     * @param [interp='linear'] {string}
     * @returns {dtm.array}
     */
    array.fit = function (len, interp) {
        //var newVal = dtm.transform.fit(array.value, len, interp);
        //delete array;
        //return dtm.array(newVal);

        array.value = dtm.transform.fit(array.value, len, interp);
        array.set(array.value);
        return array;
    };

    /**
     * Multiplies the length of the array by the given factor.
     * @function module:array#stretch
     * @param factor {number}
     * @param [interp='linear'] {string}
     * @returns {dtm.array}
     */
    array.stretch = function (factor, interp) {
        array.value = dtm.transform.stretch(array.value, factor, interp);
        array.set(array.value);
        return array;
    };

    /**
     * Morphs the array values with a target array / dtm.array values. The lengths can be mismatched.
     * @function module:array#morph
     * @param tgtArr {array | dtm.array}
     * @param morphIdx {number} between 0-1
     * @returns {dtm.array}
     */
    array.morph = function (tgtArr, morphIdx) {
        if (typeof(tgtArr) !== 'array') {
            if (tgtArr.type === 'dtm.array') {
                tgtArr = tgtArr.value;
            }
        }
        array.value = dtm.transform.morph(array.value, tgtArr, morphIdx);
        array.set(array.value);
        return array;
    };

    /**
     * Converts note values into a beat sequence.
     * @function module:array#notesToBeats
     * @param [resolution=4] {integer}
     * @returns {dtm.array}
     */
    array.notesToBeats = function (resolution) {
        resolution = resolution || 4;
        array.value = dtm.transform.notesToBeats(array.value, resolution);
        array.set(array.value);
        return array;
    };

    /**
     * Converts beat sequence into note values.
     * @function module:array#beatsToNotes
     * @param [resolution=4] {integer}
     * @returns {dtm.array}
     */
    array.beatsToNotes = function (resolution) {
        resolution = resolution || 4;
        array.value = dtm.transform.beatsToNotes(array.value, resolution);
        array.set(array.value);
        return array;
    };

    /**
     * Converts intervalic values into a beat sequence.
     * @function module:array#intervalsToBeats
     * @returns {dtm.array}
     */
    array.intervalsToBeats = function () {
        array.value = dtm.transform.intervalsToBeats(array.value);
        array.set(array.value);
        return array;
    };

    /**
     * Converts beat sequence into intervalic values.
     * @function module:array#beatsToIntervals
     * @returns {dtm.array}
     */
    array.beatsToIntervals = function () {
        array.value = dtm.transform.beatsToIntervals(array.value);
        array.set(array.value);
        return array;
    };

    /**
     * Converts beat sequence into an array of indices (or delays or onset-coordinate vectors.) Useful for creating time delay-based events.
     * @function module:array#beatsToIndices
     * @returns {dtm.array}
     */
    array.beatsToIndices = function () {
        array.value = dtm.transform.beatsToIndices(array.value);
        array.set(array.value);
        return array;
    };

    /**
     * Shorthand for notesToBeats() function.
     * @function module:array#ntob
     * @param resolution {integer}
     * @returns {dtm.array}
     */
    array.ntob = array.notesToBeats;

    /**
     * Shorthand for beatsToNotes() function.
     * @function module:array#bton
     * @param resolution {integer}
     * @returns {dtm.array}
     */
    array.bton = array.beatsToNotes;

    /**
     * Shorthand for intevalsToBeats() function.
     * @function module:array#itob
     * @returns {dtm.array}
     */
    array.itob = array.intervalsToBeats;

    /**
     * Shorthand for beatsToIntervals() function.
     * @function module:array#btoi
     * @returns {dtm.array}
     */
    array.btoi = array.beatsToIntervals;

    // CHECK: this is different from the trnsf function
    /**
     * Pitch quantize the array values.
     * @function module:array#pq
     * @param {array | string | numbers}
     * @returns {dtm.array}
     */
    array.pq = function () {
        var scale;

        if (arguments.length === 0) {
            scale = _.range(12);
        } else if (arguments[0] instanceof Array) {
            scale = arguments[0];
        } else if (typeof(arguments[0]) === 'string') {
            scale = dtm.scales[arguments[0].toLowerCase()];
        } else {
            scale = arguments;
        }
        return array.set(dtm.transform.pq(array.value, scale));
    };

    array.transpose = function (val) {
        return array;
    };

    /**
     * Half-wave rectify the values, modifying all negative values to 0.
     * @function module:array#hwr
     * @returns {dtm.array}
     */
    array.hwr = function () {
        array.set(dtm.transform.hwr(array.value));
        return array;
    };

    /**
     * Full-wave rectify the values, returning absolute values.
     * @function module:array#fwr
     * @returns {dtm.array}
     */
    array.fwr = function () {
        array.set(dtm.transform.fwr(array.value));
        return array;
    };

    /**
     * Same as the array.fwr() function.
     * @function module:array#abs
     * @returns {dtm.array}
     */
    array.abs = array.fwr;

    array.summarize = function () {
        return array;
    };

    /**
     * Returns the array contents or an analyzed value
     * @function module:array#get
     * @param [param] {string}
     * @returns {number|array|string}
     */
    array.get = function (param, opt) {
        var out;
        var type = typeof(param);

        if (type === 'number') {
            if (param < 0 || param >= array.params.length) {
                dtm.log('Index out of range');
                out = array.values[dtm.value.mod(param, array.params.length)];
            } else {
                out = array.values[param];
            }
        } else {
            switch (param) {
                case 'type':
                    out = dtm.params.type;
                    break;
                case 'len':
                case 'length':
                    out = array.params.length;
                    break;

                case 'min':
                    out = dtm.analyzer.min(array.values);
                    break;
                case 'max':
                    out = dtm.analyzer.max(array.values);
                    break;
                case 'mean':
                case 'average':
                case 'avg':
                    out = dtm.analyzer.mean(array.values);
                    break;
                case 'mode':
                    out = dtm.analyzer.mode(array.values);
                    break;
                case 'median':
                    out = dtm.analyzer.median(array.values);
                    break;
                case 'midrange':
                    out = dtm.analyzer.midrange(array.values);
                    break;
                case 'std':
                    out = dtm.analyzer.std(array.values);
                    break;
                case 'pstd':
                    out = dtm.analyzer.pstd(array.values);
                    break;
                case 'var':
                    out = dtm.analyzer.var(array.values);
                    break;
                case 'pvar':
                    out = dtm.analyzer.pvar(array.values);
                    break;

                case 'index':
                case 'idx':
                    break;

                case 'relative':
                case 'location':
                case 'loc':
                    break;

                case 'current':
                case 'curr':
                case 'cur':
                case 'now':
                case 'moment':
                    out = array.values[array.index];
                    break;

                case 'next':
                    array.index = dtm.value.mod(++array.index, array.params.length);
                    out = array.values[array.index];
                    break;

                case 'prev':
                case 'previous':
                    array.index = dtm.value.mod(--array.index, array.params.length);
                    out = array.values[array.index];
                    break;

                case 'palindrome':
                    break;

                case 'random':
                    out = array.values[_.random(0, array.params.length - 1)];
                    break;

                case 'urn':
                    break;

                case 'normalize':
                case 'normalized':
                    out = dtm.transform.normalize(array.values);
                    break;
                case 'classes':
                    break;
                case 'numClasses':
                    break;
                case 'histo':
                    break;

                default:
                    out = array.values;
                    break;
            }
        }

        return out;
    };

    /**
     * A shorthand for iterating through the array values. For more details and other iteration methods, please check the dtm.iterator.
     * @param [param='value'] {string}
     * @returns {value}
     */
    array.next = function (param) {
        if (typeof(param) === 'undefined') {
            param = 'value'
        }
        var out = array[param][array.index];
        array.index = dtm.value.mod(array.index + 1, array.params.length);
        return out;
    };

    /**
     * Retrieves the original values from when the array object was first created.
     * @function module:array#reset
     * @returns {dtm.array}
     */
    array.reset = function () {
        array.set(array.params.original);
        return array;
    };

    return array;
};

dtm.a = dtm.arr = dtm.array;