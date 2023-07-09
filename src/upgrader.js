const describe = require('describe')

/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('upgrader');
 * mod.thing == 'a thing'; // true
 */
module.exports = function upgrader(c) {
    const err = c.upgradeController(c.room.controller)
    //c.say(describe(err))
    if (err === ERR_NOT_IN_RANGE) {
        c.moveTo(c.room.controller)
    }
};