/**
 * Popup Message
 *
 * Displays a message, in a popup, to a user when they enter a space.
 *
 * All information regarding plugin development can be found at
 * https://dev.spatialweb.net/plugins/plugins/
 *
 * @license MIT
 * @author Vatom Inc.
 */
module.exports = class PopupMessage extends BasePlugin {

    /** Plugin info */
    static get id()             { return 'vatominc-popup-message' }
    static get name()           { return 'Popup Message' }
    static get description()    { return 'Display a message, in a popup, to users when they enter the space.' }

    /** Called when the plugin is loaded */
    async onLoad() {

        // Allow message to be configured
        this.menus.register({
            id: 'vatominc-popup-message-config',
            section: 'plugin-settings',
            panel: {
                fields: [
                    { type: 'section', name: 'Popup Message' },
                    { type: 'checkbox', id: 'enabled', name: 'Enabled', help: 'When enabled, the popup will be shown.' },
                    { type: 'text', id: 'title', name: 'Title', help: 'Title of the message.' },
                    { type: 'text', id: 'text', name: 'Text', help: 'Text to display in the message.' },
                    { type: 'select', id: 'icon', name: 'Icon', values: ['', 'info', 'warning', 'question', 'error'] },
                ]
            }
        })

        // Show message now, if enabled
        if (this.getField('enabled')) {
            this.menus.alert(this.getField('text'), this.getField('title'), this.getField('icon'))
        }

    }

}
