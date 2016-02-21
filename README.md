<script src="../dtm.js"></script>
<script>
function playNext(elem) {
    try {
        var code = elem.nextElementSibling.getElementsByClassName('sunlight-highlight-javascript')[0].textContent;
        eval(code);
    } catch (e) {}
}

function playPrev(elem) {
    try {
        var code = elem.previousElementSibling.getElementsByClassName('sunlight-highlight-javascript')[0].textContent;
        eval(code);
    } catch (e) {
        alert(e);
    }
}
</script>


# DataToMusic #
Client-side JavaScript utility tools for data handling, mapping, and sound synthesis. Also wants to be a unique structure for networked musical abstracts but not quite there yet. It has several data structures / objects, such as dtm.array, dtm.model, etc. that has useful information and self-transforming methods. Most methods are chainable.

    dtm.data('sample.csv', sonify);
    
    function sonify(data) {
        var src = data.get(0);
        dtm.instr().pitch(src).play();
    }

<button onclick="playPrev(this)">Listen</button>


    data = 'hello';
    dtm.instr().pitch(data).speed(data).play();

<button onclick="playPrev(this)">Listen</button>

    var a = dtm.array('hello world!').split();
    a.class().range(60, 90).round().block(1);
    
    dtm.syn().play()
        .interval(0.1)
        .rep(a.len)
        .nn(a);
    
<button onclick="playPrev(this)">Listen</button>

## How to Build ##
Dependencies:
Node.js and NPM ()
Bower (browser library management)
Grunt (task automation)
Karma and Jasmine (for unit test)
JSDoc (documentation builder)
