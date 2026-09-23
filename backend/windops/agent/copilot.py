"""Data-grounded operator answers, with an optional server-side language model."""
from __future__ import annotations

import json
import re
import requests


def percent(value):
    return f"{round(value * 100)}%"


def answer_question(question, forecast, settings, locale="en"):
    rows = forecast["records"]
    peak = max(rows, key=lambda row: row["WT01"]["prediction"])
    low = min(rows, key=lambda row: row["windSpeed120m"])
    question_lower = question.lower()
    references = ["Forecast data", "Weather forecast"]
    if re.search(r"peak|highest|maximum|пик|максим|ең жоғары|жоғары қуат", question_lower):
        answer = f"Expected peak: WT-01 {percent(peak['WT01']['prediction'])} at {peak['timestamp']} UTC; WT-02 {percent(peak['WT02']['prediction'])}. Wind at 120 m: {peak['windSpeed120m']:.1f} m/s."
    elif re.search(r"confiden|уверен|довер|над[её]ж|сенімді", question_lower):
        answer = f"System confidence: {forecast['confidence']}/100. It uses weather completeness, validation error and freshness. Current telemetry and independent weather agreement are unavailable. This is not a probability of forecast accuracy."
        references = ["Forecast data", "Diagnostics"]
    elif re.search(r"decreas|drop|decline|tomorrow|пада|снижа|сниже|сниз|завтра|төменде|азая|ертең", question_lower):
        answer = f"Lowest forecast wind: {low['windSpeed120m']:.1f} m/s at {low['timestamp']} UTC. Expected power: WT-01 {percent(low['WT01']['prediction'])}, WT-02 {percent(low['WT02']['prediction'])}. Select this hour in the chart to see the model contributions."
    elif re.search(r"compar|twin|anomal|deviat|сравн|аномал|отклон|салыстыр|ауытқу", question_lower):
        first = rows[0]
        answer = f"Next-hour expected power: WT-01 {percent(first['WT01']['prediction'])}, WT-02 {percent(first['WT02']['prediction'])}. Current power telemetry is not connected. Historical readings cannot establish the current operating state or a current anomaly."
        references = ["Twin comparison", "Forecast data"]
    elif re.search(r"chang|previous|измен|предыдущ|өзгер|алдыңғы", question_lower):
        change = forecast.get("changeSincePrevious")
        answer = (f"Average expected power changed by {change:+.2f} percentage points across hours shared with the previous forecast."
                  if change is not None else "No previous forecast is available for comparison. Refresh the forecast to compare overlapping hours.")
        references = ["Forecast data", "Agent event log"]
    else:
        answer = "Ask about peak power, wind conditions, turbine comparison, forecast changes or confidence. Answers are calculated from the published forecast and available measurements."
    provider = "Data analysis"
    # No key or model defaults. The supplied task file contains neither a usable key nor model name.
    if settings.nvidia_key and settings.nvidia_model:
        try:
            facts = {"answer": answer, "forecast": forecast, "telemetryAvailable": False}
            response = requests.post("https://integrate.api.nvidia.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.nvidia_key}", "Content-Type": "application/json"},
                json={"model": settings.nvidia_model, "temperature": .1, "max_tokens": 600,
                      "messages": [{"role": "system", "content": f"You assist a wind farm operator. Respond in {locale}. Use only supplied facts. Never change numeric forecasts, invent observations, diagnose failures or claim real-time telemetry exists. Explain unavailable evidence. Keep answers concise."},
                                   {"role": "user", "content": json.dumps({"question": question, "facts": facts}, ensure_ascii=False)}]},
                timeout=(10, 35))
            response.raise_for_status()
            answer = response.json()["choices"][0]["message"]["content"]
            provider = "NVIDIA"
        except (requests.RequestException, KeyError, IndexError, TypeError):
            provider = "Data analysis"
    return {"answer": answer, "references": references, "provider": provider, "forecastId": forecast["id"]}
