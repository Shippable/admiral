'use strict';

module.exports = function (grunt) {
  grunt.initConfig({
    watch: {
      scripts: {
        files: [
          'static/**/**/*.js',
          '!static/app.cat.js',
          '!static/app.min.js'
        ],
        tasks: ['buildLocal'],
        options: {
          spawn: true
        }
      }
    },
    concat: {
      app: {
        src: [
          'static/app.js',
          'static/scripts/**/*.js',
          'static/scripts/**/**/*.js'
        ],
        dest: 'static/app.cat.js'
      },
      css: {
        src: [
          'static/app.css'
        ],
        dest: 'static/app.cat.css'
      },
      lib: {
        src: [
          // jQuery
          'static/bower_components/jquery/dist/jquery.min.js',
          'static/bower_components/jquery.cookie/jquery.cookie.js',
          // Bootstrap
          'static/bower_components/bootstrap/dist/js/bootstrap.min.js',
          // Async
          'static/bower_components/async/dist/async.min.js',
          // Underscore
          'static/bower_components/underscore/underscore-min.js',
          // moment
          'static/bower_components/moment/min/moment.min.js',
          'static/bower_components/moment/moment.js',
          // ANSI up
          'static/bower_components/ansi_up/ansi_up.js',
          // Angular
          'static/bower_components/angular/angular.js',
          'static/libs/ui-bootstrap-tpls-0.14.0.min.js',
          'static/bower_components/angular-moment/angular-moment.min.js',
          'static/bower_components/angular-sanitize/angular-sanitize.min.js',
          'static/bower_components/angular-ui-router/release/angular-ui-router.min.js'
        ],
        dest: 'static/lib.cat.js'
      }
    },
    uglify: {
      app: {
        files: {
          'static/app.min.js': ['static/app.cat.js']
        }
      },
      lib: {
        files: {
          'static/lib.min.js': ['static/lib.cat.js']
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('cats', ['concat:css']);
  grunt.registerTask('libcat', ['concat:lib']);
  grunt.registerTask('libbit', ['uglify:lib']);
  grunt.registerTask('build',
    ['concat:app', 'concat:lib', 'uglify:app', 'uglify:lib']);
  grunt.registerTask('buildLocal', ['concat:app']);
};
