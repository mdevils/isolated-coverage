var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Tool = require('../tool');

var Git = (function (_super) {
    __extends(Git, _super);
    function Git() {
        _super.apply(this, arguments);
    }
    Git.prototype.getCurrentBranch = function () {
        return this.shell.exec('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
    };
    return Git;
})(Tool);

module.exports = Git;
