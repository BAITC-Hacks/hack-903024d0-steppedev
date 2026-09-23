import requests
import pandas as pd


# ==========================================
# КООРДИНАТЫ ВЕТРОВЫХ УСТАНОВОК
# ==========================================

TURBINES = {
    "WT_1": {
        "latitude": 43.645139,
        "longitude": 78.535611
    },

    "WT_2": {
        "latitude": 43.643194,
        "longitude": 78.538833
    }
}


API_URL = "https://api.open-meteo.com/v1/forecast"


# ==========================================
# ПОЛУЧЕНИЕ ПОГОДЫ
# ==========================================

def get_weather(name, latitude, longitude):

    params = {

        "latitude": latitude,
        "longitude": longitude,

        "hourly": ",".join([

            # температура
            "temperature_2m",

            # влажность
            "relative_humidity_2m",

            # давление
            "surface_pressure",

            # скорость ветра
            "wind_speed_10m",
            "wind_speed_80m",
            "wind_speed_120m",

            # направление ветра
            "wind_direction_10m",
            "wind_direction_80m",
            "wind_direction_120m",

            # порывы
            "wind_gusts_10m"
        ]),

        # скорость ветра в м/с
        "wind_speed_unit": "ms",

        # время Казахстана
        "timezone": "Asia/Almaty",

        # прогноз 48 часов
        "forecast_hours": 48
    }


    print(f"\nПолучаем данные для {name}...")

    response = requests.get(
        API_URL,
        params=params,
        timeout=30
    )

    response.raise_for_status()

    data = response.json()

    df = pd.DataFrame(data["hourly"])

    df.insert(0, "turbine", name)

    df.insert(1, "latitude", latitude)

    df.insert(2, "longitude", longitude)

    df["time"] = pd.to_datetime(df["time"])

    return df


# ==========================================
# ВСЕ ВЕТРОУСТАНОВКИ
# ==========================================

def get_all_weather():

    results = []

    for name, coordinates in TURBINES.items():

        df = get_weather(
            name,
            coordinates["latitude"],
            coordinates["longitude"]
        )

        results.append(df)

    return pd.concat(
        results,
        ignore_index=True
    )


# ==========================================
# ЗАПУСК
# ==========================================

if __name__ == "__main__":

    try:

        weather = get_all_weather()

        print("\n===================================")
        print(" ДАННЫЕ УСПЕШНО ПОЛУЧЕНЫ")
        print("===================================\n")

        # Показываем основные параметры
        print(
            weather[
                [
                    "turbine",
                    "time",
                    "wind_speed_10m",
                    "wind_speed_80m",
                    "wind_speed_120m",
                    "wind_direction_120m"
                ]
            ].to_string(index=False)
        )

        # Сохраняем полный прогноз
        weather.to_csv(
            "wind_forecast.csv",
            index=False,
            encoding="utf-8-sig"
        )

        print("\n===================================")
        print("Файл wind_forecast.csv создан.")
        print("===================================")

    except Exception as error:

        print("\nОШИБКА:")
        print(error)