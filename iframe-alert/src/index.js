/**
 * Iframe Alert
 *
 * Displays a custom UI within the space.
 *
 * @license MIT
 * @author jjv360
 */
module.exports = class IframeAlert extends BasePlugin {

    /** Plugin info */
    static get id()             { return 'iframe-alert' }
    static get name()           { return 'Custom UI Popup' }
    static get description()    { return 'Tests the ability to display custom UI within the app.' }

    /** Called when the plugin is loaded */
    async onLoad() {

        // Allow message to be configured
        this.menus.register({
            id: 'btn',
            section: 'controls',
            text: 'MyAlert',
            icon: this.paths.absolute('icon.svg'),
            action: e => this.showPopup()
        })

    }

    /* Show alert custom UI */
    showPopup() {

        // Show it
        this.menus.displayPopup({
            title: 'My Popup',
            panel: {
                iframeURL: this.paths.absolute('popup.html'),
                width: 500,
                height: 400
            }
        })

    }

}
