export function registerShelterSocket(io) {
  io.on("connection", (socket) => {
    socket.on("disconnect", () => {});

    //socket.join("western-province");
    //io.to("western-province").emit("alert", data);
  });
}
