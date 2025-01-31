const MAX_VIDEOS = 100;

var rtc = {
    // Variables del cliente local.
    client: null,
};

/*var options = {
    appId: "23284f5bceda4eea97300faa1bdee114",
    channel: "4",  // TODO: preguntar antes de entrar en llamada
    token: null, // Si se quiere usar la comunicacion cifrada hay que pasar un token.
};*/
var options = {
    appId: "5ffded3cf8a944fd91795e485694c067", // Arcadia World
    channel: "4_streaming",  // TODO: preguntar antes de entrar en llamada
    token: null, // Si se quiere usar la comunicacion cifrada hay que pasar un token.
};

startBasicCall();

async function startBasicCall() {
    rtc.client = AgoraRTC.createClient({ mode: "live", codec: "vp8" }); // mode live si queremos 1 ponente a muchos espectadores. Codec puede ser "h264".
    rtc.client.on("user-published", async (user, mediaType) => {
        // Subscribe to a remote user.
        await rtc.client.subscribe(user, mediaType);
        console.log("subscribe success");
        console.log(mediaType);

        if (mediaType === "video") {
            const remoteVideoTrack = user.videoTrack;
            const playerContainer = createVideoDOMObject(user);

            remoteVideoTrack.play(playerContainer); // El SDK automaticamente crea un reproductor de video en el div que le pases.
            playerContainer.children[0].style = "";
        }
    });
    rtc.client.on("user-unpublished", user => {
        // Get the dynamically created DIV container.
        const playerContainer = document.getElementById(user.uid);
        // Destroy the container.
        playerContainer.remove();
    });

    const uid = await rtc.client.join(options.appId, options.channel, options.token, null); // pasamos null como parametro uid para que agora genere uno y lo devuelva.
}

async function leaveCall() {

    rtc.client.remoteUsers.forEach(user => {
        const playerContainer = document.getElementById(user.uid);
        playerContainer && playerContainer.remove();
    });

    await rtc.client.leave(); // Leave the channel.
}

function createVideoDOMObject(user) {
    const playerContainer = document.createElement("div");  // TODO: ver si se puede usar un tag más semántico como <video>

    playerContainer.id = user.uid.toString();
    document.getElementById("videos").append(playerContainer);
    return playerContainer;
}
