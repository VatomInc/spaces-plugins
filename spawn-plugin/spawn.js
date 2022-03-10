/**
 * Spawn Plugin
 *
 * Spawns a user's avatar on a random place in the world.
 *
 * @license MIT
 * @author zmaqutu
 */
// myplugin.js

module.exports = class SpawnPlugin extends BasePlugin {

        /** Plugin info */
        static get id()             { return 'spawn-plugin' }
        static get name()           { return 'Spawn Plugin' }
        static get description()    { return 'Spawns a user\'s avatar on a random place in the world.' }
    
        /** Called when the plugin is loaded */
        onLoad() {
    
            this.menus.alert('Hello World!')
    
        }
    
    }
    