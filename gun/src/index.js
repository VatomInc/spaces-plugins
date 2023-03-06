/**
 * Gun
 *
 * A game where users can shoot a projectile from a gun.
 *
 * @license MIT
 * @author FrancoBolevin
 */
export default class GunPlugin extends BasePlugin {

    /** Plugin info */
    static id = "gunplugin"
    static name = "Gun shooting game"
    static description = "A game where users can shoot a projectile from a gun."

    /** Called when the plugin is loaded */
    async onLoad() {
        this.instanceID = Math.random().toString(36).substr(2)

        const gunModel = {
            name: 'GunModel',
            type: 'model',
            url: this.paths.absolute('shotgun.glb'),
            clientOnly: true,
            parent: 'accessoryslot',
            y: -0.5,
            x: 0.25,
            height: -0.4,
            rotation_y: 3.14159
        }

        this.audio.preload(this.paths.absolute('shot.wav'))
        this.hooks.addHandler('controls.key.down', this.fireGun)
        await this.objects.create(gunModel)
    }

    /** Called when the plugin is unloaded */
    onUnload() {
        this.hooks.removeHandler('controls.key.down', this.fireGun)
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

        this.audio.play(this.paths.absolute('shot.wav'))

        const objectsHit = await this.world.raycast({ collision: true })
        const hit = objectsHit[0]

        // Did not hit any objects
        if (!hit) {
            return
        }

        const splat = Object.assign(hit.wallProps, {
            name: 'Splat',
            type: 'image',
            url: this.paths.absolute('splat.png'),
            clientOnly: true,
            doublesided: true,
            alpha_test: 0.5,
            targetable: false
        })

        await this.objects.create(splat)
        this.hooks.trigger('ydangle.gun.hit', { id: hit.id })
        this.messages.send({ action: 'ydangle.gun.shot', splat, id: this.instanceID, position: await this.user.getPosition() }, true)
    }

    /** Called when a message has been received */
    async onMessage(e) {
        if (e.id != this.instanceID) {
            const splat = e.splat

            this.audio.play(this.paths.absolute('shot.wav'), { x: e.position.x, y: e.position.z, height: e.position.y, radius: 40 })
            await this.objects.create(splat)
        }
    }

}
