describe('analyzer', function () {
    var input = [0, 2, 2, 3, 4, 4, 4, 5];

    describe('mean', function () {
        var output = dtm.analyzer.mean(input);
    });

    describe('mode', function () {
        var numOut = dtm.analyzer.mode([0, 2, 2, 3, 4, 4, 4, 5]);

        it('should return 4', function () {
            expect(numOut).toBe(4);
        });

        var strOut = dtm.analyzer.mode(['foo', 'bar', 'buz', 'buz']);

        it('should return buz', function () {
            expect(strOut).toBe('buz');
        });
    });

    describe('variance', function () {
        var output = dtm.analyzer.var(input);
    });

    describe('standard deviation', function () {
        var output = dtm.analyzer.std(input);
    });

    describe('population variance', function () {
        var output = dtm.analyzer.pvar(input);
    });

    describe('population standard deviation', function () {
        var output = dtm.analyzer.pstd(input);
    });

    describe('rms', function () {
        var output = dtm.analyzer.rms(input);
    });
});