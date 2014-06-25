import vow = require('vow');
import Tool = require('../tool');

class RSync extends Tool {
    sync(source: string, dest: string, excludes?: string[]): vow.Promise {
        var args = ['-avzq'];
        if (excludes) {
            excludes.forEach(function (exclude) {
                args.push('--exclude');
                args.push(exclude);
            });
        }
        args.push(source);
        args.push(dest);
        return this.shell.exec('rsync', args);
    }
}

export = RSync
