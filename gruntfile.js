module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-screeps');

    grunt.initConfig({
        screeps: {
            options: {
                email: process.env.SCREEPS_EMAIL,
                token: process.env.SCREEPS_TOKEN,
                branch: 'default',
            },
            dist: {
                src: ['src/*.js']
            }
        }
    });
}