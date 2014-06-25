var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Tool = require('../tool');

var Hostname = (function (_super) {
    __extends(Hostname, _super);
    function Hostname() {
        _super.apply(this, arguments);
    }
    Hostname.prototype.getCurrentHostname = function () {
        return this.shell.exec('hostname');
    };
    return Hostname;
})(Tool);

module.exports = Hostname;
