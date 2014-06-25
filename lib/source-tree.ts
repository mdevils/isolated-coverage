import fs = require('fs');
import path = require('path');
import vow = require('vow');
import vowFs = require('vow-fs');
import TestBundle = require('./test-bundle');

class SourceTree {
    private fileList: string[] = [];
    constructor(private root: string, private tmpRoot: string, private bundles: TestBundle[] = []) {}

    public hasBundles(): boolean {
        return this.bundles.length > 0;
    }

    public shiftBundle(): TestBundle {
        return this.bundles.shift();
    }

    public addBundle(testBundle: TestBundle) {
        this.bundles.push(testBundle);
    }

    public getRoot(): string {
        return this.root;
    }

    public getTmpRoot(): string {
        return this.tmpRoot;
    }

    public load(sourceRoots: string[]): vow.Promise {
        return vow.all(
            sourceRoots.map((sourcePath) => {
                return this.collectTestFilePaths(sourcePath, this.root);
            })
        ).then((res) => {
            return [].concat.apply([], res);
        }).then((fileList) => {
            fileList = fileList.filter((filename: string): boolean => {
                return Boolean(filename.match(/\.js$/));
            });
            this.fileList = fileList;
            this.bundles = this.splitIntoBundles(fileList);
        });
    }

    private splitIntoBundles(fileList: string[]): TestBundle[] {
        var result = [];
        var bundleIndex = {};
        fileList.forEach((filename: string) => {
            var base = stripExt(filename);
            bundleIndex[base] = bundleIndex[base] || [];
            bundleIndex[base].push(filename);
        });
        fileList.forEach((filename: string) => {
            if (isTestFile(filename)) {
                var base = stripExt(filename);
                var sources = bundleIndex[base].filter((filename) => {
                    return !isTestFile(filename);
                });
                result.push(new TestBundle(filename, sources));
            }
        });
        return result;
    }

    private collectTestFilePaths(directory: string, context: string): vow.Promise {
        var directoryPath = path.join(context, directory);
        return vowFs.listDir(directory).then((files) => {
            return vow.all(files.map((filename) => {
                return vowFs.stat(path.join(directoryPath, filename)).then((stat: fs.Stats): any => {
                    var fullname = path.join(directory, filename);
                    return stat.isDirectory() ? this.collectTestFilePaths(fullname, context) : [fullname];
                })
            })).then((results: string[][]) => {
                return [].concat.apply([], results);
            });
        });
    }

    public split(parts: number): vow.Promise {
        var result = [];
        for (var i = 0; i < parts; i++) {
            result.push(new SourceTree(this.root, path.join(this.tmpRoot, String(i + 1))));
        }
        for (i = 0; i < this.bundles.length; i++) {
            result[i % parts].addBundle(this.bundles[i]);
        }
        return vow.all(result.map((sourceTree: SourceTree) => {
                return vowFs.makeDir(sourceTree.getTmpRoot());
            })).then(() => {
                return result;
            });
    }

    getSourceFiles(): string[] {
        return this.fileList.filter((filename) => {
            return !isTestFile(filename);
        });
    }
}


function isTestFile(filename: string): boolean {
    return Boolean(filename.match(/\.test\.js$/));
}

function stripExt(filename: string): string {
    return filename.replace(/(\.[\w]+)+$/, '');
}

export = SourceTree;
