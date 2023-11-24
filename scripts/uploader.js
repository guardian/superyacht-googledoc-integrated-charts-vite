import { createRequire } from "module";
import { fileTypeFromFile } from 'file-type';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { S3Client, AbortMultipartUploadCommand, PutObjectCommand } from "@aws-sdk/client-s3";
//https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_s3_code_examples.html

const require = createRequire(import.meta.url);
const path = require('path');
const mime = require('mime-types')
const timer = ms => new Promise(res => setTimeout(res, ms)) 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const origin = path.join(__dirname, "..", "dist")

const blacklist = [".DS_Store"]

const bucketName = "gdn-cdn";

const filePaths = [];


(async ()=>{

  let filepaths = await getFilePaths(origin)

  for await (const filepath of filepaths) {

    let extension = checkFile(filepath)

    let mimeType = mime.lookup(extension)

    let filename = filepath.split("/").pop()

    let prefix = filename.substring(0, filename.indexOf("."));

    uploadToS3("embed/superyacht/audio-testing", filepath, mimeType)

  }
  
})()


async function uploadToS3(dir, filepath, mimeType) {

  const client = new S3Client({});

  let key = `${dir}${filepath.split(`dist/`)[1]}`

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fs.readFileSync(filepath),
    ContentType: `${mimeType}`,
    ACL:'public-read',
    CacheControl: "max-age=30"
  });

  try {
    const response = await client.send(command);
    //console.log(response);
    console.log(`https://interactive.guim.co.uk/${key}`);
  } catch (err) {
    console.error(err);
  }

};

async function getFilePaths(dir) {

  await fs.readdirSync(dir).forEach(function (name) {
    const filePath = path.join(dir, name);
    
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      if (!contains(blacklist, name)) {
        //console.log()
        filePaths.push(filePath);
      }
    } else if (stat.isDirectory()) {
      getFilePaths(filePath);
    }
  })

  return filePaths

};

function contains(a, b) {
    // array matches
    if (Array.isArray(b)) {
        return b.some(x => a.indexOf(x) > -1);
    }
    // string match
    return a.indexOf(b) > -1;
}

function checkFile(file) {
  var extension = file.substr((file.lastIndexOf('.') +1));
  return extension
}
