/**
 * Spotify
 *
 * Adds a spotify button to the bottom menu bar and shows the given playlist
 * inside the accordion.
 *
 * All information regarding plugin development can be found at
 * https://developer.vatom.com/plugins/plugins/
 *
 * @license MIT
 * @author Vatom Inc.
 */
module.exports = class Spotify extends BasePlugin {

    /** Plugin info */
    static get id()             { return 'vatominc-spotify' }
    static get name()           { return 'Spotify Playlist' }
    static get description()    { return 'Allows you to open a spotify playlist inside the space.' }

    /** Called when the plugin is loaded */
    onLoad() {

        // Allow playlist URL to be modified
        this.menus.register({
            id: 'vatominc-spotify-config',
            section: 'plugin-settings',
            panel: {
                fields: [
                    { type: 'section', name: 'Spotify Playlist' },
                    { type: 'textarea', id: 'url', name: 'URL', help: 'Embed URL for the Spotify playlist.' }
                ]
            }
        })

        // Register the button
        this.menus.register({
            id: 'vatominc-spotify-button',
            icon: this.paths.absolute('./spotify.svg'),
            text: 'Spotify',
            section: 'controls',
            order: 3,
            inAccordion: true,
            panel: {
                iframeURL: this.getField('url') || 'https://open.spotify.com/embed/playlist/0vC2B4CRTQfTu899Jh0Cxf',
                width: 320
            }
        })

    }

    /**
     * Updates the plugin when the settings have changed.
     * @param {string} field Field that has been updated.
     * @param {any} value New value of the field.
     */
    onSettingsUpdated(field, value) {

        // Ignore any update that is not a URL change
        if (field !== 'url') {
            return
        }

        // Re-register the button when settings have changed
        this.menus.register({
            id: 'vatominc-spotify-button',
            icon: this.paths.absolute('./spotify.svg'),
            text: 'Spotify',
            section: 'controls',
            order: 3,
            inAccordion: true,
            panel: {
                iframeURL: value || 'https://open.spotify.com/embed/playlist/0vC2B4CRTQfTu899Jh0Cxf',
                width: 320
            }
        })

    }

}
