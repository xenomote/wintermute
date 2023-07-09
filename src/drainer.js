const describe = require('describe')

// Game.spawns.Spawn1.memory.queue.push([[MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL], 'drainer']) 

function leaveEdge(c) {
    if (c.pos.x < 1) {
        c.move(RIGHT)
    }
    if (c.pos.x > 48) {
        c.move(LEFT)
    }
    if (c.pos.y < 1) {
        c.move(BOTTOM)
    }
    if (c.pos.y > 48) {
        c.move(TOP)
    }
}

module.exports = function drainer(c) {
    if (Game.flags.drain === undefined) return
    
    const heals = c.room.find(FIND_MY_CREEPS, {filter: s => s.hits < s.hitsMax})
    const flees = c.room.find(FIND_HOSTILE_CREEPS, {filter: s => s.body.some(b => b.type === ATTACK)})
    
    
    if (heals.length > 0) {
        const s = c.pos.findClosestByPath(heals)
        c.moveTo(s)
        c.pos.getRangeTo(s) > 1 ? c.rangedHeal(s) : c.heal(s)
        
    } else if (c.memory.flag !== undefined) {
        const flag = Game.flags[c.memory.flag]
        if (!flag) return
        c.moveTo(flag)
        
    }
    
    return
    
    ///////
    
    c.heal(c)
    if (c.memory.draining) {
        let err = c.moveTo(Game.flags.drain.pos)
    
        if (err === ERR_NO_PATH) leaveEdge(c)
        if (err !== OK) c.room.visual.text(describe(err), c.pos.x, c.pos.y)
        
        if (c.hits < c.hitsMax) {
            c.memory.draining = false
        }
    } else {
        if (c.room === Game.flags.drain.room) {
            c.moveTo(c.pos.findClosestByRange(FIND_EXIT))
        } else {
            leaveEdge(c)
        }

        if (c.hits === c.hitsMax) {
            c.memory.draining = true
        }
    }
};