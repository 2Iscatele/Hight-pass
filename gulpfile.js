let project_folder = "dist";
let source_folder ="#src";

let path = {
    build: {
        html: project_folder + "/",
        css: project_folder + "/css/",
        js: project_folder + "/js/",
        img: project_folder + "/img/",
        fonts: project_folder + "/fonts/",
    },
    src: {
        html:[source_folder + "/*.html", "!" + source_folder + "/_*.html"] ,
        css: source_folder + "/scss/style.scss",
        js: source_folder + "/js/script.js",
        img: source_folder + "/img/**/*.{jpg,png,gif,ico,webp}",
        svg: source_folder + "/img/**/*.svg",
        fonts: source_folder + "/fonts/*.ttf",
        svgicons:source_folder + "/img/svg/*.svg",
    },
    watch: {
        html: source_folder + "/**/*.html",
        css: source_folder + "/scss/**/*.scss",
        js: source_folder + "/js/**/*.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
        svgicons:source_folder + "/img/iconsprite/*.svg",
    },
    clean: "./" + project_folder +"/"
}

const { src, dest} = require('gulp');
const gulp = require('gulp');
const browsersync = require("browser-sync").create();
const fileinclude = require('gulp-file-include');
const del =require("del");
const scss = require('gulp-sass')(require('sass'));
const autoprefixes = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const svgSprite = require('gulp-svg-sprite');
const babel = require('gulp-babel');
const group_media = require("gulp-group-css-media-queries");
const rename = require("gulp-rename");
const ttf2ToWoff = require('gulp-ttf2woff');
const ttfToWoff2 = require('gulp-ttf2woff2');
const uglify = require('gulp-uglify-es').default;
const imagemin = require("gulp-imagemin");
const webp = require('gulp-webp');
const webpHTML = require('gulp-webp-html');
const webpcss = require("gulp-webpcss");
const fonter = require("gulp-fonter");
const fs = require('fs');



function browserSync(params) {
    browsersync.init({
        server:{
        baseDir: "./" + project_folder +"/"
    },
    port: 3000,
    notify:false
    })
}

function html() {
    return src(path.src.html)
    .pipe(fileinclude())
    .pipe(webpHTML())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream())
}

function css() {
    return src(path.src.css)
    .pipe(scss({
        outputStyle:"expanded",     
        }))
    .pipe(group_media())
    
    .pipe(
        autoprefixes({
            overrideBrowserslist:["last 5 versions"],
            cascade:false,
            grid: true,
            flexbox: true,        
        })
    )
    .pipe(webpcss({}))
    .pipe(dest(path.build.css))
    .pipe(cleanCSS({
        level: 2,
        }))
        .pipe(rename({
            suffix: '.min'
          }))
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream())
}

function js() {
    return src(path.src.js)
    .pipe(fileinclude())
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(rename({
        suffix: '.min'
      }))
      .pipe(dest(path.build.js))
    .pipe(browsersync.stream())
}

function images() {
    return src(path.src.img)
    .pipe(webp({
        quality: 70,
      }))
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(
        imagemin({
            progressive:true,
            svgoPlugins: [{removeViewBox: false}],
            interlaced: true,
            optimizationLevel: 3
        })
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream())
}
function svgSprites() {
   
        return src(source_folder + '/img/svg/**/*.svg')
        .pipe(svgSprite({
            mode: {
              stack: {
                sprite: '../sprite.svg',
                example:true
              }
            }
          }))
          .pipe(dest('dist/img'))
    
}
gulp.task('otf2ttf', function() {
    return src([source_folder + '/fonts/*.otf'])
    .pipe(fonter({
        formats:['ttf']
      }))
      .pipe(dest(source_folder + '/fonts/'));
})

function fonts(params){
    src(path.src.fonts)
    .pipe(ttf2ToWoff())
    .pipe(dest(path.build.fonts))
    return src(path.src.fonts)
    .pipe(ttfToWoff2())
    .pipe(dest(path.build.fonts))
};


function fontsStyle(params) {

    let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss');
    
        fs.writeFile(source_folder + '/scss/fonts.scss', '', cb);
        fs.readdir(path.build.fonts, function (err, items) {
            if (items) {
                let c_fontname;
                for (var i = 0; i < items.length; i++) {
                    let fontname = items[i].split('.');
                    fontname = fontname[0];
                    if (c_fontname != fontname) {
                    fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
                    }
                    c_fontname = fontname;
                }
            }
        })
    
    }
    
    function cb() { }

function watchFiles(params) {
    gulp.watch([path.watch.html], html)
    gulp.watch([path.watch.css], css)
    gulp.watch([path.watch.js], js)
    gulp.watch([path.watch.svgicons], images)
}

function clean(params) {
    return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(js,css,html,images, fonts, svgSprites), fontsStyle, watchFiles);
let watch = gulp.parallel( build, watchFiles, browserSync);


exports.fontsStyle = fontsStyle;
exports.svgSprites = svgSprites;
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;