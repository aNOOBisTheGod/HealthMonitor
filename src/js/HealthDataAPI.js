class HealthDataAPI {
  constructor(proxyURL = null) {
    this.proxyURL = proxyURL || 'https://functions.yandexcloud.net/YOUR_FUNCTION_ID';
    this.useProxy = true;
    this.savedLocation = this.getSavedLocation();
  }

  getSavedLocation() {
    const saved = localStorage.getItem('selectedCity');
    if (saved) {
      const [lat, lon] = saved.split(',');
      return { lat: parseFloat(lat), lon: parseFloat(lon) };
    }
    return null;
  }

  async fetchWeatherData(lat, lon) {
    try {
      const url = `${this.proxyURL}?lat=${lat}&lon=${lon}`;
      const response = await fetch(url);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return null;
    }
  }

  getUserLocation() {
    return new Promise((resolve, reject) => {
      if (this.savedLocation) {
        return resolve(this.savedLocation);
      }

      if ('geolocation' in navigator) {
        const timeout = setTimeout(() => {
          resolve({ lat: 55.7558, lon: 37.6173 });
        }, 5000);

        navigator.geolocation.getCurrentPosition(
          (position) => {
            clearTimeout(timeout);
            resolve({
              lat: position.coords.latitude,
              lon: position.coords.longitude
            });
          },
          (error) => {
            clearTimeout(timeout);
            resolve({ lat: 55.7558, lon: 37.6173 });
          }
        );
      } else {
        resolve({ lat: 55.7558, lon: 37.6173 });
      }
    });
  }

  async getWeatherForCurrentLocation() {
    const location = await this.getUserLocation();
    const weather = await this.fetchWeatherData(location.lat, location.lon);
    return weather;
  }
}

export default HealthDataAPI;
