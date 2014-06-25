var TestBundle = (function () {
    function TestBundle(testFile, sources) {
        this.testFile = testFile;
        this.sources = sources;
    }
    TestBundle.prototype.getTestFile = function () {
        return this.testFile;
    };

    TestBundle.prototype.getSources = function () {
        return this.sources;
    };

    TestBundle.prototype.getBase = function () {
        return this.getTestFile().replace(/\.test\.js$/, '');
    };
    return TestBundle;
})();

module.exports = TestBundle;
