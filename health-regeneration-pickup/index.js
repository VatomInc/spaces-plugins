/**
* Health Regeneration Pickup
*
* Allows for creation of health regeneration pickups that heal health over time
*
* @license MIT
* @author Liron-Toledo
*/
module.exports = class HealthRegenPlugin extends BasePlugin {

    /** Plugin info */
    static get id()             { return 'health-regeneration-pickup-plugin' }
    static get name()           { return 'Health Regneration Pickup' }
    static get description()    { return 'Allows for creation of health regeneration pickups' }

    /** Called when the plugin is loaded */
    onLoad() {

        this.objects.registerComponent(HealthRegenPickup, {
            id: 'health-regen-pickup',
            name: 'Health Regeneration Pickup',
            description: 'Converts this object into a health regeneration pickup.',
            settings: [
                { id: 'trigger-distance', name: 'Trigger Distance', type: 'number', default: 1, help: 'How far, in metres, the user has to be to trigger the pickup' },
                { id: 'respawn-time', name: 'Respawn Time', type: 'number', default: 5, help: 'How long, in seconds, it takes for the pickup to respawn' },
                { id: 'amount', name: 'Health Amount', type: 'number', default: 5, help: 'How much health is gained from this pickup every second' },
                { id: 'effect-length', name: 'Effect Length', type: 'number', default: 10, help: 'How long, in seconds, the health regeneration lasts for ' },
                { id: 'sound-effect-volume', name: 'Sound Effect Volume', type: 'number', default: 0.5, help: 'Volume of the attached sound effect, with a value of 1 being full volume and 0 being silent' },
            ]
        })
        
    }

}

class HealthRegenPickup extends BaseComponent {

    onLoad() {

        const sound = this.paths.absolute('./Health_Regen_Pickup.mp3')
        if (sound) {
            this.plugin.audio.preload(sound)
        }

        // Generate instance ID
        this.instanceID = Math.random().toString(36).substr(2)
        this.timer = setInterval(this.onTimer.bind(this), 200)
    }

    /** Called when an action is performed */
    onAction(action) {

        // Remove this pick-up
        if (action == 'remove-pickup') {
            this.plugin.objects.remove(this.objectID)
        }

    }

    async onMessage(e) {
        if (e.id != this.instanceID) {
            if(e.action == "activate-pickup"){
                // this.plugin.audio.play(absolutePath('Health_Regen_Pickup.mp3'), {x: e.position.x, y: e.position.z, height: e.position.y, radius: 40})
                this.plugin.objects.update(e.objectID, { hidden: true }, true)
                let respawnTime = (parseFloat(this.getField('respawn-time')) * 1000) || 5000
                setTimeout(() => {
                    this.plugin.objects.update(e.objectID, { hidden: false }, true)
                }, respawnTime)
            }

        }
    }

     /** Called on a regular basis to check if user can pick up this power-up */
     async onTimer() {

        // Only allow triggering once
        if (this.hasTriggered) {
            return
        }

        // Get user position
        let userPos = await this.plugin.user.getPosition()
        
        // Get object position 
        const x = this.fields.x       || 0
        const y = this.fields.height  || 0
        const z = this.fields.y       || 0

        // Calculate distance between the user and this pickup
        const distance = Math.sqrt((x - userPos.x) ** 2 + (y - userPos.y) ** 2 + (z - userPos.z) ** 2)

        // If close enough, trigger Mine
        let triggerDistance = parseFloat(this.getField('trigger-distance')) || 1
        if (distance < triggerDistance) {
            this.onPickup()
            return
        }       

    }

    /** Pick up this power-up */
    async onPickup() {

        this.hasTriggered = true

        this.sendMessage({action:'activate-pickup', id: this.instanceID, position: await this.plugin.user.getPosition(), objectID: this.objectID}, true)

        // Play sound
        const sound = this.paths.absolute('./Health_Regen_Pickup.mp3')
        let volume = Math.min(Math.max((parseFloat(this.getField('sound-effect-volume')) || 0.5), 0), 1); 
        if (sound) {
            this.plugin.audio.play(sound, { volume: volume })
        }

        // Hide pickup
        this.plugin.objects.update(this.objectID, { hidden: true }, true)

        // Respawn pickup
        let respawnTime = (parseFloat(this.getField('respawn-time')) * 1000) || 5000
        setTimeout(this.respawnPickup.bind(this), respawnTime)

        // Start effect
        let amount = (parseFloat(this.getField('amount'))) || 5
        this.effectInterval = setInterval(e => this.regenerateHealth(amount), 1000)
        this.effectActive = true

        // Set timer to end effect
        let effectLength = (parseFloat(this.getField('effect-length')) * 1000) || 10000
        setTimeout(this.endEffect.bind(this), effectLength)

        // Remove pickup from server
        // await this.performServerAction('remove-pickup')

    }

    /** Respawns pickup by unhiding it */
    respawnPickup() {
        this.plugin.objects.update(this.objectID, { hidden: false }, true)
        this.hasTriggered = false
    }

    /** Regenerates health */
    async regenerateHealth(amount) {
        await this.plugin.hooks.trigger('fpshud.health.change', {amount: amount})
    }

    /** Ends regeneration effect */
    endEffect() {
        clearInterval(this.effectInterval)
        this.effectActive = false
    }

}