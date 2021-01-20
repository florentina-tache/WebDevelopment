

window.addEventListener("load", function(){

    document.getElementById("i_sel_multiplu").onchange=function(){
       // this.options[0].selected = false;

    }

    document.getElementById("filtrare").onclick=function(){
        var produse= document.querySelectorAll("article");
        var tara_input = document.getElementById("i_text").value;
        var distantaMin=document.getElementById("i_range").value;
        var cu_visa=document.getElementById("i_check1").checked;
        var fara_visa=document.getElementById("i_check2").checked;
        var categorie_input = document.getElementsByName("gr_rad");
        var descriere_input = document.getElementById("i_textarea").value;
        var oras_input = document.getElementById("i_sel_simplu").value;
        var optiuni=document.getElementById("i_sel_multiplu").options;

        categorie_aleasa="";
        for(let categ of categorie_input){
            if(categ.checked){
                categorie_aleasa=categ.value;
                break;
            }
        }

        		
		var lista = [];
		for(let opt of optiuni){
			if(opt.selected)
				lista.push(opt.value);
        }

        for(var prod of produse){
            prod.style.display="block";

            var tara = prod.getElementsByClassName("tara")[0];
            var conditie1 = 1;
            if(tara_input != ""){
            conditie1 = (tara.innerHTML.toLowerCase().includes(tara_input.toLowerCase()));
            }

            var distanta = prod.getElementsByClassName("distanta")[0].textContent;
            var conditie2 = (parseInt(distanta)<=parseInt(distantaMin));

            var categorie = prod.getElementsByClassName("categorie")[0];
            var conditie3 = ((categorie_aleasa == categorie.innerHTML) || (categorie_aleasa=="nimic"));

            var visa = prod.getElementsByClassName("visa")[0];
            var conditie4cu = (cu_visa && visa.innerHTML == 1);
            var conditie4fara = (fara_visa && visa.innerHTML == 0);

            var descriere = prod.getElementsByClassName("descriere")[0];
            var conditie5 = 1;
            if(descriere_input != ""){
            conditie5 = (descriere.innerHTML.toLowerCase().includes(descriere_input.toLowerCase()));
            }

            var oras = prod.getElementsByClassName("oras")[0];
            var conditie6 = (( oras_input == oras.innerHTML) || (oras_input=="nimic"));


            var luna = prod.getElementsByClassName("luni_vizitat")[0];
            var luni = luna.innerHTML.split(", ");
            var conditie7 = false;
            for(elem of lista){
                if(luni.includes(elem)) {
                     conditie7 = true;
                    }
            }
            
            var conditie_totala = conditie7 && conditie6 && conditie5 && conditie1 && conditie2 && conditie3 && (conditie4cu || conditie4fara);
			if(conditie_totala == false){
				prod.style.display="none";
			}
            

        }
    }


	document.getElementById("i_range").onchange=function(){
		document.getElementById("info_range").innerHTML= this.value;
    }

    //sortari

    document.getElementById("sort_asc").onclick = function(){
        var container = document.getElementById("gr-locatii");
        var orase = container.children;

        var orase_array = Array.from(orase);
        console.log(orase);
       // console.log(document.getElementsByClassName("oras")[0].textContent);
        orase_array.sort(function(a,b){
            if(a.getElementsByClassName("oras")[0].textContent.localeCompare(b.getElementsByClassName("oras")[0].textContent) == - 1 ){
                return -1;
            }
            if(a.getElementsByClassName("oras")[0].textContent.localeCompare(b.getElementsByClassName("oras")[0].textContent) == 1 ){
                return 1;
            }
            else{
                
                var a_distanta = a.getElementsByClassName("distanta")[0].textContent;
                var b_distanta = b.getElementsByClassName("distanta")[0].textContent;
                return a_distanta - b_distanta;
            }
        })

        for(var i = 0; i < orase_array.length; i++){
            let aux = orase_array[i];
            container.appendChild(aux);
        }
    }

    document.getElementById("sort_desc").onclick = function(){
        var container = document.getElementById("gr-locatii");
        var orase = container.children;

        var orase_array = Array.from(orase);
        console.log(orase);
       // console.log(document.getElementsByClassName("oras")[0].textContent);
        orase_array.sort(function(a,b){
            if(a.getElementsByClassName("oras")[0].textContent.localeCompare(b.getElementsByClassName("oras")[0].textContent) == - 1 ){
                return 1;
            }
            if(a.getElementsByClassName("oras")[0].textContent.localeCompare(b.getElementsByClassName("oras")[0].textContent) == 1 ){
                return -1;
            }
            else{
                
                var a_distanta = a.getElementsByClassName("distanta")[0].textContent;
                var b_distanta = b.getElementsByClassName("distanta")[0].textContent;
                return b_distanta - a_distanta;
            }
        })

        for(var i = 0; i < orase_array.length; i++){
            let aux = orase_array[i];
            container.appendChild(aux);
        }
    }


    document.getElementById("average").onclick = function(){
        var average = 0;
        var count = 0;

        var container = document.getElementById("gr-locatii");
        var locatii = container.children;
        var locatii_array = [];

        for(var loc of locatii){
            if(loc.style.display != "none"){
                locatii_array[count] = loc;
                count = count + 1;
                var dist_curenta = loc.getElementsByClassName("distanta")[0].textContent.split(" ")[0];
                average = average + Number(dist_curenta);
            }
        }

        
            average = Number(average/count);
            alert( "Distanta medie este: "+average + " km");
        
    }


    document.getElementById("reset_filter").onclick = function(){
        document.getElementById("i_text").value = "";
        document.getElementById("i_range").value = "16000";
        document.getElementById("i_rad").checked = true;
        document.getElementById("i_textarea").value = "";
        document.getElementById("i_sel_simplu").value = "nimic";
        document.getElementById("i_check1").checked = true;
        document.getElementById("i_check2").checked = true;
        
        var options = document.getElementById("i_sel_multiplu").options
        for (var opt of options){
            opt.selected = true;
        }
    }
})