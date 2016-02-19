module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.initConfig({
        concat: {
            target: {
                src: [
                    'misc/start.js',
                    'src/core.js',
                    'src/polyfills.js',
                    'src/utils.js',
                    'src/osc.js',
                    'src/analyzer.js',
                    'src/generator.js',
                    'src/transform.js',
                    //'src/transform_delegate.js',
                    'src/array.js',
                    'src/parser.js',
                    'src/data.js',
                    'src/clock.js',
                    'src/instrument.js',
                    'src/model.js',
                    'src/synth.js',
                    'src/master.js',
                    'src/guido.js',
                    'src/inscore.js',
                    'src/models/unipolar.js',
                    'src/models/bipolar.js',
                    'src/models/huffman.js',
                    'src/models/movetofront.js',
                    //'src/models/rhythm.js',
                    //'src/models/chord.js',
                    //'src/models/phrase.js',
                    //'src/models/instr.js',
                    //'src/models/form.js',
                    //'src/models/song.js',
                    //'src/models/scale.js',
                    //'src/models/scales/synthetic.js',
                    //'src/models/playback.js',
                    //'src/models.rhythm/clave-models.rhythm.js',

                    //'src/instr/single-note.js',
                    //'src/instr/short-noise.js',
                    //'src/instr/nice-chords.js',
                    //'src/instr/models.rhythm-seq.js',
                    //'src/instr/sampler.js',
                    //'src/instr/melody.js',
                    //'src/instr/clave.js',
                    //'src/instr/tamborim.js',

                    //'src/instr/default.js',
                    //'src/instr/testInstr.js',
                    //'src/instr/testNotation.js',
                    //'src/instr/decatur.js',
                    //'src/instr/decatur-piano.js',
                    //'src/instr/synth-drum.js',
                    //'src/instr/decatur-midi.js',
                    //'src/instr/csd.js',
                    //'src/instr/csd-osc.js',
                    'misc/end.js'
                ],
                dest: 'dtm.js'
            }
        },

        jsdoc: {
            dist: {
                src: ['src/*.js', 'src/instr/*.js'],
                jsdoc: 'jsdoc',
                options: {
                    destination: 'doc',
                    configure: 'conf.json',
                    template: './node_modules/ink-docstrap/template'
                }
            }
        },

        uglify: {
            my_target: {
                files: {
                    //'dtm_min.js': ['bower_components/lodash/dist/lodash.min.js', 'dtm.js']
                    'dtm_min.js': ['dtm.js']
                }
            }
        }
    });

    grunt.registerTask('default', ['concat']);
};