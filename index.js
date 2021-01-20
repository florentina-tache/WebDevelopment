const express=require('express')// import modulul express
var path= require('path');

var app=express();//aici am creat serverul

const session = require('express-session')
const formidable = require('formidable');
const crypto = require('crypto');
const nodemailer = require("nodemailer");
var mysql=require('mysql');
var fs=require('fs');

app.use(session({
    secret: 'abcdefg',//folosit de express session pentru criptarea id-ului de sesiune
    resave: true,
    saveUninitialized: false
  }));


//aici astept orice tip de cerere (caracterul special * care tine loc de orice sir)

app.set('view engine', 'ejs');//setez drept compilator de template-uri ejs (setez limbajul in care vor fi scrise template-urile)

//setez folderele statice (cele in care nu am fisiere generate prin node)
app.use('/resurse', express.static('resurse'));
app.use('/poze_uploadate', express.static('poze_uploadate'));

console.log(__dirname); //predefinita - calea pe masina serverului
console.log(path.join(__dirname, "resurse"));
app.use(express.static(path.join(__dirname, "resurse")));

// aici astept cereri de forma localhost:8080 (fara nimic dupa)
app.get('/', function(req, res){
    res.render("pagini/index",{utilizator:req.session.utilizator});//afisez index-ul in acest caz
});

//cerere serviciu
app.get('/ora_server', function(req, res){
    res.setHeader("Content-Type", "text/html");
    res.write("<html><body><p style='color:red;'>Salut, Gigele!</p>");
    var d=new Date();
    //res.write(d+""); conversie implicita la sir
    res.write(d.getFullYear()+"/"+d.getMonth());
    res.write("</body></html>");
    res.end();
});

app.get('/galerie_statica', function(req, res){
	res.render("pagini/galerie_statica",{utilizator:req.session.utilizator});

	
});

app.get('/galerie_animata', function(req, res){
    res.render("pagini/galerie_animata",{utilizator:req.session.utilizator});
});






var conexiune=mysql.createConnection({
    host:"localhost",
    user:"gigel",
    password:"parola",
    database:"proiect"
});

conexiune.connect(function(err){
    if (err) throw err;
    console.log("Ne-am conectat!!! Yayyyy!!");
});

//functii utile

function getUtiliz(req){
	var utiliz;
	if(req.session){
		utiliz=req.session.utilizator
	}
	else{utiliz=null}
	return utiliz;
}


conexiune.query("select * from produse",function(err, rezultat, campuri){
    if(err) throw err;
    console.log(rezultat);
});



app.get('/produse', function(req, res){

    conexiune.query("select * from produse",function(err,rezultat,campuri){
        if(err) throw err;
        console.log(rezultat);
		res.render('pagini/produse',{produse:rezultat,utilizator:req.session.utilizator});//afisez index-ul in acest caz
		
    });

});



app.get('/produs/:id', function(req, res){
    var idProdus=req.params.id;

    conexiune.query("select * from produse where id="+idProdus,function(err,rezultat,campuri){
        if(err) throw err;
        console.log(rezultat);
        res.render('pagini/pag_produs',{produs_unic:rezultat[0]});//afisez index-ul in acest caz
    });

});

async function trimiteMail(username, email){

	var data_trimitere_mail = new Date();
	var luna = data_trimitere_mail.getMonth();
    var zi = data_trimitere_mail.getDate();
    var zi_sapt = data_trimitere_mail.getDay();
    var an = data_trimitere_mail.getFullYear(); 
	var lunile_anului = ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
    "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"];
    var zilele_saptamanii = ['Duminica', 'Luni', 'Marti', 'Miercuri', 'Joi', 'Vineri', 'Sambata']; 
	var data_formatata = zi+'/'+lunile_anului[luna]+'/'+an +"("+zilele_saptamanii[zi_sapt]+")"; 
			 
	var transp= nodemailer.createTransport({
		service: "gmail",
		secure: false,
		auth:{//date login 
			user:"finder.tehniciweb@gmail.com",
			pass:"Tehniciw3b."
		},
		tls:{
			rejectUnauthorized:false
		}
	});
	//genereaza html
	await transp.sendMail({
		from:"finder.tehniciweb@gmail.com",
		to:email,
		subject:"Mesaj inregistrare",
		text:"Pe Finder ai username-ul "+username +", incepand de azi, " + data_formatata,
		html:"<p>Pe Finder ai username-ul<span style = 'text-decoration: underline;color:purple'> "+username+"</span>, incepand de azi, "+data_formatata+"</p>",
	})
	console.log("trimis mail");
}


var parolaServer="tehniciweb";
app.post("/inreg",function(req, res){
	var username;
	var formular= formidable.IncomingForm()
	console.log("am intrat pe post");
	
	//nr ordine: 4
	formular.parse(req, function(err, campuriText, campuriFisier){//se executa dupa ce a fost primit formularul si parsat
		console.log("parsare")
		var eroare="";
		console.log(campuriText);
		//verificari campuri
		if(campuriText.username==""){
			eroare+="Username nesetat";
		}
		// verificare daca exista deja username-ul in tabelul de utilizatori

		//verificari campuri inainte de comanda + sa nu fie campuri necompletate
            if (campuriText.username == "")
                eroare += "Username nesetat! ";
            if (campuriText.nume == "")
                eroare += "Nume nesetat! ";
            if (campuriText.prenume == "")
                eroare += "Prenume nesetat! ";
            if (campuriText.email == "")
                eroare += "Email nesetat! ";
            if (campuriText.username == "")
                eroare += "Parolă nesetată! ";
 
        //    if (campuriText.parola != campuriText.rparola)
          //      eroare += "Parolele nu coincid!"; 
            // if (campuriText.username.value.match(/^[A-z\s\-]+/));
 

		if(eroare==""){
			if (campuriText.username != "") {
				console.log("	Intra in if si verifica daca username-ul este deja in baza de date");
				var queryString = `select username from utilizatori where username='${campuriText.username}'`;
				console.log(queryString);
				conexiune.query(queryString, function(err, rez, campuri){
					if (err) {
						console.log(err);
						throw err;
						
					}
					console.log(rez)
					if (rez.length > 0) {
						eroare += "Exista deja un utilizator cu acest username";
						res.render("pagini/inregistrare_user",{err:eroare,raspuns:"Completati corect campurile"});
					}
					else {
						var avatarPath;
						if(campuriFisier.poza){
							var avatarPath = "/resurse/poze_uploadate/" + copie_user + "/" + campuriFisier.poza.name;
						}
						var comanda=`insert into utilizatori (username, nume, prenume, email, parola, problema_vedere, cale_imagine) values(${campuriText.username}, ${campuriText.nume}, ${campuriText.prenume}, ${campuriText.email}, ${parolaCriptata}, '${problemeVedere}',  '${avatarPath}' )`;
						console.log(comanda);
						conexiune.query(comanda, function(err, rez, campuri){
							if (err) {
								console.log(err);
								throw err;
							}
							trimiteMail(campuriText.username, copie_email);
							console.log("ceva");
							res.render("pagini/inregistrare_user",{err:"",raspuns:"Date introduse",utilizator:req.session.utilizator});
						})
					}
				})
			}

            console.log(campuriText);
			//daca nu am erori procesez campurile
            var problemeVedere;
            if(campuriText.gr_check == "da") problemeVedere = 1;
			else problemeVedere = 0;
			
			//var lista_username = `select username from utilizatori`

		//	console.log(lista_username)

			//sql injection
			var parolaCriptata = mysql.escape(crypto.scryptSync(campuriText.parola, parolaServer, 32).toString("ascii"));
			
			var copie_email = campuriText.email
			var copie_user = campuriText.username
			campuriText.username = mysql.escape(campuriText.username)
			campuriText.nume = mysql.escape(campuriText.nume)
			campuriText.prenume = mysql.escape(campuriText.prenume)
			campuriText.email = mysql.escape(campuriText.email)
			var poza = campuriText.poza
			

			conexiune.query(`select username from utilizatori where username=${campuriText.username}`,function(err, rezultat, campuri){
				console.log(rezultat);})
				


		}
		else{
			res.render("pagini/inregistrare_user",{err:eroare,raspuns:"Completati corect campurile"});
		}
	})
	//nr ordine: 1
	formular.on("field", function(name,field){
		if(name=='username')
			username=field;
		console.log("camp - field:", name)
	});
	
	//nr ordine: 2
	formular.on("fileBegin", function(name,fisier){
		console.log("inceput upload: ", fisier);
		if(fisier && fisier.name!=""){
			//am  fisier transmis
			var cale=__dirname+"/resurse/poze_uploadate/"+username
			if (!fs.existsSync(cale)) {
				fs.mkdirSync(cale);
			}
			fisier.path=cale+"/"+fisier.name;
			console.log(fisier.path);
		}
	});
	
	//nr ordine: 3
	formular.on("file", function(name,field){
		console.log("final upload: ", name);
	});
});


//-------------------------------- logare si delogare utilizator ---------------------------------------


app.post("/login",function(req, res){
	var formular= formidable.IncomingForm()
	console.log("am intrat pe login");
	
	formular.parse(req, function(err, campuriText, campuriFisier){//se executa dupa ce a fost primit formularul si parsat
		var parolaCriptata=mysql.escape(crypto.scryptSync(campuriText.parola,parolaServer,32).toString("ascii"));
		campuriText.username=mysql.escape(campuriText.username)
		var comanda=`select id, nume, prenume, email, data_inregistrare, rol, problema_vedere, cale_imagine from utilizatori where username=${campuriText.username} and parola=${parolaCriptata}`;
		conexiune.query(comanda, function(err, rez, campuri){
			console.log(comanda);
			if(rez && rez.length==1){
				req.session.utilizator={
					id:rez[0].id,
					username:campuriText.username,
                    nume:rez[0].nume,
                    prenume:rez[0].prenume,
                    email:rez[0].email,
                    data_inregistrare:rez[0].data_inregistrare,
                    rol:rez[0].rol,
                    problema_vedere:rez[0].problema_vedere,
                    cale_imagine:rez[0].cale_imagine,
				}
				res.render("pagini/index",{utilizator:req.session.utilizator});
			}
			else{
				res.render("pagini/index");
			}
		});
	});
});

app.get('/logout', function(req, res){
	console.log("logout");
	req.session.destroy();
	res.render("pagini/index");
});


//-------------------------------- actiunile admin-ului: afisare si stergere utilizator ---------------------------------------

app.get('/useri', function(req, res){
	
	if(req.session && req.session.utilizator && req.session.utilizator.rol=="admin"){
        conexiune.query("select * from utilizatori",function(err, rezultat, campuri){
		if(err) throw err;
		console.log(rezultat);
		res.render('pagini/useri',{useri:rezultat, utilizator:getUtiliz(req)});//afisez index-ul in acest caz
	});
	} else{
		res.render('pagini/eroare',{mesaj:"Nu aveti acces", utilizator:req.session.utilizator});
	}

});

app.post("/sterge_utiliz",function(req, res){
	if(req.session && req.session.utilizator && req.session.utilizator.rol=="admin"){
	var formular= formidable.IncomingForm()
	console.log("am intrat pe login");
	
	formular.parse(req, function(err, campuriText, campuriFisier){
		var comanda=`select username from utilizatori where id='${campuriText.id}'`;
		const fs = require('fs');
		conexiune.query(comanda, function(err, rez, campuri){
			var cale = __dirname + "/resurse/poze_uploadate/" + rez[0].username;
			fs.rmdir(cale,{ recursive:true}, function() {console.log("Am sters!!!")});
			
		});
	});
	}
	res.render("pagini/index",{utilizator:req.session.utilizator});
	
});



//aici astept orice tip de cerere (caracterul special * care tine loc de orice sir)
app.get('/*', function(req, res){
    res.render('pagini/'+req.url,{utilizator:req.session.utilizator}, function(err, rezRandare){
        if(err){//intra doar cand avem eroare
            if(err.message.includes("Failed to lookup view"))
                res.status(404).render('pagini/404');
            else
                throw err;
        }
        else{
            console.log(rezRandare);
            res.send(rezRandare);
        }
    });//afisez pagina ceruta dupa localhost:8080
    //de exemplu pentru localhost:8080/pag2 va afisa fisierul /pag2 din folderul pagini
    console.log(req.url);//afisez in consola url-ul pentru verificare
});

app.listen(8080);//serverul asculta pe portul 8080
console.log("A pornit serverul pe portul 8080");//afisez in consola un mesaj sa stiu ca nu s-a blocat
