// this is a plugin to test the spawn plugin
module.exports = class TestSpawnPlugin extends BasePlugin {

        /** Plugin info */
        static get id()             { return 'spawn-test' }
        static get name()           { return 'Spawn Test' }
        static get description()    { return 'A plugin to test the Spawn plugin.' }
    
        /** Called when the plugin is loaded */
        onLoad() {
    
        //     this.menus.alert('Hello World!')
            this.hooks.trigger('fpshud.death')
    
        }
    
}