module.exports = class LandMinePlugin extends BasePlugin {

    /** Plugin info */
    static get id()             { return 'land-mine-plugin' }
    static get name()           { return 'Land Mines' }
    static get description()    { return 'Allows for creation of explosive proximity land mines' }

    /** Called when the plugin is loaded */
    onLoad() {

        this.objects.registerComponent(LandMine, {
            id: 'landmine',
            name: 'Land Mine',
            description: 'Allows this object to act as an explosive proximity landmine.',
            settings: [
                { id: 'trigger-distance', name: 'Trigger Distance', type: 'number', default: 1, help: 'Determines how far user has to be to trigger the mine' },
                { id: 'respawn-time', name: 'Respawn Time', type: 'number', default: 5, help: 'Determines how long it takes for mine respawn (seconds)'},
                { id: 'explosion-power-min', name: 'Explosion Power Min', type: 'number', default: 5, help: 'Determines the minimum distance that the avatar is flung in the air by when triggering the mine'},
                { id: 'explosion-power-max', name: 'Explosion Power Max', type: 'number', default: 15, help: 'Determines the maximum distance that the avatar is flung in the air by when triggering the mine'},
                { id: 'points-removed', name: 'Points removed', type: 'number', default: 10, help: 'Determines how many points are removed when triggering the mine (No effect if external scoring plugin not installed)'}

            ]
        })
        
    }

}

class LandMine extends BaseComponent {

    onLoad() {

        const explosionSound = this.paths.absolute('./ExplosionSound.mp3')
        if (explosionSound) {
            this.plugin.audio.preload(explosionSound)
        }
        // Generate instance ID
        this.instanceID = Math.random().toString(36).substr(2)
        this.timer = setInterval(this.onTimer.bind(this), 200)
    }

    /** Called when an action is performed */
    onAction(action) {

        // Remove this coin
        if (action == 'remove-mine') {
            this.plugin.objects.remove(this.objectID)
        }

    }

    async onMessage(e) {
        if (e.id != this.instanceID) {
            if(e.action == "triggerMine"){
                this.plugin.audio.play(absolutePath('ExplosionSound.mp3'), {x: e.position.x, y: e.position.z, height: e.position.y, radius: 40})
                this.plugin.objects.update(e.objectID, { hidden: true }, true)
                let respawnTime = (parseFloat(this.getField('respawn-time')) * 1000) || 5000
                setTimeout(() => {
                    this.plugin.objects.update(e.objectID, { hidden: false }, true)
                }, respawnTime)
            }

        }
    }

     /** Called on a regular basis to check if user can pick up coin */
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

    /** Pick up this coin */
    async onTriggerMine() {

        this.hasTriggered = true

        this.sendMessage({action:'triggerMine', id: this.instanceID, position: await this.plugin.user.getPosition(), objectID: this.objectID}, true)

        // Play sound
        const explosionSound = this.paths.absolute('./ExplosionSound.mp3')
        if (explosionSound) {
            this.plugin.audio.play(explosionSound)
        }

        // TODO: Play Visual Effect

        const min = (parseFloat(this.getField('explosion-power-min')) || 5) 
        const max = (parseFloat(this.getField('explosion-power-max')) || 15) 

        if(min > max) {
            return console.error("Minimum exlosions power is larger than maximum")
        }

        // Get velocity
        let velocity = min == max ? max : Math.floor(Math.random() * (max - min + 1)) + min
        // Run the hook
        await this.plugin.hooks.trigger('avatar.applyVerticalVelocity', { velocity: velocity })

        // Hide mine
        this.plugin.objects.update(this.objectID, { hidden: true }, true)

        // Remove points from scoring plugin
        let pointsDecrease = (parseFloat(this.getField('points-removed')) || 10) * -1
        this.plugin.hooks.trigger("ydangle.scoring.increase", { points: pointsDecrease})

        // Respawn mine
        let respawnTime = (parseFloat(this.getField('respawn-time')) * 1000) || 5000
        setTimeout(this.respawnMine.bind(this), respawnTime)

        // Remove mine from server
        // await this.performServerAction('remove-mine')

    }

    /** Respawns mine by unhiding it */
    respawnMine() {
        this.plugin.objects.update(this.objectID, { hidden: false }, true)
        this.hasTriggered = false
    }

}