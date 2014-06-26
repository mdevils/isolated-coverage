import path = require('path');
import vow = require('vow');
import Tool = require('../tool');

var instanbulBin = path.resolve(__dirname, '../../node_modules/.bin/istanbul');

class Istanbul extends Tool {
    instrument(source: string, dest?: string, excludes?: string[]): vow.Promise {
        var args = ['instrument', '--no-compact', '--variable', '__coverage__'];

        if (dest) {
            args.push('--output');
            args.push(dest);
        }

        if (excludes) {
            excludes.forEach((exclude) => {
                args.push('-x');
                args.push(exclude);
            });
        }

        args.push(source);

        return this.shell.exec(instanbulBin, args);
    }

    buildReport(coveragePath: string, reporter: string) {
        return this.shell.exec(instanbulBin, ['report', reporter, coveragePath]);
    }
}

export = Istanbul
