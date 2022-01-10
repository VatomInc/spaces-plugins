# SMS Notification Plugin

This plugin allows users to notify space hosts of their arrival to the space via SMS

## Usage :clipboard:

- **Step 1:** Host the plugin on a [CORS enabled](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) server, or upload the entire `text-notification` directory into your own space
  - If you are hosting the plugin on a server, you need to copy the full URL to the `index.js` file
  - To host the plugin in your own space, you can go to File -> Storage and click the top-right "upload" button
  - Once it has been uploaded, click on the `index.js` file and select "Copy URL"
- **Step 2:** Add the plugin to your space by clicking "Plugins" and scrolling to the bottom to click the "Add from URL" button. Paste the URL to the plugin here.

## Plugin Configuration :clipboard:

- **Step 1:** Once the plugin has been installed in your space, you can add up to five phone numbers you wish to be alerted when a user enters the space.
    - Click on Plugins
    - Navigate to the 'Notify Hosts' plugin and click on Settings
    - Add the five phone numbers you wish to notify using the [E.164 format](https://www.twilio.com/docs/glossary/what-e164)

    ```
    [+][country code][area code][local phone number]
    ```
- Here are some examples of phone numbers in [E.164 format](https://www.twilio.com/docs/glossary/what-e164)

    | Country       | Local phon    | Country Code | E.164 formatted number  |
    | ------------- |:-------------:| ------------:|------------------------:|
    | United States | 415 123 1234  | +1           | +14151231234            |
    | South Africa  | 074 123 1234  | +27          | +27741231234            |
    | United Kingdom| 020 1234 1234 | +44          | +442012341234           |

