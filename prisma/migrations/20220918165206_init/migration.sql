-- CreateTable
CREATE TABLE "Authentication" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "serviceName" TEXT NOT NULL,
    "encryptedToken" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Authentication_serviceName_key" ON "Authentication"("serviceName");
