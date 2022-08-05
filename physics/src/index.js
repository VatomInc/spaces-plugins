/**
 * Physics
 *
 * Allows objects in the space to have physics.
 *
 * All information regarding plugin development can be found at
 * https://developer.vatom.com/plugins/plugins/
 *
 * @license MIT
 * @author Vatom Inc.
 */

/** Determines the interval of state transfer over the network, in milliseconds */
const StateTransferInterval = 100

module.exports = class Physics extends BasePlugin {

    /** Plugin info */
    static get id()             { return 'vatominc-physics' }
    static get name()           { return 'Physics' }
    static get description()    { return 'Allows objects in the space to have physics.' }

    /** Position of user in the x direction */
    userX = 0

    /** Position of user in the y direction */
    userY = 0

    /** Position of user in the z direction */
    userZ = 0

    /** Called when the plugin is loaded */
    onLoad() {

        // Import physics engine
        importScripts(this.paths.absolute('./cannon.min.js'))

        // Generate an ID to represent this session
        this.sessionID = Math.random().toString(36).substr(2)

        // List of all active components
        this.activeComponents = []

        // Register a component type for objects
        this.objects.registerComponent(PhysicsComponent, {
            id: 'vatominc-physics-component',
            name: 'Physics',
            description: 'Add physics to the object.',
            settings: [
                { id: 'shape', name: 'Collision Shape', type: 'select', values: ['Box', 'Sphere', 'Plane', 'Container'] },
                { id: 'static', name: 'Static', type: 'checkbox' },
                { id: 'jump-click', name: 'Jump on Click', type: 'checkbox' },
                { id: 'rotation-lock', name: 'Rotation Lock', type: 'checkbox' }
            ]
        })

        // Create world
        this.world = new CANNON.World()
        this.world.gravity.set(0, -9.8, 0)
        this.world.allowSleep = true

        // Create bouncy material
        const material = new CANNON.Material({ restitution: 0.9 })

        // Add fixed floor plane
        const ground = new CANNON.Body({ mass: 0, material: material })
        ground.addShape(new CANNON.Plane())
        ground.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
        this.world.addBody(ground)

        // Add cube to represent the user
        this.userCube = new CANNON.Body({ mass: 0, type: CANNON.Body.DYNAMIC })
        this.userCube.addShape(new CANNON.Sphere(0.5))
        this.userCube.position.set(0, 0.5, 0)
        this.userCube.component = { isOwner: true }
        this.world.addBody(this.userCube)

        // Setup a timer
        this.lastTime = Date.now()
        this.timer = setInterval(e => this.onTimer(), 1000/60)

    }

    /** Called when the plugin is unloaded */
    onUnload() {

        // Remove timer
        clearInterval(this.timer)

    }

    /** Called when the user moves */
    onUserMoved(x, y, z) {

        // Update user cube
        this.userX = x
        this.userY = y
        this.userZ = z
        this.userCube.position.set(x || 0, 0.5, z || 0)
        this.userCube.wakeUp()

    }

    /** Called on each timer iteration */
    onTimer() {

        let delta = (Date.now() - this.lastTime) / 1000
        this.lastTime = Date.now()
        this.world.step(1/60, delta, 3)

        // Check if enough time has elapsed for a state transfer, if not then stop
        if (this.lastStateTransfer && Date.now() - this.lastStateTransfer < StateTransferInterval) {
            return
        }

        this.lastStateTransfer = Date.now()

        // Create a list of all data
        let states = []
        for (let component of this.activeComponents) {

            // Stop if not needing a state transfer
            if (!component.needsTransmit) {
                continue
            }

            // It needs a transfer, store it's state
            component.needsTransmit = false
            states.push(component.getState())

        }

        // Stop if no states need to be transferred
        if (states.length == 0) {
            return
        }

        // Transmit state update
        this.messages.send({ action: 'update-state', ownerID: this.sessionID, states })

    }

    /** Called on incoming message */
    onMessage(data) {

        // Ignore messages that are not relevant
        if (data.action != 'update-state') {
            return
        }

        let obj = null

        // Go through each state
        for (let state of data.states) {
            obj = this.activeComponents.find(c => c.objectID == state[0])

            if (obj) {
                obj.onRemoteUpdate(data.ownerID, state)
            }
        }

    }

}

/**
 * Component that can be attached to an object to enable physics for
 * that object.
 */
class PhysicsComponent extends BaseComponent {

    /** Identifier for the object */
    objectID = Math.random().toString(36).substr(2)

    /** Owner of this object */
    owner = ''

    /** Last update time */
    ownerLastUpdate = Date.now()

    /** Random number used when claiming an owner */
    ownerNonce = 0

    /** `true` when the body is awake, `false` otherwise */
    isAwake = false

    /** @returns `true` if we own the object, `false` otherwise */
    get isOwner() {
        return this.owner == this.plugin.sessionID
    }

    /** Called when the component is loaded */
    async onLoad() {

        // Store it
        this.plugin.activeComponents.push(this)

        // `true` if the physics state should be transferred to the network as soon as possible
        this.needsTransmit = false

        // Cached position
        this.cachedPosition = new CANNON.Vec3()
        this.cachedQuaternion = new CANNON.Quaternion()

        // Create a body to represent this object
        this.onObjectUpdated()

    }

    /** Called when the component is unloaded */
    onUnload() {

        // Remove it
        this.plugin.activeComponents = this.plugin.activeComponents.filter(o => o != this)

        // Remove body
        this.plugin.world.removeBody(this.body)
        console.debug(`[Physics] Removed body, id = ${this.objectID}`)

    }

    /** Called when the fields for the object changes */
    onObjectUpdated() {

        // Calculate shape scale
        const scale = this.fields.scale || 1
        const scaleExt = scale / 3.45

        // Remove old body
        if (this.body) {
            this.plugin.world.removeBody(this.body)
        }

        // Create bouncy material
        const material = new CANNON.Material({ restitution: 0.9 })

        // Create body
        this.body = new CANNON.Body({
            mass: 1,
            type: CANNON.Body.DYNAMIC,
            position: new CANNON.Vec3(this.fields.x || 0, this.fields.elevation || this.fields.hf_height || 0, this.fields.y || 0),
            linearDamping: 0.25,
            angularDamping: 0.25,
            material: material,
            fixedRotation: !!this.getField('rotation-lock')
        })

        if (this.getField('shape') == 'Sphere') {

            // Create sphere
            let shape = new CANNON.Sphere(scaleExt)
            this.body.addShape(shape)

        } else if (this.getField('shape') == 'Container') {

            // Create container
            this.body.addShape(new CANNON.Box(new CANNON.Vec3(0.1, 9999, scale)), new CANNON.Vec3(-scale / 2, 0, 0))
            this.body.addShape(new CANNON.Box(new CANNON.Vec3(0.1, 9999, scale)), new CANNON.Vec3(+scale / 2, 0, 0))
            this.body.addShape(new CANNON.Box(new CANNON.Vec3(scale, 9999, 0.1)), new CANNON.Vec3(0, 0, -scale / 2))
            this.body.addShape(new CANNON.Box(new CANNON.Vec3(scale, 9999, 0.1)), new CANNON.Vec3(0, 0, +scale / 2))

        } else {

            // Default: Create box
            let shape = new CANNON.Box(new CANNON.Vec3(scaleExt, scaleExt, scaleExt))
            this.body.addShape(shape)

        }

        // Add extra params
        this.body.postStep = this.onBodyStep.bind(this)
        this.body.addEventListener('collide', this.onCollide.bind(this))
        this.body.allowSleep = true
        this.body.sleepSpeedLimit = 0.1
        this.body.sleepTimeLimit = 1
        this.body.component = this
        this.plugin.world.addBody(this.body)
        this.needsTransmit = false

        // Make static if necessary
        if (this.getField('static')) {
            this.body.mass = 0
            this.body.type = CANNON.Body.STATIC
            this.body.updateMassProperties()
        }

        // Add event listener
        this.body.addEventListener('sleep', this.onBodySleep.bind(this))
        this.body.addEventListener('wakeup', this.onBodyWake.bind(this))

    }

    /** Called when the object is clicked */
    onClick() {

        // Claim owner
        this.claimOwner()

        // Apply a force if necessary
        if (this.getField('jump-click')) {
            this.body.applyLocalImpulse(new CANNON.Vec3(0, 10, 0), new CANNON.Vec3(0, 0, 0))
        }

    }

    /** Called when the body transitions to a wake state */
    onBodyWake() {
        this.isAwake = true
    }

    /** Called when the body transitions to a sleep state */
    onBodySleep() {
        this.isAwake = false
    }

    /** Called each world iteration */
    onBodyStep() {

        // Do nothing if object is not awake
        if (!this.isAwake) {
            return
        }

        // Update object
        this.needsTransmit = true
        this.plugin.objects.update(
            this.objectID,
            {
                position: [ this.body.position.x, this.body.position.y, this.body.position.z ],
                quaternion: [ this.body.quaternion.x, this.body.quaternion.y, this.body.quaternion.z, this.body.quaternion.w ]
            },
            true
        )

    }

    /** Called when collision occurs */
    onCollide(e) {

        // Get collided object
        const collidedWith = e.body.component
        if (!collidedWith) {
            return
        }

        // Claim ownership of this object if the one we collided with is also ours
        if (collidedWith.isOwner) {
            this.claimOwner()
        }

    }

    /** Sets the current user as the owner of this physics object */
    claimOwner() {

        // Stop if object is static
        if (this.getField('static')) {
            return
        }

        // Wake up the object
        this.body.wakeUp()
        this.isAwake = true

        // Own it
        this.owner = this.plugin.sessionID
        this.ownerLastUpdate = Date.now()
        this.ownerNonce += 1

    }

    /** @returns Current state of the object. This will be passed to `onRemoteUpdate()` for remote clients. */
    getState() {
        return {
            id: this.objectID,
            nonce: this.ownerNonce,
            updatedAt: Date.now(),
            angularVelocity: {
                x: this.body.angularVelocity.x,
                y: this.body.angularVelocity.y,
                z: this.body.angularVelocity.z
            },
            force: {
                x: this.body.force.x,
                y: this.body.force.y,
                z: this.body.force.z
            },
            inertia: {
                x: this.body.inertia.x,
                y: this.body.inertia.y,
                z: this.body.inertia.z
            },
            position: {
                x: this.body.position.x,
                y: this.body.position.y,
                z: this.body.position.z
            },
            previousPosition: {
                x: this.body.previousPosition.x,
                y: this.body.previousPosition.y,
                z: this.body.previousPosition.z
            },
            quaternion: {
                x: this.body.quaternion.x,
                y: this.body.quaternion.y,
                z: this.body.quaternion.z,
                w: this.body.quaternion.w
            },
            torque: {
                x: this.body.torque.x,
                y: this.body.torque.y,
                z: this.body.torque.z
            },
            velocity: {
                x: this.body.velocity.x,
                y: this.body.velocity.y,
                z: this.body.velocity.z
            }
        }
    }

    /** Called on remote update, when another peer sends us an object update. */
    onRemoteUpdate(ownerID, state) {

        // Get values
        const nonce = state.nonce
        const updatedAt = state.updatedAt

        // Stop if ours
        if (ownerID == this.plugin.sessionID) {
            return
        }

        // Stop if changing owner and their nonce is lower than ours
        if (this.owner != ownerID && nonce <= this.ownerNonce) {
            return
        }

        // Store new owner of this object
        if (this.owner == this.plugin.sessionID) {
            console.debug(`[Physics] Releasing owner to "${ownerID}"`)
        }

        this.owner = ownerID
        this.ownerLastUpdate = updatedAt
        this.ownerNonce = nonce

        // Update all fields for this object
        this.body.angularVelocity.x   = state.angularVelocity.x
        this.body.angularVelocity.y   = state.angularVelocity.y
        this.body.angularVelocity.z   = state.angularVelocity.z
        this.body.force.x             = state.force.x
        this.body.force.y             = state.force.y
        this.body.force.z             = state.force.z
        this.body.inertia.x           = state.inertia.x
        this.body.inertia.y           = state.inertia.y
        this.body.inertia.z           = state.inertia.z
        this.body.position.x          = state.position.x
        this.body.position.y          = state.position.y
        this.body.position.z          = state.position.z
        this.body.previousPosition.x  = state.previousPosition.x
        this.body.previousPosition.y  = state.previousPosition.y
        this.body.previousPosition.z  = state.previousPosition.z
        this.body.quaternion.x        = state.quaternion.x
        this.body.quaternion.y        = state.quaternion.y
        this.body.quaternion.z        = state.quaternion.z
        this.body.quaternion.w        = state.quaternion.w
        this.body.torque.x            = state.torque.x
        this.body.torque.y            = state.torque.y
        this.body.torque.z            = state.torque.z
        this.body.velocity.x          = state.velocity.x
        this.body.velocity.y          = state.velocity.y
        this.body.velocity.z          = state.velocity.z

        // Wake it up
        this.body.wakeUp()

    }

}
