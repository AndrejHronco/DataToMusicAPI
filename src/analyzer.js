/**
 * @fileOverview Analyze a thing or two about an array. Singleton.
 * @module analyzer
 */

dtm.analyzer = {
    className: 'dtm.analyzer',

    /**
     * Checks the data type of the input array.
     * @function module:analyzer#checkType
     * @param arr {array}
     * @returns type {string}
     */
    checkType: function (arr) {
        var sum = _.reduce(arr, function (num, sum) {
            num + sum;
        });

        if (typeof(sum) === 'string') {
            if (!isNaN(sum)) {
                if (sum.toString().indexOf('.') > -1) {
                    return 'float';
                } else {
                    return 'int';
                }
            } else {
                return 'string';
            }
        } else {
            return 'number';
        }
    },

    /**
     * Returns the minimum value of numeric array.
     * @function module:analyzer#min
     * @param arr {number}
     * @returns {T}
     */
    min: function (arr) {
        return _.min(arr);
    },

    /**
     * Returns the maximum value of numeric array.
     * @function module:analyzer#max
     * @param arr {number}
     * @returns {T}
     */
    max: function (arr) {
        return _.max(arr);
    },

    // CHECK: ugly!
    /**
     * Returns the mean of a numeric array.
     * @function module:analyzer#mean
     * @param arr {array} Input numerical array.
     * @returns val {number} Single mean value.
     * @example
     *
     * dtm.transform.mean([8, 9, 4, 0, 9, 2, 1, 6]);
     * -> 4.875
     */
    mean: function (arr) {
        var type = dtm.anal.checkType(arr);

        var sum = _.reduce(arr, function (num, sum) {
            return num + sum;
        });

        //if (type === 'int') {
        //    var sum = _.reduce(arr, function (num, sum) {
        //        return Number.parseInt(num) + Number.parseInt(sum);
        //    });
        //
        //    return sum / _.size(arr);
        //} else if (type === 'float') {
        //    var sum = _.reduce(arr, function (num, sum) {
        //        return Number.parseFloat(num) + Number.parseFloat(sum);
        //    });
        //
        //    return sum / _.size(arr);
        //} else {
        //    return null;
        //}

        return sum / _.size(arr);
    },

    /**
     * Returns the most frequent value of the array.
     * @function module:analyzer#mode
     * @param arr {array}
     * @returns {value}
     */
    mode: function (arr) {
        var uniqs = _.uniq(arr);
        var max = 0;
        var num = 0;
        var res = null;

        var histo = _.countBy(arr);

        _.forEach(uniqs, function (val) {
            num = histo[val];

            if (num > max) {
                res = val;
                max = num;
            }
        });

        return res;
    },

    median: function (arr) {

    },

    midrange: function (arr) {

    },

    // TODO: num string parsing
    /**
     * Simple summation.
     * @function module:analyzer#sum
     * @param arr
     * @returns {Mixed|*}
     */
    sum: function (arr) {
        var sum = _.reduce(arr, function (num, sum) {
            //if (!isNaN(num) && !isNaN(sum)) {
            //    if (num.toString().indexOf('.') > -1) {
            //        num = Number.parseFloat(num);
            //        sum = Number.parseFloat(sum);
            //    } else {
            //        num = Number.parseInt(num);
            //        sum = Number.parseInt(sum);
            //    }
            //}
            return num + sum;
        });

        return sum;
    },

    /**
     * Variance.
     * @function module:analyzer#var
     * @param arr
     * @returns {*}
     */
    var: function (arr) {
        var mean = dtm.analyzer.mean(arr);

        var res = [];
        _.forEach(arr, function (val, idx) {
            res[idx] = Math.pow((mean - val), 2);
        });

        return dtm.analyzer.sum(res) / (arr.length-1);
    },

    /**
     * Standard Deviation.
     * @function module:analyzer#std
     * @param arr
     * @returns {*}
     */
    std: function (arr) {
        return Math.sqrt(dtm.analyzer.var(arr));
    },

    /**
     * Population Variance.
     * @function module:analyzer#pvar
     * @param arr
     * @returns {*}
     */
    pvar: function (arr) {
        var mean = dtm.analyzer.mean(arr);

        var res = [];
        _.forEach(arr, function (val, idx) {
            res[idx] = Math.pow((mean - val), 2);
        });

        return dtm.analyzer.mean(res);
    },

    /**
     * Population Standard Deviation.
     * @function module:analyzer#pstd
     * @param arr
     * @returns {number}
     */
    pstd: function (arr) {
        return Math.sqrt(dtm.analyzer.pvar(arr));
    },

    /**
     * Root-Mean-Square value of given numerical array.
     * @function module:analyzer#rms
     * @param arr {array}
     * @returns rms {number}
     */
    rms: function (arr) {
        var res = [];
        _.forEach(arr, function (val, idx) {
            res[idx] = Math.pow(val, 2);
        });

        return Math.sqrt(dtm.analyzer.mean(res));
    },

    ///**
    // * Auto-correlation (WIP)
    // * @function module:analyzer#autoCorr
    // * @param arr {array}
    // * @returns arr {array}
    // */
    autoCorr: null
};

//dtm.analyzer.pvariance = dtm.analyzer.pvar;
dtm.anal = dtm.analyzer;

function blockWise(arr, blockSize, hopSize, cb) {
    // or return promise

    return {};
}