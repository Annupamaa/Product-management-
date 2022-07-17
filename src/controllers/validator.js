
//=====================Common Validations============================//


//cheaks Request Body is Empty or Not
const isValidRequestBody = function (value) {
    return Object.keys(value).length > 0
  }


//it checks whether the string contain only space or not 
  const validString = function(value) {
    if (typeof value === 'string' && value.trim().length === 0) return false 
    return true;
}

//for product
const validInstallment = function (value) {
if (value <=0) return false
if (value % 1 == 0) return true;
}
const validInstallment1 = function (value) {
  if (value <0) return false
  if (value % 1 == 0) return true;
  }

const isValidIncludes=function(value,requestBody){
    return Object.keys(requestBody).includes(value)
} 


//validaton check for the type of Value --
const isValid = (value) => {
    if (typeof value == 'undefined' || value == null) return false;
    if (typeof value == 'string' && value.trim().length == 0) return false;
    if (typeof value === 'number'&&value.toString().trim().length===0) return false;
    return true
  }

  const validCity =(city)=>{
    if (!/^[a-zA-Z]+$/.test(city))  return false
    else return true
  }
  const validPincode =(pincode)=>{
    if (!/^\d{6}$/.test(pincode))  return false
    else return true
  }
const validEmail =(email)=>{
  if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})/.test(email))  return false
  else return true
}
const validPhone =(phone)=>{
  if (!/^(\+91)?0?[6-9]\d{9}$/.test(phone.trim())) return false
  else return true
}
const validName =(name)=>{
  if (!/^[A-Za-z\s]{1,}[\.]{0,1}[A-Za-z\s]{0,}$/.test(name)) return false
  else return true
}

 module.exports={isValid,validPhone,validName ,validEmail,validPincode,isValidIncludes,validInstallment,validInstallment1,validString,isValidRequestBody,validCity} 



  