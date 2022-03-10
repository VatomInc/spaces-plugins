/**
 * Spawn Plugin
 *
 * Spawns a user's avatar on a random place in the world.
 * Listens for a hook called 'spawn' and moves the user's avatar to a random position .
 *
 * @license MIT
 * @author zmaqutu
 */

module.exports = class SpawnPlugin extends BasePlugin {

        /** Plugin info */
        static get id()             { return 'spawn-plugin' }
        static get name()           { return 'Spawn Plugin' }
        static get description()    { return 'Spawns a user\'s avatar on a random place in the world.' }
    
        /** Called when the plugin is loaded */
        onLoad() {
    
                this.menus.alert('Hello World!')
    
        }
        onUnload() {
                        
                this.menus.alert('Goodbye World!')
        
        }
        onSettingsUpdated(field,) {
    
                this.menus.alert('Settings updated!')
    
        }
    
}
class SpawnComponent extends BaseComponent {

        /** Called when an object with this component is loaded */
        onLoad() {
    
            console.log('Loaded component!')
    
        }
    
        /** Called when the user clicks on this object */
        onClick() {
    
            // Show alert
            this.plugin.menus.alert('Object clicked!')
    
        }
    
    }
    