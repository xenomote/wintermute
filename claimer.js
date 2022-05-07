const describe = require('describe')

// Game.spawns.Spawn1.memory.queue.push([[MOVE, CLAIM], 'claimer']) 

module.exports = function claimer(c) {
    if (Game.flags.claim === undefined) return
    
    if (c.room === Game.flags.claim.room) {
        const err = c.claimController(c.room.controller)
        
        if (err === ERR_NOT_IN_RANGE) {
            c.moveTo(c.room.controller.pos)
        } else {
            c.room.visual.text(describe(err), c.pos.x, c.pos.y)
        }
    } else {
        c.moveTo(Game.flags.claim.pos)
    }
};