WITH base_questions AS (
  SELECT *
  FROM "AssessmentQuestion"
  WHERE "sourceKey" !~ '-v[2-5]$'
),
variant_numbers AS (
  SELECT 2 AS variant_number
  UNION ALL SELECT 3
  UNION ALL SELECT 4
  UNION ALL SELECT 5
),
variants AS (
  SELECT
    b.*,
    v.variant_number,
    b."sourceKey" || '-v' || v.variant_number AS variant_source_key,
    CASE
      WHEN b."skill" = 'reading' AND v.variant_number = 2 THEN 'Fokus: bagian mana yang sesuai dengan isi bacaan?'
      WHEN b."skill" = 'reading' AND v.variant_number = 3 THEN 'Fokus: pilih pernyataan yang paling didukung oleh teks.'
      WHEN b."skill" = 'reading' AND v.variant_number = 4 THEN 'Fokus: cek detail waktu, tempat, alasan, atau tindakan di teks.'
      WHEN b."skill" = 'reading' AND v.variant_number = 5 THEN 'Fokus: jawaban harus bisa dibuktikan dari kalimat dalam teks.'
      WHEN b."skill" = 'vocabulary' AND v.variant_number = 2 THEN 'Pilih makna atau bacaan yang paling natural.'
      WHEN b."skill" = 'vocabulary' AND v.variant_number = 3 THEN 'Cocokkan kosakata ini dengan arti Indonesia yang tepat.'
      WHEN b."skill" = 'vocabulary' AND v.variant_number = 4 THEN 'Pilih jawaban yang sesuai dengan kosakata Jepang berikut.'
      WHEN b."skill" = 'vocabulary' AND v.variant_number = 5 THEN 'Perhatikan bentuk katanya, lalu pilih arti/bacaan yang tepat.'
      WHEN b."skill" = 'grammar' AND v.variant_number = 2 THEN 'Pilih bentuk grammar yang membuat kalimat natural.'
      WHEN b."skill" = 'grammar' AND v.variant_number = 3 THEN 'Isi bagian kosong dengan bentuk yang tepat.'
      WHEN b."skill" = 'grammar' AND v.variant_number = 4 THEN 'Perhatikan konteks waktu/nuansa, lalu pilih bentuk yang benar.'
      WHEN b."skill" = 'grammar' AND v.variant_number = 5 THEN 'Pilih jawaban yang membuat kalimat Jepang lengkap dan sopan.'
      WHEN b."skill" = 'particle' AND v.variant_number = 2 THEN 'Isi bagian kosong dengan partikel yang sesuai fungsi kalimat.'
      WHEN b."skill" = 'particle' AND v.variant_number = 3 THEN 'Perhatikan objek, lokasi, waktu, atau arah, lalu pilih partikel.'
      WHEN b."skill" = 'particle' AND v.variant_number = 4 THEN 'Pilih partikel yang membuat hubungan kata menjadi benar.'
      WHEN b."skill" = 'particle' AND v.variant_number = 5 THEN 'Cek konteks kalimat, lalu pilih partikel paling natural.'
      WHEN b."skill" = 'kanji' AND v.variant_number = 2 THEN 'Cocokkan kanji/kata ini dengan bacaan atau makna yang benar.'
      WHEN b."skill" = 'kanji' AND v.variant_number = 3 THEN 'Perhatikan bentuk kanji, lalu pilih jawaban paling tepat.'
      WHEN b."skill" = 'kanji' AND v.variant_number = 4 THEN 'Pilih opsi yang sesuai dengan kanji atau kata berkanji berikut.'
      WHEN b."skill" = 'kanji' AND v.variant_number = 5 THEN 'Gunakan ingatan kosakata, bukan menebak bentuk huruf saja.'
      ELSE 'Pilih jawaban yang paling tepat.'
    END AS variant_hint
  FROM base_questions b
  CROSS JOIN variant_numbers v
),
variant_options AS (
  SELECT
    v.*,
    array_agg(option_value ORDER BY option_order) FILTER (WHERE option_value <> v."correctAnswer") AS distractors
  FROM variants v
  CROSS JOIN LATERAL jsonb_array_elements_text(v."options") WITH ORDINALITY AS option_item(option_value, option_order)
  GROUP BY
    v."id",
    v."level",
    v."skill",
    v."questionType",
    v."prompt",
    v."passage",
    v."options",
    v."correctAnswer",
    v."explanation",
    v."difficulty",
    v."tags",
    v."isActive",
    v."sourceKey",
    v."createdAt",
    v."updatedAt",
    v.variant_number,
    v.variant_source_key,
    v.variant_hint
)
INSERT INTO "AssessmentQuestion" (
  "id",
  "level",
  "skill",
  "questionType",
  "prompt",
  "passage",
  "options",
  "correctAnswer",
  "explanation",
  "difficulty",
  "tags",
  "isActive",
  "sourceKey",
  "createdAt",
  "updatedAt"
)
SELECT
  'aq-' || md5(variant_source_key),
  "level",
  "skill",
  "questionType",
  "prompt" || E'\n' || variant_hint,
  "passage",
  CASE variant_number
    WHEN 2 THEN jsonb_build_array(distractors[1], "correctAnswer", distractors[2], distractors[3])
    WHEN 3 THEN jsonb_build_array(distractors[1], distractors[2], "correctAnswer", distractors[3])
    WHEN 4 THEN jsonb_build_array(distractors[1], distractors[2], distractors[3], "correctAnswer")
    ELSE jsonb_build_array("correctAnswer", distractors[2], distractors[3], distractors[1])
  END,
  "correctAnswer",
  "explanation",
  "difficulty",
  COALESCE("tags", ARRAY[]::TEXT[]) || ARRAY['variant_' || variant_number::TEXT],
  true,
  variant_source_key,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM variant_options
WHERE array_length(distractors, 1) >= 3
ON CONFLICT ("sourceKey") DO UPDATE SET
  "prompt" = EXCLUDED."prompt",
  "options" = EXCLUDED."options",
  "tags" = EXCLUDED."tags",
  "isActive" = true,
  "updatedAt" = CURRENT_TIMESTAMP;
