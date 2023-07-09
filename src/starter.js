const mining = 'isMining'

module.exports = function starter(c) {
    if (Game.flags.settle) {
        c.moveTo(Game.flags.settle.pos)
        return
    }
    if (c.memory[mining]) {
        let source = c.pos.findClosestByPath(FIND_SOURCES)
        if (c.harvest(source) === ERR_NOT_IN_RANGE) {
            c.moveTo(source)
        }

        if (c.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            c.memory[mining] = false
        }
        
    } else {
        let ss = c.room.find(FIND_MY_STRUCTURES, {filter: s => s.store && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0})
        
        if (ss.length === 0) {
            if (c.upgradeController(c.room.controller) === ERR_NOT_IN_RANGE) {
                c.moveTo(c.room.controller)
            }

        } else {
            let s = ss[0]
            if (c.transfer(s, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                c.moveTo(s)
            }

        }
        
        if (c.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
            c.memory[mining] = true
        }
    }
};