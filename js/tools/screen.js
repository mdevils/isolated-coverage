var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Tool = require('../tool');

var Screen = (function (_super) {
    __extends(Screen, _super);
    function Screen() {
        _super.apply(this, arguments);
    }
    Screen.prototype.getSessions = function () {
        return this.exec('screen', ['-list']).then(function (output) {
            var lines = output.split('\n');
            var result = [];
            lines.forEach(function (line) {
                if (line.indexOf('\t') === 0) {
                    var lineBits = line.split('\t');
                    lineBits.pop(); // spacer
                    result.push(lineBits.pop());
                }
            });
            return result;
        });
    };

    Screen.prototype.killSession = function (sessionName) {
        return this.exec('screen', ['-S', sessionName, '-X', 'quit']);
    };

    Screen.prototype.startSessionWithCommand = function (sessionName, commandLine) {
        return this.exec('screen', ['-dmS', sessionName, 'sh', '-c', commandLine]);
    };
    return Screen;
})(Tool);

module.exports = Screen;
