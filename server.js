const io = require("socket.io")(process.env.PORT || 3000);

io.on("connection", (socket) => {
    socket.on("join_channel", (channelId) => {
        socket.join(channelId);
    });
    socket.on("send_audio", (data) => {
        socket.to(data.channelId).emit("receive_audio", data.audio);
    });
});