/**
 * FPS HUD
 *
 * An overlay that displays an FPS-like HUD
 *
 * @license MIT
 * @author chapmankyle
 */

/** Clamps a value between a minimum and maximum */
function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max))
}

/**
 * Creates a plugin that shows an FPS-like HUD
 */
module.exports = class FPSHUDPlugin extends BasePlugin {

    /** Plugin info */
    static get id()             { return 'fps-hud' }
    static get name()           { return 'First Person Shooter HUD' }
    static get description()    { return 'An overlay that displays information such as health, armor and more.' }

    /** @private Maximum amount of health */
    maxHealth = 100

    /** @private Maximum amount of armor */
    maxArmor = 25

    /** @private Health of the current user */
    health = this.maxHealth

    /** @private Armor of the current user */
    armor = this.maxArmor

    /** @private `true` to ignore incoming damage, `false` otherwise */
    ignoreDamage = false

    /** Called when the plugin is loaded */
    onLoad() {
        this.menus.register({
            id: 'fps-hud.overlay',
            section: 'overlay-top',
            panel: {
                iframeURL: this.paths.absolute('./overlay.html')
            }
        })

        this.hooks.addHandler('fpshud.health.change', this.onHealthChange)
        this.hooks.addHandler('fpshud.armor.change', this.onArmorChange)
    }

    /** Called when a message has been received */
    onMessage(data) {
        // Send current information to overlay panel
        if (data.action === 'overlay-load') {
            this.sendImages()
            this.sendInfo()
        }

        // We got hit by something
        if (data.action === 'got-hit') {
            this.onHealthChange({ amount: data.amount })
        }
    }

    /**
     * Removes any unnecessary information from an identifier.
     * @param {string} id Identifier to clean.
     */
    cleanID(id) {
        // Invalid ID
        if (typeof id != 'string' || id.indexOf(':') < 0) {
            return null
        }

        const split = id.split(':')
        return `${split[split.length - 2]}:${split[split.length - 1]}`
    }

    /** Sends all static images to the iframe */
    sendImages() {
        this.menus.postMessage({ action: 'show-skull', src: this.paths.absolute('./skull.svg') })
        this.menus.postMessage({ action: 'show-health', src: this.paths.absolute('./health.svg') })
        this.menus.postMessage({ action: 'show-armor', src: this.paths.absolute('./armor.svg') })
    }

    /** Sends all currently available information to the panel */
    sendInfo() {
        this.menus.postMessage({ action: 'set-health', health: this.health, max: this.maxHealth })
        this.menus.postMessage({ action: 'set-armor', armor: this.armor, max: this.maxArmor })
    }

    /** Called when the plugin is unloaded */
    onUnload() {
        this.hooks.removeHandler('fpshud.health.change', this.onHealthChange)
        this.hooks.removeHandler('fpshud.armor.change', this.onArmorChange)
    }

    /** Called when the user dies */
    onDeath = (from = null, to = null) => {
        // Ignore incoming damage until respawn
        this.menus.postMessage({ action: 'set-death-display', display: 'flex' })
        this.ignoreDamage = true

        // Reset values
        this.health = this.maxHealth
        this.armor = this.maxArmor
        this.sendInfo()

        // Award a kill
        if (from) {
            this.hooks.trigger('fpshud.kill', { userID: this.cleanID(from) })
        }

        // Indicate a death
        this.hooks.trigger('fpshud.death', { userID: this.cleanID(to ?? this.user.getID()) })

        // Allow user to interact after set delay
        setTimeout(this.respawn, 3000)
    }

    /** Respawns the player */
    respawn = () => {
        this.ignoreDamage = false
        this.menus.postMessage({ action: 'set-death-display', display: 'none' })
    }

    /**
     * Called when the health should change.
     * @param {object} data Data passed from hook.
     * @param {number} data.amount Amount of health to add or subtract.
     * @param {string=} data.from Identifier of the person who fired the shot.
     * @param {string=} data.to Identifier of the person who has been hit by the shot.
     */
    onHealthChange = data => {
        const value = data.amount || 0

        // No need to do anything if no health has changed
        if (value === 0) {
            return
        }

        // Decide if we need to increase or decrease the health
        if (!this.ignoreDamage && (data.to == null || (data.to && this.cleanID(data.to) === this.cleanID(this.user.getID())))) {
            if (value > 0) {
                this.increaseHealth(value)
            } else {
                this.decreaseHealth(value)
            }
        }

        // Send message to user indicating that they got hit
        if (data.to != null) {
            this.messages.send({ action: 'got-hit', amount: value }, false, this.cleanID(data.to))
        }

        // Send health information
        this.sendInfo()

        // Trigger event indicating death has occurred
        if (this.health <= 0) {
            this.onDeath(data.from, data.to)
        }
    }

    /**
     * @private Increases the health of the user.
     * @param {number} amount Amount to increase the health by.
     */
    increaseHealth(amount) {
        this.health = clamp(this.health + amount, 0, this.maxHealth)
    }

    /**
     * @private Decreases the health (and armor if applicable) of the user.
     * @param {number} amount Amount to decrease the health (and armor if applicable) by.
     */
    decreaseHealth(amount) {
        // Since we are decreasing by an amount, the given amount will be negative
        // so we just convert to positive and change any + to a -
        const value = Math.abs(amount)

        const beforeDmg = this.health + this.armor
        const afterDmg = clamp(beforeDmg - value, 0, this.maxHealth + this.maxArmor)

        this.health = clamp(afterDmg, 0, this.maxHealth)
        this.armor = clamp(afterDmg - this.maxHealth, 0, this.maxArmor)
    }

    /**
     * Called when the armor value should change.
     * @param {object} data Data passed from hook.
     * @param {number} data.amount Amount to change the armor by.
     */
    onArmorChange = data => {
        const value = data.amount || 0

        // No change in armor value
        if (value === 0) {
            return
        }

        this.armor = clamp(this.armor + value, 0, this.maxArmor)

        // Send armor info
        this.sendInfo()
    }

}
