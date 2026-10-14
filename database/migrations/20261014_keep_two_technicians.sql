BEGIN;

INSERT INTO tecnicos (nombre, cargo, correo, telefono, activo)
VALUES
  ('Jairo Simancas Cogollo', 'Técnico TI', 'jsimancasc14@gmail.com', '3006051812', 1),
  ('Juan Diaz Pardo', 'Técnico TI', 'juancadg007@gmail.com', '3002018036', 1)
ON CONFLICT (nombre) DO UPDATE SET
  cargo = EXCLUDED.cargo,
  correo = EXCLUDED.correo,
  telefono = EXCLUDED.telefono,
  activo = EXCLUDED.activo;

DELETE FROM tecnicos
WHERE nombre NOT IN ('Jairo Simancas Cogollo', 'Juan Diaz Pardo');

COMMIT;
