var WEATHERAPIKEY = "e11ce632b2d8e5f3dfc71f5de9ca294b"
var GEOAPIKEY = "e6cad725987c4a619f2130861e368317"
var city = document.querySelector("#city")
var form = document.querySelector("#form")
var forecast = document.querySelector("#forecast")
var icon = document.querySelector("#icon")
var dayOfTheWeek = document.querySelector("#day")
var valueDays = document.querySelector("#days")
var divCity = document.querySelector("#divCity")

//CACHE
// localStorage, sessionStorage, cookies
//
// fetch()...
// let result_paris = { temp: 30, weather: cloudy, humidity: 80}

// localStorage.setItem('Paris', JSON.stringify(result_paris))
// 
// var value_stored = JSON.parse(localStorage.getItem('Paris'))
//
// console.log(value_stored)

// localStorage.removeItem("Paris")


// retire la classe nuit
function dayify() {
    divCity.classList.remove("pNight")
    document.querySelector("#forecast").classList.remove("pNight")
    document.querySelector("body").classList.remove("bodyNight")
    document.querySelector("html").classList.remove("bodyNight")
}

//ajoute la classe nuit
function nightify(){
    divCity.classList.add("pNight")
    document.querySelector("#forecast").classList.add("pNight")
    document.querySelector("body").classList.add("bodyNight")
    document.querySelector("html").classList.add("bodyNight")
}

// Fonction qui créé les éléments jour de la semaine, icône et température + ajout classe nuit, si nécessaire
function displayIcon(main, description, day, temperature, checkday){ 
    let elem = document.createElement("img");
    let div = document.createElement("div");
    div.classList.add("icon")
    forecast.appendChild(div)

    let para = document.createElement("p")
    let divPara = document.createElement("div")
    divPara.appendChild(para)
    para.innerText = day

    let paraTemp = document.createElement("p")
    let divParaTemp = document.createElement("div")
    divParaTemp.appendChild(paraTemp)
    paraTemp.innerText = temperature


    if(main == "Clear") {
        elem.setAttribute("src", "images/sun.svg")
    }
    else if(main == "Snow"){
        elem.setAttribute("src", "images/snow.svg")
    }           
    else if(main == "Clouds"){
        if(description == 'broken clouds' || description == 'overcast clouds'){
            elem.setAttribute("src", "images/clouds.svg")
        }
        if(description == 'few clouds' || description == 'scattered clouds'){
            elem.setAttribute("src", "images/cloudy.svg")
        }
    }
    else{
        elem.setAttribute("src", "images/rain.svg")
    }

    div.appendChild(divPara)
    div.appendChild(elem)
    div.appendChild(divParaTemp)

    if (checkday == false) {
        elem.classList.add("imgNight")
    }
}

// affiche le nom de la ville
function displayCity(city){
    let divC = document.createElement("p")
    divC.innerText = city
    divCity.appendChild(divC)
}

// vide toutes les balises d'un node parent
function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

// convertit dt en jour de la semaine
function convertDTTimeDay (time) {
    let d = new Date(0)
    d.setUTCSeconds(time)
    let day = (new Intl.DateTimeFormat('en-US', {weekday: 'long'}).format(d))
    return day
}

// convertit dt en format HH:MM
function convertDTTimeHour (time) {
    let d = new Date(0)
    d.setUTCSeconds(time)
    let currentTime = (new Intl.DateTimeFormat('en-US', {hour: "numeric", minute: "numeric", hour12: false}).format(d))
    return currentTime
}

// convertit un format d'heure en format HH:MM
function convert24hTime(time) {
    var hours = Number(time.match(/^(\d+)/)[1]);
    var minutes = Number(time.match(/:(\d+)/)[1]);
    var AMPM = time.match(/\s(.*)$/)[1];
    if(AMPM == "PM" && hours<12) hours = hours+12;
    if(AMPM == "AM" && hours==12) hours = hours-12;
    var sHours = hours.toString();
    var sMinutes = minutes.toString();
    if(hours<10) sHours = "0" + sHours;
    if(minutes<10) sMinutes = "0" + sMinutes;
    return (sHours + ":" + sMinutes);
}

// convertit un format HH:MM en secondes
function convertHHMMintoSec(time) {
    let splited = time.split(':')
    var seconds = ((splited[0]) * 60 * 60) + ((splited[1]) * 60)
    return seconds
}

// détermine si l'horaire retourné est jour ou nuit
function rangeTime(sunriseSec, sunsetSec, nowSec) {
    if (sunsetSec<sunriseSec) {
        sunsetSec += 86400
    }
    if(nowSec >= sunriseSec && nowSec < sunsetSec ){
        return true
    }else{
        return false
    }
}

// fonction d'écoute du submit
form.addEventListener("submit", function(e) {
    e.preventDefault()
    removeAllChildNodes(forecast)
    removeAllChildNodes(divCity)
    $.get("https://api.opencagedata.com/geocode/v1/json?q="+city.value+"&key="+GEOAPIKEY, function(data){
        let lat = data["results"][0]["geometry"]["lat"]
        let lng = data["results"][0]["geometry"]["lng"]
        let city = data["results"][0]["formatted"]
        displayCity(city)
        console.log(city)
        $.get("https://api.openweathermap.org/data/2.5/onecall?lat="+lat+"&lon="+lng+"&units=metric&appid="+WEATHERAPIKEY, function(data){
            for (i = 0; i < valueDays.value; i++) {
                    let current = data["current"]["dt"]
                    let description = data["daily"][i]["weather"][0]["description"]
                    let main = data["daily"][i]["weather"][0]["main"]
                    let dt = data["daily"][i]["dt"]
                    let temperature = parseInt(data["daily"][i]["temp"]["day"])

                    let day = convertDTTimeDay(dt)
                    let nowHour= convertDTTimeHour(current)
                    let nowSec = convertHHMMintoSec(nowHour)

                    
                    $.get("https://api.sunrise-sunset.org/json?lat="+lat+"&lng="+lng+"&date=today&formatted=1", function(data) {
                        let sunrise = data["results"]["sunrise"]
                        let sunset = data["results"]["sunset"]
                        let convertedSunrise = convert24hTime(sunrise)
                        let convertedSunset = convert24hTime(sunset)
                        var sunriseSec = convertHHMMintoSec(convertedSunrise)
                        var sunsetSec = convertHHMMintoSec(convertedSunset)

                        if (rangeTime(sunriseSec, sunsetSec, nowSec) == true) {
                            var checkday = true
                        } else {
                            var checkday = false
                        } 
                        
                        displayIcon(main, description, day, temperature, checkday)

                            if (checkday == true) {
                                dayify()
                            } else {
                                nightify()
                            }                                                  
                        }
                    )
            }
            }
        )
        }
    )
    }
)