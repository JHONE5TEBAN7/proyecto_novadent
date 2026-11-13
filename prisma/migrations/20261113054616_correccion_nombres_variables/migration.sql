-- Recreate the empty database with English columns and plural table names.
-- The previous failed attempt may have left either naming style behind.

ALTER TABLE IF EXISTS "appointments" DROP CONSTRAINT IF EXISTS "appointments_servicio_id_fkey";
ALTER TABLE IF EXISTS "appointments" DROP CONSTRAINT IF EXISTS "appointments_usuario_id_fkey";

DROP TABLE IF EXISTS "Appointment";
DROP TABLE IF EXISTS "appointments";
DROP TABLE IF EXISTS "User";
DROP TABLE IF EXISTS "users";
DROP TABLE IF EXISTS "Service";
DROP TABLE IF EXISTS "services";
DROP TABLE IF EXISTS "Dentist";
DROP TABLE IF EXISTS "dentists";
DROP TABLE IF EXISTS "Patient";
DROP TABLE IF EXISTS "patients";
DROP TYPE IF EXISTS "UserRole";

CREATE TYPE "UserRole" AS ENUM ('admin', 'doctor', 'receptionist', 'patient');

CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'patient',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT,
    "birthDate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "services" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "durationMin" INTEGER,
    "price" DOUBLE PRECISION,
    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "appointments" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "dentists" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dentists_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "patients" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "documents" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "dentists_email_key" ON "dentists"("email");
CREATE UNIQUE INDEX "patients_documents_key" ON "patients"("documents");
CREATE UNIQUE INDEX "patients_email_key" ON "patients"("email");

ALTER TABLE "appointments" ADD CONSTRAINT "appointments_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_serviceId_fkey"
    FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
