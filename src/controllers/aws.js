const aws=require("aws-sdk")
const path = require("path")

aws.config.update({
  accessKeyId: "AKIAY3L35MCRUJ6WPO6J",
  secretAccessKey: "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",
  region: "ap-south-1",
});

let uploadFile = (file) => {
  return new Promise(function (resolve, reject) {
      // this function will upload file to aws and return the link
      let s3 = new aws.S3({ apiVersion: "2006-03-01" }); // we will be using the s3 service of aws

      var uploadParams = {
          ACL: "public-read",     //access control list
          Bucket: "classroom-training-bucket", //HERE
          Key: "pfile/" + file.originalname, //HERE
          Body: file.buffer,
      };

      s3.upload(uploadParams, function (err, data) {
          if (err) {
              return reject({ error: err.message });
          }
          if(![".png",".jpg",".txt"].includes(path.extname(file.originalname))){
            return reject({ status: false, message: "Invalid file type - accepted file type are - png, jpg, doc, pdf" })
          }
        
          console.log(data)
          console.log("file uploaded succesfully");
          return resolve(data.Location); //link generated
      });

  });
};


module.exports={uploadFile}