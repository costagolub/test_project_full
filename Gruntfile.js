module.exports = function(grunt) {

  require('time-grunt')(grunt);

  require('jit-grunt')(grunt,  {
    includereplace: 'grunt-include-replace',
    useminPrepare: 'grunt-usemin',
    validation: 'grunt-html-validation',
    replace: 'grunt-text-replace'
  });

  // Project configuration.
  grunt.option('force', true);

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    // Configs
    xh: {
      src: 'src',
      dist: 'dist',
      tmp: '.tmp',
      build: ['head.html', 'scripts.html'],
      root: __dirname
    },

    useminPrepare: {
      html: {
        src: '<%= xh.build %>',
        cwd: '<%= xh.src %>/includes/',
        expand: true
      },

      options: {
        dest: '<%= xh.dist %>',
        root: '<%= xh.src %>',
        flow: {
          steps: {'js': ['concat'], 'css': ['concat'] },
          post: {}
        }
      }
    },

    usemin: {
      html: {
        src: '<%= xh.build %>',
        cwd: '<%= xh.src %>/includes/',
        expand: true
      },

      options: {
        assetsDirs: ['<%= xh.src %>/includes/']
      }
    },

    clean: {
      tmp: { src: ['<%= xh.tmp %>'] },
      dist: { src: ['<%= xh.dist %>/*.html', '<%= xh.dist %>/css', '<%= xh.dist %>/js', '<%= xh.dist %>/fonts'] }
    },

    // HTML Includes
    includereplace: {
      dist: {
        options: {
          globals: {
            xprecise: '<script async src="http://xhtmlized.github.io/x-precise/xprecise.min.js"></script>'
          }
        },
        files: [{
          expand: true,
          cwd: '<%= xh.src %>',
          src: ['*.html', '!template.html'],
          dest: '<%= xh.dist %>',
          ext: '.html'
        }]
      }
    },

    jsbeautifier: {
      options : {
        html: {
          indentSize: 2
        },
        js: {
          indentSize: 2
        }
      },

      html: {
        src: '<%= xh.dist %>/*.html'
      },

      js: {
        src: '<%= xh.dist %>/js/main.js'
      }
    },

    validation: {
      src: ['<%= xh.dist %>/*.html'],
      options: {
        reset: true,
        relaxerror: [
          'Bad value X-UA-Compatible for attribute http-equiv on element meta.',
          'The frameborder attribute on the iframe element is obsolete. Use CSS instead.'
        ]
      }
    },

    // CSS
    sass: {
      dist: {
        options: {
          style: 'expanded',
          loadPath: '<%= xh.src %>/bower_components/'
        },
        files: {
          '<%= xh.dist %>/css/main.css': '<%= xh.src %>/scss/main.scss'
        }
      }
    },

    autoprefixer: {
      main: {
        src: '<%= xh.dist %>/css/main.css',
        dest: '<%= xh.dist %>/css/main.css'
      }
    },

    cssbeautifier: {
      files: ['<%= xh.dist %>/css/*.css', '!<%= xh.dist %>/css/libraries.min.css'],
      options : {
        indent: '  '
      }
    },

    // JS
    copy: {
      normalize: {
        src: '<%= xh.src %>/bower_components/normalize.css/normalize.css',
        dest: '<%= xh.src %>/bower_components/normalize.css/normalize.scss'
      },

      jquery: {
        expand: true,
        cwd: '<%= xh.src %>/bower_components/jquery/dist/',
        src: 'jquery.min.js',
        dest: '<%= xh.dist %>/js/'
      },

      assets: {
        files: [
          {
            expand: true,
            cwd: '<%= xh.src %>/img/',
            src: ['**/*.*', '!do_not_delete_me.png'],
            dest: '<%= xh.dist %>/img/'
          },
          {
            expand: true,
            cwd: '<%= xh.src %>/media/',
            src: ['**/*.*', '!do_not_delete_me.png'],
            dest: '<%= xh.dist %>/media/'
          },
          {
            expand: true,
            cwd: '<%= xh.src %>/fonts/',
            src: ['**/*.*', '!do_not_delete_me.png'],
            dest: '<%= xh.dist %>/fonts/'
          },
          {
            expand: true,
            cwd: '<%= xh.src %>/xprecise/',
            src: ['**/*.*', '!do_not_delete_me.png'],
            dest: '<%= xh.dist %>/xprecise/'
          }
        ]
      },

      js: {
        expand: true,
        cwd: '<%= xh.src %>/js/',
        src: ['main.js', 'PIE.htc'],
        dest: '<%= xh.dist %>/js/'
      },

      // Backup include files
      backup: {
        expand: true,
        cwd: '<%= xh.src %>/includes/',
        src: '<%= xh.build %>',
        dest: '<%= xh.tmp %>'
      },

      // Restore include files
      restore: {
        expand: true,
        cwd: '<%= xh.tmp %>',
        src: '<%= xh.build %>',
        dest: '<%= xh.src %>/includes/'
      }
    },

    jshint: {
      options: {
        jshintrc: true,
        force: true
      },
      dist: {
        src: ['<%= xh.src %>/js/main.js', '<%= xh.dist %>/js/main.js'],
      }
    },

    uglify: {
      modernizr: {
        files: {
          '<%= xh.dist %>/js/modernizr.min.js': ['src/bower_components/modernizr/modernizr.js']
        }
      }
    },

    // Replacements in main.css and main.js
    replace: {
      css: {
        src: ['<%= xh.dist %>/css/main.css'],
        overwrite: true,
        replacements: [{
          from: '@@timestamp',
          to: '<%= grunt.template.today() %>'
        },
        // Table of contents in main.css
        {
          from: '@@toc',
          to: function () {
            var tmp = grunt.config.get('xh.tmp');

            if (!grunt.file.exists(tmp + '/csstoc.json')) {
              return '';
            }

            var toc_file = grunt.file.readJSON(tmp + '/csstoc.json');
            var files = toc_file.results;
            var toc = '';
            var i = 1;
            var match;

            function capitalize(s) {
              return s[0].toUpperCase() + s.slice(1);
            }

            for (var key in files) {
              if (files.hasOwnProperty(key)) {

                var results = files[key];

                for (var key in results) {
                  if (results.hasOwnProperty(key)) {

                    match = results[key]['match'];
                    match = match.replace(/"|'|@import|;|.scss|.less/gi, "").trim();
                    match = match.split('/').pop();
                    match = capitalize(match);

                    if (['Variables', 'Mixins', 'Placeholders'].indexOf(match) === -1) {
                      toc += '\n    ' + i + '. ' + match;
                      i++;
                    }
                  }
                }
              }
            }
            return toc;
          }
        },
        // Add empty line after section & subsection comment
        {
          from: /=== \*\//g,
          to: '=== */\n'
        },
        // Add empty line after rule if it doesn't have one already
        {
          from: /}(?!\n\n)/gi,
          to: '}\n'
        }]
      },

      js: {
        src: ['<%= xh.dist %>/js/main.js'],
        overwrite: true,
        replacements: [{
          from: '@@timestamp',
          to: '<%= grunt.template.today() %>'
        }]
      },

      xprecise: {
        src: ['<%= xh.src %>/includes/scripts.html'],
        overwrite: true,
        replacements: [{
          from: '@@xprecise\n',
          to: ''
        }]
      }
    },

    // Create list of @imports
    search: {
      imports: {
        files: {
          src: ['<%= xh.src %>/scss/main.scss']
        },
        options: {
          searchString: /@import[ \("']*([^;]+)[;\)"']*/g,
          logFormat: 'json',
          logFile: '<%= xh.tmp %>/csstoc.json'
        }
      }
    },

    connect: {
      server: {
        options: {
          base: './',
          open: true,
          livereload: {
            port: 35729
          },
          hostname: 'localhost',
          port: 3000
        }
      }
    },

    // Watch
    watch: {
      options: {
        spawn: false
      },

      compileCSS: {
        files: ['<%= xh.src %>/scss/**/*.scss'],
        tasks: ['build-css']
      },

      css: {
        files: ['<%= xh.dist %>/css/*.css'],
        options: {
          livereload: true
        }
      },

      html: {
        files: ['<%= xh.src %>/*.html', '<%= xh.src %>/includes/*.html'],
        tasks: ['build-html'],
        options: {
          livereload: true
        }
      },

      js: {
        files: ['<%= xh.src %>/js/*.js'],
        tasks: ['build-js'],
        options: {
          livereload: true
        }
      },

      assets: {
        files: ['<%= xh.src %>/{img,media,fonts,xprecise}/**/*'],
        tasks: ['build-assets'],
        options: {
          livereload: true
        }
      }
    }

  });

  grunt.registerTask('build-html', [
    'useminPrepare',
    'concat',
    'copy:backup',
    'usemin',
    'includereplace',
    'copy:restore',
    'jsbeautifier:html',
    'clean:tmp'
  ]);

  grunt.registerTask('build-assets', [
    'copy:assets'
  ]);

  grunt.registerTask('build-css', [
    'sass',
    'autoprefixer',
    'cssbeautifier',
    'search',
    'replace:css',
    'clean:tmp'
  ]);

  grunt.registerTask('build-js', [
    'copy:js',
    'jsbeautifier:js',
    'replace:js',
    'jshint'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'postinstall',

    'build-html',
    'build-assets',
    'build-css',
    'build-js',
  ]);

  grunt.registerTask('validate', [
    'validation'
  ]);

  grunt.registerTask('qa', [
    'replace:xprecise',
    'build',
    'validate',
    'jshint'
  ]);

  grunt.registerTask('postinstall', [
    'copy:normalize',
    'uglify:modernizr',
    'copy:jquery'
  ]);

  grunt.registerTask('default', [
    'postinstall',
    'connect:server',
    'watch'
  ]);
};
