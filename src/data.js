/**
 * @fileOverview Data object.
 * @module data
 */

/**
 * Creates a new dtm.data object, if the argument is empty, or a promise object, if the argument is a URL.
 * @function module:data.data
 * @param [arg] {string} URL to load or query the data
 * @param callback {function}
 * @returns {dtm.data | promise}
 */
dtm.data = function (arg, cb, type) {
    var params = {
        arrays: {},
        coll: [],

        keys: [],
        types: {},
        size: {}
    };

    var data = {
        type: 'dtm.data',

        /**
         * This can be used for promise callback upon loading data.
         * @name module:data#promise
         * @type {object}
         */
        promise: null
    };

    /**
     * Returns a clone of dtm.array object from the data.
     * @param id {string|integer} Key (string) or index (integer)
     * @returns {dtm.array}
     */
    data.get = function (param, id) {
        var out = null;

        if (typeof(param) === 'string') {
            switch (param) {
                case 'column':
                case 'arrays':
                case 'array':
                case 'arr':
                case 'a':
                    if (typeof(id) === 'number') {
                        if (id >= 0 && id < params.size['col']) {
                            return params.arrays[params.keys[id]].clone();
                        } else {
                            dtm.log('data.get(): index out of range');
                            return data;
                        }
                    } else if (typeof(id) === 'string') {
                        if (params.keys.indexOf(id) > -1) {
                            return params.arrays[id].clone();
                        } else {
                            dtm.log('data.get(): key does not exist');
                            return data;
                        }
                    } else {
                        dtm.log('data.get(): please specify array with index or name');
                        return params.arrays;
                    }

                case 'c':
                case 'collection':
                case 'col':
                case 'coll':
                    return params.coll;

                case 'row':
                case 'r':
                    return params.coll[id];

                case 'size':
                case 'dim':
                case 'dimension':
                    return params.size;

                case 'len':
                case 'length':
                    return params.size.row;

                case 'k':
                case 'key':
                case 'keys':
                case 'list':
                case 'names':
                    return params.keys;

                case 't':
                case 'type':
                case 'types':
                    return params.types;

                default:
                    return data;
            }
        } else if (typeof(param) === 'number') {
            if (param >= 0 && param < params.size['col']) {
                return params.arrays[params.keys[param]].clone();
            } else {
                dtm.log('data.get(): index out of range');
                return data;
            }
        } else {
            return data;
        }
    };

    data.set = function (res) {
        params.coll = res;
        params.keys = _.keys(params.coll[0]);
        setArrays();
        setTypes();
        setSize();
    };

    //if (type !== 'undefined') {
    //    // array, csv, json
    //    switch (type) {
    //        case 'array':
    //            break;
    //
    //        case 'CSV':
    //        case 'csv':
    //            break;
    //
    //        case 'JSON':
    //        case 'json':
    //
    //            break;
    //        default:
    //            break;
    //    }
    //}


    // TODO: make a dict for well-known APIs to load data nicely
    /**
     * Loads data from file, or query using URL for Rest-ful API. Passes the result data to the given callback function or the promise object.
     * @function module:data#load
     * @param url {string}
     * @param [cb] {function} A callback function.
     * @returns promise {promise}
     */
    data.load = function (url, cb) {
        data.promise = new Promise(function (resolve, reject) {
            var ext = url.split('.').pop(); // checks the extension

            if (ext === 'json') {
                var cbName = 'jsonp_callback_' + Math.round(100000 * Math.random());
                window[cbName] = function (res) {
                    delete window[cbName];
                    document.body.removeChild(script);

                    var keys = _.keys(res);

                    _.forEach(keys, function (val) {
                        // CHECK: this is a little too case specific
                        if (val !== 'response') {
                            params.coll = res[val];
                            params.keys = _.keys(params.coll[0]);
                            setArrays();
                            setTypes();
                            setSize();

                            resolve(data);
                            if (typeof(cb) !== 'undefined') {
                                cb(data);
                            }
                        }
                    });
                    //cb(data);
                };

                var script = document.createElement('script');
                script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + cbName;
                document.body.appendChild(script);

            } else {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);

                switch (ext) {
                    case 'txt':
                    case 'csv':
                        break;
                    //case 'json':
                    //    xhr.responseType = 'json';
                    //    break;
                    case 'wav':
                    case 'aif':
                    case 'aiff':
                    case 'ogg':
                    case 'mp3':
                        xhr.responseType = 'arraybuffer';
                        break;
                    default:
                        //xhr.responseType = 'blob';
                        break;
                }

                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        if (xhr.responseType === 'arraybuffer') {
                            dtm.wa.actx.decodeAudioData(xhr.response, function (buf) {
                                for (var c = 0; c < buf.numberOfChannels; c++) {
                                    var floatArr = buf.getChannelData(c);
                                    params.arrays['ch_' + c] = dtm.array(Array.prototype.slice.call(floatArr), 'ch_' + c);
                                }

                                //setArrays();
                                //setTypes();
                                //setSize();

                                resolve(data);

                                if (typeof(cb) !== 'undefined') {
                                    cb(data);
                                }
                            });
                        } else {
                            if (ext === 'csv') {
                                params.coll = dtm.parser.csvToJson(xhr.response);
                            } else {
                                // TODO: this only works for shodan
                                params.coll = JSON.parse(xhr.response)['matches'];
                            }
                            params.keys = _.keys(params.coll[0]);
                            setArrays();
                            setTypes();
                            setSize();

                            resolve(data);

                            if (typeof(cb) !== 'undefined') {
                                cb(data);
                            }
                        }
                    }
                };

                xhr.send();
            }
        });

        // CHECK: this doesn't work
        data.promise.get = function (arg) {
            data.promise.then(function (d) {
                data = d;
                return d.get(arg);
            });
            //return data.promise;
        };

        return data.promise;
    };

    //data.jsonp = function (url, cb) {
    //    data.promise = new Promise(function (resolve, reject) {
    //        var cbName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    //        window[cbName] = function (res) {
    //            delete window[cbName];
    //            document.body.removeChild(script);
    //            var keys = _.keys(res);
    //            _.forEach(keys, function (val) {
    //                if (val !== 'response') {
    //                    params.coll = res[val];
    //                    data.keys = _.keys(params.coll[0]);
    //                    setArrays();
    //                    setTypes();
    //                    setSize();
    //
    //                    resolve(data);
    //                    if (typeof(cb) !== 'undefined') {
    //                        cb(data);
    //                    }
    //                }
    //            });
    //            //cb(data);
    //        };
    //
    //        var script = document.createElement('script');
    //        script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + cbName;
    //        document.body.appendChild(script);
    //    });
    //
    //    return data.promise;
    //};


    function setArrays() {
        _.forEach(params.keys, function (key) {
            var a = dtm.array(_.pluck(params.coll, key), key);
            params.arrays[key] = a;
        })
    }

    function setTypes() {
        _.forEach(params.keys, function (key) {
            params.types[key] = params.arrays[key].get('type');
        })
    }

    function setSize() {
        params.size.col = params.keys.length;
        params.size.row = params.coll.length;
    }

    //data.capture = function () {
    //    return new Promise(function (resolve, reject) {
    //
    //    });
    //};

    /**
     * Returns a clone of the data object itself. It can be used when you don't want to reference the same data object from different places.
     * @function module:data#clone
     * @returns {dtm.data}
     */
    data.clone = function () {
        // CHECK: this may be broken
        return dtm.clone(data);
    };

    data.map = function () {
        return data;
    };

    data.stream = function (uri, rate) {
        return data;
    };

    if (typeof(arg) !== 'undefined') {
        if (typeof(arg) === 'string') {
            return data.load(arg);
        }
    } else {
        return data;
    }
};

dtm.load = dtm.d = dtm.data;
