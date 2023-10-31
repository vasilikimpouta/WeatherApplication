let location = null;
const CELSIUS = "&#8451;";

const WEATHER_CODE_MAP = {
  0: "fa-sun",
  1: "fa-cloud-sun",
  2: "fa-cloud",
  3: "fa-cloud",
  80: "fa-cloud",
  61: "fa-cloud-rain",
  63: "fa-cloud-rain",
  65: "fa-cloud-rain",
  95: "fa-cloud-bolt",
};

const currentWeatherContainer = document.getElementById(
  "current-weather-container"
);

const todayWeatherContainer = document.getElementById(
  "today-weather-container"
);

const weatherForecastContainer = document.getElementById(
  "weather-forecast-container"
);

const dateFormatter = new Intl.DateTimeFormat("el-gr", {
  dateStyle: "short",
  timeStyle: "short",
});

function getApiUrl(location) {
  return `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&hourly=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&current_weather=true&timezone=auto`;
}

async function getWeatherForecast(location) {
  const apiUrl = getApiUrl(location);

  const weatherForecast = await fetch(apiUrl).then((response) =>
    response.json()
  );

  console.log(weatherForecast);
  return weatherForecast;
}

function getPosition() {
  navigator.geolocation.getCurrentPosition(onPositionSuccess);
}

function onPositionSuccess(position) {
  savePosition(position);
  renderMap();
  getWeatherForecast(location).then((weatherForecast) => {
    const currentWeather = weatherForecast.current_weather;
    const dailyWeather = weatherForecast.daily;
    const minTemperatureOfDay = dailyWeather.temperature_2m_min[0];
    const maxTemperatureOfDay = dailyWeather.temperature_2m_max[0];

    const weekForeCast = dailyWeather.time.map((time, index) => {
      return {
        time: time,
        minTemp: dailyWeather.temperature_2m_min[index],
        maxTemp: dailyWeather.temperature_2m_max[index],
        weathercode: dailyWeather.weathercode[index],
      };
    });

    const currentTimeIndex = weatherForecast.hourly.time.indexOf(
      currentWeather.time
    );
    console.log(currentTimeIndex);
    console.log(weekForeCast);
    const nextHours = [];
    for (let index = 1; index <= 4; index++) {
      const nextHourForecast = {
        time: weatherForecast.hourly.time[currentTimeIndex + index],
        temperature:
          weatherForecast.hourly.temperature_2m[currentTimeIndex + index],
        weathercode:
          weatherForecast.hourly.weathercode[currentTimeIndex + index],
      };
      nextHours.push(nextHourForecast);
    }

    displayCurrentWeather(
      currentWeather,
      minTemperatureOfDay,
      maxTemperatureOfDay
    );

    displayNextHours(nextHours);
    displayWeekForeCast(weekForeCast);
  });
}

function savePosition(position) {
  location = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}

function displayCurrentWeather(
  { time, temperature, weathercode },
  minTemp,
  maxTemp
) {
  WeatherCard(currentWeatherContainer, {
    time,
    temperature,
    weathercode,
    minTemp,
    maxTemp,
  });
}

function displayNextHours(nextHours) {
  nextHours.forEach((hour) => {
    WeatherCard(todayWeatherContainer, {
      time: hour.time,
      temperature: hour.temperature,
      weathercode: hour.weathercode,
    });
  });
}
function displayWeekForeCast(weekForeCast) {
  weekForeCast.forEach((day) => {
    WeatherCard(weatherForecastContainer, {
      time: day.time,
      minTemp: day.minTemp,
      maxTemp: day.maxTemp,
      weathercode: day.weathercode,
    });
  });
}
function WeatherCard(
  parent,
  { time, temperature, weathercode, minTemp, maxTemp }
) {
  const weatherCard = document.createElement("div");
  weatherCard.classList = ["weather-card"];

  const dateTime = new Date(time);

  const timeSpan = document.createElement("div");
  timeSpan.innerText = dateFormatter.format(dateTime);

  const weathercodeIcon = document.createElement("i");
  weathercodeIcon.classList = ["fa-solid"];
  weathercodeIcon.classList.add(WEATHER_CODE_MAP[weathercode]);

  weatherCard.append(weathercodeIcon);
  if (temperature) {
    const temperatureSpan = document.createElement("div");
    temperatureSpan.innerText = temperature;
    temperatureSpan.classList = ["temperature"];
    weatherCard.appendChild(temperatureSpan);
  }
  weatherCard.append(timeSpan);
  if (minTemp && maxTemp) {
    const minTempContainer = document.createElement("div");
    minTempContainer.innerText = minTemp;

    const maxTempContainer = document.createElement("div");
    maxTempContainer.innerText = maxTemp;

    weatherCard.append(minTempContainer, maxTempContainer);
  }

  parent.append(weatherCard);
}

getPosition();

setTimeout(() => console.log(location), 5000);

function renderMap() {
  var map = L.map("map").setView([location.latitude, location.longitude], 13);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  L.marker([location.latitude, location.longitude]).addTo(map);
}
