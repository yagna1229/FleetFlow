"""
Fix migration — runs each SQL statement individually (no splitting issues).

Usage:
    cd backend
    venv\Scripts\python migrate_schema.py
"""

import asyncio
from sqlalchemy import text
from app.core.database import engine


STATEMENTS = [
    # 1. Roles table
    """CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description VARCHAR(255)
    )""",

    # 2. Seed roles
    "INSERT INTO roles (name, description) VALUES ('fleet_manager', 'Oversees vehicle health, asset lifecycle, scheduling') ON CONFLICT (name) DO NOTHING",
    "INSERT INTO roles (name, description) VALUES ('dispatcher', 'Creates trips, assigns drivers, validates cargo loads') ON CONFLICT (name) DO NOTHING",
    "INSERT INTO roles (name, description) VALUES ('safety_officer', 'Monitors driver compliance, safety scores') ON CONFLICT (name) DO NOTHING",
    "INSERT INTO roles (name, description) VALUES ('financial_analyst', 'Audits fuel spend, maintenance ROI') ON CONFLICT (name) DO NOTHING",

    # 3. Add missing columns to users
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id INTEGER REFERENCES roles(id)",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code VARCHAR(10)",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()",

    # 4. Enum types (each in a DO block)
    "DO $$ BEGIN CREATE TYPE vehiclestatus AS ENUM ('AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$",
    "DO $$ BEGIN CREATE TYPE driverstatus AS ENUM ('AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$",
    "DO $$ BEGIN CREATE TYPE tripstatus AS ENUM ('DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$",
    "DO $$ BEGIN CREATE TYPE vehicletype AS ENUM ('TRUCK', 'VAN', 'BIKE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$",
    "DO $$ BEGIN CREATE TYPE licensecategory AS ENUM ('TRUCK', 'VAN', 'BIKE', 'ALL'); EXCEPTION WHEN duplicate_object THEN NULL; END $$",
    "DO $$ BEGIN CREATE TYPE expensecategory AS ENUM ('TOLL', 'PARKING', 'PENALTY', 'OTHER'); EXCEPTION WHEN duplicate_object THEN NULL; END $$",

    # 5. Vehicles table
    """CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        model VARCHAR(120),
        vehicle_type vehicletype NOT NULL DEFAULT 'VAN',
        license_plate VARCHAR(30) UNIQUE NOT NULL,
        max_capacity_kg NUMERIC(12,2) NOT NULL,
        odometer_km NUMERIC(14,2) DEFAULT 0,
        acquisition_cost NUMERIC(14,2) DEFAULT 0,
        region VARCHAR(100),
        status vehiclestatus NOT NULL DEFAULT 'AVAILABLE',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    )""",

    # 6. Drivers table
    """CREATE TABLE IF NOT EXISTS drivers (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(150) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(30),
        license_number VARCHAR(50) UNIQUE NOT NULL,
        license_category licensecategory NOT NULL DEFAULT 'VAN',
        license_expiry DATE NOT NULL,
        status driverstatus NOT NULL DEFAULT 'AVAILABLE',
        safety_score INTEGER DEFAULT 100,
        total_trips INTEGER DEFAULT 0,
        completed_trips INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    )""",

    # 7. Trips table
    """CREATE TABLE IF NOT EXISTS trips (
        id SERIAL PRIMARY KEY,
        vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
        driver_id INTEGER NOT NULL REFERENCES drivers(id),
        origin VARCHAR(200) NOT NULL,
        destination VARCHAR(200) NOT NULL,
        cargo_weight_kg NUMERIC(12,2) NOT NULL,
        cargo_description VARCHAR(500),
        status tripstatus NOT NULL DEFAULT 'DRAFT',
        start_odometer NUMERIC(14,2),
        end_odometer NUMERIC(14,2),
        dispatched_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    )""",

    # 8. Maintenance logs table
    """CREATE TABLE IF NOT EXISTS maintenance_logs (
        id SERIAL PRIMARY KEY,
        vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
        service_type VARCHAR(100) NOT NULL,
        description VARCHAR(500),
        cost NUMERIC(12,2) DEFAULT 0,
        service_date DATE,
        completed_date DATE,
        is_completed BOOLEAN DEFAULT FALSE,
        logged_by INTEGER REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW()
    )""",

    # 9. Fuel logs table
    """CREATE TABLE IF NOT EXISTS fuel_logs (
        id SERIAL PRIMARY KEY,
        trip_id INTEGER NOT NULL REFERENCES trips(id),
        vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
        liters NUMERIC(10,2) NOT NULL,
        cost NUMERIC(12,2) NOT NULL,
        fuel_date DATE,
        logged_by INTEGER REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW()
    )""",

    # 10. Trip expenses table
    """CREATE TABLE IF NOT EXISTS trip_expenses (
        id SERIAL PRIMARY KEY,
        trip_id INTEGER NOT NULL REFERENCES trips(id),
        category expensecategory NOT NULL DEFAULT 'OTHER',
        description VARCHAR(300),
        amount NUMERIC(12,2) NOT NULL,
        expense_date DATE,
        logged_by INTEGER REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW()
    )""",

    # 11. Indexes
    "CREATE INDEX IF NOT EXISTS ix_vehicles_status ON vehicles (status)",
    "CREATE INDEX IF NOT EXISTS ix_vehicles_type ON vehicles (vehicle_type)",
    "CREATE INDEX IF NOT EXISTS ix_vehicles_region ON vehicles (region)",
    "CREATE INDEX IF NOT EXISTS ix_drivers_status ON drivers (status)",
    "CREATE INDEX IF NOT EXISTS ix_drivers_license_expiry ON drivers (license_expiry)",
    "CREATE INDEX IF NOT EXISTS ix_trips_status ON trips (status)",
    "CREATE INDEX IF NOT EXISTS ix_trips_vehicle_id ON trips (vehicle_id)",
    "CREATE INDEX IF NOT EXISTS ix_trips_driver_id ON trips (driver_id)",
    "CREATE INDEX IF NOT EXISTS ix_fuel_logs_vehicle_id ON fuel_logs (vehicle_id)",
    "CREATE INDEX IF NOT EXISTS ix_maintenance_logs_vehicle_id ON maintenance_logs (vehicle_id)",
]


async def run_migration():
    async with engine.begin() as conn:
        for i, stmt in enumerate(STATEMENTS, 1):
            try:
                await conn.execute(text(stmt))
                label = stmt.strip().split('\n')[0][:70]
                print(f"  ✓ [{i}/{len(STATEMENTS)}] {label}")
            except Exception as e:
                label = stmt.strip().split('\n')[0][:70]
                print(f"  ⚠ [{i}/{len(STATEMENTS)}] {label} → {e}")

    print(f"\n✅ Migration complete! ({len(STATEMENTS)} statements)")


if __name__ == "__main__":
    asyncio.run(run_migration())
