import * as net from "net";
import fs from "node:fs";

const CLRF = "\r\n";

const server = net.createServer((socket) => {
  socket.on("data", async (data) => {
    let dataAsString = data.toString().split(CLRF);
    let [method, path, protocol] = dataAsString[0].split(" ");

    let userAgentResponse;
    for (const line of dataAsString.slice(1)) {
      let [header, info] = line.split(": ");
      if (header === "User-Agent") {
        userAgentResponse = info;
      }
    }

    let lengthResponse = 0;
    let [root, endpoint, serverResponse] = path.split("/");
    console.log(`endpoint ${endpoint}`);
    console.log(`serverResponse ${serverResponse}`);

    if (endpoint === "echo") {
      lengthResponse = serverResponse.length;
      socket.write(
        `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${lengthResponse}\r\n\r\n${serverResponse}`,
      );
      socket.end();
      return;
    }

    if (endpoint === "user-agent") {
      socket.write(
        `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgentResponse.length}\r\n\r\n${userAgentResponse}`,
      );
      socket.end();
      return;
    }

    if (endpoint === "files") {
      const [_, __, filename] = path.split("/");
      const args = process.argv.slice(2);
      const [___, absPath] = args;
      const filePath = absPath + "/" + filename;

      try {
        const content = fs.readFileSync(filePath);
        socket.write(
          `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${content.length}\r\n\r\n${content}`,
        );
      } catch (error) {
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      }

      socket.end();
      return;
    }

    if (path === "/") {
      serverResponse = "Hello, World!";
      lengthResponse = serverResponse.length;
      socket.write(
        `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${lengthResponse}\r\n\r\n${serverResponse}`,
      );
      socket.end();
      return;
    }

    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    socket.end();
  });
});

console.log("Logs from your program will appear here!");

server.listen(4221, "localhost", () => {
  console.log("Server is running on port 4221");
});
