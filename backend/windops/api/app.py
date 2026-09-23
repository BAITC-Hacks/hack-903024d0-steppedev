"""WindOps HTTP API. Run one worker; the scheduler owns model execution."""
from contextlib import asynccontextmanager
from typing import Literal
import logging

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from ..agent.copilot import answer_question
from ..core.config import settings
from .runtime import Runtime

runtime = Runtime(settings)


@asynccontextmanager
async def lifespan(app: FastAPI):
    runtime.start()
    yield
    runtime.stop.set()


app = FastAPI(title="WindOps API", version="2.0.0", lifespan=lifespan)


@app.exception_handler(Exception)
async def unexpected_error(request, error):
    logging.getLogger(__name__).warning("API operation failed (%s)", type(error).__name__)
    return JSONResponse(status_code=500, content={"detail": "The operation could not be completed. Check the server data configuration."})


@app.get("/api/health")
def health():
    return {"status": "online", "modelLoaded": runtime.forecaster is not None}


@app.get("/api/operations")
def operations():
    return runtime.snapshot()


@app.get("/api/forecast")
def forecast():
    result = runtime.snapshot()["forecast"]
    if result is None:
        raise HTTPException(503, "A forecast is not available yet. Check the agent event log.")
    return result


@app.get("/api/weather")
def weather():
    return [{key: value for key, value in row.items() if key not in {"WT01", "WT02"}} for row in forecast()["records"]]


@app.get("/api/turbines")
def turbines():
    return runtime.snapshot()["turbines"]


@app.get("/api/anomalies")
def anomalies():
    return runtime.snapshot()["anomalies"]


@app.get("/api/agent/status")
def agent_status():
    return runtime.snapshot()["agent"]


@app.get("/api/agent/history")
def agent_history():
    return runtime.snapshot()["events"]


@app.get("/api/diagnostics")
def diagnostics():
    result = runtime.diagnostics()
    if result is None:
        raise HTTPException(503, "Model and dataset information is not available yet.")
    return result


@app.post("/api/forecast/refresh", status_code=202)
def refresh():
    started = runtime.start_refresh()
    return {"started": started, "busy": True}


class ReplayRequest(BaseModel):
    date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    time: str = Field(pattern=r"^\d{2}:\d{2}$")


@app.post("/api/replay")
def replay(body: ReplayRequest):
    try:
        origin = pd.Timestamp(f"{body.date}T{body.time}:00Z")
        return runtime.replay(origin)
    except ValueError as error:
        raise HTTPException(422, str(error)) from None


@app.get("/api/forecast/explanation")
def explanation(forecast_id: str, timestamp: str, turbine: Literal["WT01", "WT02"]):
    try:
        return runtime.explanation(forecast_id, timestamp, turbine)
    except ValueError as error:
        raise HTTPException(422, str(error)) from None


class CopilotRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000)
    locale: Literal["en", "ru", "kk"] = "en"


@app.post("/api/copilot")
def copilot(body: CopilotRequest):
    return answer_question(body.question, forecast(), settings, body.locale)
