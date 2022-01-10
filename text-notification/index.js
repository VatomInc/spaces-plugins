module.exports = class TextNotificationPlugin extends BasePlugin {

    /** Plugin info */
    static get id()             { return 'zongo.text-notify' }
    static get name()           { return 'Notify Hosts' }
    static get description()    { return 'This plugin allows users to notify space hosts via text of their arival in the space' }

    phoneNumberSet = new Set()
    userName = ''
    /** Called when the plugin is loaded */
    onLoad() {
        this.user.getDisplayName().then(userID => {
            this.userName = userID
        }).catch(err => {
            console.log(err + 'userName is not defined')
        })
        // Register button
        this.menus.register({
            text: "Notify",
            section: 'add',
            adminOnly: false,
            icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE4LjEuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNjExLjk5OSA2MTEuOTk5IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA2MTEuOTk5IDYxMS45OTk7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8Zz4NCgkJCTxwYXRoIGQ9Ik01NzAuMTA3LDUwMC4yNTRjLTY1LjAzNy0yOS4zNzEtNjcuNTExLTE1NS40NDEtNjcuNTU5LTE1OC42MjJ2LTg0LjU3OGMwLTgxLjQwMi00OS43NDItMTUxLjM5OS0xMjAuNDI3LTE4MS4yMDMNCgkJCQlDMzgxLjk2OSwzNCwzNDcuODgzLDAsMzA2LjAwMSwwYy00MS44ODMsMC03NS45NjgsMzQuMDAyLTc2LjEyMSw3NS44NDljLTcwLjY4MiwyOS44MDQtMTIwLjQyNSw5OS44MDEtMTIwLjQyNSwxODEuMjAzdjg0LjU3OA0KCQkJCWMtMC4wNDYsMy4xODEtMi41MjIsMTI5LjI1MS02Ny41NjEsMTU4LjYyMmMtNy40MDksMy4zNDctMTEuNDgxLDExLjQxMi05Ljc2OCwxOS4zNmMxLjcxMSw3Ljk0OSw4Ljc0LDEzLjYyNiwxNi44NzEsMTMuNjI2DQoJCQkJaDE2NC44OGMzLjM4LDE4LjU5NCwxMi4xNzIsMzUuODkyLDI1LjYxOSw0OS45MDNjMTcuODYsMTguNjA4LDQxLjQ3OSwyOC44NTYsNjYuNTAyLDI4Ljg1Ng0KCQkJCWMyNS4wMjUsMCw0OC42NDQtMTAuMjQ4LDY2LjUwMi0yOC44NTZjMTMuNDQ5LTE0LjAxMiwyMi4yNDEtMzEuMzExLDI1LjYxOS00OS45MDNoMTY0Ljg4YzguMTMxLDAsMTUuMTU5LTUuNjc2LDE2Ljg3Mi0xMy42MjYNCgkJCQlDNTgxLjU4Niw1MTEuNjY0LDU3Ny41MTYsNTAzLjYsNTcwLjEwNyw1MDAuMjU0eiBNNDg0LjQzNCw0MzkuODU5YzYuODM3LDIwLjcyOCwxNi41MTgsNDEuNTQ0LDMwLjI0Niw1OC44NjZIOTcuMzINCgkJCQljMTMuNzI2LTE3LjMyLDIzLjQwNy0zOC4xMzUsMzAuMjQ0LTU4Ljg2Nkg0ODQuNDM0eiBNMzA2LjAwMSwzNC41MTVjMTguOTQ1LDAsMzQuOTYzLDEyLjczLDM5Ljk3NSwzMC4wODINCgkJCQljLTEyLjkxMi0yLjY3OC0yNi4yODItNC4wOS0zOS45NzUtNC4wOXMtMjcuMDYzLDEuNDExLTM5Ljk3NSw0LjA5QzI3MS4wMzksNDcuMjQ2LDI4Ny4wNTcsMzQuNTE1LDMwNi4wMDEsMzQuNTE1eg0KCQkJCSBNMTQzLjk3LDM0MS43MzZ2LTg0LjY4NWMwLTg5LjM0Myw3Mi42ODYtMTYyLjAyOSwxNjIuMDMxLTE2Mi4wMjlzMTYyLjAzMSw3Mi42ODYsMTYyLjAzMSwxNjIuMDI5djg0LjgyNg0KCQkJCWMwLjAyMywyLjU5NiwwLjQyNywyOS44NzksNy4zMDMsNjMuNDY1SDEzNi42NjNDMTQzLjU0MywzNzEuNzI0LDE0My45NDksMzQ0LjM5MywxNDMuOTcsMzQxLjczNnogTTMwNi4wMDEsNTc3LjQ4NQ0KCQkJCWMtMjYuMzQxLDAtNDkuMzMtMTguOTkyLTU2LjcwOS00NC4yNDZoMTEzLjQxNkMzNTUuMzI5LDU1OC40OTMsMzMyLjM0NCw1NzcuNDg1LDMwNi4wMDEsNTc3LjQ4NXoiLz4NCgkJCTxwYXRoIGQ9Ik0zMDYuMDAxLDExOS4yMzVjLTc0LjI1LDAtMTM0LjY1Nyw2MC40MDUtMTM0LjY1NywxMzQuNjU0YzAsOS41MzEsNy43MjcsMTcuMjU4LDE3LjI1OCwxNy4yNTgNCgkJCQljOS41MzEsMCwxNy4yNTgtNy43MjcsMTcuMjU4LTE3LjI1OGMwLTU1LjIxNyw0NC45MjMtMTAwLjEzOSwxMDAuMTQyLTEwMC4xMzljOS41MzEsMCwxNy4yNTgtNy43MjcsMTcuMjU4LTE3LjI1OA0KCQkJCUMzMjMuMjU5LDEyNi45NiwzMTUuNTMyLDExOS4yMzUsMzA2LjAwMSwxMTkuMjM1eiIvPg0KCQk8L2c+DQoJPC9nPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPC9zdmc+DQo=',
            action: this.onMenuPress.bind(this)
        })

        this.menus.register({
            id: 'notify-config',
            section: 'plugin-settings',
            panel: {
                fields: [
                    { type: 'section', name: 'Phone Numbers' },
                    { type: 'text', id: 'phone-number1', name: 'Phone Number', help: 'Enter the phone number you wish to be alerted when a user joins the space. Example Format: +15555555555' },
                    { type: 'text', id: 'phone-number2', name: 'Phone Number', help: 'Enter the phone number you wish to be alerted when a user joins the space. Example Format: +15555555555' },
                    { type: 'text', id: 'phone-number3', name: 'Phone Number', help: 'Enter the phone number you wish to be alerted when a user joins the space. Example Format: +15555555555' },
                    { type: 'text', id: 'phone-number4', name: 'Phone Number', help: 'Enter the phone number you wish to be alerted when a user joins the space. Example Format: +15555555555' },
                    { type: 'text', id: 'phone-number5', name: 'Phone Number', help: 'Enter the phone number you wish to be alerted when a user joins the space. Example Format: +15555555555' },
                ]
            }
        })

    }
    /**
     * Updates the plugin when settings have changed
     * @param {} feild that has been updated
     * @param {any} value new value of the feild
     */
    onSettingsUpdated(feild, value){
        //check that the number is of the correct format then add to set
        if(value.match(/^\+[1-9]\d{1,14}$/)){
            this.phoneNumberSet.add(value)
        }
        else{
            this.menus.alert('Please renter the number with the correct format eg. +11234567890', 'Invalid international number', 'info')
        }
        //reregister the button when the settings have changed
    }

    /** Called when the user presses the Notify button */
    async onMenuPress() {
        // Ask user for message
        if(this.phoneNumberSet.size > 0){
            this.phoneNumberSet.forEach( (number) => {
                let dataToSend = this.userName + ':' + number       //message body format: "userName:number"
                fetch('https://us-central1-ydangle-high-fidelity-test-2.cloudfunctions.net/sendSMSNotification',{
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'text/plain'
                    },
                    body: dataToSend,
                })
                .then(() =>{
                    console.log('success message sent')
                })
                .catch(error => console.log('ERROR', error))
            })
            this.menus.alert('The hosts have been notified of your arrival','Notification sent', 'info')
        }
        else{
            this.menus.alert('The space hosts do not wish to be notified at this moment','Notification not sent', 'info')
        }

    }

    /** Called when a message is received */
    async onMessage(msg, fromUserID) {
        // Check message type
        console.log("On Message")

    }

    /** Called when we receive a message to display text */
    onShowMessage(msg, fromUserID) {
        console.log("On Show Message")
    }

}

