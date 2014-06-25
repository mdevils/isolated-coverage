var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var path = require('path');

var Tool = require('../tool');

var instanbulBin = path.resolve(__dirname, '../../node_modules/.bin/istanbul');

var Istanbul = (function (_super) {
    __extends(Istanbul, _super);
    function Istanbul() {
        _super.apply(this, arguments);
    }
    Istanbul.prototype.instrument = function (source, dest, excludes) {
        var args = ['instrument', '--no-compact', '--variable', '__coverage__'];

        if (dest) {
            args.push('--output');
            args.push(dest);
        }

        if (excludes) {
            excludes.forEach(function (exclude) {
                args.push('-x');
                args.push(exclude);
            });
        }

        args.push(source);

        return this.shell.exec(instanbulBin, args);
    };

    Istanbul.prototype.buildHtmlReport = function (coveragePath) {
        return this.shell.exec(instanbulBin, ['report', 'html', coveragePath]);
    };
    return Istanbul;
})(Tool);

module.exports = Istanbul;
