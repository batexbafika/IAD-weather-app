//ask for permission to collect users location data
async function getUserWeatherLocation() {
  const DEFAULT_CITY = "Bamenda";
  //If browser does not support this feature
  if (!navigator.geolocation) {
    showError("Browser does not suport geolocation: search by city instead");
    const data = await fetchData({ city: DEFAULT_CITY });
    if (data) displayWeather(data);
    return;
  }
  navigator.geolocation.getCurrentPosition(
    //browser handdles this (BOM)
    //In case the user grants permission
    async (position) => {
      // async without refreshing the browser
      //accessing and save the coord
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      //collect data from API
      const data = await fetchData({ lat, lon }); //no refresh required
      //display on UI
      if (data) displayWeather(data);
    },
    async () => {
      //If user declines permission
      showError("Faild to get current location : try searching a city");
      //fallback to default city weather
      const data = await fetchData({ city: DEFAULT_CITY });
      if (data) displayWeather(data);
    },
  );
}

// Error handling helper function
function showError(message) {
  const errorElement = document.getElementById("error");
  errorElement.textContent = message;

  setTimeout(() => {
    errorElement.textContent = "";
  }, 5000);
}

// Display the weather information on the webpage
function displayWeather(data, isLocationBased = false) {
  const temperature = data.main.temp; //retrieves the temperature from the data
  const decsription = data.weather[0].description; //retrieves the weather description
  const humidity = data.main.humidity; //retrieves the humidity
  const cityname = data.name; //retrieves the city name
  const Windspeed = data.wind.speed; //speed
  const icon = data.weather[0].icon; //retrieves the weather icon code

  document.getElementById("weather-result").innerHTML = `
    <h2>Weather in <b id="data_values"> ${cityname}</b></h2>
    <p>Temperature: <b id="data_values">${temperature} °C<b></p>
    <p>Description: <b id="data_values"> ${decsription} </b></p>
    <p>Windspeed : <b id="data_values"> ${Windspeed} m/s </b></p>
    <p>Humidity: <b id="data_values">${humidity}%</b></p>
    <span><img src="http://openweathermap.org/img/wn/${icon}.png" alt="Weather icon"></span>`;
}

//Get the data from the API : try catch, assync , await, fetch.s
async function fetchData({ city = null, lat = null, lon = null }) {
  //apiKey for the weather API
  const apiKey = "6344996de75dd5dc1bf43ea5fe88a90c"; //preferably in config or .env

  let url;
  if (city) {
    url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  } else if (lat && lon) {
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  } else {
    showError("No location provided");
    return null;
  }

  //try catch block to handle errors
  try {
    //fetch data from the API
    const response = await fetch(url);

    //Check is HTTP response is ok
    if (!response.ok) {
      throw new Error("Weather not found");
    }

    //else if response returns with the expected data,
    //parse the data to JSON
    const data = await response.json();

    //If execution reaches here, it means no errors occurred during the fetch
    //hence, we can now safely reset the error message
    document.getElementById("error").textContent = "";
    return data; //the data is now returned to the caller.
  } catch (error) {
    showError("No data found. check internet connection... or city name");
    return null; // return null in case of an error
  }
}

// function that searches for the city when the button is clicked
async function searchCity() {
  //FrontEnd(Yannick and Annie) give the input field an id of 'city-name' for smooth integration.
  const city = document.getElementById("city-name").value.trim();
  document.getElementById("weather-result").innerHTML = ""; // Clear previous results
  // checking if data is not null before proceeding
  if (!city) {
    showError("City name cannot be empty");
    return null; // exit the function if there was an error fetching data
  }
  // This line gets the city from the API
  const data = await fetchData({ city });

  // If data is valid, it should be dispalyed
  if (data) displayWeather(data, false);
}
