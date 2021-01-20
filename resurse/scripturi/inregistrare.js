function validateForm(){
    var parola1 = document.getElementById("parola").value;
    var parola2 = document.getElementById("reintrParola").value;
    var conditie1 = (parola1 == parola2); 
    if (conditie1 == false) {
        alert ("Parolele nu coincid");
    }

    var username = document.getElementById("usernameInreg").value;
    var conditie2 = (username != "");

    var nume = document.getElementById("numeInreg").value;
    var conditie3 = (nume != "");

    var prenume = document.getElementById("prenumeInreg").value;
    var conditie4 = (prenume != "");

    var email = document.getElementById("emailInreg").value;
    var conditie5 = (email != "");

    if ((conditie2 || conditie3 || conditie4 || conditie5) == false) {
        alert ("Introduceti toate campurile!");
    }

    conditie6 = ((parola1.match(new RegExp("[A-Z]+")) && parola1.match(new RegExp("[a-z]+")) && parola1.match(new RegExp("[0-9]+.*[0-9]+")) &&  parola1.match(new RegExp("\\.+")))!=null)

    if (conditie6 == false)
    {
       alert("Parola nu respecta formatul cerut!")
    }
 
    var rez = conditie1 && conditie2 && conditie3 && conditie4 && conditie5 && conditie6;
    return rez

}