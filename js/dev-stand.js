var vow = require('vow');

var LocalShell = require('./shell/local-shell');
var RemoteShell = require('./shell/remote-shell');

var Git = require('./tools/git');
var User = require('./tools/user');
var Hostname = require('./tools/hostname');
var RSync = require('./tools/rsync');
var Screen = require('./tools/screen');

var DevStand = (function () {
    function DevStand() {
        this.wwwDirectory = 'www';
    }
    DevStand.prototype.setHost = function (host) {
        this.host = host;
    };
    DevStand.prototype.setUsername = function (userName) {
        this.userName = userName;
    };
    DevStand.prototype.setWwwDirectory = function (wwwDirectory) {
        this.wwwDirectory = wwwDirectory;
    };
    DevStand.prototype.setProjectName = function (projectName) {
        this.projectName = projectName;
    };
    DevStand.prototype.setCommand = function (command) {
        this.command = command;
    };
    DevStand.prototype.setUrl = function (url) {
        this.url = url;
    };
    DevStand.prototype.deploy = function () {
        if (!this.host) {
            throw new Error('Host is not specified');
        }
        if (!this.command) {
            throw new Error('Command is not specified');
        }
        if (!this.url) {
            throw new Error('Url is not specified');
        }
        if (!this.projectName) {
            throw new Error('Project is not specified');
        }

        var localShell = new LocalShell();

        var git = new Git(localShell);
        var user = new User(localShell);
        var hostname = new Hostname(localShell);

        var destHost = this.host;
        var wwwDirectory = this.wwwDirectory;
        var projectName = this.projectName;
        var command = this.command;
        var url = this.url;

        return vow.all([
            git.getCurrentBranch(),
            this.userName ? vow.cast(this.userName) : user.getLogin(),
            hostname.getCurrentHostname()
        ]).spread(function (branchName, userName, currentHost) {
            var destUrl;
            var directory = projectName + '-' + branchName;
            var relativePath = wwwDirectory + '/' + directory;
            var remotePath = '/home/' + userName + '/' + relativePath;
            var remoteShell;
            if (skipTld(currentHost) === skipTld(destHost)) {
                destUrl = remotePath;
                remoteShell = new LocalShell(remotePath);
            } else {
                destUrl = userName + '@' + destHost + ':' + relativePath;
                remoteShell = new RemoteShell(destUrl);
            }
            var screen = new Screen(remoteShell);
            var rsync = new RSync(localShell);

            function processString(str) {
                return str.replace(/\{\{directory\}\}/g, directory).replace(/\{\{userName\}\}/g, userName);
            }

            return rsync.sync('.', destUrl, ['.git']).then(function () {
                return screen.killSession(directory).always(function () {
                    return screen.startSessionWithCommand(directory, processString(command));
                }).then(function () {
                    return processString(url);
                });
            });
        });
    };
    return DevStand;
})();

function skipTld(host) {
    var bits = host.split('.');
    var tdl = bits.pop();
    if (tdl === 'tr') {
        bits.pop();
    }
    return bits.join('.');
}

module.exports = DevStand;
