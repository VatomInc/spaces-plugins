import { BasePlugin, BaseComponent } from 'vatom-spaces-plugins'

/**
 * This is the main entry point for your plugin.
 *
 * All information regarding plugin development can be found at
 * https://developer.vatom.com/spaces/plugins-in-spaces/guide-create-plugin
 *
 * @license MIT
 * @author Vatom Inc.
 */
export default class MyPlugin extends BasePlugin {

    /** Plugin info */
    static id = "vatom-template-plugin"
    static name = "Vatom Template Plugin"
    static description = "Description of the plugin goes here."

    /** Called on load */
    onLoad() {

        // Create a button in the toolbar
        this.menus.register({
            icon: this.paths.absolute('button-icon.png'),
            text: 'Plugin',
            action: () => this.onButtonPress()
        })

    }

    /** Called when the user presses the action button */
    onButtonPress() {

        // Show alert
        this.menus.alert(`Hello from ${this.constructor.name} version ${require('../package.json').version}!`, 'Hello world!', 'info')

    }

}
