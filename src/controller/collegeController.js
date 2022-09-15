const collegeModel = require("../model/collegeModel");
const internModel = require("../model/internModel");

const axios = require("axios");


// Validataion for empty request body
const isValid = function (value) {
  if (Object.keys(value).length === 0) return false;
  else return true;
};


// Validation for Empty strings from req
const isValidValue = function (value) {
  if (typeof value !== "string") return false;
  else if (value.trim().length == 0) return false;
  else return true;
};

const createCollege = async function (req, res) {
  try {
    let data = req.body;
    if (!isValid(data)) return res.status(400).send({ status: false, message: "Please Wrire required data to create College" });

    const { name, fullName, logoLink } = data;

    if (!name) return res.status(400).send({ status: false, message: "Name is required" });

    function whitespace(name) {
      return name.indexOf(" ") >= 0
    }

    if (whitespace(name)) {
      return res.status(400).send( "Make sure college name should not have space." )
    }
      

    if (!isValidValue(name) || (!name.match(/^[ ]*[a-zA-Z][a-zA-Z\s]{0,35}[a-zA-Z][ ]*$/)))
      return res.status(400).send({ status: false, message: "Name should be in letters" });


    if (!fullName) return res.status(400).send({ status: false, message: "Full Name is required" });

    if (!isValidValue(fullName) || (!fullName.match(/^[ ]*[a-zA-Z][a-zA-Z\s]{0,35}[a-zA-Z][ ]*$/)))
        return res.status(400).send({ status: false, message: "Full Name should be in letters" });


    if (!logoLink)
      return res.status(400).send({ status: false, message: "Logo link is required" });

    if (!isValidValue(logoLink))
      return res.status(400).send({ status: false, message: "Logo link is in wrong format" });


    //for check logo link we use axios

    function isURL(logoLink) {
      var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
      return pattern.test(str);
    }




    let check = false;
    await axios.get(logoLink).then((response) => {

      if (response.status == 200 || response.status == 201) {
        if (response.headers["content-type"].startsWith("image/")) check = true;

      }
    })
      .catch((error) => { });
    if (check == false) return res.status(400).send({ status: false, message: "Please give valid logo link" });

    let checkName = await collegeModel.findOne({ name: name });
    if (checkName) return res.status(400).send({ status: false, message: "College Name is already exist" });

    let college = await collegeModel.create(data);
    return res.status(201).send({ status: true, data: college });

  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};


const getCollegeDetails = async function (req, res) {
  try {
    const collegeName = req.query.collegeName;

    if (!isValidValue(collegeName))
      return res.status(400).send({ status: false, message: "collegeName is required" });

    const college = await collegeModel.findOne({ name: collegeName, isDeleted: false, });

    if (!college) return res.status(400).send({ status: false, message: "No college found" });



    // Copying name, fullName & logoLink from college to a new object collegeDetails
    const collegeDetails = {
      Name: college.name,
      FullName: college.fullName,
      LogoLink: college.logoLink,
    };


    // Extracting _id from college & using it to get interns
    const getCollegeId = college._id;
    
    const internData = await internModel.find({ collegeId: getCollegeId, isDeleted: false })
      .select({ name:1,email:1,mobile:1 });

    if (internData.length == 0)
      return res.status(400).send({ status: false, message: "No interns for this college" });
    const data = { collegeDetails, interns: internData };


    return res.status(200).send({ status: true, data: data });

  } catch (error) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { createCollege, getCollegeDetails, isValid, isValidValue };




