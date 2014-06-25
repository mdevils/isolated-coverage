var vow = require('vow');
var child_process = require('child_process');

var Message = require('../message');

var RemoteShell = (function () {
    function RemoteShell(url) {
        this.url = url;
    }
    RemoteShell.prototype.exec = function (command, args) {
        args = args || [];
        return this.execCommandLine(command + ' ' + args.map(this.escape).join(' '));
    };

    RemoteShell.prototype.execCommandLine = function (commandLine) {
        var urlBits = this.url.split(':');
        var userAndHost = urlBits.shift();
        var directory = urlBits.shift() || '.';
        var defer = new vow.Deferred();
        var remoteExecCommand = 'ssh ' + userAndHost + ' ' + this.escape('cd ' + this.escape(directory) + ' && ' + commandLine);

        process.nextTick(function () {
            defer.notify(new Message('remote', commandLine, Message.InProgress));
        });
        child_process.exec(remoteExecCommand, function (error, stdout) {
            if (error) {
                defer.notify(new Message('remote', commandLine, Message.Error));
                defer.reject(error);
            } else {
                defer.notify(new Message('remote', commandLine, Message.Success));
                defer.resolve(stdout.toString().trim());
            }
        });
        return defer.promise();
    };

    RemoteShell.prototype.escape = function (val) {
        return '\'' + val.replace(/\'/g, "'\\''") + '\'';
    };
    return RemoteShell;
})();

module.exports = RemoteShell;
