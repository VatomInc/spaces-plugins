/**
 * Gun
 *
 * A game where users can shoot a projectile from a gun.
 *
 * @license MIT
 * @author FrancoBolevin
 */
module.exports = class GunPlugin2 extends BasePlugin {

    /** Plugin info */
    static get id()             { return 'gunplugin2' }
    static get name()           { return 'Gun shooting game 2.0' }
    static get description()    { return 'A game where users can shoot a projectile from a gun.' }

    /** Called when the plugin is loaded */
    async onLoad() {
        this.instanceID = Math.random().toString(36).substr(2)

        // Shoot Hooks
        this.hooks.addHandler('controls.key.down', this.fireGun)
        this.hooks.addHandler('controls.pointerlock.pointerdown', this.fireGunMouse)

        // Ammo Hook
        this.hooks.addHandler('gun.ammo.change', this.ammoUpdate)

        // Damage Booster Hook
        this.hooks.addHandler('gun.damage.multiply', this.damageUpdate)

        // Do setup
        this.setup()
          
    }

    /** Called when the plugin is unloaded */
    onUnload() {
        // Shoot Hooks
        this.hooks.removeHandler('controls.key.down', this.fireGun)
        this.hooks.removeHandler('controls.pointerlock.pointerdown', this.fireGunMouse)

        // Ammo Hook
        this.hooks.removeHandler('gun.ammo.change', this.ammoUpdate)

        // Damage Booster Hook
        this.hooks.removeHandler('gun.damage.multiply', this.damageUpdate)
    }

    /** Do setup */
    async setup(){

        // Register configuration page
        this.menus.register({
            id: 'gun-game-config',
            section: 'plugin-settings',
            panel: {
                fields: [
                    { name: 'Score Limits', type: 'section' },
                    { id: 'bullets', name: 'Bullets', type: 'number', help: 'The amount of bullets each user starts with' },
                    { id: 'damage', name: 'Damage', type: 'number', help: 'The amount of damage each shot deals.' }
                ]
            }
        })

        this.bullets = parseInt(this.getField('bullets')) || 30

        this.damage = parseInt(this.getField('damage')) || 10

        this.createBulletsCounter()

        const gunModel = {
            name: 'GunModel',
            type: 'model',
            url: this.paths.absolute('railgun.glb'),
            clientOnly: true,
            parent: 'accessoryslot',
            y: -1,
            x: 0.25,
            height: -0.3,
            //rotation_y: 3.14159 
            scale: 0.4,
            use_original_scale: true,
        }

        this.audio.preload(this.paths.absolute('shot.wav'))

        await this.objects.create(gunModel)  

        this.bulletUpdate()
    }

    /** Displays current health on screen */
    createBulletsCounter() {

        // Register the overlay UI
        this.infoOverlayID = this.menus.register({
            section: 'overlay-top',
            panel: {
                iframeURL: this.paths.absolute('bulletCount.html'),
                zIndex: 2,
                moveWhenPanelActive: false
            }
        }) 
    }

    /** Updates the `src` attribute of the relevant images */
    updateImages() {

        // Images inside the HTML files would not load, so we load them here
        this.menus.postMessage({ action: 'update-crosshair-img', src: this.paths.absolute('crosshair.png') })

    }

    /**
     * Fires the gun.
     * @param {KeyboardEvent} e Keyboard event.
     */
    fireGun = async e => {
        // Not the correct key
        if (e.key != 'g' && e.key != 'G') {
            return
        }

        // Don't shoot if you are out of bullets
        if (this.bullets == 0) return

        // Lower bullet count
        this.bullets -= 1
        this.bulletUpdate()

        this.audio.play(this.paths.absolute('laser.wav'), {volume: 0.3})

        const objectsHit = await this.world.raycast({ collision: true })
        const hit = objectsHit[0]

        // Did not hit any objects
        if (!hit) {
            return
        }

        if (hit.id.substring(0,9) == 'mixeruser') this.healthUpdate(hit.id)
        
        const splat = Object.assign(hit.wallProps, {
            name: 'Splat',
            type: 'image',
            url: this.paths.absolute('smallHole.png'),
            clientOnly: true,
            doublesided: true,
            alpha_test: 0.5,
            targetable: false
        })

        await this.objects.create(splat)
        this.hooks.trigger('ydangle.gun.hit', { id: hit.id })
        this.messages.send({ action: 'ydangle.gun.shot', splat, id: this.instanceID, position: await this.user.getPosition() }, true)
    }

    /** Fires the gun on click.*/
    fireGunMouse = async e => {

        // Don't shoot if you are out of bullets
        if (this.bullets == 0) return

        // Lower bullet count
        this.bullets -= 1
        this.bulletUpdate()

        this.audio.play(this.paths.absolute('laser.wav'))

        const objectsHit = await this.world.raycast({ collision: true })
        const hit = objectsHit[0]

        // Did not hit any objects
        if (!hit) {
            return
        }

        if (hit.id.substring(0,9) == 'mixeruser') this.healthUpdate(hit.id)
        
        const splat = Object.assign(hit.wallProps, {
            name: 'Splat',
            type: 'image',
            url: this.paths.absolute('smallHole.png'),
            clientOnly: true,
            doublesided: true,
            alpha_test: 0.5,
            targetable: false
        })

        await this.objects.create(splat)
        this.hooks.trigger('ydangle.gun.hit', { id: hit.id })
        this.messages.send({ action: 'ydangle.gun.shot', splat, id: this.instanceID, position: await this.user.getPosition() }, true)
    }

    /* Updates your health */
    async healthUpdate(user) {
        let userID = await this.user.getID()
        this.hooks.trigger('fpshud.health.change', { amount: -this.damage, from: userID, to: user})
    }

    /* Updates your ammonution */
    ammoUpdate = async e => {
        this.bullets += e.amount
        this.bulletUpdate()
    }

    /* Updates your damage */
    damageUpdate = async e => {
        this.damage = 10 * e.multiplier
    }

    /* Updates your damage */
    bulletUpdate = async e => {

        // Send bullet count to panel
        this.menus.postMessage({ action: 'set-bullets', bullets: this.bullets })

    }

    /** Called when a message has been received */
    async onMessage(e) {
        if (e.id != this.instanceID) {
            const splat = e.splat

            this.audio.play(this.paths.absolute('laser.wav'), { x: e.position.x, y: e.position.z, height: e.position.y, radius: 40, volume: 0.3 })
            await this.objects.create(splat)
        }

        // Update image now if panel loaded
        if (e.action === 'panel-load') {
            this.updateImages()
            return
        }
    }

}
