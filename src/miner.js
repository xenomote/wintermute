const describe = require('describe')

// Game.spawns.Spawn1.memory.queue.push([[MOVE, CARRY, WORK, WORK], 'miner'])

function findLeastUsedSource(c) {
    const miners = c.room.find(FIND_MY_CREEPS, {filter: m => m.memory.role === 'miner'})
    const sources = c.room.find(FIND_SOURCES, {filter: s => !s.room.memory.ignoredSources || !s.room.memory.ignoredSources.includes(s.id)})
        .reduce((a, s) => ({ ...a, [s.id]: 0}), {})
    
    miners.forEach(m => sources[m.memory.source]++)
    
    return _.min(Object.entries(sources), ([_, v]) => v)[0]
}

function findAdjacentContainer(c) {
    const containers = c.room.find(
        FIND_STRUCTURES,
        {filter: s => 
            s.structureType === STRUCTURE_CONTAINER &&
            s.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
            s.pos.getRangeTo(c) <= 1
        }
    )
    
    return containers.length > 0 ? containers[0] : null
}

module.exports = function miner(c) {
    c.transfer(findAdjacentContainer(c), RESOURCE_ENERGY)

    if (c.store.getFreeCapacity(RESOURCE_ENERGY) === 0) return
    
    const source = Game.getObjectById(c.memory.source)
    
    if (!source || c.memory.source === undefined) {
        c.say('no source')
        c.memory.source = findLeastUsedSource(c)
        return
    }
    
    c.harvest(source)
    
    
    if (c.pos.getRangeTo(source) > 1) {
        c.moveTo(source)
    }
};