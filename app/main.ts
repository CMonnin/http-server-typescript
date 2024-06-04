import { assert } from "console";
import * as net from "net";
import fs from "node:fs";

const CLRF = "\r\n";

const server = net.createServer((socket) => {
  let accumulatedData = "";
  socket.on("data", async (data) => {
    let dataAsString = data.toString().split(CLRF);
    console.log(dataAsString);
    let [method, path, protocol] = dataAsString[0].split(" ");
    console.log(`method: ${method}, path: ${path}, protocol: ${protocol}`);
    let userAgentResponse = "";
    let lengthResponse = 0;
    let encodingHeader = dataAsString[2].split(": ");
    console.log(encodingHeader);
    let encodingType = encodingHeader.slice(1)[0];
    if (encodingType) {
      encodingType = encodingType.split(", ");
    }
    console.log(encodingType);
    let acceptEncoding = true;

    for (const line of dataAsString.slice(1)) {
      let [header, info] = line.split(": ");
      if (header === "User-Agent") {
        userAgentResponse = info;
      }
    }

    let [root, endpoint, serverResponse] = path.split("/");
    console.log(
      `root: ${root}, endpoint: ${endpoint}, serverResponse ${serverResponse}`,
    );

    if (method === "POST" && endpoint === "files") {
      accumulatedData += data;
      let fileBody = accumulatedData.split(CLRF);
      fileBody = fileBody[fileBody.length - 1];
      const [_, __, filename] = path.split("/");
      const args = process.argv.slice(2);
      const [___, absPath] = args;
      const filePath = absPath + "/" + filename;

      try {
        fs.writeFileSync(filePath, fileBody);
        socket.write(`HTTP/1.1 201 Created\r\n\r\n`);
        socket.end();
        return;
      } catch (err) {
        console.log(err);
      }
    }

    if (endpoint === "echo" && acceptEncoding === true && encodingType) {
      lengthResponse = serverResponse.length;
      if (encodingType.includes("gzip")) {
        socket.write(
          `HTTP/1.1 200 OK\r\nContent-encoding: gzip\r\nContent-type: text/plain\r\nContent-length: ${lengthResponse}\r\n\r\n${serverResponse}`,
        );
        socket.end();
        return;
      }
      socket.write(
        `HTTP/1.1 200 OK\r\nContent-type: text/plain\r\nContent-length: ${lengthResponse}\r\n\r\n${serverResponse}`,
      );
      socket.end();
      return;
    }
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
