import requests

from opencage.geocoder import OpenCageGeocode


def get_coordinates(city_name):
    api_key = "af490727a8fc46299026b044bbe9cf1a"
    geocoder = OpenCageGeocode(api_key)
    result = geocoder.geocode(city_name)
    print("CITY:", city_name, result)
    if result:
        lat = result[0]["geometry"]["lat"]
        lon = result[0]["geometry"]["lng"]
        return lat, lon
    else:
        return None, None

    import requests


API_KEY = "wFHjfmxSrCnTxkE2nE7WmgkdKJBvJJTG"


def get_weather(lat, lon, date):
    """Отримує прогноз погоди за координатами та датою"""
    print(lat, lon, date)
    url = f"https://api.tomorrow.io/v4/weather/forecast?location={lat},{lon}&apikey={API_KEY}"
    response = requests.get(url).json()

    forecast = response.get("timelines", {}).get("daily", [])
    for day in forecast:
        if day["time"].startswith(date):  # YYYY-MM-DD
            print("temperature", day["values"].get("temperatureAvg"))
            print("weather_code", day["values"].get("weatherCodeMax"))
            return {
                "temperature": day["values"].get("temperatureAvg"),
                "weather_code": day["values"].get("weatherCodeMax"),
            }
    return None
