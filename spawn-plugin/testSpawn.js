// this is a plugin to test the spawn plugin
module.exports = class TestSpawnPlugin extends BasePlugin {

    /** Plugin info */
    static get id()             { return 'spawn-test' }
    static get name()           { return 'Spawn Test' }
    static get description()    { return 'A plugin to test the Spawn plugin.' }

    /** Called when the plugin is loaded */
    onLoad() {
        this.menus.register({
            id: 'zongo.spawn-test',
            text: 'Test Spawn',
            section: 'controls',
            adminOnly: false,
            order: 11,
            icon: this.paths.absolute('./respawnTest.svg'),
            action: this.onMenuPress
        })
    }

    /** Called when the button is clicked */
    onMenuPress = () => {
        this.hooks.trigger('fpshud.death')
    }

}
