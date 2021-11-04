/**
 * Spotify
 *
 * Embeds a spotify playlist
 *
 * All information regarding plugin development can be found at
 * https://dev.spatialweb.net/plugins/plugins/
 *
 * @license MIT
 * @author Vatom Inc.
 */
module.exports = class Spotify extends BasePlugin {

    /** Plugin info */
    static get id()             { return 'vatominc-spotify' }
    static get name()           { return 'Spotify Playlist' }
    static get description()    { return 'Display a message, in a popup, to users when they enter the space.' }

    /** Called when the plugin is loaded */
    onLoad() {

        // Allow playlist URL to be modified
        this.menus.register({
            id: 'vatominc-spotify-config',
            section: 'plugin-settings',
            panel: {
                fields: [
                    { type: 'section', name: 'Spotify Playlist' },
                    { type: 'text', id: 'url', name: 'URL', help: 'Embed URL for the Spotify playlist.' }
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

}
