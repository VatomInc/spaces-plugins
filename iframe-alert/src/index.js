/**
 * Iframe Alert
 *
 * Displays a custom UI within the space.
 *
 * @license MIT
 * @author jjv360
 */
export default class IframeAlert extends BasePlugin {

    /** Plugin info */
    static id = "iframe-alert"
    static name = "Custom UI Popup"
    static description = "Tests the ability to display custom UI within the app."

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
