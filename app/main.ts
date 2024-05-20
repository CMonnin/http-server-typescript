import * as net from "net";

const CLRF = "\r\n";

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    // processing the incoming data
    let dataAsString = data.toString().split(CLRF);
    let [method, path, protocol] = dataAsString[0].split(" ");
    let [root, echo, aString] = path.split("/");

    let statusCode;
    let message;
    const header1 = "Content-Type";
    const header2 = "Content-Length";
    const response1 = "text/plain";
    let response2 = 0;
    let rootCheck = false;
    let fullReponse = true;

    // early retun if not string to send back
    if (!aString) {
      console.log("no string passed");
      socket.end();
    }
    // checking it's a good start to the address
    if (root === "") {
      rootCheck = true;
    }
    if (path === "/") {
      statusCode = 200;
      message = "OK";
    } else if (rootCheck && echo && aString) {
      statusCode = 200;
      message = "OK";
      response2 = aString.length;
    } else {
      statusCode = 404;
      message = "Not Found";
      fullReponse = false;
    }

    writeSocket(
      socket,
      statusCode,
      message,
      header1,
      header2,
      response1,
      response2,
      aString,
    );
    socket.end();
  });
});

// Status line
//HTTP/1.1 200 OK
//\r\n                          // CRLF that marks the end of the status line

// Headers
//Content-Type: text/plain\r\n  // Header that specifies the format of the response body
//Content-Length: 3\r\n         // Header that specifies the size of the response body, in bytes
//\r\n                          // CRLF that marks the end of the headers

// Response body
//abc

const writeSocket = (
  socket: net.Socket,
  statusCode: number,
  message: string,
  header1: string,
  header2: string,
  response1: string,
  response2: number,
  aString: string,
) => {
  {
    socket.write(
      `HTTP/1.1 ${statusCode} ${message}${CLRF}${header1}: ${response1}${CLRF}${header2}: ${response2}${CLRF}${CLRF}${aString}`,
    );
    console.log(
      `HTTP/1.1 ${statusCode} ${message}${CLRF}${header1}: ${response1}${CLRF}${header2}: ${response2}${CLRF}${CLRF}${aString}`,
    );
  }
};
// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
server.listen(4221, "localhost", () => {
  console.log("Server is running on port 4221");
});
