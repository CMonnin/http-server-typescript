import * as net from "net";
import fetch from "node-fetch";

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

    let statusCode = 200;
    let message = "OK";
    let typeResponse = "text/plain";
    let lengthResponse = 0;
    const contentTypeHeader = "Content-Type";
    const contentLengthHeader = "Content-Length";
    let fullReponse = true;
    let [root, endpoint, serverResponse] = path.split("/");
    console.log(`endpoint ${endpoint}`);
    console.log(`serverResponse ${serverResponse}`);

    const fileExists = await fileExistsChecker(urlCreator(path));
    if (fileExists) {
      console.log(fileExists);
      if (endpoint === "user-agent") {
        serverResponse = userAgentResponse;
        lengthResponse = serverResponse.length;
      } else if (endpoint === "echo") {
        serverResponse = serverResponse;
        lengthResponse = serverResponse.length;
      } else if (endpoint === "files") {
        typeResponse = "application/octet-stream";
        if (fileExists) {
          console.log("fileExists");
          serverResponse = "File exists";
        } else {
          statusCode = 404;
          message = "Not Found";
          serverResponse = "File not found";
        }
        lengthResponse = serverResponse.length;
      } else if (path === "/") {
        serverResponse = "Hello, World!";
        lengthResponse = serverResponse.length;
      } else {
        statusCode = 404;
        message = "Not Found";
        serverResponse = "Not Found";
        lengthResponse = serverResponse.length;
      }
    }
    // checking it's a good start to the address
    writeSocket(
      socket,
      statusCode,
      message,
      contentTypeHeader,
      contentLengthHeader,
      typeResponse,
      lengthResponse,
      serverResponse,
      fullReponse,
    );
    socket.end();
  });
});

// Status line
//HTTP/1.1 200 OK               // Status code must be 200
//\r\n

// Headers
//Content-Type: text/plain\r\n
//Content-Length: 12\r\n
//\r\n

// Response body
//foobar/1.2.3                  // The value of `User-Agent`
const writeSocket = (
  socket: net.Socket,
  statusCode: number,
  message: string,
  contentTypeHeader: string,
  contentLengthHeader: string,
  typeResponse: string,
  lengthResponse: number,
  serverResponse: string,
  fullReponse: boolean,
) => {
  if (fullReponse) {
    {
      socket.write(
        `HTTP/1.1 ${statusCode} ${message}${CLRF}${contentTypeHeader}: ${typeResponse}${CLRF}${contentLengthHeader}: ${lengthResponse}${CLRF}${CLRF}${serverResponse}`,
      );
      console.log(
        `HTTP/1.1 ${statusCode} ${message}${CLRF}${contentTypeHeader}: ${typeResponse}${CLRF}${contentLengthHeader}: ${lengthResponse}${CLRF}${CLRF}${
          serverResponse
        }`,
      );
    }
  } else {
    socket.write(
      `HTTP/1.1 ${statusCode} ${message}${CLRF}${contentTypeHeader}: ${typeResponse}${CLRF}${contentLengthHeader}: ${lengthResponse}${CLRF}${CLRF}${serverResponse}`,
    );
    console.log(
      `HTTP/1.1 ${statusCode} ${message}${CLRF}${contentTypeHeader}: ${typeResponse}${CLRF}${contentLengthHeader}: ${lengthResponse}${CLRF}${CLRF}${serverResponse}`,
    );
  }
};
const fileExistsChecker = async (url: string) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    console.log("are you still awaiting? were done");
    return response.ok;
  } catch (error) {
    console.error(`Error:`, error);
    return false;
  }
};

const urlCreator = (path: string) => {
  const toPrepend = "http://localhost:4221";
  return toPrepend + path;
};

console.log("Logs from your program will appear here!");

server.listen(4221, "localhost", () => {
  console.log("Server is running on port 4221");
});
