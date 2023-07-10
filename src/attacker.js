const describe = require('describe')

// Game.spawns.Spawn1.memory.queue.push([[TOUGH, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, MOVE], 'attacker']) 

const IGNORED = [STRUCTURE_ROAD, STRUCTURE_WALL, STRUCTURE_CONTROLLER, STRUCTURE_CONTAINER]

function leaveEdge(c) {
    if (c.pos.x <= 1) {
        c.move(RIGHT)
    }
    if (c.pos.x >= 48) {
        c.move(LEFT)
    }
    if (c.pos.y <= 1) {
        c.move(BOTTOM)
    }
    if (c.pos.y >= 48) {
        c.move(TOP)
    }
}

module.exports = function attacker(c) {

    if (c.memory.flag === undefined) c.memory.flag = 'attack'
    if (Game.flags[c.memory.flag] === undefined) return
    const flag = Game.flags[c.memory.flag]
    
    
    function attack(target) {
        if (target) {
            c.moveTo(target)
            c.attack(target)
            
            return true
        }
        return false
    }
    
    if (flag.pos.roomName !== c.pos.roomName) {
        let err = c.moveTo(flag, { maxOps: 10000 })
        if (err === ERR_NO_PATH) leaveEdge(c)
        
        if (err !== OK) c.room.visual.text(describe(err), c.pos.x, c.pos.y)
        return
    }
    
    // const attacker = c.pos.findClosestByPath(c.room.attackers)
    // if (attack(attacker)) return

    const enemy = c.pos.findClosestByPath(FIND_HOSTILE_CREEPS)
    if (attack(enemy)) {
        // if (c.pos.getRangeTo(flag) > 3) {
        //     c.moveTo(flag)
        // }
        return
    }
    
    if (c.room.find(FIND_MY_STRUCTURES).length > 0) {
        c.moveTo(flag)
        return
    }
        
    const structure = c.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {filter: s => !IGNORED.includes(s.structureType)})
    if (attack(structure)) return
    
    if (c.room.find(FIND_HOSTILE_STRUCTURES).length === 0) {
        c.moveTo(flag)
        return
    }
    
    const wall = c.pos.findClosestByPath(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_WALL})
    if (attack(wall)) return 
};