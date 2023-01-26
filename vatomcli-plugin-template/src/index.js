import BasePlugin from 'base-plugin-declaration'

/**
 * This is the main entry point for your plugin.
 *
 * All information regarding plugin development can be found at
 * https://developer.vatom.com/plugins/plugins/
 *
 * @license MIT
 * @author Vatom Inc.
 */
export default class MyPlugin extends BasePlugin {

    /** Plugin info */
    static id = "VATOM_TEMPLATE_PLUGIN_ID"
    static name = "VATOM_TEMPLATE_PLUGIN_NAME"

    /** Called on load */
    onLoad() {

        // Create a button in the toolbar
        this.menus.register({
            icon: this.paths.absolute('button-icon.png'),
            text: 'VATOM_TEMPLATE_PLUGIN_NAME',
            action: () => this.onButtonPress()
        })

    }

    /** Called when the user presses the action button */
    onButtonPress() {

        // Show alert
        this.menus.alert(`Hello from ${this.constructor.name} version ${require('../package.json').version}!`, 'Hello world!', 'info')

    }

}
