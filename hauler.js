const describe = require('describe')

// Game.spawns.Spawn1.memory.queue.push([[MOVE, MOVE, MOVE, CARRY, CARRY, CARRY], 'hauler'])

const DROPOFFS = ['builder', 'upgrader']
const PICKUPS = ['miner']
const IMPORTANT = [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER]

function multipleMax(cs) {
    const max = _.max(cs, c => amount(c))
    return _.filter(cs, c => amount(c) === amount(max))
}

function multipleMin(cs) {
    const min = _.min(cs, c => amount(c))
    return _.filter(cs, c => amount(c) === amount(min))
}

function amount(t) {
    if (t instanceof Creep || t instanceof StructureContainer || t instanceof Ruin) {
        return t.store.getUsedCapacity(RESOURCE_ENERGY)
    }
    
    if (t instanceof Resource) {
        return t.amount
    }
}

function take(c, t) {
    if (t instanceof Creep) {
        return t.transfer(c, RESOURCE_ENERGY)
    }
    if (t instanceof StructureContainer || t instanceof Ruin) {
        return c.withdraw(t, RESOURCE_ENERGY)
    }
    if (t instanceof Resource) {
        return c.pickup(t)
    }
}

function findNextPickup(c) {
    const ruins = c.room.find(
        FIND_RUINS,
        { filter: r =>
            r.store.getUsedCapacity(RESOURCE_ENERGY) > 0}
    )
    
    const dropped = c.room.find(
        FIND_DROPPED_RESOURCES,
        { filter: r =>
            r.resourceType === RESOURCE_ENERGY}
    )
    
    const miners = c.room.find(
        FIND_MY_CREEPS,
        { filter: c => 
            c.memory.role === 'miner' &&
            c.store.getUsedCapacity(RESOURCE_ENERGY) > 0}
    )
    
    const containers = c.room.find(
        FIND_STRUCTURES,
        { filter: s =>
            s.structureType === STRUCTURE_CONTAINER &&
            s.store.getUsedCapacity(RESOURCE_ENERGY) > 0}
    )
   
    const targets = [].concat(miners, dropped, containers, ruins)
        
    if (targets.length === 0) return false

    const newTarget = c.pos.findClosestByPath(multipleMax(targets))
    
    if (c.store.getUsedCapacity(RESOURCE_ENERGY) > c.store.getCapacity(RESOURCE_ENERGY) * 0.5 && c.pos.getRangeTo(newTarget) > 10) return false
    
    c.memory.hauling = false
    c.memory.target = newTarget.id
    c.moveTo(newTarget)
    
    return newTarget
}

function priority(t) {
    return t.store.getUsedCapacity(RESOURCE_ENERGY)
}

function onlyStructure(structureType) {
    return {filter: s => 
        s.structureType === structureType &&
        s.store.getCapacity(RESOURCE_ENERGY) > 0 &&
        s.store.getFreeCapacity(RESOURCE_ENERGY) > 0}
}

function dropoffs(c) {
    
    const structureTypes = [STRUCTURE_TOWER, STRUCTURE_EXTENSION, STRUCTURE_SPAWN]
    
    
    for (const structureType of structureTypes) {
        const structures = c.room.find(FIND_MY_STRUCTURES, onlyStructure(structureType))
        if (structures.length > 0) return structures
    }

    const creeps = c.room.find(
        FIND_MY_CREEPS,
        {filter: d => 
            DROPOFFS.includes(d.memory.role) &&
            d.store.getCapacity(RESOURCE_ENERGY) > 0 &&
            d.store.getFreeCapacity(RESOURCE_ENERGY) > 0}
    )
    if (creeps.length > 0) return creeps
    
    return []
}

function findNextDropoff(c) {
    const targets = multipleMin(dropoffs(c))

    if (targets.length === 0) return false

    const newTarget = c.pos.findClosestByPath(targets)
    
    c.memory.hauling = true
    c.memory.target = newTarget.id
    c.moveTo(newTarget)
    
    return newTarget
}

module.exports = function hauler(c) {
    const target = Game.getObjectById(c.memory.target) || (c.memory.hauling ? findNextDropoff(c) : findNextPickup(c))
    if (!target) {
        (c.memory.hauling ? findNextDropoff(c) : findNextPickup(c))
        return
    }
    c.moveTo(target)
    
    if (c.memory.hauling) {
        if (target.room !== c.room) {
            findNextPickup(c)
            return
        }
        
        const err = c.transfer(target, RESOURCE_ENERGY)
        
        if (c.store.getUsedCapacity(RESOURCE_ENERGY) === 0){
            findNextPickup(c)
        } else if (err == OK || target.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            findNextDropoff(c)
        }
    } else {
        const err = take(c, target)
        
        if (c.store.getFreeCapacity(RESOURCE_ENERGY) === 0){
            findNextDropoff(c)
        } else if (err === OK || target.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
            findNextPickup(c) || findNextDropoff(c)
        }
    }
};