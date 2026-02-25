"""
Simulator Routes - Protected endpoints for pension simulator feature

Provides access to the pension simulation tools.
Only available to subscribers and admins with active status.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional
import logging

from backend.auth import require_permission, require_active_subscription
from backend.auth.models import AuthClaims
from backend.auth.roles import Permission

logger = logging.getLogger("uvicorn.error")

router = APIRouter(prefix="/simulator", tags=["simulator"])


class SimulationRequest(BaseModel):
    """Request model for pension simulation."""
    
    # Step 1: Montante
    eta_attuale: int = Field(..., ge=18, le=67, description="Current age")
    eta_pensione: int = Field(..., ge=50, le=70, description="Retirement age")
    contributo_mensile: float = Field(..., ge=0, description="Monthly contribution")
    contributo_azienda: float = Field(..., ge=0, description="Company contribution")
    montante_attuale: float = Field(default=0, ge=0, description="Current accumulated amount")
    
    # TFR
    tfr_to_fund: bool = Field(default=True, description="Transfer TFR to fund")
    tfr_annuale: Optional[float] = Field(default=None, ge=0, description="Annual TFR amount")
    
    # Performance
    rendimento_atteso: float = Field(default=3.0, ge=-5, le=15, description="Expected return %")
    
    # Step 2: Tax
    reddito_annuo: float = Field(..., ge=0, description="Annual income")
    
    # Step 3: Pension tax
    anni_contribuzione: int = Field(..., ge=0, le=50, description="Years of contribution")


class SimulationResponse(BaseModel):
    """Response model for pension simulation."""
    
    montante_finale: float
    anni_accumulo: int
    contributo_totale: float
    rendimento_totale: float
    
    # Tax savings
    risparmio_fiscale_annuo: float
    risparmio_fiscale_totale: float
    aliquota_irpef: float
    
    # Pension tax
    aliquota_pensione: float
    tassazione_stimata: float
    netto_stimato: float
    
    # Charts data
    montante_chart: list
    breakdown: dict


@router.post("/calculate", response_model=SimulationResponse)
async def calculate_simulation(
    request: SimulationRequest,
    claims: AuthClaims = Depends(require_permission(Permission.USE_SIMULATOR))
):
    """
    Calculate complete pension simulation.
    
    Requires: USE_SIMULATOR permission (Subscriber or Admin with active status)
    
    This endpoint:
    1. Calculates future pension amount (montante)
    2. Computes tax savings during accumulation
    3. Estimates pension taxation
    4. Returns detailed breakdown and chart data
    """
    try:
        # Validate inputs
        if request.eta_pensione <= request.eta_attuale:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Retirement age must be greater than current age"
            )
        
        anni_accumulo = request.eta_pensione - request.eta_attuale
        
        # Mock calculation (in production, use actual financial formulas)
        contributo_annuo = (request.contributo_mensile + request.contributo_azienda) * 12
        if request.tfr_to_fund and request.tfr_annuale:
            contributo_annuo += request.tfr_annuale
        
        # Simple compound interest calculation (mock)
        montante_finale = request.montante_attuale
        contributo_totale = request.montante_attuale
        
        montante_chart = []
        
        for anno in range(anni_accumulo):
            montante_finale += contributo_annuo
            montante_finale *= (1 + request.rendimento_atteso / 100)
            contributo_totale += contributo_annuo
            
            montante_chart.append({
                "anno": request.eta_attuale + anno + 1,
                "montante": round(montante_finale, 2),
                "contributi": round(contributo_totale, 2)
            })
        
        rendimento_totale = montante_finale - contributo_totale
        
        # Tax calculations (mock)
        aliquota_irpef = _calcola_aliquota_irpef(request.reddito_annuo)
        risparmio_fiscale_annuo = contributo_annuo * (aliquota_irpef / 100)
        risparmio_fiscale_totale = risparmio_fiscale_annuo * anni_accumulo
        
        # Pension tax (mock)
        aliquota_pensione = _calcola_aliquota_pensione(request.anni_contribuzione)
        tassazione_stimata = montante_finale * (aliquota_pensione / 100)
        netto_stimato = montante_finale - tassazione_stimata
        
        return SimulationResponse(
            montante_finale=round(montante_finale, 2),
            anni_accumulo=anni_accumulo,
            contributo_totale=round(contributo_totale, 2),
            rendimento_totale=round(rendimento_totale, 2),
            risparmio_fiscale_annuo=round(risparmio_fiscale_annuo, 2),
            risparmio_fiscale_totale=round(risparmio_fiscale_totale, 2),
            aliquota_irpef=round(aliquota_irpef, 2),
            aliquota_pensione=round(aliquota_pensione, 2),
            tassazione_stimata=round(tassazione_stimata, 2),
            netto_stimato=round(netto_stimato, 2),
            montante_chart=montante_chart,
            breakdown={
                "contributi_personali": round(request.contributo_mensile * 12 * anni_accumulo, 2),
                "contributi_azienda": round(request.contributo_azienda * 12 * anni_accumulo, 2),
                "tfr": round((request.tfr_annuale or 0) * anni_accumulo, 2) if request.tfr_to_fund else 0,
                "rendimenti": round(rendimento_totale, 2)
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating simulation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to calculate simulation"
        )


@router.get("/parameters")
async def get_simulation_parameters(
    claims: AuthClaims = Depends(require_active_subscription())
):
    """
    Get default parameters and ranges for the simulator.
    
    Requires: Active subscription
    
    Returns recommended values and allowed ranges.
    """
    return {
        "age_range": {"min": 18, "max": 67},
        "retirement_age_range": {"min": 50, "max": 70},
        "default_return_rate": 3.0,
        "return_rate_range": {"min": -5, "max": 15},
        "contribution_suggestions": {
            "conservative": 100,
            "moderate": 200,
            "aggressive": 500
        },
        "irpef_brackets": [
            {"max": 15000, "rate": 23},
            {"max": 28000, "rate": 25},
            {"max": 50000, "rate": 35},
            {"max": None, "rate": 43}
        ]
    }


@router.post("/save")
async def save_simulation(
    simulation_data: dict,
    claims: AuthClaims = Depends(require_active_subscription())
):
    """
    Save a simulation for later reference.
    
    Requires: Active subscription
    
    Allows users to save their simulation results.
    """
    # In production, save to database
    return {
        "success": True,
        "simulation_id": "sim_123",
        "message": "Simulation saved successfully"
    }


@router.get("/history")
async def get_simulation_history(
    claims: AuthClaims = Depends(require_active_subscription())
):
    """
    Get user's simulation history.
    
    Requires: Active subscription
    
    Returns list of previously saved simulations.
    """
    # Mock history
    return {
        "simulations": [
            {
                "id": "sim_123",
                "created_at": "2026-02-20T10:00:00Z",
                "montante_finale": 250000,
                "eta_pensione": 67
            }
        ]
    }


def _calcola_aliquota_irpef(reddito: float) -> float:
    """Calculate Italian IRPEF tax rate based on income."""
    if reddito <= 15000:
        return 23.0
    elif reddito <= 28000:
        return 25.0
    elif reddito <= 50000:
        return 35.0
    else:
        return 43.0


def _calcola_aliquota_pensione(anni_contribuzione: int) -> float:
    """Calculate pension withdrawal tax rate based on contribution years."""
    if anni_contribuzione <= 15:
        return 15.0
    elif anni_contribuzione <= 35:
        # Linear decrease from 15% to 9%
        return 15.0 - ((anni_contribuzione - 15) * 0.3)
    else:
        return 9.0
