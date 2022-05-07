const describe = require('describe')
const starter = require('starter')
const miner = require('miner')
const hauler = require('hauler')
const upgrader = require('upgrader')
const attacker = require('attacker')
const builder = require('builder')
const drainer = require('drainer')
const claimer = require('claimer')

const waypoints = require('waypoints')

const ROLES = { starter, miner, hauler, upgrader, attacker, builder, drainer, claimer }

// Game.spawns.Spawn1.memory.queue.push(...)
// {waypoints: ['1', '2', '3', '4', '5', '6', '7', '8', '9']}
// Game.spawns.Spawn2.memory.queue.push([[MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK], 'attacker', {flag: 'a1'}])

// ['9a', '9b', '9c', '10a', '11', '12a', '12b']

const CONTROLLER_MAX_LEVEL = 8

const STARTER = [MOVE, MOVE, WORK, CARRY, CARRY]

const WORKER = [MOVE, CARRY, WORK, WORK]
const HAULER = [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY]
const ATTACKER = [MOVE, MOVE, ATTACK, ATTACK]

const CAUSES_SAFEMODE = [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER]
const IGNORE_REPAIR = [STRUCTURE_ROAD, STRUCTURE_WALL]
const ATTACK_PARTS = [RANGED_ATTACK, ATTACK]
const DANGEROUS_PARTS = [...ATTACK_PARTS, WORK]

function room(r) {
    const dropped = r.find(FIND_DROPPED_RESOURCES)
    dropped.forEach(d => {
        d.store = { getUsedCapacity: () => d.amount }
        d.transfer = c => c.pickup(d)
    })
    
    r.attackers = r.find(FIND_HOSTILE_CREEPS, {filter: a => a.body.find(b => ATTACK_PARTS.includes(b.type))})
    
    if (!r.controller || !r.controller.my) return
    
    r.damaged = r.find(FIND_MY_STRUCTURES, {filter: s => CAUSES_SAFEMODE.includes(s.structureType) && s.hits < s.hitsMax})
    if (!r.controller.safeMode && r.damaged.length > 0 && r.find(FIND_HOSTILE_CREEPS).length > 0) {
        r.controller.activateSafeMode()
        Game.notify('SAFE MODE TRIGGERED IN ' + r)
    }
    
    r.towers = r.find(FIND_MY_STRUCTURES, {filter: s => s.structureType === STRUCTURE_TOWER})
    const targets = r.find(FIND_HOSTILE_CREEPS)
    const repairs = r.find(
        FIND_STRUCTURES, 
        {filter: s => 
            !IGNORE_REPAIR.includes(s.structureType) &&
            s.hits < s.hitsMax}
    )
    
    r.towers.forEach(t => {
        if (targets.length > 0) t.attack(t.pos.findClosestByRange(targets))
        else if (repairs.length > 0) t.repair(t.pos.findClosestByRange(repairs))
    })
}

function spawn(s) {
    function spawnCreep(body, name, memory = {}) {
        const err = s.spawnCreep(body, name + ' ' + Game.time, { memory: { role: name, ...memory }})
        if (err !== OK) s.room.visual.text(describe(err), s.pos.x, s.pos.y + 1)
        return err === OK
    }
    
    const creeps = s.room.find(FIND_MY_CREEPS)
    const roles = creeps.reduce((r, c) => 
        { return r[c.memory['role']]++, r },
        { starter: 0, miner: 0, hauler: 0, upgrader: 0, builder: 0 })
        
    if (!s.memory.queue) {
        s.memory.queue = []
    }
    
    const sites = s.room.find(FIND_CONSTRUCTION_SITES)

    if (roles.miner === 0 && roles.starter < 5) {
        spawnCreep(STARTER, 'starter')
    } else if (roles.miner < 4) {
        spawnCreep(WORKER, 'miner')
    } else if (roles.hauler < 3) {
        spawnCreep(HAULER, 'hauler')
    } else if ((s.room.damaged.length > 0 || sites.length > 0) && roles.builder < 2) {
        spawnCreep(WORKER, 'builder')
    } else if (s.memory.queue.length > 0) {
        if (spawnCreep(...s.memory.queue[0])) s.memory.queue.shift()
    } else if (roles.upgrader < 2 && s.room.controller.level < CONTROLLER_MAX_LEVEL && sites.length === 0) {
        spawnCreep(WORKER, 'upgrader')
    } 
}

function creep(c) {
    try {
        if (waypoints(c)) return
        const run = ROLES[c.memory.role]
        run ? run(c) : c.say('no role')
    } catch(e) {
        console.log(c.memory.role)
        console.log(e.stack)
    }
}

module.exports.loop = function () {
    Object.values(Game.rooms).forEach(room)
    Object.values(Game.spawns).forEach(spawn)
    Object.values(Game.creeps).forEach(creep)
}

Object.keys(Memory.creeps).forEach(name => { if (Game.creeps[name] === undefined) delete Memory.creeps[name] })