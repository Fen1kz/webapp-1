let _ = require('lodash');
let browserifyIncremental = require('browserify-incremental');
let browserify = require('browserify');
let moduleify = require('moduleify');
let source = require('vinyl-source-stream');
let merge = require('merge-stream');

let packageJson = require('../../package.json');
let dependencies = Object.keys(packageJson && packageJson.dependencies || {});

let requireBundle = (prebundle, libs) => _.reduce(libs, (prebundle, value, key) => {
    return prebundle.require(key, {expose: value});
}, prebundle);

export default function (gulp, $, config) {
    let dirs = config.dirs;
    let globs = config.globs;

    let browserifyShimConfig = _.reduce(globs.scripts.shims, (obj, v, k) => {
        obj[k] = (typeof v === 'string' ? v.replace('global:', '') : v.exports);
        return obj;
    }, {});

    gulp.task('scripts:libs', () => {
        let debug = false;

        let node_modules = browserify({
            debug: debug
            , noParse: dependencies
            , detectGlobals: false
        })
            .require(dependencies)
            .transform({
                global: true
            }, 'uglifyify')
            .bundle();

        let commonjs = requireBundle(browserify({debug: debug}), globs.scripts.commonjs)
            .bundle();

        let shim = requireBundle(browserify({debug: debug}), browserifyShimConfig)
            .transform('browserify-shim')
            .bundle();

        return merge(node_modules, commonjs, shim)
            .pipe(source('vendor.min.js'))
            .pipe(gulp.dest(`${dirs.dist}/js`))
    });

    let bundler = browserifyIncremental(`${dirs.src}/js/app.js`, {
        //let bundler = browserify(`${dirs.src}/js/app.js`, {
        paths: ['./src/js/']
        , debug: true
    })
        .external(_.values(browserifyShimConfig))
        .external(_.values(globs.scripts.commonjs))
        .external(dependencies)
        .transform('babelify')
        .transform({
            global: true
        }, 'uglifyify')
        .transform('stringify', config.stringify);

    gulp.task('scripts:local', () => {
        return bundler
            .bundle()
            .on('error', function handleError(err) {
                console.error(err.toString());
                this.emit('end');
            })
            .pipe(source('bundle.js'))
            .pipe(gulp.dest(`${dirs.dist}/js`))
            .pipe($.livereload());
    });

    gulp.task('scripts', ['scripts:libs', 'scripts:local']);
}