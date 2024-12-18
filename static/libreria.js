"use strict";

const _URL =  "" // "http://localhost:1337"
// Se vuota viene assegnata in automatico l'origine da cui è stata scaricata la pagina

async function inviaRichiesta(method, url="", params={}) {
	method = method.toUpperCase()
	
	let options = {
		"method": method,
		"headers":{},
		"mode": "cors",      // default
		"cache": "no-cache", // default
		"credentials": "same-origin",    // default
		"redirect": "follow", // default
		"referrerPolicy": "no-referrer", // default no-referrer-when-downgrade
		// riduce il timeout rispetto al default (6s) ma non sembra possibile incrementarlo
		//"signal": AbortSignal.timeout(500) 
    }
		
  	if(method=="GET") 
	{
		const queryParams= new URLSearchParams()
		for (const key in params) {
			let value = params[key];
			if(typeof value === "object" && value != null)
			{
				queryParams.append(key, JSON.stringify(value))
			}
			else
			{
				queryParams.append(key, value)
			}
		}
		url += "?" + queryParams.toString();
	}
	else {
		if(params instanceof FormData){
			options.headers["Content-Type"]="multipart/form-data;" 
			options["body"]=params     // Accept FormData, File, Blob
		}
		else{			
			options.headers["Content-Type"]="application/json"; // !!!!!!!!!
			options["body"] = JSON.stringify(params)
		}
	}
	
    try{
		const response = await fetch(_URL + url, options)	
		if (!response.ok) {
			let err = await response.text()
			alert(response.status + " - " + err)
			//return false or undefined
		} 
		else{
		    let data = await response.json().catch(function(err){
				console.log(err)
			    alert("response contains an invalid json")
				//return false or undefined
		    })
			return data;
		}
    }
    catch{ 
	   alert("Connection Refused or Server timeout") 
	   // return false or undefined	   
	}
}



