module.exports = class GunPlugin extends BasePlugin {

    /** Plugin info */
    static get id()             { return 'gunplugin' }
    static get name()           { return 'Gun shooting game' }
    static get description()    { return 'A game where users can shoot a projectile from a gun.' }

    async onLoad() {
        this.instanceID = Math.random()

        let gunModel = {
            name: 'GunModel',
            type: 'model',
            url: absolutePath('shotgun.glb'),
            clientOnly: true,
            parent: 'accessoryslot',
            y: -0.5,
            x: 0.25,
            height: -0.4,
            rotation_y: 3.14159

        }
        
        this.audio.preload(absolutePath('shot.wav'))
        this.hooks.addHandler('controls.key.down', async e => {
            if (e.key == 'g' || e.key == 'G') {
                this.audio.play(absolutePath('shot.wav'))

                let hit = await this.world.raycast({collision: true})
                let hitPoint = []
                
                if (hit[0]) hitPoint = hit[0].point 
                if (hitPoint && hit[0]) {
                    let splat = Object.assign(hit[0].wallProps, { 
                        name: 'Splat',
                        type: 'image',
                        url: absolutePath('splat.png'),
                        clientOnly: true,
                        doublesided: true,
                        alpha_test: 0.5,
                        targetable: false
                    })
                    let splatImage = await this.objects.create(splat)
                    this.hooks.trigger('ydangle.gun.hit', { id: hit[0].id })

                    this.messages.send({action:'ydangle.gun.shot', splat, id: this.instanceID, position: await this.user.getPosition()}, true)

                }
            }
        })


        let object = await this.objects.create(gunModel)
    }

    async onMessage(e) {
        if (e.id != this.instanceID) {
            let splat = e.splat
            this.audio.play(absolutePath('shot.wav'), {x: e.position.x, y: e.position.z, height: e.position.y, radius: 40})
            let splatImage = await this.objects.create(e.splat)

        }
    }

}