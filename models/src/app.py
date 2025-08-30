from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List, Optional
import os

app = FastAPI(title="SPI Price Recommender", version="0.1.0")

class ProductIn(BaseModel):
    sku: str
    cost_price: float

class RulesIn(BaseModel):
    min_profit_margin: Optional[float] = Field(default=float(os.getenv("MODEL_MIN_MARGIN_DEFAULT", "0.15")))
    undercut_limit: Optional[float] = 0.05

class PredictIn(BaseModel):
    product: ProductIn
    competitor_prices: List[float] = []
    rules: Optional[RulesIn] = None

class PredictOut(BaseModel):
    recommended_price: float
    model_version: str = "rule-v0"

@app.post("/predict", response_model=PredictOut)
def predict(inp: PredictIn):
    cost = inp.product.cost_price
    rules = inp.rules or RulesIn()
    min_by_margin = cost * (1 + (rules.min_profit_margin or 0.15))
    comp_min = min(inp.competitor_prices) if inp.competitor_prices else None
    if comp_min is not None:
        undercut_price = comp_min * (1 - (rules.undercut_limit or 0.05))
        rec = max(min_by_margin, undercut_price)
    else:
        rec = min_by_margin
    return PredictOut(recommended_price=round(rec, 2))
