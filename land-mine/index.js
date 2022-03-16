/**
 * Land Mine
 *
 * Allows for creation of explosive, proximity-based land mines.
 *
 * @license MIT
 * @author Liron-Toledo
 */

/** Clamps a value between a minimum and maximum */
function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max))
}

module.exports = class LandMinePlugin extends BasePlugin {

    /** Plugin info */
    static get id()             { return 'land-mine-plugin' }
    static get name()           { return 'Land Mines' }
    static get description()    { return 'Allows for creation of explosive, proximity-based land mines' }

    /** Called when the plugin is loaded */
    onLoad() {

        this.objects.registerComponent(LandMine, {
            id: 'landmine',
            name: 'Land Mine',
            description: 'Allows this object to act as an explosive proximity landmine.',
            settings: [
                { id: 'trigger-distance', name: 'Trigger Distance', type: 'number', default: 1, help: 'How far away, in metres, the user has to be to trigger the land mine' },
                { id: 'respawn-time', name: 'Respawn Time', type: 'number', default: 5, help: 'How long, in seconds, it takes for land mine to respawn' },
                { id: 'explosion-power-min', name: 'Explosion Power Min', type: 'number', default: 5, help: 'Minimum height, in metres, that the avatar is flung in the air when triggering the land mine' },
                { id: 'explosion-power-max', name: 'Explosion Power Max', type: 'number', default: 15, help: 'Maximum height, in metres, that the avatar is flung in the air when triggering the land mine' },
                { id: 'sound-effect-volume', name: 'Sound Effect Volume', type: 'number', default: 0.5, help: 'Volume of the attached sound effect, with a value of 1 being full volume and 0 being silent' },
                { id: 'points-removed', name: 'Points Removed', type: 'number', default: 10, help: 'How many points are removed when triggering the mine' }
            ]
        })

    }

}

class LandMine extends BaseComponent {

    /** Explosion sound */
    explosionSound = this.paths.absolute('./ExplosionSound.mp3')

    /** Called when the component is loaded */
    onLoad() {
        this.instanceID = Math.random().toString(36).substr(2)

        this.plugin.audio.preload(this.explosionSound)
        this.timer = setInterval(this.onTimer.bind(this), 200)
    }

    /** Called when a message has been received */
    async onMessage(e) {
        if (e.id === this.instanceID) {
            return
        }

        if (e.action == 'triggerMine') {
            this.plugin.audio.play(this.explosionSound, { x: e.position.x, y: e.position.z, height: e.position.y, radius: 40 })
            this.plugin.objects.update(e.objectID, { hidden: true }, true)

            // Respawn mine after a delay
            const respawnTime = (parseFloat(this.getField('respawn-time')) * 1000) || 5000
            setTimeout(() => {
                this.plugin.objects.update(e.objectID, { hidden: false }, true)
            }, respawnTime)
        }
    }

    /** Called on a regular basis to check if the user should detonate the land mine */
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

        // Calculate distance between the user and this coin
        const distance = Math.sqrt((x - userPos.x) ** 2 + (y - userPos.y) ** 2 + (z - userPos.z) ** 2)

        // If close enough, trigger Mine
        let triggerDistance = parseFloat(this.getField('trigger-distance')) || 1
        if (distance < triggerDistance) {
            this.onTriggerMine()
            return
        }

    }

    /** Called when the land mine has been triggered */
    async onTriggerMine() {

        this.hasTriggered = true
        this.sendMessage({ action:'triggerMine', id: this.instanceID, position: await this.plugin.user.getPosition(), objectID: this.objectID }, true)

        // Play sound
        let volume = clamp(parseFloat(this.getField('sound-effect-volume')) || 0.5, 0, 1)
        this.plugin.audio.play(this.explosionSound, { volume: volume })

        const min = parseFloat(this.getField('explosion-power-min')) || 5
        const max = parseFloat(this.getField('explosion-power-max')) || 15

        if (min > max) {
            console.error("Minimum exlosions power is larger than maximum")
            return
        }

        // Apply velocity
        const velocity = min == max ? max : Math.floor(Math.random() * (max - min + 1)) + min
        await this.plugin.hooks.trigger('avatar.applyVerticalVelocity', { velocity: velocity })

        // Hide mine
        this.plugin.objects.update(this.objectID, { hidden: true }, true)

        // Remove points from scoring plugin
        const pointsDecrease = (parseFloat(this.getField('points-removed')) || 10) * -1
        this.plugin.hooks.trigger('ydangle.scoring.increase', { points: pointsDecrease })

        // Respawn mine
        const respawnTime = (parseFloat(this.getField('respawn-time')) * 1000) || 5000
        setTimeout(() => {
            this.plugin.objects.update(this.objectID, { hidden: false }, true)
            this.hasTriggered = false
        }, respawnTime)

    }

}
