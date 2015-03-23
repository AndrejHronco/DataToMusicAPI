(function () {
    var m = dtm.model('decatur', 'instr').register();

    var params = {
        name: 'Flute',

        score: true,
        midi: true,

        // only for score
        staves: 1,
        clef: 'g',
        durFx: ['rest', 'stacc', 'half', 'normal', 'tenuto', 'slur'],
        dynFx: ['pp', 'p', 'mp', 'mf', 'f', 'ff'],

        // only for MIDI
        bpm: dtm.master.clock.get('bpm'),

        voice: 'mono',
        measures: 4,
        time: '4/4',
        div: 8,
        update: 1,
        repeat: 2,
        repMap: [2, 3, 3, 3, 4, 5, 5, 6, 6, 6, 7, 7, 8, 9],

        divMap: [16, 8, 16, 8, 16],
        range: {
            'Flute': [60, 75, 93],
            'Cello': [36, 48, 72],
            'Piano': [60, 72, 84],
            'PianoL': [36, 48, 60],
            'Pad': [36, 54, 72],
            'Pulse': [60, 75, 93]
        },
        scale: [[0, 2, 7, 9], [2, 5, 7], [0, 2, 5, 7, 10], [0, 2, 5, 7], [0, 2, 4, 7, 9], [0, 2, 4, 6, 7], [2, 4, 6, 7, 9]],

        celloFx: ['arc', 'pizz']
    };

    var mods = {
        pitch: dtm.array().fill('normal', 8, 60, 72).round(),
        range: dtm.array(0.3),
        scale: dtm.array(params.scale[params.scale.length-1]),
        scaleSel: dtm.array(2),

        transp: dtm.array(0),
        //chord: dtm.array(0),

        pos: dtm.array(0),

        div: dtm.a(Math.round(params.divMap.length/2)),
        repeat: dtm.array(2),
        note: dtm.array().fill('line', 8),
        dur: dtm.array().fill('ones', 8),
        dyn: dtm.array().fill('zeros', 8),

        //density: dtm.array(8),
        activity: dtm.array(1)
    };

    var g = dtm.guido;
    var osc = dtm.osc;

    m.output = function (c) {
        c.div(params.div);
        var rep = params.repeat;
        var numNotes = params.div * params.measures;
        var pLen = Math.round(numNotes/rep);

        var range = mods.range.clone().fit(pLen, 'step');
        var low = Math.round((params.range[params.name][0] - params.range[params.name][1]) * range.get('mean') + params.range[params.name][1]);
        var high = Math.round((params.range[params.name][2] - params.range[params.name][1]) * range.get('mean') + params.range[params.name][1]);
        var nArr = mods.note.clone().scale(0.1, 1).fit(pLen, 'linear').fitSum(pLen, true);
        var acArr = mods.activity.clone().fit(pLen, 'linear').round();

        if (params.score && (params.name === 'Flute' || params.name === 'Piano' || params.name === 'PianoL' || params.name === 'Cello')) {



            // MEMO: \repeatBegin at the beginning breaks the score (bug)
            if (c.get('beat') % (numNotes * params.update) === 0) {
                var seq = [];
                var pc = [];
                var oct = [];

                var slurOn = false;
                var accum = 0, accErr = 0;
                var fixImaginaryLines = false;
                var pre, post;

                var pArr = mods.pitch.clone().fit(pLen, 'linear');
                pArr.rescale(low, high).round().pq(mods.scale.get(), true);

                var durArr = mods.dur.clone().fit(pLen, 'step').scale(0, 5).round();
                var dynArr = mods.dyn.clone().fit(pLen, 'step');


                if (params.div <= 16) {
                    params.durFx[2] = 'stacc';
                } else {
                    params.durFx[2] = 'half';
                }

                for (var i = 0; i < numNotes; i++) {
                    seq[i] = '';

                    var p = pArr.get('next');
                    var len = nArr.get('next');
                    var dur = durArr.get('next');
                    var prevDyn = dynArr.get('current');
                    var dyn = dynArr.get('next');
                    var ac = acArr.get('next');

                    //===== imaginary line stuff =====
                    if (len > 1 && len + (accum % 4) > 4) {
                        fixImaginaryLines = true;
                        post = (len + accum) % 4;

                        if (post == 0) {
                            post = 4;
                        }
                        pre = len - post;
                        //console.log('bad: ' + i);
                        //console.log('accum: ' + accum);
                        //console.log('pre: ' + pre);
                        //console.log('post: ' + post);
                    }
                    accum += len;
                    //==================================

                    if (i == numNotes-1) {
                        accErr = numNotes - accum;

                        if (fixImaginaryLines) {
                            post += accErr;
                        } else {
                            len += accErr;
                        }
                    }

                    if (post == 0) {
                        len = pre;
                        fixImaginaryLines = false;
                    }

                    var pitch = '';

                    //if (params.name === 'PianoL') {
                    //    pitch += '{';
                    //    var pMod = 0;
                    //
                    //    for (var i = 0; i < 3; i++) {
                    //        switch (i) {
                    //            case 0:
                    //                pMod = p + 0;
                    //                break;
                    //            case 1:
                    //                pMod = p + 7;
                    //                break;
                    //            case 2:
                    //                pMod = p + 10;
                    //                break;
                    //            default:
                    //                break;
                    //        }
                    //        pc[i] = g.pitchClass[dtm.val.mod(pMod, 12)];
                    //        oct[i] = (pMod - dtm.val.mod(pMod, 12)) / 12 - 4;
                    //        pitch += pc[i] + oct[i].toString();
                    //
                    //        if (i < 2) {
                    //            pitch += ',';
                    //        } else {
                    //            pitch += '}';
                    //        }
                    //    }
                    //
                    //} else {
                    //}
                    pc[i] = g.pitchClass[dtm.val.mod(p, 12)];
                    oct[i] = (p - dtm.val.mod(p, 12)) / 12 - 4;
                    pitch += pc[i] + oct[i].toString();

                    // note len & duration
                    if (params.durFx[dur] == 'rest' || ac === 0) {
                        pitch = '_';

                        if (slurOn) {
                            seq[i-1] += ')';
                            slurOn = false;
                        }
                    }

                    if (params.durFx[dur] == 'slur' && ac !== 0) {
                        if (!slurOn && i !== numNotes-1) {
                            seq[i] += '\\slur(';
                            slurOn = true;
                        }
                    }

                    if (params.durFx[dur] == 'half' && ac !== 0) {
                        if (fixImaginaryLines) {
                            seq[i] += pitch + '*' + pre + '/' + params.div*2 + '_*' + pre + '/' + params.div*2;
                            seq[i] += ',';
                            seq[i] += pitch + '*' + post + '/' + params.div*2 + '_*' + post + '/' + params.div*2;
                        } else if (len !== 0) {
                            seq[i] += pitch + '*' + len + '/' + params.div*2 + '_*' + len + '/' + params.div*2;
                        }

                    } else {
                        if (fixImaginaryLines && !(params.durFx[dur] == 'rest' || ac === 0)) {
                            seq[i] += '\\tie(' + pitch + '*' + pre + '/' + params.div;
                            seq[i] += ',';
                            seq[i] += pitch + '*' + post + '/' + params.div + ')';
                        } else if (len !== 0) {
                            seq[i] += pitch + '*' + len + '/' + params.div;
                        }
                    }

                    if (ac !== 0 && !slurOn && params.div > 16) {
                        if (params.durFx[dur] == 'stacc') {
                            seq[i] = '\\stacc(' + seq[i] + ')';
                        } else if (params.durFx[dur] == 'tenuto') {
                            seq[i] = '\\ten(' + seq[i] + ')';
                        }
                    }

                    if ((params.durFx[dur] != 'slur' && slurOn) || i == numNotes-1 && slurOn) {
                        seq[i] += ')';
                        slurOn = false;
                    }

                    //if (i > 0) {
                    //    if (dyn != prevDyn && (params.durFx[dur] != 'rest' || ac === 0)) {
                    //        seq[i] = '\\intens<"' + params.dynFx[dyn] + '", dx=-0.3, dy=-4> ' + seq[i];
                    //    }
                    //} else {
                    //    if (params.durFx[dur] != 'rest' || ac === 0) {
                    //        seq[i] = '\\intens<"' + params.dynFx[dyn] + '", dx=-0.3, dy=-4> ' + seq[i];
                    //    }
                    //}

                    fixImaginaryLines = false;
                }

                //================ formatting ================

                for (var i = seq.length-1; i >= 0; i--) {
                    if (seq[i] === '') {
                        seq.splice(i, 1);
                    }
                }

                for (var i = seq.length-1; i > 0; i--) {
                    if (seq[i].indexOf('_') > -1 && seq[i-1].indexOf('_') > -1) {
                        seq[i-1] = '_*' + (parseInt(seq[i].substr(seq[i].indexOf('*')+1, (seq[i].indexOf('/')-seq[i].indexOf('*')-1))) +
                        parseInt(seq[i-1].substr(seq[i-1].indexOf('*')+1, (seq[i-1].indexOf('/')-seq[i-1].indexOf('*')-1)))) + '/' + params.div;

                        seq[i] = '';
                    }
                }

                for (var i = seq.length-1; i > 0; i--) {
                    if (seq[i] === '') {
                        seq.splice(i, 1);
                    }
                }

                for (var i = 0; i < seq.length; i++) {
                    if (seq[i].indexOf(',') > -1) {
                        var sliced = seq[i].split(',');
                        seq[i] = sliced[0];
                        seq.splice(i+1, 0, sliced[1]);
                    }
                }

                var accum = 0;
                var space = ' \\space<4>';
                for (var i = 0; i < seq.length; i++) {
                    accum += parseInt(seq[i].substr(seq[i].indexOf('*')+1, (seq[i].indexOf('/')-seq[i].indexOf('*')-1)));

                    if (seq[i].indexOf('_') > -1) {
                        seq[i] = '\\space<4> ' + seq[i] + ' \\space<4>';
                    }


                    if (accum >= 16) {
                        seq[i] += space;
                        if (accum % 16 === 0 && i !== seq.length-1) {
                            seq[i+1] = '\\bar' + space + seq[i+1];
                        } else if (i === seq.length-1) {
                            seq[i] += ' \\space<3>';
                        }
                        accum -= 16;
                    }
                }

                var staffFormat = '\\staffFormat<"5-line",';
                if (seq.length === 1) {
                    staffFormat += 'size=1.3pt>';
                } else if (seq.length < 50) {
                    staffFormat += 'size=1.3pt>';
                } else if (seq.length < 100) {
                    staffFormat += 'size=2pt>';
                } else {
                    staffFormat += 'size=3pt>';
                }

                var staff = '\\staff<';

                switch (params.name) {
                    case 'Flute':
                        staff += '1';
                        break;
                    case 'Cello':
                        staff += '2';
                        break;
                    case 'Piano':
                        staff+= '3';
                        break;
                    case 'PianoL':
                        staff+= '4';
                        break;
                    default:
                        break;
                }

                if (seq.length === 1) {
                    staff += ',5mm>';
                } else {
                    switch (params.name) {
                        case 'Flute':
                            staff += ',14mm>';
                            break;
                        case 'Cello':
                            staff += ',14mm>';
                            break;
                        case 'Piano':
                            staff+= ',10mm>';
                            break;
                        case 'PianoL':
                            staff+= ',10mm>';
                            break;
                        default:
                            break;
                    }
                }

                //console.log(params.name, seq.length);

                seq = seq.join(' ');


                var name = '';
                if (params.name === 'Flute' || params.name === 'Cello') {
                    name += '\\instr<"' + params.name + '", dx=-1.65cm, dy=-0.5cm>';
                } else if (params.name === 'Piano') {
                    name += '\\instr<"' + params.name + '", dx=-1.65cm, dy=-1.3cm>';
                }
                var clef = '\\clef<"' + params.clef + '">';
                var time = '\\meter<"' + params.time + '">';

                var autoBreak = '\\set<autoSystemBreak="off">';
                var barLine = '\\barFormat<style="staff">';

                //+ staff + staffFormat
                osc.send('/decatur/score', [params.name, '[' + autoBreak + barLine + name + clef + time + seq + ' \\repeatEnd]']);
            }
        }

        if (params.midi) {
            if (c.get('beat') % (numNotes * params.update) === 0) {
                params.bpm = dtm.master.clock.get('bpm');
                var evList = [];
                var unit = 60 / params.bpm * 4 / params.div;

                var sc = mods.scale.get();

                var p = mods.pitch.clone().fit(pLen, 'linear');
                p.rescale(low, high).round().pq(sc, true);

                var dur = mods.dur.clone().fit(pLen, 'step').scale(0, 5).round().normalize();

                var del = 0;
                var tr = mods.transp.get('next');

                for (var j = 0; j < params.update; j++) {
                    nArr.index(0);
                    p.index(0);
                    dur.index(0);
                    acArr.index(0);

                    del = numNotes * j;

                    for (var i = 0; i < numNotes; i++) {
                        var note = nArr.get('next');
                        var pitch = p.get('next');
                        var durMod = dur.get('next');
                        var ac = acArr.get('next');

                        if (note !== 0) {
                            if (durMod !== 0 && ac !== 0) {
                                evList.push([del * unit + dtm.val.rand(0, 0.01), note * durMod * unit * 0.95, pitch + tr]);
                            }
                            del += note;
                        }
                    }
                }

                for (var i = 0; i < evList.length; i++) {
                    if (typeof(evList[i]) !== 'undefined') {
                        dtm.osc.send('/decatur/midi', [params.name].concat(evList[i]));
                    }
                }
            }
        }

        return m.parent;
    };

    m.param.score = function (bool) {
        params.score = bool;
        return m.parent;
    };

    m.params.midi = function (bool) {
        params.midi = bool;
        return m.parent;
    };

    m.param.name = function (src) {
        params.name = src;

        switch (params.name) {
            case 'Flute':
                params.clef = 'g';
                break;
            case 'Cello':
                params.clef = 'f';
                break;
            case 'Piano':
                params.clef = 'g';
                break;
            case 'PianoL':
                params.clef = 'f';
                break;
            default:
                break;
        }
        return m.parent;
    };

    m.param.measures = function (val) {
        params.measures = val;
        return m.parent;
    };

    m.param.update = function (val) {
        params.update = val;
        return m.parent;
    };

    m.param.clef = function (src) {
        params.clef = src;
        return m.parent;
    };

    m.param.staves = function (num) {
        params.staves = num;
        return m.parent;
    };

    m.mod.pitch = function (src, literal) {
        mapper(src, 'pitch');

        if (literal) {
            mods.pitch.round();
        } else {
            if (params.name === 'Flute') {
                mods.pitch.rescale(60, 96).round();
            } else if (params.name === 'Piano') {
                mods.pitch.rescale(60, 84).round();
            } else if (params.name === 'PianoL') {
                mods.pitch.rescale(36, 60).round();
            } else if (params.name === 'Cello') {
                //mods.pitch.rescale(36, 81).round();
                mods.pitch.rescale(36, 72).round();
            } else {
                mods.pitch.rescale(60, 96).round();
            }
        }

        return m.parent;
    };

    m.mod.range = function (src, literal) {
        mapper(src, 'range');
        if (literal) {

        } else {
            mods.range.exp(2).scale(0.2, 0.8);
        }

        return m.parent;
    };

    m.mod.transpose = function (src, literal) {
        mapper(src, 'transp');

        if (!literal) {

        }
        return m.parent;
    };

    m.mod.transp = m.mod.transpose;

    m.mod.scale = function (src, literal) {
        if (literal) {
            mapper(src, 'scale');
        } else {
            mapper(src, 'scaleSel');
            mods.scaleSel.rescale(0, params.scale.length-1).round();
            mods.scale.set(params.scale[mods.scaleSel.get('mode')])
        }

        return m.parent;
    };

    m.mod.pq = m.mod.scale;

    m.mod.div = function (src, literal) {
        mapper(src, 'div');

        if (literal) {
            params.div = mods.div.round().get('mode');
        } else {
            mods.div.range(0, params.divMap.length-1).round();
            params.div = params.divMap[mods.div.get('mode')];
        }
        return m.parent;
    };

    m.mod.activity = function (src, literal) {
        mapper(src, 'activity');

        if (!literal) {
            mods.activity.normalize().log(10);
        }

        return m.parent;
    };

    m.mod.ac = m.mod.activity;

    m.mod.note = function (src, literal) {
        mapper(src, 'note');

        if (literal) {
            mods.note.round();
        }
        //else {
        //    mods.note.fitSum(params.measures * mods.div.get(0), true);
        //}

        return m.parent;
    };

    m.mod.dur = function (src, literal) {
        mapper(src, 'dur');
        if (!literal) {
            mods.dur.normalize();
        }
        return m.parent;
    };

    m.mod.dyn = function (src, literal) {
        mapper(src, 'dyn');

        if (!literal) {
            mods.dyn.scale(0, 5).round();
        }

        return m.parent;
    };

    m.mod.density = function (src, literal) {
        mapper(src, 'density');

        if (!literal) {
            mods.density.scale(1, 32).exp(5);
        }

        return m.parent;
    };

    m.mod.repeat = function (src, literal) {
        mapper(src, 'repeat');

        if (literal) {
            params.repeat = src;
        } else {
            mods.repeat.rescale(0, params.repMap.length-1).round();
            params.repeat = params.repMap[mods.repeat.get('mode')];
        }

        return m.parent;
    };

    m.mod.rep = m.mod.repeat;

    function mapper(src, dest) {
        if (typeof(src) === 'number') {
            mods[dest] = dtm.array(src);
        } else if (typeof(src) === 'string') {
            mods[dest] = dtm.array(src).classify();
        } else {
            if (src instanceof Array) {
                mods[dest] = dtm.array(src);
            } else if (src.type === 'dtm.array') {
                if (src.get('type') === 'string') {
                    mods[dest] = src.clone().classify();
                } else {
                    mods[dest] = src.clone();
                }
            } else if (src.type === 'dtm.model') {

            } else if (src.type === 'dtm.synth') {
                mods[dest] = src;
            }
        }
    }

    return m;
})();