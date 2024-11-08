// import pg from "pg";
import express from "express";
// const { Client } = pg;
import fs from "fs";
// import { AudioRoute } from "./routes/index.js";
import { AudioRoute } from "./routes/AudioRoute.js";
import bodyParser from "body-parser";
const app = express();
// app.use(express.json());

app.use(bodyParser.json({ limit: "35mb" }));

app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "35mb",
    parameterLimit: 50000,
  }),
);

app.use("/test", AudioRoute);
// const client = new Client({
//   host: "localhost", // PostgreSQL server address
//   port: 5432, // PostgreSQL default port
//   user: "myuser", // Your PostgreSQL username
//   password: "mypassword", // Your PostgreSQL password
//   database: "mydatabase", // Database name
// });
// await client.connect();

// const createTableQuery = `
//   CREATE TABLE users (
//     id SERIAL PRIMARY KEY,
//     name VARCHAR(100),
//     email VARCHAR(100) UNIQUE,
//     age INT,
//     created_at TIMESTAMPTZ DEFAULT NOW()
//   );
// `;

// const insertRowQuery = `
//   INSERT INTO users (name, email, age)
//   VALUES ($1, $2, $3)
//   RETURNING id;
// `;
//
// const values = ["John Doe", "john.doe@example.com", 30];
//
// const res = await client.query(insertRowQuery, values);
// console.log(res);

// const rest = await client.query(createTableQuery);
// console.log(rest);

// const anotherres = await client.query("SELECT * FROM users");
//
// await client.end();
// console.log(anotherres);
//

// import {
// S3Client,
// CreateBucketCommand,
// PutObjectCommand,
// GetObjectCommand,
// } from "@aws-sdk/client-s3Client";
// import { v4 as uuid } from "uuid";
// import { Readable } from "stream";

import {
  S3Client,
  // CreateBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { Blob } from "buffer";
import { configDotenv } from "dotenv";
// const dotenv = require("dotenv");

configDotenv();

// const s3ClientEndpoint = process.env.S3_CLIENT_ENDPOINT;
const s3ClientEndpoint = process.env.S3_CLIENT_ENDPOINT || "";
const s3ClientRegion = process.env.S3_CLIENT_REGION || "";
const bucketAccessKey = process.env.BUCKET_ACCESS_KEY_ID || "";
const bucketAccessKeyIdSecret = process.env.BUCKET_SECRET_ACCESS_KEY || "";
const bucketName = process.env.BUCKET_NAME || "";
const port = process.env.PORT || 3000;
const filename = "pagaleconseguenze.wav";


// Create an S3 client
//
// You must copy the endpoint from your B2 bucket details
// and set the region to match.
const s3Client = new S3Client({
  endpoint: s3ClientEndpoint,
  region: s3ClientRegion,
  credentials: {
    accessKeyId: bucketAccessKey,
    secretAccessKey: bucketAccessKeyIdSecret,
  },
});

async function getFileFromB2Bucket(bucketName: string, fileName: string) {
  try {
    // Create a command to get the object
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    });

    // console.log(command);
    // Send the command to S3
    const data = await s3Client.send(command);

    // Convert the response stream to a readable stream
    // const fileContent = await streamToString(data.Body);

    // console.log("File retrieved successfully:");
    // console.log(data.Body);

    //  if not null!
    return data;
  } catch (error) {
    console.error("Error retrieving file:", error);
  }
}

app.get("/", (_req, res) => {
  res.send({ test: "test" });
});

app.get("/audio/list", async (req, res) => {
  const command = await new ListObjectsV2Command({
    Bucket: bucketName,
  });
  try {
    const response = await s3Client.send(command);
    res.json(response);
  } catch (error) {
    res.send("error");
    console.log("error");
  }
});

app.get("/audio/get", async (_req, res) => {
  const data = await getFileFromB2Bucket(bucketName, filename);
  // const { Body, ContentType } = data;
  if (data != null) {
    const { Body, ContentType } = data as any;
    res.set("Content-Type", ContentType);
    res.set("Content-Disposition", `attachment; filename="test.wav"`);
    // const fileStream = fs.createWriteStream("maam.pdf");
    if (Body) {
      // Body.pipe(fileStream);
      Body.pipe(res);
    }
  } else {
    console.log("BODY IS NULL");
  }
});

app.use(express.raw({ type: "application/octet-stream", limit: "10mb" })); // Adjust the `limit` as needed

app.use(express.raw({ type: "audio/wav", limit: "50mb" })); // Adjust the limit as needed

app.post("/audio/post", async (req, res) => {
  const fileBuffer = req.body;
  var bucketName = "Waking1653";
  const filename = `pagaleconseguenze${(Math.random() * 10).toFixed(0)}.wav`;

  try {
    const test = await putFileB2Bucket(bucketName, filename, fileBuffer);
    console.log(test);
    res.send("okay");
  } catch {
    res.send("error");
  }
});

async function putFileB2Bucket(
  bucketName: string,
  fileName: string,
  fileBuffer: Buffer,
) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: fileBuffer,
  });
  const data = await s3Client.send(command);
  return data;
}

app.listen(port, () => console.log(`server is listening on port ${port}`));

// Add audio
// get audio
// delete audio

function saveFile() {
  // const filePath = "./uploadedFile.wav";
  // fs.writeFile(filePath, blob, (err) => {
  //   if (err) {
  //     console.error("Error saving the blob:", err);
  //     res.status(500).send("Failed to save the blob");
  //     return;
  //   }
  //   console.log("Blob saved successfully to", filePath);
  //   res.send("Blob saved successfully!");
  // });
}
