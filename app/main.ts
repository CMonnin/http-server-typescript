import * as net from "net";

const CLRF = "\r\n";

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    // processing the incoming data
    let dataAsString = data.toString().split(CLRF);
    // Request line
    //GET
    ///user-agent
    //HTTP/1.1
    //\r\n
    let [method, path, protocol] = dataAsString[0].split(" ");
    // Headers
    //Host: localhost:4221\r\n
    //User-Agent: foobar/1.2.3\r\n  // Read this value
    //Accept: */*\r\n
    //\r\n
    let userAgentResponse = "";
    for (const line of dataAsString.slice(1)) {
      let [header, info] = line.split(": ");
      if (header === "User-Agent") {
        userAgentResponse = info;
      }
    }

    // path parsing
    let [root, echo, aString] = path.split("/");

    let statusCode = 404;
    let message = "Not Found";
    const contentTypeHeader = "Content-Type";
    const contentLengthHeader = "Content-Length";
    const typeResponse = "text/plain";
    let lengthResponse = 0;
    let fullReponse = false;

    if (path.includes("/user-agent")) {
    }
    statusCode = 200;
    message = "OK";
    fullReponse = true;

    if (echo) {
    }
    statusCode = 200;
    message = "OK";
    lengthResponse = aString.length;
    fullReponse = true;

    // checking it's a good start to the address
    writeSocket(
      socket,
      statusCode,
      message,
      contentTypeHeader,
      contentLengthHeader,
      typeResponse,
      lengthResponse,
      aString,
      userAgentResponse,
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
  aString: string,
  userAgentResponse: string,
  fullReponse: boolean,
) => {
  if (fullReponse) {
    {
      socket.write(
        `HTTP/1.1 ${statusCode} ${message}${CLRF}${contentTypeHeader}: ${typeResponse}${CLRF}${contentLengthHeader}: ${lengthResponse}${CLRF}${CLRF}${userAgentResponse}`,
      );
      console.log(
        `HTTP/1.1 ${statusCode} ${message}${CLRF}${contentTypeHeader}: ${typeResponse}${CLRF}${contentLengthHeader}: ${lengthResponse}${CLRF}${CLRF}${userAgentResponse}`,
      );
    }
  } else {
    socket.write(
      `HTTP/1.1 ${statusCode} ${message}${CLRF}${contentTypeHeader}: ${typeResponse}${CLRF}${contentLengthHeader}: ${lengthResponse}${CLRF}${CLRF}${userAgentResponse}`,
    );
    console.log(
      `HTTP/1.1 ${statusCode} ${message}${CLRF}${contentTypeHeader}: ${typeResponse}${CLRF}${contentLengthHeader}: ${lengthResponse}${CLRF}${CLRF}${userAgentResponse}`,
    );
  }
};
// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
server.listen(4221, "localhost", () => {
  console.log("Server is running on port 4221");
});
