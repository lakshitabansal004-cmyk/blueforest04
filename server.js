var express = require("express");
var app = express();

app.listen(2006, function () {
    console.log("1");
    console.log("server started");

})
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "lakshitabansal.004@gmail.com",
        pass: "jwnk rhlf yter oixz",
    }
});

app.get("/", function (req, resp) {
    var path = __dirname + "/public/index.html";
    resp.sendFile(path);

})
app.use(express.static("public"));

var fileuploader = require("express-fileupload");
app.use(fileuploader());
var cloudinary = require("cloudinary").v2;
var mysql = require("mysql2");
require('dotenv').config();
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API,
    api_secret: process.env.CLOUD_KEY

});

let url = process.env.AIVEN_URL;
let mysqlCon = mysql.createConnection(url);
mysqlCon.connect(function (err) {
    if (err == null)
        console.log("CONNECTED SUCCESSFULYYYYYYYYY");
    else
        console.log(err.message);
})

app.get("/signup-process", function (req, resp) {

    let email = req.query.emailKuch;
    let pwd = req.query.pwdKuch;
    let utype = req.query.utypeKuch;

    mysqlCon.query( "insert into userspro values(?,?,?,current_date,1)",[email, pwd, utype],function (err) {
if(err==null)
    resp.send("Signup Successfull");
else
    resp.send(err.message);
            /*if (err) {
                return resp.send(err.message);
            }

            // Send email only after successful signup
            let mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Welcome to Our Website",
                text: "Your account has been created successfully."
            };

            transporter.sendMail(mailOptions, function (error, info) {

                if (error) {
                    console.log("Email Error:", error);
                    return resp.send("Signup successful, but email could not be sent.");
                }

                console.log("Email sent:", info.response);
                resp.send("Signup successful. Welcome email sent!");
            });*/

        }
    );

});

app.get("/login-process", function (req, resp) {

    let emailid = req.query.emailKuch2;
    let password = req.query.pwdKuch2;
    console.log(emailid);
    mysqlCon.query("select * from userspro where emailid=? AND password=?", [emailid, password], function (err, result) {
        if (err == null) {
            if (result.length == 1) {
                if (result[0].stataus == 1)
                    resp.send(result[0].usertype);
                else
                    resp.send("Blocked");
            }

            else {
                resp.send("INVALID userid/pwd");
            }

        }

        else
            resp.send(err.message);
    })
})
app.get("/check-email-ajax", function (req, resp) {
    let emailid = req.query.emailKuch3;
    mysqlCon.query("select * from userspro where emailid=?", [emailid], function (err, resultJSONAry) {
        if (err == null) {
            if (resultJSONAry.length == 1)

                resp.send("Already occupied");
            else
                resp.send("Available");
        }

        else
            resp.send(err.message);
    })
})

app.get("/donor-profile", function (req, resp) {
    var path = __dirname + "/public/donor-profile.html";
    resp.sendFile(path);
})

app.get("/Avail-med", function (req, resp) {
    var path = __dirname + "/public/availmed.html";
    resp.sendFile(path);
})

app.use(express.urlencoded(true));

app.post("/update-record", async function (req, resp) {


    //File Uploading
    let fileName = "";
    let msg = "File Not uploaded";
    let acardpath = "NO-URL";
    if (req.files != null) {
        fileName = req.files.profilePic.name;
        let fullPath = __dirname + "/uploads/" + fileName;
        await req.files.profilePic.mv(fullPath);
        msg = "Uploaded Successfully";

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            acardpath = picUrlResult.url;
            console.log("************")
            console.log(acardpath);
        });
    }
    else {
        AadhaarPic = req.body.hdn;
    }

    //------FILE UPLOADING 2
    let picpath = "NO-URL";
    if (req.files != null) {
        fileName = req.files.profilePic.name;
        let fullPath = __dirname + "/uploads/" + fileName;
        await req.files.profilePic.mv(fullPath);
        msg = "Uploaded Successfully";

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            picpath = picUrlResult.url;
            console.log("************")
            console.log(picpath);
        });
    }
    else {
        profilePic = req.body.hdn2;
    }


    //====================================


    let emailid = req.body.txtEmail;
    let name = req.body.txtName;
    let mobile = req.body.mob;
    let address = req.body.txtaddress;
    let city = req.body.city;


    //resp.send(email + "<br>" + " Branch= " + branch + "<br>" + " Tech=" + tech.substring(0, tech.length - 1) + "<br>" + " State=" + state + "<br>" + " Cities Visited=" + citiesAry + "<br>" + "DOB: " + formattedDOB + "<br>" + fileName + "-" + msg + "</br>myurl on cloud=" + myUrl);

    // sending data to server mysql********

    mysqlCon.query("update dprofiles set name=?,mobile=?,address=?,city=?,acardpath=?,picpath=? where emailid=?", [name, mobile, address, city, AadhaarPic, profilePic, emailid], function (err) {
        if (err == null)
            resp.send("Record Updated successfully");
        else
            resp.send(err.message);
    })
})
app.post("/donor", async function (req, resp) {


    //File Uploading
    let fileName1 = "";
    let msg = "File Not uploaded";
    let acardpath = "NO-URL";
    if (req.files != null) {
        fileName1 = req.files.AadhaarPic.name;
        let fullPath = __dirname + "/uploads/" + fileName1;
        await req.files.AadhaarPic.mv(fullPath);
        msg = "Uploaded Successfully";

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            acardpath = picUrlResult.url;
            console.log("************")
            console.log(acardpath);
        });
    }
    else {
        fileName1 = "not chosen";
    }

    //------FILE UPLOADING 2
    let fileName2 = "";
    let picpath = "NO-URL";
    if (req.files != null) {
        fileName2 = req.files.profilePic.name;
        let fullPath = __dirname + "/uploads/" + fileName2;
        await req.files.profilePic.mv(fullPath);
        msg = "Uploaded Successfully";

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            picpath = picUrlResult.url;
            console.log("************")
            console.log(picpath);
        });
    }
    else {
        fileName2 = "not chosen";
    }


    //====================================


    let emailid = req.body.txtEmail;
    let name = req.body.txtName;
    let mobile = req.body.mob;
    let address = req.body.txtaddress;
    let city = req.body.city;


    //resp.send(email + "<br>" + " Branch= " + branch + "<br>" + " Tech=" + tech.substring(0, tech.length - 1) + "<br>" + " State=" + state + "<br>" + " Cities Visited=" + citiesAry + "<br>" + "DOB: " + formattedDOB + "<br>" + fileName + "-" + msg + "</br>myurl on cloud=" + myUrl);

    // sending data to server mysql********

    mysqlCon.query("insert into dprofiles values(?,?,?,?,?,?,?)", [emailid, name, mobile, address, city, acardpath, picpath], function (err) {
        if (err == null)
            resp.send("Record saved successfully");
        else
            resp.send(err.message);
    })
})
//------------------

app.get("/fetch-one", function (req, resp) {
    let emailid = req.query.emailKuch;
    console.log(emailid)
    mysqlCon.query("select * from dprofiles where emailid=?", [emailid], function (err, resultJSONAry) {
        if (err == null) {
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);
    })
})


app.post("/availmed", async function (req, resp) {

    //File Uploading
    let fileName3 = "";
    let msg = "File Not uploaded";
    let picurl = "NO-URL";
    if (req.files != null) {
        fileName3 = req.files.picurl.name;
        let fullPath = __dirname + "/uploads/" + fileName3;
        await req.files.picurl.mv(fullPath);
        msg = "Uploaded Successfully";

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            picurl = picUrlResult.url;
            console.log("************")
            console.log(picurl);
        });
    }
    else {
        fileName3 = "not chosen";
    }

    //====================================

    let emailid = req.body.txtEmail2;
    let medname = req.body.txtmedName;
    let expdate = req.body.expdate;
    let company = req.body.company;
    let packing = req.body.Packing;
    let qty = req.body.Qty;
    let info = req.body.info;


    //resp.send(email + "<br>" + " Branch= " + branch + "<br>" + " Tech=" + tech.substring(0, tech.length - 1) + "<br>" + " State=" + state + "<br>" + " Cities Visited=" + citiesAry + "<br>" + "DOB: " + formattedDOB + "<br>" + fileName + "-" + msg + "</br>myurl on cloud=" + myUrl);

    // sending data to server mysql********

    mysqlCon.query("insert into medicines values(?,?,?,?,?,?,?,?,?)", [null, emailid, medname, expdate, company, packing, qty, info, picurl], function (err) {
        if (err == null)
            resp.send("Record saved successfully");
        else
            resp.send(err.message);
    })
})

app.get("/Avail-eqp", function (req, resp) {
    var path = __dirname + "/public/availequip.html";
    resp.sendFile(path);
})


app.post("/availeqp", async function (req, resp) {


    //File Uploading
    let fileName1 = "";
    let msg = "File Not uploaded";
    let pic1url = "NO-URL";
    if (req.files != null) {
        fileName1 = req.files.pic1url.name;
        let fullPath = __dirname + "/uploads/" + fileName1;
        await req.files.pic1url.mv(fullPath);
        msg = "Uploaded Successfully";

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            pic1url = picUrlResult.url;
            console.log("************")
            console.log(pic1url);
        });
    }
    else {
        fileName1 = "not chosen";
    }

    console.log("helo");
    //------FILE UPLOADING 2
    let fileName2 = "";
    let pic2url = "NO-URL";
    if (req.files != null) {
        fileName2 = req.files.pic2url.name;
        let fullPath = __dirname + "/uploads/" + fileName2;
        await req.files.pic2url.mv(fullPath);
        msg = "Uploaded Successfully";

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            pic2url = picUrlResult.url;
            console.log("************")
            console.log(pic2url);
        });
    }
    else {
        fileName2 = "not chosen";
    }

    console.log("2nd" + pic2url)
    //====================================


    let emailid = req.body.txtEmail;
    let equipment = req.body.medeqp;
    let conditionn = req.body.condition;
    let typee = req.body.type;
    let amount = req.body.amount;
    if (req.body.type == "Donation") 
        {
        amount = 0;
    }
    let info = req.body.info;

    //resp.send(email + "<br>" + " Branch= " + branch + "<br>" + " Tech=" + tech.substring(0, tech.length - 1) + "<br>" + " State=" + state + "<br>" + " Cities Visited=" + citiesAry + "<br>" + "DOB: " + formattedDOB + "<br>" + fileName + "-" + msg + "</br>myurl on cloud=" + myUrl);

    // sending data to server mysql********

    mysqlCon.query("insert into equipments values(?,?,?,?,?,?,?,?,?)", [null, emailid, equipment, conditionn, typee, amount, pic1url, pic2url, info], function (err) {
        if (err == null)
            resp.send("Record saved successfully");
        else
            resp.send(err.message);
    })
})

app.get("/Admin-users", function (req, resp) {
    var path = __dirname + "/public/admin-users-dash.html";
    resp.sendFile(path);
})

app.get("/Admin-donors", function (req, resp) {
    var path = __dirname + "/public/admin-donors-dash.html";
    resp.sendFile(path);
})

app.get("/fetch-all-donors", function (req, resp) {

    //? is called in Parameter
    mysqlCon.query("select * from dprofiles ", function (err, resultJSONAry) {
        if (err == null) {
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);
    })
})

app.get("/fetch-all-users", function (req, resp) {

    //? is called in Parameter
    mysqlCon.query("select * from userspro ", function (err, resultJSONAry) {
        if (err == null) {
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);
    })
})

app.get("/block-user", function (req, resp) {
    let email = req.query.emailkeykuch;

    mysqlCon.query("update userspro set stataus=0 where emailid=?", [email], function (err) {
        if (err == null)
            resp.send("User blocked");
        else
            resp.send(err.message);
    })
})

app.get("/resume-user", function (req, resp) {
    let email = req.query.emailkeykuch;
    mysqlCon.query("update userspro set stataus=1 where emailid=?", [email], function (err) {
        if (err == null)
            resp.send("User Unblocked");
        else
            resp.send(err.message);

    })
})

app.get("/donor-dashboard", function (req, resp) {
    var path = __dirname + "/public/dash-donor.html";
    resp.sendFile(path);
})

app.get("/needy-dashboard",function(req,resp){
    var path=__dirname+"/public/dash-needy.html";
    resp.sendFile(path);
})

app.get("/ngo-dashboard", function (req, resp) {
    var path = __dirname + "/public/dash-ngo.html";
    resp.sendFile(path);
})

app.get("/fetch-all-med-manager", function (req, resp) {

    let email = req.query.emailkeykuch;                                   //? is called in Parameter
    mysqlCon.query("select * from medicines where emailid=? ", [email], function (err, resultJSONAry) {
        if (err == null) {
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);
    })
})

app.get("/fetch-all-eqp-manager", function (req, resp) {

    let email = req.query.emailkeykuch;                                   //? is called in Parameter
    mysqlCon.query("select * from equipments where emailid=? ", [email], function (err, resultJSONAry) {
        if (err == null) {
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);
    })
})

app.get("/do-delete-med", function (req, resp) {
    let rid = req.query.ridkeykuch;
    mysqlCon.query("delete from medicines where rid=?", [rid], function (err, result) {
        if (err == null) {
            if (result.affectedRows == 1) // matlab mysql wale table ch agar eh id hai ta
                resp.send("RECORD DELETED SUCCESSFULLY");

            else
                resp.send("INVALID EMAILID");
        }
        else
            resp.send(err.message);
    })
})

app.get("/update-password", function (req, resp) {
    let pwd = req.query.passkeyKuch2;
    let pass = req.query.passkeykuch;
    let email2 = req.query.emailkeyKuch2;
    console.log("Password:", pass);
    console.log("Email:", email2);
    console.log(pwd);

    mysqlCon.query("update userspro set password=? where emailid=? AND password=?", [pass, email2, pwd], function (result, err) {
        if (err == null) {
            if (result.affectedRows == 1)
                resp.send("Password Updated Successfully");
            else
                resp.send(err.message);
        }


        else
            resp.send("Incorrect Password")
    })
})

app.get("/admin-dashboard", function (req, resp) {
    var path = __dirname + "/public/dash-admin.html";
    resp.sendFile(path);
})



app.get("/fetch-all-med-details", function (req, resp) {

    //? is called in Parameter
    mysqlCon.query("select * from medicines ", function (err, resultJSONAry) {
        if (err == null) {
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);
    })
})

app.get("/medFinder-name", function (req, resp) {
    var path = __dirname + "/public/medFinder.html";
    resp.sendFile(path);
})

app.get("/fetch-distinct-city", function (req, resp) {
    mysqlCon.query("select distinct city from dprofiles", function (err, resultJSONAry) {
        if (err == null) {
            console.log(resultJSONAry)
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);
    })
})

app.get("/fetch-med", function (req, resp) {
    let city = req.query.city;
    mysqlCon.query("select distinct medicines.medname from medicines m inner join dprofiles d on m.emailid=d.emailid where d.city=?", [city], function (err, resultJSONAry) {
        if (err == null) {
            console.log(resultJSONAry)
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);
    })
})

app.get("/show_med_full", function (req, resp) {
    let city = req.query.city;
    let medname = req.query.medname;
    mysqlCon.query("select * from  medicines m inner join dprofiles d on m.emailid=d.emailid where d.city=? and m.medname=?", [city, medname], function (err, resultJSONAry) {
        if (err == null) {
            console.log(resultJSONAry)
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);
    })
})

app.get("/eqp-finder", function (req, resp) {
    var path = __dirname + "/public/equip-finder.html";
    resp.sendFile(path);

})

app.get("/fetch-distinct-city", function (req, resp) {
    mysqlCon.query("select distinct city from dprofiles", function (err, resultJSONAry) {
        if (err == null) {
            console.log(resultJSONAry)
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);
    })
})

app.get("/show_eqp_full", function (req, resp) {
    let city = req.query.city;
    let typee = req.query.type;
    mysqlCon.query("select * from  equipments m inner join dprofiles d on m.emailid=d.emailid where d.city=? and m.typee=?", [city, typee], function (err, resultJSONAry) {
        if (err == null) {
            console.log(resultJSONAry)
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);
    })
})

app.get("/ngo-registration", function (req, resp) {
    var path = __dirname + "/public/NGO-REGISTRATION.html";
    resp.sendFile(path);
})

app.post("/ngo-registration", async function (req, resp) {

    let fileName1 = "";
    let msg = "File Not uploaded";
    let picurl = "NO-URL";
    if (req.files != null) {
        fileName1 = req.files.proofpic.name;
        let fullPath = __dirname + "/uploads/" + fileName1;
        await req.files.proofpic.mv(fullPath);
        msg = "Uploaded Successfully";

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            picurl = picUrlResult.url;
            //console.log("************")
            console.log(picurl);
        });
    }
    else {
        fileName1 = "not chosen";
    }

    let emailid = req.body.txtEmail;
    let ngo = req.body.txtNGOName;
    let regoffice = req.body.txtregoffice;
    let city = req.body.city;
    let website = req.body.web;
    let contactno = req.body.mob;
    let since = req.body.since;
    let chairperson = req.body.chairperson;
    let ngoworks = req.body.prof;
    let regnumber = req.body.regnumber;

    mysqlCon.query("insert into ngos values(?,?,?,?,?,?,?,?,?,?,?)", [emailid, ngo, regoffice, city, website, contactno, since, chairperson, ngoworks, regnumber, picurl], function (err) {
        if (err == null)
            resp.send(" Record saved successfully");
        else
            resp.send(err.message);
    })
})

app.get("/ngo-finder", function (req, resp) {
    var path = __dirname + "/public/NGO-FINDER.html";
    resp.sendFile(path);
})

app.get("/find-all-ngos", function (req, resp) {

    let city = req.query.ngoscity;                                   //? is called in Parameter
    mysqlCon.query("select * from ngos where city=? ", [city], function (err, resultJSONAry) {
        if (err == null) {
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);
    })
})
app.get("/needy-profile", function (req, resp) {
    var path = __dirname + "/public/needy-profile.html";
    resp.sendFile(path);
})

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

app.get("/genai", function (req, resp) {
    var path = __dirname + "/public/Ai.html";
    resp.sendFile(path);
})


async function CallGemini(imgurl) {
    const myprompt = "Read the text on picture and tell all the information in adhaar card and give output STRICTLY in JSON format {adhaar_number:'', name:'', gender:'', dob: ''}. Dont give output as string and also give me date as YYYY/MM/DD."
    const imageResp = await fetch(imgurl)
        .then((response) => response.arrayBuffer());

    const result = await model.generateContent([
        {
            inlineData: {
                data: Buffer.from(imageResp).toString("base64"),
                mimeType: "image/jpeg",
            },
        },
        myprompt,
    ]);
    console.log(result.response.text())

    const cleaned = result.response.text().replace(/```json|```/g, '').trim();
    const jsonData = JSON.parse(cleaned);
    console.log(jsonData);

    return jsonData

}

async function CallGemini2(imgurl) {
    const myprompt = "Read the text on picture and tell all the information in adhaar card and give output STRICTLY in JSON format {address: ''}. Dont give output as string."
    const imageResp = await fetch(imgurl)
        .then((response) => response.arrayBuffer());

    const result = await model.generateContent([
        {
            inlineData: {
                data: Buffer.from(imageResp).toString("base64"),
                mimeType: "image/jpeg",
            },
        },
        myprompt,
    ]);
    console.log(result.response.text())

    const cleaned = result.response.text().replace(/```json|```/g, '').trim();
    const jsonData = JSON.parse(cleaned);
    console.log(jsonData);

    return jsonData

}

app.post("/neddy-prof", async function (req, resp) {
    //File Uploading
    let jsonResultFromAi;
    let fileName1 = "";
    let msg = "File Not uploaded";
    let pic1url = "NO-URL";
    if (req.files != null) {
        fileName1 = req.files.pic1url.name;
        let fullPath = __dirname + "/uploads/" + fileName1;
        await req.files.pic1url.mv(fullPath);
        msg = "Uploaded Successfully";

        await cloudinary.uploader.upload(fullPath).then(async function (picUrlResult) {
            pic1url = picUrlResult.url;
            console.log("************")
            console.log(pic1url);
            jsonResultFromAi = await CallGemini(pic1url);
            console.log(jsonResultFromAi);
        });
    }
    else {
        fileName1 = "not chosen";
    }

    //------FILE UPLOADING 2
    let jsonResultFromAi2;
    let fileName2 = "";
    let pic2url = "NO-URL";
    if (req.files != null) {
        fileName2 = req.files.pic2url.name;
        let fullPath = __dirname + "/uploads/" + fileName2;
        await req.files.pic2url.mv(fullPath);
        msg = "Uploaded Successfully";

        await cloudinary.uploader.upload(fullPath).then(async function (picUrlResult) {
            pic2url = picUrlResult.url;
            console.log("************")
            console.log(pic2url);
            jsonResultFromAi2 = await CallGemini2(pic2url);
            console.log(jsonResultFromAi2);
        });
    }
    else {
        fileName2 = "not chosen";
    }

    let email = req.body.txtEmail;
    let mobile = req.body.num;
    let fronturl = pic1url;
    let rearurl = pic2url
    let nam = jsonResultFromAi.name;
    let ano = jsonResultFromAi.adhaar_number;
    let gen = jsonResultFromAi.gender;
    let dob = jsonResultFromAi.dob;
    let add = jsonResultFromAi2.address;

    mysqlCon.query("insert into needys values(?,?,?,?,?,?,?,?,?)", [email, mobile, fronturl, rearurl, nam, ano, gen, dob, add], function (err) {
        if (err == null)
            //resp.sendFile(__dirname + "/public/response.html");
            resp.send("Record Saved Successsfulllyyyy");
        else
            resp.send(err.message);
    })
})

app.get("/show-all-cities", function (req, resp) {
    let city = req.query.city;
    mysqlCon.query("select distinct city from ngos", function (err, resultJSONAry) {
        if (err == null) {
            console.log(resultJSONAry)
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);
    })
})


app.get("/show_ngos_full", function (req, resp) {
    let city = req.query.city;
    mysqlCon.query("select * from  ngos  where city=?", [city], function (err, resultJSONAry) {
        if (err == null) {
            console.log(resultJSONAry)
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);
    })
})
