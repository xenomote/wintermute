// Game.spawns.Spawn1.memory.queue.push([[MOVE, CARRY, WORK, WORK], 'builder'])


module.exports = function builder(c) {
    if (c.memory.site === undefined) {
        const site = c.pos.findClosestByPath(FIND_CONSTRUCTION_SITES)
        if (site) {
            c.memory.site = site.id
        }
        return
    }
    
    const site = Game.getObjectById(c.memory.site)
    
    if (!site) {
        c.memory.site = undefined
        return
    }
        
    
    if (c.build(site) === ERR_NOT_IN_RANGE) {
        c.moveTo(site)
    }
};