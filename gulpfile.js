var gulp = require("gulp"),
    rimraf = require("rimraf"),
    concat = require("gulp-concat"),
    less = require("gulp-less"),
    cssmin = require("gulp-cssmin"),
    uglify = require("gulp-uglify"),
    rename = require("gulp-rename");

var paths = {
    excludes: "!./**/*.min.*",
    venCopySrc: "./bower_components/",
    venCopyDest: "./src/",
    depCssSrc: "./src/less/phantomnet-compozr.less",
    depJsSrc: [
        "./src/js/plugins/jquery.gg.clean-html.js",
        "./src/js/plugins/color-picker.js",
        "./src/js/phantom-net/gg.phantom-net.inheritance.js",
        "./src/js/phantom-net/gg.phantom-net.utilities.js",
        "./src/js/components/remote-folder.js",
        "./src/js/select2_locale_vi.js",
        // compozr
        "./src/js/compozr/compozr.js",
        "./src/js/compozr/toolbar-base.js",
        "./src/js/compozr/html-editor-toolbar.js",
        "./src/js/compozr/html-image-toolbar.js",
        // page-compozr
        "./src/js/page-compozr/resources.js",
        "./src/js/page-compozr/page-view.js",
        "./src/js/page-compozr/page-controller.js",
        "./src/js/page-compozr/extensions/page-images/resources.js",
        "./src/js/page-compozr/extensions/page-images/page-view.js",
        "./src/js/page-compozr/extensions/page-images/page-controller.js",
        "./src/js/page-compozr/extensions/multi-page/resources.js",
        "./src/js/page-compozr/extensions/multi-page/page-view.js",
        "./src/js/page-compozr/extensions/multi-page/page-controller.js",
        // doc-compozr
        "./src/js/doc-compozr/resources.js",
        "./src/js/doc-compozr/doc-view.js",
        "./src/js/doc-compozr/doc-controller.js",
        // blog
        "./src/js/blog/compozr/resources.js",
        "./src/js/blog/compozr/categories.js",
        "./src/js/blog/compozr/index.js",
        "./src/js/blog/compozr/category.js",
        "./src/js/blog/compozr/article-view.js",
        "./src/js/blog/compozr/article-controller.js",
        // documentation
        "./src/js/documentation/compozr-base/resources.js",
        "./src/js/documentation/compozr-base/index.js",
        "./src/js/documentation/compozr-base/paper-view.js",
        "./src/js/documentation/compozr-base/paper-controller.js",
        // whole documentation
        "./src/js/documentation/whole-compozr/resources.js",
        "./src/js/documentation/whole-compozr/index.js",
        "./src/js/documentation/whole-compozr/paper-view.js",
        "./src/js/documentation/whole-compozr/paper-controller.js",
        // split documentation
        "./src/js/documentation/split-compozr/resources.js",
        "./src/js/documentation/split-compozr/index.js",
        "./src/js/documentation/split-compozr/paper-view.js",
        "./src/js/documentation/split-compozr/paper-controller.js",
        // gallery
        "./src/js/gallery/compozr/resources.js",
        "./src/js/gallery/compozr/index.js",
        "./src/js/gallery/compozr/album-view-base.js",
        "./src/js/gallery/compozr/slides-album-view.js",
        "./src/js/gallery/compozr/photostream-album-view.js",
        "./src/js/gallery/compozr/album-controller.js"],
    depFontsSrc: "./src/fonts*/**/*.*",
    depDest: "./dist",
    depCssDest: "./dist/css",
    depJsDest: "./dist/js",
    concatCssDest: "./dist/css/phantomnet-compozr.css",
    concatJsDest: "./dist/js/phantomnet-compozr.js",
    minCssSrc: "./dist/css/**/*.*",
    minJsSrc: "./dist/js/**/*.*"
};

// clean

gulp.task("clean", function (cb) {
    rimraf(paths.depDest, cb);
});

// deploy

gulp.task("deploy:css", function () {
    return gulp.src(paths.depCssSrc)
               .pipe(less({ relativeUrls: true }))
               .pipe(concat(paths.concatCssDest))
               .pipe(gulp.dest("."));
});

gulp.task("deploy:js", function () {
    return gulp.src(paths.depJsSrc)
               .pipe(concat(paths.concatJsDest))
               .pipe(gulp.dest("."));
});

gulp.task("deploy:fonts", function () {
    return gulp.src(paths.depFontsSrc)
               .pipe(gulp.dest(paths.depDest));
});

// min

gulp.task("min:css", ["deploy:css"], function () {
    return gulp.src([paths.minCssSrc, paths.excludes])
        .pipe(cssmin())
        .pipe(rename(function (path) {
            path.extname = ".min.css";
        }))
        .pipe(gulp.dest(paths.depCssDest));
});

gulp.task("min:js", ["deploy:js"], function () {
    return gulp.src([paths.minJsSrc, paths.excludes])
        .pipe(uglify())
        .pipe(rename(function (path) {
            path.extname = ".min.js";
        }))
        .pipe(gulp.dest(paths.depJsDest));
});

gulp.task("min", ["min:css", "min:js"]);

// default

gulp.task("default", ["deploy:fonts", "min"]);

// vendors copy

gulp.task("vendors-copy:bootstrap", function () {
    return gulp.src([paths.venCopySrc + "bootstrap/less/mixins.less",
                     paths.venCopySrc + "bootstrap/less/mixins*/**/*.*"])
               .pipe(gulp.dest(paths.venCopyDest + "/less/vendors/bootstrap"));
});

gulp.task("vendors-copy:phantomnet-bootstrap-utilities", function () {
    return gulp.src(paths.venCopySrc + "phantomnet-bootstrap-utilities/src/**/variables.less")
               .pipe(gulp.dest(paths.venCopyDest + "/less/vendors/phantomnet-bootstrap-utilities"));
});
