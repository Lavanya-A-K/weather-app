import React, { useEffect, useState } from "react";
import "./Weather.css"
import searchIcon from "../assets/SearchIcon.svg"
import cloudIcon from "../assets/cloud.png"
import humidityIcon from "../assets/humidity.svg"
import windIcon from "../assets/wind.svg"
import clearSky from "../assets/normalDay.gif"
import clearSkyNight from "../assets/clearNight.gif"
import cloudyIcon from "../assets/cloudy.png"
import cloudyNightIcon from "../assets/cloudyNight.gif"
import cloudyDayIcon from "../assets/cloudyDay.gif"
import rainIcon from "../assets/rainy.gif"
import heavyRainIcon from "../assets/thunderstorm.gif"
import snow from "../assets/snow.gif"
import scatteredClouds from "../assets/scatteredClouds.gif"

const Weather = () => {
  const [weatherData, setWeatherData] = useState(false);
  const [city, setCity] = useState("");
  const [forecast, setForecast] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [inputValue, setInputValue] = useState("");

  const weatherIcons = {
    "01d" : clearSky,
    "01n" : clearSkyNight,
    "02d" : cloudyDayIcon,
    "02n" : cloudyNightIcon,
    "03d" : cloudyDayIcon,
    "03n" : cloudyNightIcon,
    "04d" : scatteredClouds,
    "04n" : scatteredClouds,
    "09d" : rainIcon,
    "09n" : rainIcon,
    "10d" : rainIcon,
    "10n" : rainIcon,
    "13d" : snow,
    "13n" : snow,
  }

  const API_KEY = process.env.REACT_APP_WEATHER_ID;

  const normalizeCityName = (name) => {
    return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };
  useEffect(() => {
    fetchLocationAndWeather();
  }, []);
  
  useEffect(()=>{
    if (city) {
      handleSearch(city);
    }
  },[])

  const getWeatherForecast = async (city) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
      );
      const data = await response.json();
      const today = new Date().toISOString().split("T")[0];
      const dailyForecast = [];
      const uniqueDates = new Set();
      const todayForecast = [];
  
      data.list.forEach((item) => {
        const date = new Date(item.dt * 1000).toISOString().split("T")[0];
        if (date === today) {
          todayForecast.push({
            ...item,
            time: new Date(item.dt * 1000).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            }),
          });
        }
        if (!uniqueDates.has(date)) {
          console.log(date)
          uniqueDates.add(date);
          dailyForecast.push({
            ...item,
            time: new Date(item.dt * 1000).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            }),
          });
        }
      });
  console.log("today",todayForecast)
  console.log("daily",dailyForecast)
      return {dailyForecast, todayForecast};
    } catch (error) {
      console.error("Error fetching forecast data:", error);
    }
  };

  const handleSearchClick = () => {
    if (city.trim() !== "") {
      handleSearch(city);
    } else {
      alert("Please enter a city name.");
    }
  };
  const handleSearch = async (city)=>{
    if (city) {
      try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=en&appid=${API_KEY}`
        );
        const data = await response.json();
        if(!response.ok){
          alert(data.message);
          return;
        }
        const icon = weatherIcons[data.weather[0].icon] || clearSky
        const weatherForecast = await getWeatherForecast(city);
        setForecast(weatherForecast);
      // console.log('Weather Data:', data);
        setWeatherData({
          temperature :data.main.temp,
          humidity :data.main.humidity,
          windSpead : Math.floor(data.wind.speed),
          location : normalizeCityName(data.name),
          feelsLike : data.main.feels_like,
          icon : icon,
          description : data.weather[0].main 
        })
        setLastUpdated(new Date());
      } catch(error) {
        console.log (error);
      }
    }
  }
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setCity(value)
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (inputValue.trim() !== "") {
        handleSearch(inputValue);
      } else {
        alert("Please enter a city name.");
      }
    }
  };

  const fetchLocationAndWeather = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const geocodeResponse = await fetch(
              `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`
            );
            const geocodeData = await geocodeResponse.json();
            if (geocodeData.length > 0) {
              const districtOrState =
              geocodeData[0].state || geocodeData[0].name || "Unknown";
              setCity(districtOrState);
              handleSearch(districtOrState);
            } else {
              alert("Unable to fetch district or state information.");
            }
          } catch (error) {
            console.error("Error in reverse geocoding:", error);
          }
        },
        (error) => {
          console.error("Error fetching location:", error);
          alert("Unable to retrieve your location. Please search manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };
  return (
      <div className="weather">
        <div className="search-bar">
          <input type="text" placeholder="Search location" value={inputValue || city}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
          <div className='search-icon' onClick={handleSearchClick}><img src={searchIcon} alt=""/></div>
        </div>
        {weatherData ? (
          <>
            <img src={weatherData.icon} alt="" className="weather-icon"/>
            <span>{weatherData.description}</span>
            <p className="temperature">{weatherData.temperature}° C</p>
            <p className="location">{weatherData.location} {weatherData.state ? `, ${weatherData.state}` : ""}</p>
            <p>Feels like {weatherData.feelsLike}° C</p>
          <div className="weather-data">
            <div>
              <p><img className="icon-svg" src={humidityIcon} alt=""/> Humidity : {weatherData.humidity}%</p>
              <p><img className="icon-svg" src={windIcon} alt=""/> Wind speed : {weatherData.windSpead} Km/h</p>
            </div>
            <div>
              <p>{new Date().toLocaleDateString("en-US", { weekday: "long" })}</p>
              <p>Last updated at:{" "}
                {lastUpdated.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                })}
              </p>
            </div>
          </div>
          {forecast && (
            <div className="forcast-data">
              <h2>Today's Forecast</h2>
              <div className="today-forecast">
                {forecast.todayForecast.map((item) => (
                  <div key={item.dt} className="forecast-item">
                    <p>{item.time}</p>
                    <img
                      src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                      alt={item.weather[0].description}
                    />
                    <p>{item.main.temp.toFixed(1)}°C</p>
                    <p>
                      <img className="humidity-icon" src={humidityIcon} alt=""/>{item.main.humidity}%
                    </p>
                    <p>{item.weather[0].description}</p>
                  </div>
                ))}
              </div>
              
              <h2>Weekly Forecast</h2>
              <div className="daily-forecast">
                {forecast.dailyForecast.map((item) => {
                  const date = new Date(item.dt * 1000);
                  const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
                  return (
                    <div key={item.dt} className="forecast-item">
                      <p>{dayName}</p>
                      <img
                        src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                        alt={item.weather[0].description}
                      />
                      <p>{item.main.temp.toFixed(1)}°C</p>
                      <p>
                        <img className="humidity-icon" src={humidityIcon} alt=""/>{item.main.humidity}%
                      </p>
                      <p>{item.weather[0].description}</p>
                    </div>
                  );
                })}
              </div>
            {/* {forecast?.dailyForecast?.map((item) => {
              const date = new Date(item.dt * 1000);
              const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
              return (
                <div key={item.dt} className="forecast-item">
                  <p>{dayName}</p>
                  //<p>{item.time}</p> 
                  <img
                    src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                    alt={item.weather[0].description}
                  />
                  <p>{item.main.temp.toFixed(1)}°C</p>
                  <p>{item.main.humidity}%</p>
                  <p>{item.weather[0].description}</p>
                </div>
              );
            })} */}
            
            </div>
        )}
      </> 
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}
export default Weather