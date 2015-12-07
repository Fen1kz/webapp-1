/*
 * Glob patterns
 * ============================================================================
 *
 * Information about the project assets and source code. Very specific to the
 * development tasks, telling where to read the project source code for
 * processing and compilation.
 */

'use strict';


var dirs = require('./dirs');

var globs = {
    src: [`${dirs.src}/**`]
    , index: [`${dirs.src}/index.html`]
    , assets: [`${dirs.src}/assets/**/*`]
    , scripts: {
        local: [`${dirs.src}/js/**/*.js`]
        , vendor: []
    }
    , styles: {
        local: [`${dirs.src}/css/**/*.{css,scss}`]
        , extension: []
        , vendor: []
    }
    , dist: `${dirs.dist}/**/*`
};

module.exports = globs;
