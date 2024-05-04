const express = require("express");
const app=express();
const fs = require("fs");
const multer = require("multer");
const {createWorker} = require("tesseract.js");
const bp =require("body-parser");
const QRCode = require('qrcode');
const Jimp = require("jimp");
const qrCode = require('qrcode-reader');
const path = require("path");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

const worker = createWorker({
    logger: m => console.log(m)
  });

const PORT =  process.env.PORT || 5000 ;




const storage = multer.diskStorage({
    destination :'./public/uploads/',
    filename : function(req,file,cb){
        cb(null,file.originalname);
    }
});
// cb(null,file.fieldname + '-' + Date.now() + 
//         path.extname(file.originalname));


const uploads = multer({
    storage:storage  
}).single("avatar");





// const uploads = multer({storage:storage}).single("avatar");
app.set("view engine","ejs");

const Scnmed=[];
const Data=[];
let gtol;
const Cred=[];
const LabR=[];
const Bill=[];
let scnf ;
const patCode = "234r45k5";

app.get('/',(req,res)=>{
    res.render("login");
});

app.post('/login',(req,res)=>{
    Cred.length=0;
    const cred = req.body.name;
    console.log(cred);
    Cred.push(cred);
    res.render("dashboard",{LabR:LabR,Data:Data,Bill:Bill});
});

app.get('/doclogin',(req,res)=>{
    res.render("doclogin");
});

app.post('/doclogin',(req,res)=>{
    Cred.length=0;
    const Dcred = req.body.name;
    console.log(Dcred);
    Cred.push(Dcred);
    res.render("docdash",{LabR:LabR,Data:Data});
});



app.get('/dashboard',(req,res)=>{
    res.render("dashboard",{LabR:LabR,Data:Data,Bill:Bill});
});

app.get('/upd',(req,res)=>{
    res.render('index');
});

app.post('/form',(req,res)=>{
    uploads(req,res,err=>{
        const File = `uploads/${req.file.filename}`;
        console.log(req.file);
          LabR.push(File) 
          scnf=req.file.filename;
        //   console.log(scnf) 
        console.log(scnf);
        if(req.file.originalname==="asd.png"){
            res.redirect('/scan');
        }
            (async () => {
                await worker.load();
                await worker.loadLanguage('eng');
                await worker.initialize('eng');
                const { data: { text } } = await worker
                .recognize(`./public/uploads/${req.file.filename}`);
                console.log(text);
                await worker.terminate();
              })();
         
    })
})



app.get('/precipitation',(req,res)=>{
    res.render('precipitation');
})



app.post('/precipitation',(req,res)=>{
    const url= req.body.med1+","+req.body.med2+","+req.body.med3+","+req.body.med4;
    const data={
        fname:req.body.fname,
        age:req.body.age,
        gender:req.body.gender,
        pno:req.body.pno,
        desp:req.body.desp,
        sym:req.body.sym,
        med1:req.body.med1,
        med2:req.body.med2,
        med3:req.body.med3,
        med4:req.body.med4,
        dose1:req.body.dose1,
        dose2:req.body.dose2,
        dose3:req.body.dose3,
        dose4:req.body.dose4,
        days:req.body.days
    }
    Data.push(data);
    console.log(Data);
    
    if(url.length===0) res.send("Empty Data");

    QRCode.toDataURL(url,(err,src)=>{
        if(err) res.send("error Occured yes");

        res.render("qr",{src,patCode:patCode});
    })
})

app.get('/pbill',(req,res)=>{
    res.render("pbill");
});

app.post('/pbill',(req,res)=>{

    const hcode= req.body.pid
    if(hcode==="234r45k5"){
        res.redirect('/scan');
    }
    res.render("pbill");
});


app.get('/scan',(req,res)=>{

        console.log('public/uploads/'+scnf);
        var buffer = fs.readFileSync('public/uploads/asd.png');
 

        Jimp.read(buffer, function(err, image) {
            if (err) {
                console.error(err);
            }

            let qrcode = new qrCode();
            qrcode.callback = function(err, value) {
                if (err) {
                    console.error(err);
                }
                console.log(value);
                console.log(value.result);
                console.log(value.result.length);
                     
                var j=0,i; 
                for(i=0;i<value.result.length;i++){
                    if(value.result[i]===","){
                        const no = value.result.slice(j,i);
                        j=i+1;
                        Scnmed.push(no);
                    }
                    
                }
                Scnmed.push(value.result.slice(j,i))
            
                console.log(Scnmed);
                res.render("bill",{gtol:" ",Scnmed:Scnmed});
                // res.redirect('/')
            };

            qrcode.decode(image.bitmap);
        });

})

app.post('/scan',(req,res)=>{
    console.log(Scnmed);
    // gtol.length=0;
    const TolBIL={
         quantity1 :req.body.quantity1,
         quantity2 :req.body.quantity2,
         quantity3 :req.body.quantity3,
         quantity4 :req.body.quantity4,
         total1 :req.body.total1,
         total2 :req.body.total2,
         total3 :req.body.total3,
         total4 :req.body.total4,
         med:Scnmed,
         gtol:gtol
    }
    const Qunt1 = TolBIL.quantity1*TolBIL.total1;
    const Qunt2 = TolBIL.quantity2*TolBIL.total2;
     const Qunt3 = TolBIL.quantity3*TolBIL.total3;
    const Qunt4 = TolBIL.quantity4*TolBIL.total4;

     gtol= Qunt1+Qunt2+Qunt3+Qunt4;
    console.log(gtol);
    TolBIL.gtol=gtol;
    Bill.push(TolBIL);
    console.log(Bill);
    res.render("bill",{gtol:gtol,Scnmed:Scnmed});
})


app.listen(PORT,()=>console.log(`server is running on port ${PORT}`));
