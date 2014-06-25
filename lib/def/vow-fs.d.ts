declare module 'vow-fs' {
    import vow = require('vow');

    export function read(path: string, encoding?: string): vow.Promise;
    export function write(path: string, data: string, encoding?: string): vow.Promise;
    export function append(path: string, data: string, encoding?: string): vow.Promise;
    export function remove(path: string): vow.Promise;
    export function copy(sourcePath: string, destPath: string): vow.Promise;
    export function move(sourcePath: string, destPath: string): vow.Promise;
    export function stat(path: string): vow.Promise;
    export function exists(path: string): vow.Promise;
    export function link(sourcePath: string, destPath: string): vow.Promise;
    export function symLink(sourcePath: string, destPath: string): vow.Promise;
    export function chown(sourcePath: string, uid: any, gid: any): vow.Promise;
    export function chmod(sourcePath: string, mode: any): vow.Promise;
    export function absolute(path: string): vow.Promise;
    export function isFile(path: string): vow.Promise;
    export function isDir(path: string): vow.Promise;
    export function isSocket(path: string): vow.Promise;
    export function isSymLink(path: string): vow.Promise;
    export function makeTmpFile(path: string): vow.Promise;
    export function listDir(path: string): vow.Promise;
    export function makeDir(path: string, mode?: any, failIfExist?: boolean): vow.Promise;
    export function removeDir(path: string): vow.Promise;
    export function glob(path: string): vow.Promise;
}
