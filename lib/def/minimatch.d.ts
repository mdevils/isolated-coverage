declare module 'minimatch' {
    function minimatch(filename: string, pattern: string): boolean;
    export = minimatch
}
