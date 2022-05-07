/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('waypoints');
 * mod.thing == 'a thing'; // true
 */

module.exports = function waypoints(c) {
    if (c.memory.waypoints === undefined) return false
    if (c.memory.waypoints.length === 0) {
        c.memory.waypoints === undefined
        return false
    }
    
    const waypoint = Game.flags[c.memory.waypoints[0]]
    
    if (!waypoint) {
        c.say('!' + c.memory.waypoints[0])
        return true
    }
    
    if (c.pos.getRangeTo(waypoint) < 5) {
        c.memory.waypoints.shift()
        return true
    }
    
    c.moveTo(waypoint.pos)
    
    return true
};