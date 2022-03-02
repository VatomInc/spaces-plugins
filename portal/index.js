/**
 * Portal
 *
 * Allows users to teleport to different areas (within a space) using a portal.
 *
 * All information regarding plugin development can be found at
 * https://dev.spatialweb.net/plugins/plugins/
 *
 * @license MIT
 * @author Vatom Inc.
 */
module.exports = class PortalPlugin extends BasePlugin {

    /** Plugin info */
    static get id()             { return 'vatominc-portals' }
    static get name()           { return 'Portals' }
    static get description()    { return 'Allow users to teleport to different areas within the space.' }

    /** All loaded portals */
    portals = []

    /** Timer used to check portals */
    timer = 0

    /** `true` if the portals are currently being checked, `false` otherwise */
    isChecking = false

    /** Portal that we are currently inside */
    currentlyInsidePortal = null

    /** Timer to keep track of your last portal time */
    portalTimer = null

    /** Called when the plugin is loaded */
    onLoad() {

        // Register component
        this.objects.registerComponent(PortalComponent, {
            id: 'portal',
            name: 'Portal',
            description: 'Allow users to teleport to different areas within the space.',
            settings: [
                { id: 'group-id', name: 'Group ID', type: 'text', help: 'Identifier used to link portals together. Use the same group ID for portals that you want linked.' },
                { id: 'activation-range', name: 'Activation Range', type: 'number', default: 0.5, help: 'Distance away from the center of the portal that will cause users to trigger it. Default is 0.5 meters.' },
                { id: 'entry-sound-url', name: 'Entry Sound', type: 'textarea', help: 'URL for the sound to play when using the portal. Leave blank for the default, or "none" to disable.' }
            ]
        })

        // Create query timer
        this.timer = setInterval(this.onTimer.bind(this), 250)

    }

    /** Called when the plugin is unloaded */
    onUnload() {

        // Stop timer
        clearInterval(this.timer)

    }

    /** Called when the portals need to be checked */
    onTimer() {

        // Only run one at a time
        if (this.isChecking) {
            return
        }

        this.isChecking = true
        this.checkPortals().then(e => {
            // Done
            this.isChecking = false
        }).catch(err => {
            // Failed
            console.warn('[Portals] Error with portal:', err)
            this.isChecking = false
        })

    }

    /** Check the portals for any users who may be nearby */
    async checkPortals() {

        // Do nothing if no portals loaded
        if (this.portals.length === 0) {
            return
        }

        // Get position of user
        const userPosition = await this.user.getPosition()

        let activatePortal = null

        // Check if we are in range of any of the portals
        for (const portal of this.portals) {

            // X and Z are the 3D equivalent to the X and Y position in 2D
            const x = portal.fields.x || 0
            const z = portal.fields.y || 0

            // Calculate distance between the user and the portal (ignore height)
            const distance = Math.sqrt((x - userPosition.x) ** 2 + (z - userPosition.z) ** 2)
            const activationRange = parseFloat(portal.getField('activation-range')) || 0.5

            // Further than activation range, so check next portal
            if (distance > activationRange) {
                continue
            }

            // Within activation range, so we can stop checking
            activatePortal = portal
            break

        }

        // Stop if the portal we are in is the same as the last activated one or if it has been less than 2 seconds since our last portal.
        // This is to correctly recover from errors and to ensure the user
        // does not continue to bounce between portals the whole time
        if (this.currentlyInsidePortal == activatePortal || this.portalTimer + 2000 >= Date.now()) {
            return
        }

        this.currentlyInsidePortal = activatePortal

        // Stop if no portal to activate
        if (!activatePortal) {
            return
        }

        // Activate portal
        this.portalTimer = Date.now()
        await activatePortal.activate()

    }

}

/**
 * Component that can be added to an object to make it a portal.
 */
class PortalComponent extends BaseComponent {

    /** Called when the component is loaded */
    async onLoad() {

        // Instance identifier for this portal component
        this.instanceID = Math.random().toString(36).substr(2)

        // Add this portal to plugin list
        this.plugin.portals.push(this)

        // Preload entry sound if not disabled
        const entrySound = this.getField('entry-sound-url') || this.paths.absolute('teleport.mp3')
        if (entrySound !== 'none') {
            this.plugin.audio.preload(entrySound)
        }

        // Move on if not an admin
        if (!this.plugin.user.isAdmin) {
            return
        }

        let willAlwaysLoad = this.fields.render_distance >= 999999999

        // Ensure that the object is always loaded
        if (!willAlwaysLoad && await this.plugin.user.isAdmin()) {
            // Update it
            console.debug(`[Portals] Updating the portal object to always load. Object ID = ${this.objectID}`)
            this.plugin.objects.update(this.objectID, { render_distance: 999999999 }, false)
        }

    }

    /** Called when the component is unloaded */
    onUnload() {

        // Remove reference
        this.plugin.portals = this.plugin.portals.filter(p => p != this)

    }

    /** Called by the main plugin when the portal should be activated */
    async activate() {

        // Get group ID
        const groupID = this.getField('group-id')
        if (!groupID) {
            throw new Error(`Portal ${this.instanceID} does not have a group ID set.`)
        }

        // Get all destination portals with this ID
        const portals = this.plugin.portals.filter(p => p != this && p.getField('group-id') === groupID)

        let targetPortal = null

        // Choose a portal to go to
        if (portals.length == 0) {

            // No destination portal
            console.warn(`[Portals] No portals found for group ID = ${groupID}`)
            return

        } else if (portals.length == 1) {

            // There is a single target portal, so go to that one
            targetPortal = portals[0]

        } else {

            // Multiple portals in this group, so select one at random
            console.warn(`[Portals] There are ${portals.length} portals with group ID = ${groupID}, selecting a random portal...`)
            targetPortal = portals[Math.floor(Math.random() * portals.length)]

        }

        // Play the entry sound locally if not disabled
        const entrySound = this.getField('entry-sound-url') || this.paths.absolute('teleport.mp3')
        if (entrySound !== 'none') {
            this.plugin.audio.play(entrySound)
        }

        // Play sound for other users
        this.sendMessage({ fromInstance: this.instanceID, action: 'play-entry-sound' }, true)

        // Move avatar to the position of the target
        console.debug(`[Portals] Portal activated, going from "${this.fields.name || this.fields.id}" to "${targetPortal.fields.name || targetPortal.fields.id}"`)

        await this.plugin.user.setPosition(targetPortal.fields.x || 0, 0, targetPortal.fields.y || 0)

        // Set target portal as the last activated portal, so that we do not trigger it by accident
        this.plugin.currentlyInsidePortal = targetPortal

        // Play sound for other users
        targetPortal.sendMessage({ fromInstance: this.instanceID, action: 'play-entry-sound' }, true)

    }

    /** Called when a remote message is received */
    onMessage(msg) {

        // Check what to do
        if (msg.action === 'play-entry-sound') {

            // Stop if from our own instance, this message is meant for remote users only
            if (msg.fromInstance == this.instanceID) {
                return
            }

            // Play it at this position if not disabled
            const entrySound = this.getField('entry-sound-url') || this.paths.absolute('teleport.mp3')
            if (entrySound !== 'none') {
                this.plugin.audio.play(entrySound, {
                    x: this.fields.x || 0,
                    y: this.fields.y || 0,
                    height: this.fields.height || 0,
                    radius: 10
                })
            }

        }

    }

}
