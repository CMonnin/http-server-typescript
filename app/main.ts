import * as net from "net";

const CLRF = "\r\n";

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    let dataAsString = data.toString().split(CLRF);
    let [method, path, protocol] = dataAsString[0].split(" ");
    let statusCode;
    let message;

    if (path === "/") {
      statusCode = 200;
      message = "OK" + CLRF + CLRF;
    } else {
      statusCode = 404;
      message = "Not Found" + CLRF + CLRF;
    }

    writeSocket(socket, statusCode, message);
    socket.end();
  });
});

const writeSocket = (
  socket: net.Socket,
  statusCode: number,
  message: string,
) => {
  socket.write(`HTTP/1.1 ${statusCode} ${message}\r\n\r\n`);
  console.log(`HTTP/1.1 ${statusCode} ${message}\r\n\r\n`);
};
// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
server.listen(4221, "localhost", () => {
  console.log("Server is running on port 4221");
});
