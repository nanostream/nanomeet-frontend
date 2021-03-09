/**
 * nanoMeet Web API Class for HTML5 Web Browsers.
 *
 * @file nanomeet.js - nanoMeet API Class for HTML5 Web Browsers.
 * @author nanocosmos
 * @copyright (c) 2021 nanocosmos GmbH. All rights reserved. 
 * @license nanoStream Software/Service License - https://www.nanocosmos.de/terms
 * 
 * @version 1.0.2
 * 
 */

class NanoMeet {
    constructor() {
    }

    version = "1.0.2";

    // nanoMeet web page for invite URL
    nanoMeetWebPage = "https://nanomeet.pages.nanocosmos.de/nanomeet-frontend/nanomeet-sample.html"

    // default nanoMeet server
    defaultServer = "nanomeet-eu.nanocosmos.de";

    // global API config
    bintuFrontendUrl = "https://bintu-cloud-frontend.nanocosmos.de";
    bintuTokenUrl = "https://bintu-cloud-token.k8s-prod.nanocosmos.de";
    linkShortener = "https://nanomeet-linkshortener.k8s-prod.nanocosmos.de/shorturl";
    bintuApiUrl = "https://bintu.nanocosmos.de";

    // rtmp ingest for live stream
    ingestURL = "rtmp://bintu-vtrans.nanocosmos.de";
   
    // nanoPlayer for sharing live stream
    nanoPlayerUrl = "https://demo.nanocosmos.de/nanoplayer/release/nanoplayer.html";

    // VOD recording URL
    bintuVodUrl = "https://bintu-vod.nanocosmos.de/vod";

    /**
    * Method that parses the JWT to an object.
    * @param {String} token The token that should be parsed.
    * @returns {Object} An object containing the properties "aud", "sub", "exp", "ext.streamname", "iss", "moderator", "room", "sub".
    */
    parseToken(token) {
        let base64Url = token.split('.')[1];
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

        let jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    }

    /**
     * Helper method to that returns the value of a search parameter if existing.
     * @param {String} variable The search parameter that should be found.
     * @returns {Object} Returns the value of the search parameter or false if not existing.
     */
    getQueryVariable(variable) {
        var result = [];
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) === variable) {
                result.push(decodeURIComponent(pair[1]));
            }
        }
        if (result.length === 0) { return false; }
        else {
            if (result.length === 1) { return result[0]; }
            return result;
        }
    }

    /**
     * Helper method to validate the nanoStream Cloud API key
     * @param {String} apikey 
     * @returns {Object} Returns a data object with informations of the organisation.
     */
    validateAPIKey(apikey) {
        if (!apikey) {
            return Promise.reject({ error: "Missing API Key Error", message: "Please provide an API Key." });
        }

        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();

            request.onreadystatechange = (res) => {
                let target = res.currentTarget;
                if (target.readyState == 4 && target.status != 200) {
                    let parsedResponse = JSON.parse(target.response);
                    reject({ error: "API Key Error", message: parsedResponse.message })
                }
                if (target.readyState == 4 && target.status == 200) {
                    let parsedResponse = JSON.parse(target.response);
                    let response = parsedResponse;
                    resolve({ data: response })
                }
            };
            request.open("GET", `${this.bintuApiUrl}/organisation`, true);
            request.setRequestHeader("content-Type", "application/json");
            request.setRequestHeader("accept", "application/json");
            request.setRequestHeader("x-bintu-apikey", apikey);

            request.send();

        })
    }

    /**
     * Initializes the nanoMeet window.
     * @param {Object} config The configuration for the nanoMeet window. 
     * @param {String} config.token The token. 
     * @param {String} config.id The ID of the div element the nanoMeet window will be embedded into. 
     * @param {Number | String} [config.height] The height of the nanoMeet window. Default is 100%.
     * @param {Number | String} [config.width] The width of the nanoMeet window. Default is 100%.
     * @param {String} [config.branding] The branding URL that refers to a JSON file. Default is nanoMeet branding.
     * @param {Object} [config.tileView] The configuration for the tile view.
     * @param {Number} [config.tileView.size] The maximal height of a tile. Default is 120.
     * @param {Number} [config.tileView.maxColumns] The maximal amount of tiles, accepts values from 1 to 5. Default is 5.
     * @param {Boolean} [config.tileView.vertical] Whether to show the tiles vertical (true) or horizontal (false). Default is true.
     * @returns {Promise<Object>} A data object containing "moderator".
     */
    init(config) {

        console.log("nanoMeet API Version ", this.version);

        if (!config) {
            return Promise.reject({ error: "Config Error", message: "Please provide a config." });
        }
        if (!config.token || config.token.length < 200) {
            return Promise.reject({ error: "Token Error", message: "Please provide a token." });
        }
        if (!config.id) {
            return Promise.reject({ error: "Missing Div Error", message: "Please provide a Div-ID." });
        }

        let decodedJWT = this.parseToken(config.token);

        if (!decodedJWT.room) {
            return Promise.reject({ error: "Missing Property Error", message: "The token contains no nanoMeet room." });
        }
        if (!decodedJWT.streamname) {
            return Promise.reject({ error: "Missing Property Error", message: "The token contains no nanoMeet streamname." });
        }
        if (!decodedJWT.sub) {
            return Promise.reject({ error: "Missing Group Error", message: "The token contains no valid nanoMeet group. " })
        }
        if (decodedJWT.iat) {
            console.log("nanoMeet Token issue date (iat): ", decodedJWT.iat, new Date(decodedJWT.iat * 1000));
        }        
        if (decodedJWT.nbf) {
            console.log("nanoMeet Token start date (nbf): ", decodedJWT.nbf, new Date(decodedJWT.nbf * 1000));
            if(Date.now()<decodedJWT.nbf * 1000) {
                return Promise.reject({ error: "Invalid token", message: "The token 'not before date' (nbf) is not reached yet." });
            }
        }        
        if (decodedJWT.exp) {
            console.log("nanoMeet Token expiration date: ", decodedJWT.exp, new Date(decodedJWT.exp * 1000));
            if(Date.now()>decodedJWT.exp * 1000) {
                return Promise.reject({ error: "Invalid token", message: "The token is expired." });
            }
        }        

        this.server = decodedJWT.server;
        // override by url query param
        if(decodedJWT.server) {
            this.server = decodedJWT.server;            
        }     
        // override by url query param
        this.server = this.getQueryVariable("nanomeet.server") || this.server || this.defaultServer;
        this.domain = `${this.server}/${decodedJWT.sub}`;
        console.log(`nanoMeet server: ${this.server}`);

        this.token = config.token;
        this.room = decodedJWT.room;        
        this.streamname = decodedJWT.streamname;
        this.parentNode = document.querySelector(`#${config.id}`);
        this.isLive = false;
        this.moderator = decodedJWT.moderator;

        let configOverwrite = {
            disableDeepLinking: true
        };
        let interfaceConfigOverwrite = {
            MOBILE_APP_PROMO: false,
        };

        if (config.tileView) {
            if (config.tileView.size) interfaceConfigOverwrite.FILM_STRIP_MAX_HEIGHT = config.tileView.size;
            if (config.tileView.maxColumns) interfaceConfigOverwrite.TILE_VIEW_MAX_COLUMNS = config.tileView.maxColumns;
            if (config.tileView.vertical) interfaceConfigOverwrite.VERTICAL_FILMSTRIP = config.tileView.vertical
        }

        // override by url query param
        config.branding = this.getQueryVariable("nanomeet.branding") || config.branding;

        if (config.branding) {
            configOverwrite.dynamicBrandingUrl = config.branding;
            configOverwrite.brandingDataUrl = config.branding; // to be removed
        }

        this.nanoMeetSetUp = {
            roomName: this.room,
            jwt: this.token,
            width: config.width ? config.width : "100%",
            height: config.height ? config.height : "100%",
            parentNode: this.parentNode,
            configOverwrite,
            interfaceConfigOverwrite
        };

        let externalApi = `https://${this.server}/external_api.js`;

        const script = document.createElement('script');
        script.setAttribute("src", externalApi);
        document.body.appendChild(script);

        script.onload = () => {
            // Init NanoMeetWeb
            this.api = new NanoMeetAPI(this.domain, this.nanoMeetSetUp);

            this.api.addEventListener("readyToClose", () => {
                this.destroy();
            });
        }

        let response = {
            moderator: this.moderator
        }

        return Promise.resolve({ data: response })
    }

    /**
     * Shortens a provided URL
     * @param {String} url The URL that should be shorten
     * @returns {Promise<Object>} A data object containing the shorten URL.
     */
    shortenMeetingUrl(url, alias) {
        let self = this;
        return new Promise((resolve, reject) => {
            let xhttp = new XMLHttpRequest();

            xhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status != 200) {
                    let error = JSON.parse(this.responseText);
                    console.log({ error: "Shorten URL Error", message: "Could not shorten URL" })
                    reject(error);
                }
                if (this.readyState == 4 && this.status == 200) {
                    console.log(JSON.parse(this.responseText))
                    let meetingUrl = JSON.parse(this.responseText).objects[0].short_link
                    resolve({ data: meetingUrl });
                }
            };
            xhttp.open("GET", `${self.linkShortener}?url=${url}&alias=${alias}`, true);
            xhttp.setRequestHeader("content-type", "application/json");
            xhttp.setRequestHeader("accept", "application/json");

            xhttp.send();
        })
    }


    /**
     * Removes the embedded nanoMeet window.
     * @returns {Promise}
     */
    destroy() {
        if (!this.api) {
            return Promise.reject({ error: "Missing Instance Error", message: "You are trying to destory a non existing Instance." })
        }
        this.api.dispose();
        return Promise.resolve();
    }

    /**
     * Creates transcoded stream with default profiles "vtrans2-852x480x800x25", "vtrans2-640x360x400x25"
     * @param {String} apikey API Key of the organisation
     * @param {Array<String>} [profiles] Optional added profiles
     * @returns A data object containing the "streamInfo" and a "cloudDashboardLink"
     */
    createNanoStreams(apikey, profiles) {
        if (!apikey) {
            return Promise.reject({ error: "Missing API Key Error", message: "Please provide a valid api key." });
        }
        let profile1 = "vtrans2-852x480x800x25";
        let profile2 = "vtrans2-640x360x400x25";
        let self = this;
        let bintuApi = self.bintuApiUrl

        if (profiles && profiles.length === 2) {
            var transcodingProfiles = {
                "vtrans-2000x30": 2000,
                "vtrans-2000x25": 2000,
                "vtrans-1600x30": 1600,
                "vtrans-1600x25": 1600,
                "vtrans-1000k": 1000,
                "vtrans-1000x30": 1000,
                "vtrans-1000x25": 1000,
                "vtrans-800k": 800,
                "vtrans-400k": 400,
                "vtrans-400k15": 400,
                "vtrans-1280x720x2000x30": 2000,
                "vtrans-1280x720x2000x25": 2000,
                "vtrans-1280x720x1600x30": 1600,
                "vtrans-1280x720x1600x25": 1600,
                "vtrans-1280x720x1200x30": 1200,
                "vtrans-1280x720x1200x25": 1200,
                "vtrans-1280x720x1000x30": 1000,
                "vtrans-1280x720x1000x25": 1000,
                "vtrans-852x480x800x30": 800,
                "vtrans-852x480x800x25": 800,
                "vtrans-852x480x640x30": 640,
                "vtrans-852x480x640x25": 640,
                "vtrans-640x360x400": 400,
                "vtrans-640x360x400x25": 400,
                "vtrans-640x360x300x15": 300,
                "vtrans-480x360x300x15": 300,
                "vtrans-480x270x250x15": 250,
                "vtrans-426x240x200x15": 200,
                "vtrans-320x240x200x15": 200,
                "vtrans2-2000x30": 2000,
                "vtrans2-2000x25": 2000,
                "vtrans2-1600x30": 1600,
                "vtrans2-1600x25": 1600,
                "vtrans2-1000k": 1000,
                "vtrans2-1000x30": 1000,
                "vtrans2-1000x25": 1000,
                "vtrans2-800k": 800,
                "vtrans2-400k": 400,
                "vtrans2-400k15": 400,
                "vtrans2-1280x720x2000x30": 2000,
                "vtrans2-1280x720x2000x25": 2000,
                "vtrans2-1280x720x1600x30": 1600,
                "vtrans2-1280x720x1600x25": 1600,
                "vtrans2-1280x720x1200x30": 1200,
                "vtrans2-1280x720x1200x25": 1200,
                "vtrans2-1280x720x1000x30": 1000,
                "vtrans2-1280x720x1000x25": 1000,
                "vtrans2-852x480x800x30": 800,
                "vtrans2-852x480x800x25": 800,
                "vtrans2-852x480x640x30": 640,
                "vtrans2-852x480x640x25": 640,
                "vtrans2-640x360x400": 400,
                "vtrans2-640x360x400x25": 400,
                "vtrans2-640x360x300x15": 300,
                "vtrans2-480x360x300x15": 300,
                "vtrans2-480x270x250x15": 250,
                "vtrans2-426x240x200x15": 200,
                "vtrans2-320x240x200x15": 200
            };
            if (!(transcodingProfiles[`${profiles[0]}`]) && !(transcodingProfiles[`${profiles[1]}`])) {
                return Promise.reject({ error: "Transcoding Profiles Error", message: "Please provide 2 valid profiles." });
            }

            if (transcodingProfiles[`${profiles[0]}`] > transcodingProfiles[`${profiles[1]}`]) {
                profile1 = profiles[1];
                profile2 = profiles[0];
            }
            else {
                profile1 = profiles[0];
                profile2 = profiles[1];
            }
        }
        return new Promise(function (resolve, reject) {
            let xhttp = new XMLHttpRequest();

            const body = JSON.stringify({
                tags: [
                    "nanoMeet"
                ],
                transcodes: [
                    {
                        profile: profile1,
                        tags: [
                            "1st transcode",
                            "nanoMeet"
                        ]
                    },
                    {
                        profile: profile2,
                        tags: [
                            "2nd transcode",
                            "nanoMeet"
                        ]
                    }
                ]
            });

            xhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status != 200) {
                    let error = JSON.parse(this.responseText);
                    console.log({ error: "Create Stream Error", message: "Could not create streams" })
                    reject(error);
                }
                if (this.readyState == 4 && this.status == 200) {
                    let success = JSON.parse(this.responseText)
                    let cloudDashboardLink = `${self.bintuFrontendUrl}/stream/new/${success.id}?vtrans1.id=${success.playout.h5live[1].id}&vtrans1.bitrate=${profile1}&vtrans2.id=${success.playout.h5live[2].id}&vtrans2.bitrate=${profile2}&startIndex=0`
                    let response = {
                        streamInfo: success,
                        cloudDashboardLink
                    }
                    resolve({ data: response });
                }
            };
            xhttp.open("POST", `${bintuApi}/stream`, true);
            xhttp.setRequestHeader("content-type", "application/json");
            xhttp.setRequestHeader("x-bintu-apikey", apikey);
            xhttp.setRequestHeader("accept", "application/json");

            xhttp.send(body);
        })
    }


    /**
     * Creates a new nanoMeet room.
     * @param {String} bintuToken The bintu API key.
     * @param {Object} roomSetUp The configuration for the room.
     * @param {String} roomSetUp.exp The expiration date for the token in ISO format.
     * @param {String} roomSetUp.nbf The not before date for the token in ISO format.
     * @param {String} roomSetUp.streamname The passthrough streamname.
     * @param {String} roomSetUp.room The room name.
     * @param {String} roomSetUp.moderator The moderator rights.
     * @returns {Promise<Object>} A data object containing "expiration", "notbefore", "room", "streamname", "moderator", "token", "inviteLink".
     */
    createNanoMeetRoom(bintuToken, roomSetUp) {
        if (!bintuToken) {
            return Promise.reject({ error: "Missing Bintu Token Error", message: "Please provide a valid bintu token." });
        }
        if (!roomSetUp) {
            return Promise.reject({ error: "Missing Room Setup Error", message: "Please provide informations for the room creation." });
        }
        if (roomSetUp.exp === undefined) {
            return Promise.reject({ error: "Missing Expiration Error", message: "Please provide a expiration time for the token in ISO format." });
        }
        if (roomSetUp.nbf === undefined) {
            return Promise.reject({ error: "Missing Not Before Error", message: "Please provide a not before time for the token in ISO format." });
        }
        if (roomSetUp.room === undefined) {
            return Promise.reject({ error: "Missing Room Error", message: "Please provide a room name." });
        }
        if (roomSetUp.moderator === undefined) {
            return Promise.reject({ error: "Missing Moderator Error", message: "Please provide if the token owner should be a moderator." });
        }
        if (roomSetUp.server === undefined) {
            return Promise.reject({ error: "Missing Server Error", message: "Please provide a location where you want to host your room." });
        }

        const body = {
            "exp": roomSetUp.exp,
            "nbf": roomSetUp.nbf,
            "room": roomSetUp.room,
            "streamname": roomSetUp.streamname,
            "moderator": roomSetUp.moderator,
            "server": roomSetUp.server
        };

        let self = this;

        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();

            request.onreadystatechange = (res) => {
                let target = res.currentTarget;
                if (target.readyState == 4 && target.status != 200) {
                    let parsedResponse = JSON.parse(target.response);
                    reject({ error: "Create Room Error", message: parsedResponse.message })
                }
                if (target.readyState == 4 && target.status == 200) {
                    let parsedResponse = JSON.parse(target.response);
                    let response = {
                        expiration: roomSetUp.exp,
                        notbefore: roomSetUp.nbf,
                        room: roomSetUp.room,
                        server: roomSetUp.server,
                        streamname: roomSetUp.streamname,
                        moderator: roomSetUp.moderator,
                        token: parsedResponse.data,
                    }
                    resolve({ data: response })
                }
            };
            request.open("POST", `${self.bintuTokenUrl}/nanomeet`, true);
            request.setRequestHeader("X-BINTU-APIKEY", bintuToken);
            request.setRequestHeader("Content-Type", "application/json");
            request.setRequestHeader("Accept", "application/json");

            request.send(JSON.stringify(body));
        })
    }

    /**
     * Creates an invite token for an participant of the nanoMeet.
     * @param {Object} tokenSetup The configuration for the invite token.
     * @param {String} token Token with moderator rights for this specific room.
     * @param {Boolean} tokenSetup.moderator Moderator rights for the Invitee.
     * @param {String} [tokenSetup.exp] Expiration date in ISO format.
     * @param {String} [tokenSetup.nbf] Not before date in ISO format.
     * @returns {Promise<Object>} A data object containing the properties "moderator", "inviteToken" and "inviteLink".
     */
    createInviteToken(token, tokenSetup) {
        if (token === undefined) {
            return Promise.reject({ error: "Missing Token Error", message: "Please provide a valid token with moderator rights to create an invite token." });
        }
        if (!tokenSetup) {
            return Promise.reject({ error: "Missing Token Setup Error", message: "Please provide a token set up for the Invitee." });
        }
        if (tokenSetup.moderator === undefined) {
            return Promise.reject({ error: "Missing Moderator Error", message: "Please provide if the Invitee should have moderator rights." });
        }

        let decodedJWT = this.parseToken(token);

        const body = {
            "moderator": tokenSetup.moderator,
            "server": decodedJWT.server
        };

        tokenSetup.exp ? body.exp = tokenSetup.exp : null;
        tokenSetup.nbf ? body.nbf = tokenSetup.nbf : null;

        let self = this;

        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();

            request.onreadystatechange = (res) => {
                let target = res.currentTarget
                if (target.readyState == 4 && target.status != 200) {
                    let parsedResponse = JSON.parse(target.response);
                    reject({ error: "Create Invite Token Error", message: parsedResponse.message })
                }
                if (target.readyState == 4 && target.status == 200) {
                    let parsedResponse = JSON.parse(target.response);

                    let response = {
                        moderator: tokenSetup.moderator,
                        token: parsedResponse.data,
                        inviteLink: `${self.nanoMeetWebPage}?token=${parsedResponse.data}`,
                    }
                    resolve({ data: response })

                }
            };
            request.open("POST", `${self.bintuTokenUrl}/nanomeet`, true);
            request.setRequestHeader("Content-Type", "application/json");
            request.setRequestHeader("Accept", "application/json");
            request.setRequestHeader("x-bintu-token", token);

            request.send(JSON.stringify(body));
        })
    }

    /**
     * Starts the broadcast and sends it to the nanoStream Cloud.
     * @param {Boolean} isVOD Sets up whether the broadcast will be recorded.
     * @returns {Promise<Object>} A data object containing a property named "nanoStream".
     */
    startBroadcast(isVOD) {
        let ingest = `${this.ingestURL}${isVOD ? "/rec" : "/live"}/${this.streamname}`;

        this.api.executeCommand('startRecording', { mode: "stream", rtmpStreamKey: ingest });
        let response = {
            nanoStream: ingest,
            playback: {
                live: `${this.nanoPlayerUrl}?bintu.streamname=${this.streamname}`,
            }
        }
        if (isVOD) {
            response.playback.vod = `${this.bintuVodUrl}/${this.streamname}.mp4`
        }
        return Promise.resolve({ data: response });
    }

    /**
     * Stops the broadcast.
     * @returns {Promise}
     */
    stopBroadcast() {
        this.api.executeCommand('stopRecording', "stream");
        return Promise.resolve();
    }

    /**
     * Sets the subject of the room. Default is the room name.
     * @param {String} subject The subject that will be applied to the nanoMeet room if more than 1 person attends.
     * @returns {Promise<Object>} A data object containig a property named "subject".
     */
    setNanoMeetSubject(subject) {
        if (!subject || !(subject instanceof String)) {
            return Promise.reject({ error: "Missing Subject Error", message: "Please provide a valid subject." });
        }
        this.api.executeCommand('subject', subject);
        let response = {
            subject: subject
        }
        console.log(response);
        return Promise.resolve({ data: response })
    }

    /**
     * Updates the audio input or output device to the id that is passed.
     * @param {Object} audio The configuration to update the audio device.
     * @param {String} audio.type The type ("input" or "ouput") of the audio that should be updated.
     * @param {String} audio.id The id of the device that should be applied.
     * @returns {Promise<Object>} A data object containing properties named "type", "deviceId"
     */
    setAudioDevice(audio) {
        return new Promise((resolve, reject) => {
            if (!audio) {
                reject({ error: "Set Audio Device Error", message: "Please provide informations to change the audio device." });
            }
            if (!audio.type || !audio.type instanceof String) {
                reject({ error: "Set Audio Device Error", message: "Please provide the type of the audio you want to change." });
            }
            if (!audio.id) {
                reject({ error: "Set Audio Device Error", message: "Please provide the id of the audio you want to set up." });
            }

            let identifier = `audio${audio.type.charAt(0).toUpperCase()}${audio.type.slice(1)}`;

            this.getAvailableDevices()
                .then((success) => {
                    let array = success.data[identifier];
                    if (array.some((device) => device.deviceId === audio.id)) {
                        let audioInformation = {
                            type: audio.type,
                            deviceId: audio.id
                        }
                        switch (audio.type) {
                            case "input":
                                this.api.setAudioInputDevice(audio.id);
                                resolve({ data: audioInformation });
                            case "output":
                                this.api.setAudioOutputDevice(audio.id);
                                resolve({ data: audioInformation });
                            default: reject({ error: "Set Audio Device Error", message: "Please provide a valid type of the audio you want to change." });
                        }
                    }
                }).catch((error) => {
                    reject({ error: "Set Audio Device Error", message: "The devices couldn't be fetched." });
                });
        })

    }

    /**
     * Elects the participant with the given id to be the pinned participant in order to always receive video for this participant.
     * @param {String} id The id of the participant that should be pinned.
     * @returns {Promise<Object>} A data object containing the pinnedParticipant.id 
     */
    setMainParticipant(id) {
        return new Promise((resolve, reject) => {
            if (!id) {
                reject({ error: "Missing ID Error", message: "Please provide a participant ID." })
            }
            this.getParticipants()
                .then((success) => {
                    if (success.data.some((participant) => participant.participantId === id)) {
                        this.api.setLargeVideoParticipant(id);
                        let response = {
                            pinnedParticipant: {
                                id: id
                            }
                        }
                        resolve({ data: response });
                    }
                })
                .catch((error) => {
                    reject({ error: "Presenter ID Error", message: "Please provide a valid participant ID." })
                })
        })
    }

    /**
     * Displays the participant with the matching id on the large video. If no participant id is passed, a particpant will be picked based on the dominant/pinned speaker settings.
     * @param {String} id The id of the participant that should be shown in the large window.
     * @returns {Promise<Object>} A data object containing the mainParticipant.id
     */
    pinParticipant(id) {
        this.api.pinParticipant(id);
        let response = {
            mainParticipant: {
                id: id
            }
        }
        resolve({ data: response });
    }

    /**
     *  Lists the participants and their informations.
     * @returns {Promise<Object>} A data object containing an array of objects with "avatar", "displayName", "formattedDisplayName", "participantId" properties.
     */
    getParticipants() {
        let participants = this.api.getParticipantsInfo();
        return Promise.resolve({ data: participants });
    }

    /**
     * Retrieves a list of the available devices.
     * @returns {Promise<Object>} A data object containing arrays for "audioInput", "audioOutput", "videoInput" with the properties "deviceId", "groupId", "kind", "label".
     */
    getAvailableDevices() {
        return new Promise((resolve, reject) => {
            this.api.getAvailableDevices()
                .then((success) => {
                    this.availbleDevices = success;
                    resolve({ data: success })
                }).catch((error) => {
                    reject({ error: "Devices Error", message: "Could not get available devices." });
                })
        })
    }

    /**
     * Retrieve a list with the devices that are currently selected.
     * @returns {Promise<Object>} A data object containing objects named "audioInput", "audioOutput", "videoInput" with the properties "deviceId", "groupId", "kind", "label".
     */
    getCurrentDevices() {
        return new Promise((resolve, reject) => {
            this.api.getCurrentDevices()
                .then((success) => {
                    this.currentDevices = success;
                    resolve({ data: success })
                }).catch((error) => {
                    reject({ error: "Devices Error", message: "Could not get current devices." });
                })
        })
    }

    /**
     * Toggles the lobby mode on or off. This command requires one argument - the desired state of lobby mode. Default password is "changeme". Password is required
     * @param {Boolean} activate Should the lobby be turnt on or off.
     * @returns {Promise<Object>} A data object containing the property "lobby".
     */
    setLobby(activate) {
        return new Promise((resolve, reject) => {
            if (!this.moderator) {
                reject({ error: "Set Lobby Error", message: "You do not have access to turn the lobby on or off." })
            }
            let turnOn = activate === "true" || activate === true ? true : false;
            this.api.executeCommand('password', turnOn ? "changeme" : "");
            this.api.executeCommand('toggleLobby', turnOn);
            let response = {
                lobby: turnOn,
                password: turnOn ? "changeme" : ""
            }
            resolve({ data: response });
        })
    }

    /**
     * Sets the password for the room. Turns the lobby on if setted and off if empty.
     * @param {String} password The password that for the room. Empty String turns off password.
     * @returns {Promise<Object>} A data object containing the property "password"
     */
    setPassword(password) {
        return new Promise((resolve, reject) => {
            if (!this.moderator) {
                reject({ error: "Set Password Error", message: "You do not have access to change or set the password." })
            }
            this.api.executeCommand('password', password);
            let updatedPassword = (password === "") ? false : password;
            let lobby = updatedPassword ? true : false;
            this.api.executeCommand('toggleLobby', lobby);
            let response = {
                lobby: lobby,
                password: updatedPassword
            }
            resolve({ data: response })
        })
    }

    /**
     * Lets the moderator mute every participant.
     * @returns {Promise<Object>} A data object containing the property "muteEveryone"
     */
    muteEveryone() {
        return new Promise((resolve, reject) => {
            this.api.executeCommand('muteEveryone')
            let response = {
                muteEveryone: true
            }
            resolve({ data: response })
        })
    }

}

window.NanoMeet = NanoMeet;
