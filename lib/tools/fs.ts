import os = require('os');
import path = require('path');
import vow = require('vow');
import vowFs = require('vow-fs');
import Tool = require('../tool');

class FS extends Tool {
    copy(from: string, to: string): vow.Promise {
        return this.shell.exec('cp', ['-R', from, to]);
    }
    remove(what: string): vow.Promise {
        return this.shell.exec('rm', ['-Rf', what]);
    }
    createTmpDir(): vow.Promise {
        var tmpDir = os.tmpDir();
        function tryCreateNewDirectory() {
            var tmpName = path.join(tmpDir, (new Date()).getTime() + '-' + Math.round(1000000 * Math.random()));
            return vowFs.exists(tmpName).then((exists: boolean) => {
                return exists ? tryCreateNewDirectory() : vowFs.makeDir(tmpName).then(() => {
                    return tmpName;
                });
            });
        }
        return tryCreateNewDirectory();
    }
}

export = FS
