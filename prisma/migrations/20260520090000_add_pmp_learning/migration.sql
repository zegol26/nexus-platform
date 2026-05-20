CREATE TABLE "PmpIttoProcess" (
    "id" TEXT NOT NULL,
    "processName" TEXT NOT NULL,
    "processGroup" TEXT NOT NULL,
    "knowledgeArea" TEXT NOT NULL,
    "domain" TEXT,
    "approach" TEXT NOT NULL DEFAULT 'predictive',
    "examVersion" TEXT NOT NULL DEFAULT 'current',
    "purpose" TEXT NOT NULL,
    "whenToUse" TEXT,
    "simpleExample" TEXT,
    "agileHybridNote" TEXT,
    "commonPitfall" TEXT,
    "studyTip" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PmpIttoProcess_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PmpIttoItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "simpleExample" TEXT,
    "examTip" TEXT,
    "relatedTerms" TEXT[],
    "examVersion" TEXT NOT NULL DEFAULT 'both',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "inputForId" TEXT,
    "toolForId" TEXT,
    "outputForId" TEXT,

    CONSTRAINT "PmpIttoItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PmpGlossaryTerm" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "acronym" TEXT,
    "category" TEXT,
    "definition" TEXT NOT NULL,
    "simpleMeaning" TEXT,
    "example" TEXT,
    "pmpMindset" TEXT,
    "relatedTerms" TEXT[],
    "approach" TEXT NOT NULL DEFAULT 'general',
    "examVersion" TEXT NOT NULL DEFAULT 'both',
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PmpGlossaryTerm_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PmpKnowledgeArticle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "domain" TEXT,
    "approach" TEXT NOT NULL DEFAULT 'general',
    "examVersion" TEXT NOT NULL DEFAULT 'both',
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "keyTakeaways" TEXT[],
    "examples" JSONB,
    "relatedTerms" TEXT[],
    "studyTip" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PmpKnowledgeArticle_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PmpIttoProcess_processName_examVersion_key" ON "PmpIttoProcess"("processName", "examVersion");
CREATE INDEX "PmpIttoProcess_processGroup_idx" ON "PmpIttoProcess"("processGroup");
CREATE INDEX "PmpIttoProcess_knowledgeArea_idx" ON "PmpIttoProcess"("knowledgeArea");
CREATE INDEX "PmpIttoProcess_examVersion_idx" ON "PmpIttoProcess"("examVersion");
CREATE INDEX "PmpIttoProcess_isActive_idx" ON "PmpIttoProcess"("isActive");

CREATE INDEX "PmpIttoItem_name_idx" ON "PmpIttoItem"("name");
CREATE INDEX "PmpIttoItem_type_idx" ON "PmpIttoItem"("type");
CREATE INDEX "PmpIttoItem_inputForId_idx" ON "PmpIttoItem"("inputForId");
CREATE INDEX "PmpIttoItem_toolForId_idx" ON "PmpIttoItem"("toolForId");
CREATE INDEX "PmpIttoItem_outputForId_idx" ON "PmpIttoItem"("outputForId");

CREATE UNIQUE INDEX "PmpGlossaryTerm_term_examVersion_key" ON "PmpGlossaryTerm"("term", "examVersion");
CREATE INDEX "PmpGlossaryTerm_category_idx" ON "PmpGlossaryTerm"("category");
CREATE INDEX "PmpGlossaryTerm_approach_idx" ON "PmpGlossaryTerm"("approach");
CREATE INDEX "PmpGlossaryTerm_examVersion_idx" ON "PmpGlossaryTerm"("examVersion");
CREATE INDEX "PmpGlossaryTerm_difficulty_idx" ON "PmpGlossaryTerm"("difficulty");
CREATE INDEX "PmpGlossaryTerm_isActive_idx" ON "PmpGlossaryTerm"("isActive");

CREATE UNIQUE INDEX "PmpKnowledgeArticle_slug_key" ON "PmpKnowledgeArticle"("slug");
CREATE INDEX "PmpKnowledgeArticle_category_idx" ON "PmpKnowledgeArticle"("category");
CREATE INDEX "PmpKnowledgeArticle_domain_idx" ON "PmpKnowledgeArticle"("domain");
CREATE INDEX "PmpKnowledgeArticle_approach_idx" ON "PmpKnowledgeArticle"("approach");
CREATE INDEX "PmpKnowledgeArticle_examVersion_idx" ON "PmpKnowledgeArticle"("examVersion");
CREATE INDEX "PmpKnowledgeArticle_isActive_idx" ON "PmpKnowledgeArticle"("isActive");

ALTER TABLE "PmpIttoItem" ADD CONSTRAINT "PmpIttoItem_inputForId_fkey" FOREIGN KEY ("inputForId") REFERENCES "PmpIttoProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PmpIttoItem" ADD CONSTRAINT "PmpIttoItem_toolForId_fkey" FOREIGN KEY ("toolForId") REFERENCES "PmpIttoProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PmpIttoItem" ADD CONSTRAINT "PmpIttoItem_outputForId_fkey" FOREIGN KEY ("outputForId") REFERENCES "PmpIttoProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE;
