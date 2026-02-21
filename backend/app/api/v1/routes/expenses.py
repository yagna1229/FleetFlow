"""Trip expenses API. RBAC: manager + financial_analyst."""

from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models.user import User
from app.schemas.expense import ExpenseCreate, ExpenseOut
from app.services.expense_service import ExpenseService
from app.utils.pagination import PaginationParams

router = APIRouter(prefix="/expenses", tags=["Expenses"])


@router.post("/", response_model=ExpenseOut, status_code=201)
async def create_expense(
    data: ExpenseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager")),
):
    svc = ExpenseService(db)
    return await svc.create_expense(data, logged_by=current_user.id)


@router.get("/", response_model=list[ExpenseOut])
async def list_expenses(
    response: Response,
    trip_id: int | None = None,
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager", "financial_analyst")),
):
    svc = ExpenseService(db)
    items, total = await svc.list_expenses(
        offset=pagination.offset, limit=pagination.limit, trip_id=trip_id
    )
    response.headers["X-Total-Count"] = str(total)
    response.headers["X-Page"] = str(pagination.page)
    response.headers["X-Per-Page"] = str(pagination.per_page)
    return items


@router.get("/{expense_id}", response_model=ExpenseOut)
async def get_expense(
    expense_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager", "financial_analyst")),
):
    svc = ExpenseService(db)
    return await svc.get_expense(expense_id)
