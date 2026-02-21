from typing import Any, Sequence
from pydantic import BaseModel
from app.models.user import User

def filter_response(
    data: BaseModel | Sequence[BaseModel],
    user: User,
    role_excludes: dict[str, set[str]]
) -> dict[str, Any] | list[dict[str, Any]]:
    """
    Given a pydantic model or sequence of models, and a dictionary detailing 
    which fields to exclude for which roles, this function returns a dict 
    (or list of dicts) ready to be returned by a FastAPI route WITHOUT a 
    strict response_model, or with response_model=Any.
    
    Example:
        role_excludes = {
            "dispatcher": {"acquisition_cost"},
            "safety_officer": {"acquisition_cost", "odometer_km"}
        }
    """
    role_name = user.role.name if user.role else "guest"
    excludes = role_excludes.get(role_name, set())
    
    if isinstance(data, list):
        return [item.model_dump(exclude=excludes) for item in data]
    else:
        return data.model_dump(exclude=excludes)
