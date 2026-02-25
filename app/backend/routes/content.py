"""
Content Routes - Public and authenticated access to guides, FAQ, and educational content

These endpoints are available to all users (free, subscriber, admin).
They provide educational content about pension funds and TFR.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
import logging

from backend.auth import auth_required, optional_auth
from backend.auth.models import AuthClaims

logger = logging.getLogger("uvicorn.error")

router = APIRouter(prefix="/content", tags=["content"])


# Mock content data
GUIDE_SECTIONS = [
    {
        "id": "intro",
        "title": "Introduzione alla Previdenza Complementare",
        "slug": "introduzione",
        "content": "La previdenza complementare è un sistema...",
        "order": 1,
        "is_public": True
    },
    {
        "id": "tfr",
        "title": "Tutto sul TFR",
        "slug": "tfr",
        "content": "Il Trattamento di Fine Rapporto...",
        "order": 2,
        "is_public": True
    },
    {
        "id": "fondi",
        "title": "Tipi di Fondi Pensione",
        "slug": "tipi-fondi",
        "content": "Esistono diversi tipi di fondi...",
        "order": 3,
        "is_public": True
    },
    {
        "id": "tassazione",
        "title": "Tassazione e Benefici Fiscali",
        "slug": "tassazione",
        "content": "La previdenza complementare offre vantaggi fiscali...",
        "order": 4,
        "is_public": True
    }
]

FAQ_ITEMS = [
    {
        "id": "faq_1",
        "category": "tfr",
        "question": "Cosa succede al mio TFR se scelgo il fondo pensione?",
        "answer": "Il TFR viene versato al fondo pensione e investito...",
        "order": 1
    },
    {
        "id": "faq_2",
        "category": "tfr",
        "question": "Posso recuperare il TFR prima della pensione?",
        "answer": "Sì, in alcuni casi specifici come acquisto prima casa...",
        "order": 2
    },
    {
        "id": "faq_3",
        "category": "contributi",
        "question": "Quanto devo versare ogni mese?",
        "answer": "Non esiste un minimo obbligatorio, ma si consiglia...",
        "order": 3
    },
    {
        "id": "faq_4",
        "category": "tassazione",
        "question": "Quali sono i vantaggi fiscali?",
        "answer": "Puoi detrarre fino a 5.164€ annui...",
        "order": 4
    },
    {
        "id": "faq_5",
        "category": "rendimenti",
        "question": "Come vengono tassati i rendimenti?",
        "answer": "I rendimenti sono tassati al 20% invece del 26%...",
        "order": 5
    }
]


@router.get("/guide")
async def get_guide_sections(
    claims: Optional[AuthClaims] = Depends(optional_auth)
):
    """
    Get all guide sections.
    
    Available to all users (authenticated and unauthenticated).
    Returns complete guide content.
    """
    return {
        "sections": GUIDE_SECTIONS,
        "total": len(GUIDE_SECTIONS)
    }


@router.get("/guide/{slug}")
async def get_guide_section(
    slug: str,
    claims: Optional[AuthClaims] = Depends(optional_auth)
):
    """
    Get a specific guide section by slug.
    
    Available to all users.
    """
    section = next((s for s in GUIDE_SECTIONS if s["slug"] == slug), None)
    
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Guide section '{slug}' not found"
        )
    
    return section


@router.get("/faq")
async def get_faq(
    category: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    claims: Optional[AuthClaims] = Depends(optional_auth)
):
    """
    Get FAQ items with optional filtering.
    
    Available to all users (authenticated and unauthenticated).
    
    Query Parameters:
    - category: Filter by category (tfr, contributi, tassazione, rendimenti)
    - search: Search in questions and answers
    """
    items = FAQ_ITEMS
    
    if category:
        items = [f for f in items if f["category"] == category.lower()]
    
    if search:
        search_lower = search.lower()
        items = [
            f for f in items 
            if search_lower in f["question"].lower() or search_lower in f["answer"].lower()
        ]
    
    return {
        "faq": items,
        "total": len(items),
        "categories": list(set(f["category"] for f in FAQ_ITEMS))
    }


@router.get("/faq/{faq_id}")
async def get_faq_item(
    faq_id: str,
    claims: Optional[AuthClaims] = Depends(optional_auth)
):
    """
    Get a specific FAQ item.
    
    Available to all users.
    """
    item = next((f for f in FAQ_ITEMS if f["id"] == faq_id), None)
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"FAQ item '{faq_id}' not found"
        )
    
    return item


@router.get("/glossary")
async def get_glossary(
    letter: Optional[str] = Query(default=None, max_length=1),
    claims: Optional[AuthClaims] = Depends(optional_auth)
):
    """
    Get glossary of pension fund terms.
    
    Available to all users.
    """
    # Mock glossary
    glossary = [
        {
            "term": "Previdenza Complementare",
            "definition": "Sistema di risparmio previdenziale integrativo rispetto alla pensione pubblica obbligatoria.",
            "letter": "P"
        },
        {
            "term": "TFR",
            "definition": "Trattamento di Fine Rapporto - accantonamento annuale pari al 6,91% della retribuzione lorda.",
            "letter": "T"
        },
        {
            "term": "Fondo Pensione Aperto (FPA)",
            "definition": "Fondo gestito da società di gestione del risparmio, banche o assicurazioni.",
            "letter": "F"
        },
        {
            "term": "Fondo Pensione Negoziale (FPN)",
            "definition": "Fondo istituito tramite contrattazione collettiva tra rappresentanti dei lavoratori e datori di lavoro.",
            "letter": "F"
        },
        {
            "term": "PIP",
            "definition": "Piano Individuale Pensionistico - forma pensionistica complementare individuale.",
            "letter": "P"
        }
    ]
    
    if letter:
        glossary = [g for g in glossary if g["letter"] == letter.upper()]
    
    return {
        "terms": glossary,
        "total": len(glossary),
        "letters": sorted(list(set(g["letter"] for g in glossary)))
    }


@router.get("/resources")
async def get_resources(
    claims: Optional[AuthClaims] = Depends(optional_auth)
):
    """
    Get additional resources and external links.
    
    Available to all users.
    """
    return {
        "resources": [
            {
                "title": "COVIP - Commissione di Vigilanza sui Fondi Pensione",
                "description": "Sito ufficiale dell'autorità di vigilanza italiana",
                "url": "https://www.covip.it",
                "type": "official"
            },
            {
                "title": "Guida COVIP alla Previdenza Complementare",
                "description": "Guida completa pubblicata dall'autorità di vigilanza",
                "url": "https://www.covip.it/per-i-cittadini/guida-introduttiva",
                "type": "guide"
            },
            {
                "title": "Calcolatore INPS",
                "description": "Strumento per calcolare la pensione pubblica",
                "url": "https://www.inps.it",
                "type": "tool"
            }
        ]
    }


@router.post("/feedback")
async def submit_content_feedback(
    content_id: str,
    rating: int = Query(..., ge=1, le=5),
    comment: Optional[str] = None,
    claims: AuthClaims = Depends(auth_required)
):
    """
    Submit feedback on guide/FAQ content.
    
    Requires: Authentication (any role)
    
    Helps improve content quality based on user feedback.
    """
    if rating < 1 or rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be between 1 and 5"
        )
    
    # In production, save to database
    logger.info(f"User {claims.sub} rated content {content_id} with {rating} stars")
    
    return {
        "success": True,
        "message": "Thank you for your feedback!"
    }


@router.get("/search")
async def search_content(
    q: str = Query(..., min_length=3, description="Search query"),
    claims: Optional[AuthClaims] = Depends(optional_auth)
):
    """
    Search across guides, FAQ, and glossary.
    
    Available to all users.
    """
    q_lower = q.lower()
    
    # Search in guides
    guide_results = [
        {"type": "guide", "id": s["id"], "title": s["title"], "slug": s["slug"]}
        for s in GUIDE_SECTIONS
        if q_lower in s["title"].lower() or q_lower in s["content"].lower()
    ]
    
    # Search in FAQ
    faq_results = [
        {"type": "faq", "id": f["id"], "question": f["question"], "category": f["category"]}
        for f in FAQ_ITEMS
        if q_lower in f["question"].lower() or q_lower in f["answer"].lower()
    ]
    
    return {
        "query": q,
        "results": {
            "guides": guide_results,
            "faq": faq_results
        },
        "total": len(guide_results) + len(faq_results)
    }
