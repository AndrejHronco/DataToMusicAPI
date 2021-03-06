(function () {
    var m = dtm.model('clave', 'beats');

    m.source = dtm.tr.itob([3, 3, 4, 2, 4]);
    m.target = dtm.tr.itob([2, 1, 2, 1]);
    m.midx = 0;
    m.array = dtm.array(dtm.tr.morph(m.source, m.target, m.midx));

    m.mod = function (val) {
        m.midx = val;
        m.array.set(dtm.tr.morph(m.source, m.target, m.midx));
        return m;
    };

    m.next = function () {
        return m.array.round().next();
    };
})();