module.exports = function(grunt) {
    let email = grunt.option('email')
    let token = grunt.option('token')

    if (!email || !token) {
        grunt.fail.fatal('email and token options must be set!')
    }

    console.log(email, token)

    grunt.loadNpmTasks('grunt-screeps');

    grunt.initConfig({
        screeps: {
            options: {
                email,
                token,
                branch: 'default',
            },
            dist: {
                src: ['src/*.js']
            }
        }
    });
}