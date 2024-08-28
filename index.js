const fs = require("fs");
const http = require("http");
const url = require("url");

// FILES
// // Blocking, synchronous way
// const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
// const textOut = `This is what we know about avocado: ${textIn}. \nCreated on ${Date.now()}`;
// fs.writeFileSync("./txt/output.txt", textOut);
// console.log("NEW FILE INSERTED");
// const text2Read = fs.readFileSync("./txt/output.txt", "utf-8");
// console.log(text2Read);

// non-blocking, asynchronous way
// fs.readFile("./txt/start.txt", "utf-8", function (err, data1) {
//   fs.readFile(`./txt/${data1}.txt`, "utf-8", function (err, data2) {
//     fs.readFile("./txt/append.txt", "utf-8", function (err, data3) {
//       console.log(data2);
//       console.log(data3);

//       fs.writeFile(
//         "./txt/final.txt",
//         `${data2}\n${data3}`,
//         "utf-8",
//         function (err) {
//           console.log("File written successfully");
//         }
//       );
//     });
//   });
// });

// SERVER
const replaceTemplate = function (template, product) {
  let output = template.replace(/{%PRODUCTNAME%}/g, product.productName);
  output = output.replace(/{%IMAGE%}/g, product.image);
  output = output.replace(/{%PRODUCTLOCATION%}/g, product.from);
  output = output.replace(/{%PRODUCTNUTRIENTSNAME%}/g, product.nutrients);
  output = output.replace(/{%QUANTITY%}/g, product.quantity);
  output = output.replace(/{%ID%}/g, product.id);
  output = output.replace(/{%PRICE%}/g, product.price);
  output = output.replace(/{%PRODUCTDESCRIPTION%}/g, product.desciption);

  if (!product.organic)
    output = output.replace(/{%NOT-ORGANIC%}/g, "not-organic");
  return output;
};

const tempOverview = fs.readFileSync(
  "./templates/template-overview.html",
  "utf-8"
);
const tempProduct = fs.readFileSync(
  "./templates/template-product.html",
  "utf-8"
);
const tempCard = fs.readFileSync("./templates/template-card.html", "utf-8");

const data = fs.readFileSync("./dev-data/data.json", "utf-8");
const dataObject = JSON.parse(data);

const server = http.createServer(function (request, response) {
  const { query, pathname } = url.parse(request.url, true);

  // OVERVIEW PAGE
  if (pathname === "/" || pathname === "/overview") {
    response.writeHead(200, {
      "Content-type": "text/html",
    });
    const cardHtml = dataObject
      .map(function (element) {
        return replaceTemplate(tempCard, element);
      })
      .join("");
    const output = tempOverview.replace("{%PRODUCT-CARD%}", cardHtml);
    response.end(output);

    // PRODUCT PAGE
  } else if (pathname === "/product") {
    response.writeHead(200, {
      "Content-type": "text/html",
    });
    const product = dataObject[query.id];
    const output = replaceTemplate(tempProduct, product);
    response.end(output);

    // API PAGE
  } else if (pathname === "/api") {
    response.writeHead(200, {
      "Content-type": "application/json",
    });
    response.end(data);

    // ERROR PAGE
  } else {
    response.writeHead(404, {
      "Content-type": "text/html",
    });
    response.end("<h1> Url not valid</h1>");
  }
});
server.listen(8000, "127.0.0.1", function () {
  console.log("Listening to Request on port 8000");
});
