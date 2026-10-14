BEGIN;

INSERT INTO tecnicos (nombre, cargo, correo, telefono, activo)
SELECT seed.nombre, seed.cargo, seed.correo, seed.telefono, seed.activo
FROM (VALUES
  ('Jairo Simancas Cogollo', 'Técnico TI', 'jsimancasc14@gmail.com', '3006051812', 1),
  ('Juan Diaz Pardo', 'Técnico TI', 'juancadg007@gmail.com', '3002018036', 1)
) AS seed(nombre, cargo, correo, telefono, activo)
WHERE NOT EXISTS (
  SELECT 1
  FROM tecnicos
  WHERE lower(trim(tecnicos.nombre)) = lower(trim(seed.nombre))
);

COMMIT;
