const userModel = require("../models/userModel")
const ObjectId = require("mongoose").Types.ObjectId
const aws = require("aws-sdk")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { AutoScaling } = require("aws-sdk")
const { uploadFile } = require("./aws")
let {isValid,isValidIncludes,validName,validPhone,validEmail,isValidRequestBody, validCity, validPincode}=require("./validator")



//================================Create User API=============================//
const createUser = async (req, res) => {

    try {
        let data = req.body
        let file = req.files

        //=======Request Body data validation===>

        if (!isValidRequestBody(data) && (file == undefined || file.length == 0)) {
            res.status(400).send({ status: false, message: "invalid request parameters.plzz provide user details" })
            return
        }

        //==========destructuring=======/

        let { fname, lname, email, password, phone, address } = data
        console.log(address)


        //===============Validate attributes===============//
        if (!isValid(fname)) {
            res.status(400).send({ status: false, message: " first name is required" })
            return
        }

        if (!!validName(fname)) {
            return res.status(400).send({ status: false, message: "Please enter valid user first name." })
        }


        // name validation===>
        if (!isValid(lname)) {
            res.status(400).send({ status: false, message: "last name is required" })
            return
        }


        //this will validate the type of name including alphabets and its property with the help of regex.
        if (!validName(lname)) {
            return res.status(400).send({ status: false, message: "Please enter valid user last name." })
        }


        //Email Validation===>
        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "plzz enter email" })
        }


        //email regex validation for validate the type of email.
        email = email.toLowerCase().trim()
   

        if (!validEmail(email)) {
            return res.status(400).send({ status: false, message: "This is not a valid email" })
        }


        //searching Email in DB to maintain their uniqueness.
        const emailExt = await userModel.findOne({ email: email })
        if (emailExt) {
            return res.status(400).send({ status: false, message: "Email already exists" })
        }


        //Password Validations===>
        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "plzz enter password" })
        }

        // cheack password length between 8 to 15
        password = password.trim()
        if (password.length < 8 || password.length > 15) {
            return res.status(400).send({ status: false, message: "password length should between 8 to 15" })
        }     
        
        data.password = await bcrypt.hash(password, 10)
        console.log(data.password)



        //Phone Validations===>
        if (!isValid(phone)) {
            return res.status(400).send({ status: false, message: "plzz enter mobile" })
        }

        //this regex will to set the phone no. length to 10 numeric digits only.
        if (!validPhone(phone)) {
            return res.status(400).send({ status: false, message: "Please enter valid 10 digit mobile number." })
        }


          //searching Phone in DB to maintain their uniqueness.
        const phoneExt = await userModel.findOne({ phone: phone })
        if (phoneExt) {
            return res.status(400).send({ status: false, message: "phone number already exists" })
        }

        //for address validation===>
      let arr1=["shipping","billing"]
      let arr2=["street","city","pincode"]
      for(let i=0;i<arr1.length;i++){
        if(!address[arr1[i]]){
            return res.status(400).send({status: false,message:` ${arr1[i]} must present`})
        }

        for(let j=0;j<arr2.length;j++){
            if(!address[arr1[i]][arr2[j]])
            return res.status(400).send({status:false,message:`please provide ${arr1[i]} ${arr2[j]}`})

        }

        if(!validCity(address[arr1[i]].city)){
            return res.status(400).send({status:false,message:` ${[arr1[i]]} city is not valid`})
        }
        if(!validPincode(address[arr1[i]].pincode)){
            return res.status(400).send({status:false,message:` ${[arr1[i]]} pincode is not valid`})
        }
      }
        
        //saving aws link of ProfileImage
      console.log(file)
        if (file && file.length > 0) {
            
            let uploadedFileURL = await uploadFile(file[0])
            
            data["profileImage"] = uploadedFileURL
        }
        else {
            return res.status(400).send({ status: false, message: "No file found" })
        }
       

        ///Creating User Data====>

        let saveData = await userModel.create(data)
        return res.status(201).send({ status: true, message: "success", data: saveData })

    }

    catch (error) {
        return res.status(500).send({ status: "error", message: error.message })
    }



}



//==================================Login ApI=====================================//


const loginUser = async function (req, res) {
    try {
        const requestBody = req.body;

        //cheacking Empty request Body 
        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, msg: "please provide data to signIn" });
        }

        //Destructuring
        let { email, password } = requestBody;


        // //Email Validation===>
        if (!isValid(email)) {
            return res.status(400).send({ status: false, msg: "please provide email" });
        }

        //email regex validation for validate the type of email.
        email = email.toLowerCase().trim()
        if (!validEmail(email)) {
            return res.status(400).send({ status: false, message: "This is not a valid email" })
        }


        //Password Validations===>
        if (!isValid(password)) {
            return res.status(400).send({ status: false, msg: "please provide password" });
        }
        
        password = password.trim()
        if (password.length < 8 || password.length > 15) {
            return res.status(400).send({ status: false, message: "plzz enter valid password" })
        }


            //searching Email in DB 
        const emailCheck = await userModel.findOne({ email: email })
        if (!emailCheck) {
            return res.status(404).send({ status: false, message: "Email not found" })
        }

        //matching of encrypted Password
        const dbPassword = emailCheck.password
        
        const passwordMathched = await bcrypt.compare(password, dbPassword)
        console.log(passwordMathched)
        if (!passwordMathched) {
            return res.status(401).send({ status: false, message: "Please provide valid credentils" })
        }

        //Ganeration of JWT Token

        const userId = emailCheck._id;
        
        console.log(`welcome ${emailCheck.fname}   ${emailCheck.lname}`)
        const data = { email, password };
        if (data) {
            const token = jwt.sign(
                {
                    userId: userId

                },
                "project5", { expiresIn: "24hr" }
            );
            res.status(200).send({ status: true, message: `welcome ${emailCheck.fname}   ${emailCheck.lname}`, data: { userId: userId, token: token } });
        }
    } catch (err) {
        res.status(500).send({ status: false, data: err.message });
    }
};





//===========================================GET User DATA API=====================================================//

const getUser = async function (req, res) {
    try {

        //taking UserID from Params
        let pathParams = req.params.userId

        //cheacking for UserID Is valid ObjectID
        if (!ObjectId.isValid(pathParams)) {
            return res.status(400).send({ status: false, message: "Please enter valid userId" })
        }

        //Authrization
        let userToken = req.userId
        
        if (!ObjectId.isValid(userToken)) {
            return res.status(400).send({ status: false, message: "Please enter valid userId" })
        }

        let user = await userModel.findOne({ _id: pathParams })
        if (!user) {
            return res.status(404).send({ status: false, message: "No user found" })
        }

        if (userToken !== pathParams) {
            return res.status(403).send({ status: false, message: "Unauthorized user" })
        }

       
        return res.status(200).send({ status: true, message: "User profile details", data: user })


    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}




//========================================PUT API-Update User Data===================================================//
const updateUser = async function (req, res) {
    try {

        //Ganeration of encrypted Password
        let pathParams = req.params.userId

        //cheack for UserID Is valid ObjectID
        if (!ObjectId.isValid(pathParams)) {
            return res.status(400).send({ status: false, message: "user id is not valid" })
        }

        //Authrization
        let authorToken = req.userId
        
        if (!ObjectId.isValid(authorToken)) {
            return res.status(400).send({ status: false, message: "Please enter valid userId" })
        }

        let user = await userModel.findOne({ _id: pathParams })
        if (!user) {
            return res.status(404).send({ status: false, message: "No user found" })
        }

        if (authorToken !== pathParams) {
            return res.status(403).send({ status: false, message: "Unauthorized user" })
        }

        //fetching data from Request Body
        let data = req.body
        let file = req.files

        if (file && file.length > 0) {
            let uploadedFileURL = await uploadFile(file[0])
            data["profileImage"] = uploadedFileURL
        }


        if (!isValidRequestBody(data) && (file == undefined || file.length == 0)) {
            return res.status(400).send({ status: false, message: "plz enter valid data for updation" })

        }

        //Destructuring
        let { email, phone, lname, fname, password, address } = data
        console.log(address)


        //Email Validtion
        if (isValidIncludes("email", data)) {
            if (!isValid(email)) {
                return res.status(400).send({ status: false, message: "plzz enter email" })
            }

            //email regex validation for validate the type of email.
            email = email.toLowerCase().trim()
            if (!validEmail(email)) {
                return res.status(400).send({ status: false, message: "This is not a valid email" })
            }


            const emailExt = await userModel.findOne({ email: email })
            if (emailExt) {
                return res.status(400).send({ status: false, message: "Email already exists" })
            }
            data.email = email

        }

        //Phone Validation

        if (isValidIncludes("phone", data)) {
            if (!isValid(phone)) {
                return res.status(400).send({ status: false, message: "plzz enter mobile" })
            }


            //this regex will to set the phone no. length to 10 numeric digits only.
            if (!validPhone(phone)) {
                return res.status(400).send({ status: false, message: "Please enter valid 10 digit mobile number." })
            }

            const phoneExt = await userModel.findOne({ phone: phone })
            if (phoneExt) {
                return res.status(400).send({ status: false, message: "phone number already exists" })
            }
            data.phone = phone

        }


        //Fname Vaidation
        if (isValidIncludes("fname", data)) {

            if (!isValid(fname)) {
                return res.status(400).send({ status: false, message: "Please enter valid fname" })
            }
            data.fname = fname

        }

        //Lname Validation
        if (isValidIncludes("lname", data)) {
            if (!isValid(lname)) {
                return res.status(400).send({ status: false, message: "Please enter valid lname" })

            }
            data.lname = lname
        }


        //password validation
        if (isValidIncludes("password", data)) {
            if (!isValid(password)) {
                return res.status(400).send({ status: false, message: "plzz enter password" })
            }


            //check password length between 8-15
            password = password.trim()
            if (password.length < 8 || password.length > 15) {
                return res.status(400).send({ status: false, message: "plzz enter valid password" })
            }


            //Password Encryption
            
            data.password = await bcrypt.hash(password, 10)
        }


        //address validation
         if(address){   
                //  if (isValidIncludes("address", data)) {
            
        //     if (!isValid(address)) {
        //         return res.status(400).send({ status: false, message: "plzz enter address" })
        //     }
         let {shipping,billing} =address
         console.log("address",address,"shipping",shipping)
                   
      
        data.address = {
            shipping: {
                street: data.address?.shipping?.street || user.address.shipping.street,
                city: data.address?.shipping?.city || user.address.shipping.city,
                pincode: data.address?.shipping?.pincode || user.address.shipping.pincode
            },
            billing: {
                street: data.address?.billing?.street || user.address.billing.street,
                city: data.address?.billing?.city || user.address.billing.city,
                pincode: data.address?.billing?.pincode || user.address.billing.pincode

            }

        }
    }


        //Upadate data and Save
        let updatedData = await userModel.findByIdAndUpdate({ _id: pathParams }, data, { new: true })
        return res.status(200).send({ status: true,message: 'Success', data: updatedData })


    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createUser, loginUser, getUser, updateUser }