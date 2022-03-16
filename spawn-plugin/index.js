/**
 * Spawn Plugin
 *
 * Spawns a user's avatar on a random place in the space.
 * Listens for a hook called 'spawn' and moves the user's avatar to a random position .
 *
 * @license MIT
 * @author zmaqutu
 */
module.exports = class SpawnPlugin extends BasePlugin {

    /** Plugin info */
    static get id()             { return 'spawn-plugin' }
    static get name()           { return 'Spawn Plugin' }
    static get description()    { return "Spawns the user's avatar at a random place in the space." }

    /** List of all spawn discs in the space */
    spawnObjectIDs = []

    /** Called when the plugin is loaded */
    onLoad() {
        // Register component
        this.objects.registerComponent(SpawnComponent, {
            id: 'spawn',
            name: 'Spawn Avatar',
            description: 'Moves this object to a random position in the space.',
        })

        this.hooks.addHandler('fpshud.death', this.spawnToRandomPosition)
    }

    /** Called when the plugin is unloaded */
    onUnload() {
        this.hooks.removeHandler('fpshud.death', this.spawnToRandomPosition)
    }

    /** Spawns the avatar at a random position */
    spawnToRandomPosition = async () => {
        // Get random spawn disc
        const randomObjectID = this.spawnObjectIDs[Math.floor(Math.random() * this.spawnObjectIDs.length)]

        // Wait for the position of random spawn disc
        const objectProperties = await this.objects.get(randomObjectID)

        // Unable to find object
        if (!objectProperties) {
            return
        }

        // Move user to said position
        this.user.setPosition(objectProperties.x, objectProperties.height, objectProperties.z)
    }

}

class SpawnComponent extends BaseComponent {

    /** Called when an object with this component is loaded */
    onLoad() {
        // Remove any previous and re-add it
        this.plugin.spawnObjectIDs = this.plugin.spawnObjectIDs.filter(id => id !== this.objectID)
        this.plugin.spawnObjectIDs.push(this.objectID)
    }

    /** Called when your component is about to be removed */
    onUnload() {
        this.plugin.spawnObjectIDs = this.plugin.spawnObjectIDs.filter(id => id !== this.objectID)
    }

}
