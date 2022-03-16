/**
 * Coin Pickup Game
 *
 * A game where users can walk over coins to collect them.
 *
 * All information regarding plugin development can be found at
 * https://developer.vatom.com/plugins/plugins/
 *
 * @license MIT
 * @author Vatom Inc.
 */

/** List of active coins */
let activeCoins = []

/** Available themes */
const Themes = [
    // Default
    {
        id: 'default',
        name: 'Golden Coins',
        scorePage: 'notice-overlay.html'
    }
]

module.exports = class CoinPickupGame extends BasePlugin {

    /** Plugin info */
    static get id()             { return 'vatominc-coin-pickup-game' }
    static get name()           { return 'Coin Pickup Game' }
    static get description()    { return 'A game where users can walk over coins to collect them.' }

    /** Current number of coins collected */
    score = 0

    /** Timer used to check for updates */
    timer = null

    /** Called when the plugin is loaded */
    async onLoad() {

        // Register coin component
        this.objects.registerComponent(Coin, {
            id: 'vatominc-coin',
            name: 'Collectible Coin',
            description: 'Allows this object to act as a coin that can be picked up.'
        })

        // Register coin spawner component
        this.objects.registerComponent(CoinSpawner, {
            id: 'vatominc-coin-spawner',
            name: 'Collectible Coin Spawner',
            description: 'Allows this object to spawn coins on a regular interval.',
            serverTick: true,
            settings: [
                { id: 'enabled', name: 'Enabled', type: 'checkbox', help: 'If disabled, new coins will not spawn.' },
                { id: 'pickup-sound', name: 'Pickup Sound', type: 'file', help: 'Sound that plays when picking up a coin. Leave blank for the default.' },
                { id: 'model', name: 'Coin Model', type: 'file', help: 'GLB model file of the coin. Leave blank for the default.' },
                { id: 'model-own-animation', name: 'Use Model Animation', type: 'checkbox', help: 'When enabled, the coin model will not rotate, instead it will use the animation inside the GLB (if one exists). You can enable this even if you just want to disable rotation and have no animation at all.' },
                { id: 'spawn-radius', name: 'Spawn Radius', type: 'number', default: 10, help: 'Distance around this object to start spawning coins. Default is 10 meters, minimum is 5 meters and maximum is 500 meters.' },
                { id: 'max-coins', name: 'Maximum Coins', type: 'number', default: 10, help: 'Maximum number of coins to spawn within the radius. Default is 10 coins.' },
                { id: 'spawn-rate', name: 'Spawn Rate', type: 'number', default: 15, help: 'Number of seconds between coin spawns. Minimum is 15 seconds.' },
                { id: 'spawn-chance', name: 'Spawn Chance', type: 'number', default: 100, help: 'Percentage chance that a coin will spawn. Default is 100 percent, meaning that the coin will always spawn.' },
                { id: 'spawn-amount', name: 'Spawn Amount', type: 'number', default: 1, help: 'Number of coins to spawn each cycle. Minimum is 1 coin per cycle. Each coin is affected by the "Spawn Chance" field.' },
                { id: 'score', name: 'Score Value', type: 'number', default: 1, help: 'Amount to increase the score by when picked up. Default is 1.'},
                { id: 'action-spawn-now', name: 'Spawn New Coin', type: 'button' },
                { id: 'action-remove-all', name: 'Remove All Coins', type: 'button' }
            ]
        })

        // Stop here if on the server
        if (this.isServer) {
            return
        }

        // Register configuration page
        this.menus.register({
            id: 'vatominc-coin-pickup-game-config',
            section: 'plugin-settings',
            panel: {
                fields: [
                    // Theme section
                    { name: 'Appearance', type: 'section' },
                    { id: 'theme', name: 'Theme', type: 'select', values: Themes.map(t => t.name), help: 'Theme to use for the score counter. You may need to refresh the page to see the changes.' },

                    // Limiting section
                    { name: 'Score Limits', type: 'section' },
                    { id: 'minimum-score', name: 'Minimum Score', type: 'text', help: 'Minimum score for each user. Default is no minimum.' },
                    { id: 'maximum-score', name: 'Maximum Score', type: 'text', help: 'Maximum score for each user. Default is no maximum.' },
                    { id: 'minimum-score-msg', name: 'Minimum Score Message', help: 'Displayed if the score is at the minimum.' },
                    { id: 'maximum-score-msg', name: 'Maximum Score Message', help: 'Displayed if the score is at the maximum.' }
                ]
            }
        })

        // Use selected theme
        const currentTheme = Themes.find(t => t.name == this.getField('theme')) || Themes[0]

        // Register the overlay UI
        this.infoOverlayID = this.menus.register({
            section: 'infopanel',
            panel: {
                iframeURL: this.paths.absolute(currentTheme.scorePage),
                width: 300,
                height: 100
            }
        })

        // Start a distance check timer
        this.timer = setInterval(this.onTimer.bind(this), 200)

    }

    /** Called when the plugin is unloaded */
    onUnload() {

        // Remove timer
        if (this.timer) {
            clearInterval(this.timer)
        }

    }

    /** Called on a regular interval */
    async onTimer() {

        // Get position of user
        const userPos = await this.user.getPosition()

        // Run each timer
        for (let coin of activeCoins) {
            coin.onTimer(userPos)
        }

    }

    /** Called when a message is received */
    async onMessage(data) {

        // Update score now if panel loaded
        if (data.action === 'panel-load') {
            this.updateScore()
            this.updateImages()
            return
        }

        // Show coin message alert
        if (data.action == 'coin-alert') {
            this.menus.alert(null, 'Find the hidden coins in this space to increase your score!')
            return
        }

    }

    /** Show score increase */
    async updateScore() {

        // Send score to panel
        this.menus.postMessage({ action: 'set-score', score: this.score })

    }

    /** Updates the `src` attribute of the relevant images */
    updateImages() {

        // Images inside the HTML files would not load, so we load them here
        this.menus.postMessage({ action: 'update-coin-img', src: this.paths.absolute('coin.gif') })

    }

}

/**
 * Component that spawns new coins.
 */
class CoinSpawner extends BaseComponent {

    /** Called when an action is performed */
    async onAction(action) {

        if (action === 'action-spawn-now') {

            // Spawn new coin
            await this.spawnCoin().catch(err => {
                console.error(err)
                this.plugin.menus.alert(err.message, 'Unable to spawn coin', 'error')
            })

        } else if (action === 'action-remove-all') {

            // Remove all coins
            await this.removeAllCoins()

        }

    }

    /** Called to check if new coins need to be added */
    async onServerTick() {

        // Stop if disabled
        if (!this.getField('enabled')) {
            return
        }

        // Get nearby coins
        const nearbyObjects = await this.plugin.objects.fetchInRadius(this.fields.x || 0, this.fields.y || 0, 500)

        // Filter out coins that do not belong to us
        const nearbyCoins = nearbyObjects.filter(obj => obj.coin_spawner_id == this.objectID)
        const lastCoinAddedAt = nearbyCoins.reduce((last, currentObj) => Math.max(last || 0, currentObj.lastModified || 0), 0)

        // Make sure there are not too many coins already
        const maxCoins = parseFloat(this.getField('max-coins')) || 10
        if (nearbyCoins.length >= maxCoins) {
            return
        }

        // Check if we need to spawn more
        const spawnRate = Math.max(15, parseFloat(this.getField('spawn-rate')) || 0)
        const nextSpawnTime = lastCoinAddedAt + (spawnRate * 1000)

        // Do not spawn yet
        if (Date.now() < nextSpawnTime) {
            return
        }

        // Run coin spawner cycle
        const numCoins = Math.max(1, parseInt(this.getField('spawn-amount')) || 1)
        for (let i = 0; i < numCoins; i++) {
            await this.spawnCoinChance()
        }

    }

    /** Spawns a coin based on the spawn percentage chance */
    async spawnCoinChance() {

        // Check spawn chance
        const spawnChance = Math.min(100, Math.max(0, parseFloat(this.getField('spawn-chance')) || 100)) / 100
        const pickedChance = Math.random()

        if (pickedChance > spawnChance) {
            return
        }

        // Spawn a coin
        await this.spawnCoin()

    }

    /** Spawn a new coin. Must be called by an admin user or on the server. */
    async spawnCoin() {

        // Determine how far we want to spread the coins
        const spawnRadius = Math.min(500, Math.max(5, parseFloat(this.getField('spawn-radius')) || 10))

        // Create new coin properties
        const newCoinProps = {
            name: '[Coin] ' + (this.fields.name || 'Untitled'),
            type: 'model',
            x: (this.fields.x || 0) + (Math.random() * spawnRadius * 2) - spawnRadius,
            y: (this.fields.y || 0) + (Math.random() * spawnRadius * 2) - spawnRadius,
            height: this.fields.height || 0,
            url: this.getField('model') || this.paths.absolute('gold-pirate-coin.glb'),
            coin_spawner_id: this.objectID,
            rotation_speed: this.getField('model-own-animation') ? 0 : 2,
            do_not_clone: this.getField('model-own-animation') ? true : false,
            clientOnly: false,
            ['component:' + this.plugin.id + ':coin:' + 'pickup-sound']: this.getField('pickup-sound') || this.paths.absolute('collect.wav'),
            ['component:' + this.plugin.id + ':coin:' + 'score']: this.getField('score') || '',
            components: [
                { id: this.plugin.id + ':coin' }
            ]
        }

        // Create a coin
        await this.plugin.objects.create(newCoinProps)

    }

    /** Removes all coins */
    async removeAllCoins() {

        // Get nearby coins
        const nearbyObjects = await this.plugin.objects.fetchInRadius(this.fields.x || 0, this.fields.y || 0, 500)
        const nearbyCoins = nearbyObjects.filter(obj => obj.coin_spawner_id == this.objectID)

        // Remove all
        await Promise.all(nearbyCoins.map(c => this.plugin.objects.remove(c.id)))

    }

}

/**
 * Component that allows an object to be a coin.
 */
class Coin extends BaseComponent {

    /** Timer used when claiming a coin */
    claimTimer = null

    /** Called when the component is loaded */
    onLoad() {

        // Generate instance ID
        this.instanceID = Math.random().toString(36).substr(2)

        // Store it
        activeCoins.push(this)

        // Preload sound
        const pickupSound = this.getField('pickup-sound')
        if (pickupSound) {
            this.plugin.audio.preload(pickupSound)
        }

    }

    /** Called when the component is unloaded */
    onUnload() {

        // Remove it
        activeCoins = activeCoins.filter(c => c != this)

        // Stop claim timer
        if (this.claimTimer) {
            clearTimeout(this.claimTimer)
        }

        this.claimTimer = null

    }

    /** Called when an action is performed */
    onAction(action) {

        // Remove this coin
        if (action == 'remove-coin') {
            this.plugin.objects.remove(this.objectID)
        }

    }

    /** Called when a message is received */
    onMessage(msg) {

        // Check if it's a claiming message
        if (msg.action == 'claiming') {

            // Stop if we were the sender
            if (msg.fromInstance == this.instanceID) {
                return
            }

            // Hide it
            this.plugin.objects.update(this.objectID, { hidden: true }, true)

            // Play sound
            const pickupSound = this.getField('pickup-sound')
            if (pickupSound) {
                this.plugin.audio.play(pickupSound, { x: this.fields.x || 0, y: this.fields.y || 0, height: this.fields.height || 0, radius: 10 })
            }

            // Clear any existing timer
            if (this.claimTimer) {
                clearTimeout(this.claimTimer)
            }

            // Create a claim timer
            this.claimTimer = setTimeout(e => this.onClaimFailed(), 15000)

        } else if (msg.action == 'claim-failed') {

            // Claiming coin failed
            this.onClaimFailed()

        }

    }

    /**
     * Called in the case where another user claims the coin, but their claim
     * fails and they do not get it
     */
    onClaimFailed() {

        // Stop claim timer
        if (this.claimTimer) {
            clearTimeout(this.claimTimer)
        }

        this.claimTimer = null

        // Show the coin again
        this.plugin.objects.update(this.objectID, { hidden: false }, true)

    }

    /** Called on a regular basis to check if user can pick up coin */
    onTimer(userPos) {

        const x = this.fields.x       || 0
        const y = this.fields.height  || 0
        const z = this.fields.y       || 0

        // Calculate distance between the user and this coin
        const distance = Math.sqrt((x - userPos.x) ** 2 + (y - userPos.y) ** 2 + (z - userPos.z) ** 2)

        // Stop if far away
        if (distance > 1) {
            this.lastPickupFailed = false
            return
        }

        // If last pickup failed, wait until the user leaves and comes back
        if (this.lastPickupFailed) {
            return
        }

        // Only allow pickup once
        if (this.hasPickedUp) {
            return
        }

        this.hasPickedUp = true

        // Play sound
        const pickupSound = this.getField('pickup-sound')
        if (pickupSound) {
            this.plugin.audio.play(pickupSound)
        }

        // Hide object
        this.plugin.objects.update(this.objectID, { hidden: true }, true)

        // Notify other users that we claimed it
        this.sendMessage({ action: 'claiming', fromInstance: this.instanceID })

        // Get score value
        const scoreValue = parseFloat(this.getField('score')) || 1

        // Increase score
        this.plugin.score += scoreValue
        this.plugin.updateScore()

        // Attempt to pick it up
        this.doPickup().catch(err => {

            // On fail, reset state
            console.warn(`[Coin Game] Unable to pick up coin.`, err)
            this.hasPickedUp = false
            this.plugin.objects.update(this.objectID, { hidden: false }, true)
            this.sendMessage({ action: 'claim-failed' })

            // Update score
            this.plugin.score -= scoreValue
            this.plugin.updateScore()

            // Notify user
            if (err.message == this.plugin.getField('maximum-score-msg') || err.message == this.plugin.getField('minimum-score-msg')) {
                this.plugin.menus.alert(null, err.message)
            } else {
                this.plugin.menus.alert(err.message, 'Failed to update score', 'warning')
            }

            // Disable pickup of this coin until moved away
            this.lastPickupFailed = true

        })

    }

    /** Pick up this coin */
    async doPickup() {

        const scoreValue = parseFloat(this.getField('score')) || 1
        const actualScore = this.plugin.score - scoreValue

        const minScoreStr = this.plugin.getField('minimum-score')
        const minScore = parseFloat(minScoreStr)
        const minScoreEnabled = minScoreStr && minScoreStr.length > 0 && !isNaN(minScore)

        const maxScoreStr = this.plugin.getField('maximum-score')
        const maxScore = parseFloat(maxScoreStr)
        const maxScoreEnabled = maxScoreStr && maxScoreStr.length > 0 && !isNaN(maxScore)

        // Check if we are already at maximum
        if (scoreValue > 0 && maxScoreEnabled && actualScore >= maxScore) {
            throw new Error(this.plugin.getField('maximum-score-msg') || "Your score is already at the maximum!")
        }

        // Check if we are already at minimum
        if (scoreValue < 0 && minScoreEnabled && actualScore <= minScore) {
            throw new Error(this.plugin.getField('minimum-score-msg') || "Your score is already at the minimum!")
        }

        // Run the hook
        let hookResult = await this.plugin.hooks.trigger('coinpickupgame.onPickedUp', { object: this.fields })
        if (hookResult) {
            throw new Error(hookResult.error || 'Coin pickup interrupted by hook.')
        }

        // Remove coin from server
        await this.performServerAction('remove-coin')

    }

}
