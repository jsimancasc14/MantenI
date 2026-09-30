<?php
require_once __DIR__ . '/backend/db.php';

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

requireAuth();
requireRole(['administrador', 'director']);

function normalizarHeader(string $texto): string
{
    $texto = strtr($texto, [
        'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u', 'ü' => 'u', 'ñ' => 'n',
        'Á' => 'A', 'É' => 'E', 'Í' => 'I', 'Ó' => 'O', 'Ú' => 'U', 'Ü' => 'U', 'Ñ' => 'N',
    ]);
    $normalizado = preg_replace('/[^a-z0-9]+/i', '_', $texto) ?? '';
    return trim(strtolower($normalizado), '_');
}

function excelCellToIndex(string $cellRef): int
{
    if ($cellRef === '') {
        return 1;
    }

    preg_match('/^([A-Z]+)([0-9]+)$/i', strtoupper($cellRef), $matches);
    if (!$matches) {
        return 1;
    }

    $letters = $matches[1];
    $value = 0;
    foreach (str_split($letters) as $char) {
        $value = ($value * 26) + (ord($char) - 64);
    }

    return $value;
}

function leerArchivoXlsx(string $ruta): array
{
    $zip = new ZipArchive();
    if ($zip->open($ruta) !== true) {
        throw new RuntimeException('No se pudo abrir el archivo Excel.');
    }

    try {
        $workbookXml = $zip->getFromName('xl/workbook.xml');
        $relsXml = $zip->getFromName('xl/_rels/workbook.xml.rels');
        if ($workbookXml === false || $relsXml === false) {
            throw new RuntimeException('El archivo Excel no tiene formato de libro válido.');
        }

        $sharedStrings = [];
        $sharedStringsXml = $zip->getFromName('xl/sharedStrings.xml');
        if ($sharedStringsXml !== false) {
            $sharedDoc = new DOMDocument();
            if ($sharedDoc->loadXML($sharedStringsXml) === true) {
                foreach ($sharedDoc->getElementsByTagName('si') as $item) {
                    $text = '';
                    foreach ($item->getElementsByTagName('t') as $node) {
                        $text .= $node->textContent;
                    }
                    $sharedStrings[] = trim($text);
                }
            }
        }

        $workbookDoc = new DOMDocument();
        if ($workbookDoc->loadXML($workbookXml) !== true) {
            throw new RuntimeException('No se pudo leer el libro Excel.');
        }
        $workbookXPath = new DOMXPath($workbookDoc);
        $workbookXPath->registerNamespace('main', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main');
        $workbookXPath->registerNamespace('rel', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships');
        $sheetNodes = $workbookXPath->query('/main:workbook/main:sheets/main:sheet');
        if (!$sheetNodes || $sheetNodes->length === 0) {
            throw new RuntimeException('No se encontró ninguna hoja en el archivo Excel.');
        }

        $relsDoc = new DOMDocument();
        if ($relsDoc->loadXML($relsXml) !== true) {
            throw new RuntimeException('No se pudo leer la relación de las hojas Excel.');
        }
        $relsXPath = new DOMXPath($relsDoc);
        $relsXPath->registerNamespace('pkg', 'http://schemas.openxmlformats.org/package/2006/relationships');
        $relationships = [];
        foreach ($relsXPath->query('/pkg:Relationships/pkg:Relationship') as $relationship) {
            $relationships[$relationship->getAttribute('Id')] = $relationship->getAttribute('Target');
        }

        $sheets = [];
        foreach ($sheetNodes as $sheetNode) {
            $relationshipId = $sheetNode->getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
            $sheetTarget = $relationships[$relationshipId] ?? '';
            if ($sheetTarget === '') {
                continue;
            }

            $sheetTarget = str_replace('\\', '/', $sheetTarget);
            $sheetTarget = preg_replace('#^/+#', '', $sheetTarget) ?? $sheetTarget;
            if (strpos($sheetTarget, 'xl/') !== 0) {
                $sheetTarget = 'xl/' . ltrim($sheetTarget, '/');
            }
            $normalizedParts = [];
            foreach (explode('/', $sheetTarget) as $part) {
                if ($part === '' || $part === '.') {
                    continue;
                }
                if ($part === '..') {
                    array_pop($normalizedParts);
                    continue;
                }
                $normalizedParts[] = $part;
            }
            $sheetXml = $zip->getFromName(implode('/', $normalizedParts));
            if ($sheetXml === false) {
                continue;
            }

            $sheetDoc = new DOMDocument();
            if ($sheetDoc->loadXML($sheetXml) !== true) {
                continue;
            }
            $sheetXPath = new DOMXPath($sheetDoc);
            $sheetXPath->registerNamespace('main', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main');
            $rows = [];
            foreach ($sheetXPath->query('/main:worksheet/main:sheetData/main:row') as $rowNode) {
                $values = [];
                foreach ($sheetXPath->query('./main:c', $rowNode) as $cellNode) {
                    $colIndex = excelCellToIndex($cellNode->getAttribute('r')) - 1;
                    while (count($values) <= $colIndex) {
                        $values[] = '';
                    }

                    $cellType = $cellNode->getAttribute('t');
                    if ($cellType === 's') {
                        $valueNode = $sheetXPath->query('./main:v', $cellNode)->item(0);
                        $value = $valueNode ? ($sharedStrings[(int) trim($valueNode->textContent)] ?? '') : '';
                    } elseif ($cellType === 'inlineStr') {
                        $valueNode = $sheetXPath->query('./main:is/main:t', $cellNode)->item(0);
                        $value = $valueNode ? trim($valueNode->textContent) : '';
                    } else {
                        $valueNode = $sheetXPath->query('./main:v', $cellNode)->item(0);
                        $value = $valueNode ? trim($valueNode->textContent) : '';
                    }
                    $values[$colIndex] = (string) $value;
                }
                $rows[] = ['numero' => (int) $rowNode->getAttribute('r'), 'valores' => $values];
            }
            $sheets[] = ['nombre' => $sheetNode->getAttribute('name'), 'filas' => $rows];
        }

        return $sheets;
    } finally {
        $zip->close();
    }
}

function valorPorAlias(array $registro, array $aliasList): string
{
    foreach ($aliasList as $alias) {
        $target = normalizarHeader((string) $alias);
        foreach ($registro as $header => $valor) {
            if (normalizarHeader((string) $header) === $target) {
                return trim((string) $valor);
            }
        }
    }

    foreach ($registro as $header => $valor) {
        $headerNorm = normalizarHeader((string) $header);
        foreach ($aliasList as $alias) {
            $aliasNorm = normalizarHeader((string) $alias);
            if ($headerNorm === $aliasNorm || str_contains($headerNorm, $aliasNorm) || str_contains($aliasNorm, $headerNorm)) {
                $valorLimpio = trim((string) $valor);
                if ($valorLimpio !== '') {
                    return $valorLimpio;
                }
            }
        }
    }

    return '';
}

function detectarFilaEncabezados(array $filas): ?int
{
    $campos = [
        'codigo', 'cod', 'id', 'identificacion', 'equipo', 'marca', 'fabricante', 'modelo', 'serial', 'serie',
        'tipo', 'tipo_equipo', 'dependencia', 'area', 'oficina', 'seccion', 'ubicacion', 'localizacion', 'sede',
        'no', 'nro', 'numero', 'num', 'consecutivo',
    ];

    foreach (array_slice($filas, 0, 30, true) as $indice => $fila) {
        $encabezados = array_map('normalizarHeader', $fila['valores']);
        $coincidencias = array_unique(array_filter($encabezados, fn($encabezado) => in_array($encabezado, $campos, true)));
        if (count($coincidencias) >= 3) {
            return $indice;
        }
    }

    return null;
}

function importarEquiposDesdeXlsx(string $ruta): array
{
    $hojas = leerArchivoXlsx($ruta);
    if (empty($hojas)) {
        return ['importados' => 0, 'errores' => ['El archivo no tiene filas.']];
    }

    $db = getDb();
    $insertados = 0;
    $errores = [];

    foreach ($hojas as $indiceHoja => $hoja) {
        $filas = $hoja['filas'];
        $indiceEncabezados = detectarFilaEncabezados($filas);
        if ($indiceEncabezados === null) {
            continue;
        }

        $encabezados = array_map('strval', $filas[$indiceEncabezados]['valores']);
        $secuencia = 0;
        foreach (array_slice($filas, $indiceEncabezados + 1) as $fila) {
            $registro = [];
            foreach ($encabezados as $indice => $titulo) {
                if (trim($titulo) === '') {
                    continue;
                }
                $registro[$titulo] = $fila['valores'][$indice] ?? '';
            }

            $filaLimpia = array_filter($registro, fn($valor) => trim((string) $valor) !== '');
            if ($filaLimpia === []) {
                continue;
            }

            $marca = valorPorAlias($registro, ['marca', 'fabricante', 'marca_equipo', 'fabricante_equipo']);
            $modelo = valorPorAlias($registro, ['modelo', 'modelo_equipo', 'modelo_dispositivo']);
            $serial = valorPorAlias($registro, ['serial', 'serie', 'numero_serie', 'n_serie', 'num_serie']);
            $codigo = valorPorAlias($registro, ['codigo', 'cod', 'id', 'identificacion', 'equipo_codigo', 'codigo_equipo', 'codigo_inventario']);
            if ($marca === '' && $modelo === '' && $serial === '' && $codigo === '') {
                continue;
            }

            $secuencia++;
            if ($codigo === '') {
                $numeroListado = valorPorAlias($registro, ['no', 'nro', 'numero', 'num', 'consecutivo', 'item']);
                $numero = ctype_digit($numeroListado) ? (int) $numeroListado : $fila['numero'];
                $codigo = 'EQ-S' . str_pad((string) ($indiceHoja + 1), 2, '0', STR_PAD_LEFT) . '-' . str_pad((string) $numero, 4, '0', STR_PAD_LEFT);
            }

            $tipo = valorPorAlias($registro, ['tipo', 'tipo_equipo', 'clase', 'categoria', 'equipo_tipo', 'categoria_equipo', 'nombre_equipo']);
            $numeroInterno = valorPorAlias($registro, ['numero_interno', 'num_interno', 'n_interno', 'interno', 'inventario_interno', 'codigo_interno']);
            $dependencia = valorPorAlias($registro, ['dependencia', 'area', 'area_responsable', 'oficina', 'unidad', 'departamento', 'seccion', 'dependencia_ubicacion']);
            $responsable = valorPorAlias($registro, ['responsable', 'funcionario_responsable', 'encargado', 'usuario', 'titular', 'usuario_asignado', 'persona_responsable']);
            $ubicacion = valorPorAlias($registro, ['ubicacion', 'ubicación', 'sede', 'lugar', 'direccion', 'dirección', 'sitio', 'localizacion']);
            $estado = valorPorAlias($registro, ['estado', 'situacion', 'situación', 'condicion', 'condición', 'estado_equipo']);
            $procesador = valorPorAlias($registro, ['procesador', 'cpu', 'microprocesador', 'tipo_procesador']);
            $ram = valorPorAlias($registro, ['ram', 'memoria', 'memoria_ram', 'cantidad_ram', 'tamaño_ram']);
            $disco = valorPorAlias($registro, ['disco', 'almacenamiento', 'ssd', 'hdd', 'disco_duro', 'tipo_disco']);
            $sistemaOperativo = valorPorAlias($registro, ['sistema_operativo', 'sistema', 'so', 'os', 'operating_system', 'windows_version']);
            $office = valorPorAlias($registro, ['office', 'suite', 'office_suite', 'microsoft_office', 'paquete_office']);
            $programas = valorPorAlias($registro, ['programas', 'software', 'aplicativos', 'programas_instalados', 'apps', 'software_instalado']);
            $observaciones = valorPorAlias($registro, ['observaciones', 'descripcion', 'descripción', 'detalle', 'nota', 'comentarios', 'comentario']);

            $sql = 'INSERT INTO equipos
                (codigo, tipo, marca, modelo, serial, numero_interno, dependencia, responsable, ubicacion, estado, procesador, ram, disco, sistema_operativo, office, programas, observaciones)
                VALUES (:codigo, :tipo, :marca, :modelo, :serial, :numero_interno, :dependencia, :responsable, :ubicacion, :estado, :procesador, :ram, :disco, :sistema_operativo, :office, :programas, :observaciones)
                ON DUPLICATE KEY UPDATE
                tipo = VALUES(tipo), marca = VALUES(marca), modelo = VALUES(modelo), serial = VALUES(serial), numero_interno = VALUES(numero_interno),
                dependencia = VALUES(dependencia), responsable = VALUES(responsable), ubicacion = VALUES(ubicacion), estado = VALUES(estado),
                procesador = VALUES(procesador), ram = VALUES(ram), disco = VALUES(disco), sistema_operativo = VALUES(sistema_operativo),
                office = VALUES(office), programas = VALUES(programas), observaciones = VALUES(observaciones)';

            try {
                $stmt = $db->prepare($sql);
                $stmt->execute([
                    ':codigo' => trim($codigo),
                    ':tipo' => $tipo !== '' ? trim($tipo) : 'Computador',
                    ':marca' => $marca !== '' ? trim($marca) : 'Sin marca',
                    ':modelo' => $modelo !== '' ? trim($modelo) : 'Sin modelo',
                    ':serial' => $serial !== '' ? trim($serial) : 'SIN-SERIAL-' . $codigo,
                    ':numero_interno' => $numeroInterno !== '' ? trim($numeroInterno) : 'SIN-INV-' . $codigo,
                    ':dependencia' => $dependencia !== '' ? trim($dependencia) : 'Sin dependencia',
                    ':responsable' => $responsable !== '' ? trim($responsable) : 'Por asignar',
                    ':ubicacion' => $ubicacion !== '' ? trim($ubicacion) : 'Sin ubicación',
                    ':estado' => $estado !== '' ? trim($estado) : 'Operativo',
                    ':procesador' => $procesador !== '' ? trim($procesador) : null,
                    ':ram' => $ram !== '' ? trim($ram) : null,
                    ':disco' => $disco !== '' ? trim($disco) : null,
                    ':sistema_operativo' => $sistemaOperativo !== '' ? trim($sistemaOperativo) : null,
                    ':office' => $office !== '' ? trim($office) : null,
                    ':programas' => $programas !== '' ? trim($programas) : null,
                    ':observaciones' => $observaciones !== '' ? trim($observaciones) : null,
                ]);
                $insertados++;
            } catch (Throwable $exception) {
                $errores[] = 'Hoja ' . $hoja['nombre'] . ', fila ' . $fila['numero'] . ': ' . $exception->getMessage();
            }
        }
    }

    return ['importados' => $insertados, 'errores' => $errores];
}

$mensaje = '';
$mensajeTipo = 'success';
$estadisticas = [
    'equipos' => (int) getDb()->query('SELECT COUNT(*) FROM equipos')->fetchColumn(),
    'ordenes' => (int) getDb()->query('SELECT COUNT(*) FROM ordenes_trabajo')->fetchColumn(),
    'preventivos' => (int) getDb()->query('SELECT COUNT(*) FROM preventivos')->fetchColumn(),
];

if (isset($_GET['exportar']) && $_GET['exportar'] === 'equipos') {
    $stmt = getDb()->query('SELECT codigo, tipo, marca, modelo, serial, numero_interno, dependencia, responsable, ubicacion, estado, procesador, ram, disco, sistema_operativo, office, programas, observaciones FROM equipos ORDER BY id ASC');
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $headers = ['codigo', 'tipo', 'marca', 'modelo', 'serial', 'numero_interno', 'dependencia', 'responsable', 'ubicacion', 'estado', 'procesador', 'ram', 'disco', 'sistema_operativo', 'office', 'programas', 'observaciones'];

    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="inventario_mantenti_' . date('Y-m-d') . '.csv"');
    header('Cache-Control: no-cache, no-store, must-revalidate');
    header('Pragma: no-cache');
    header('Expires: 0');

    $output = fopen('php://output', 'w');
    fwrite($output, "\xEF\xBB\xBF");
    fputcsv($output, $headers, ';');
    foreach ($rows as $row) {
        $line = [];
        foreach ($headers as $header) {
            $value = $row[$header] ?? '';
            $line[] = is_string($value) ? str_replace(["\r", "\n"], [' ', ' '], $value) : $value;
        }
        fputcsv($output, $line, ';');
    }
    fclose($output);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['archivo']) && $_FILES['archivo']['error'] === UPLOAD_ERR_OK) {
    $tmpFile = $_FILES['archivo']['tmp_name'];
    $extension = strtolower(pathinfo($_FILES['archivo']['name'], PATHINFO_EXTENSION));

    if (!in_array($extension, ['xlsx', 'xls'], true)) {
        $mensaje = 'El archivo debe ser un Excel válido (.xlsx o .xls).';
        $mensajeTipo = 'error';
    } else {
        try {
            $resultado = importarEquiposDesdeXlsx($tmpFile);
            $mensaje = 'Se importaron ' . $resultado['importados'] . ' registros desde Excel.';
            if (!empty($resultado['errores'])) {
                $mensaje .= ' Algunas filas fallaron: ' . implode(' | ', array_slice($resultado['errores'], 0, 3));
            }
            $estadisticas['equipos'] = (int) getDb()->query('SELECT COUNT(*) FROM equipos')->fetchColumn();
        } catch (Throwable $exception) {
            $mensaje = 'No se pudo importar el archivo: ' . $exception->getMessage();
            $mensajeTipo = 'error';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - ManténTI Arjona</title>
    <link rel="stylesheet" href="estilos.css">
    <style>
        body { padding: 24px; }
        .admin-container { max-width: 1200px; margin: 0 auto; }
        .admin-card { background: rgba(255,255,255,0.92); border: 1px solid var(--borde); border-radius: 24px; padding: 24px; box-shadow: var(--shadow); }
        .admin-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin: 24px 0; }
        .stat-box { padding: 18px; border-radius: 16px; background: linear-gradient(135deg, #edf4ff, #fff); border: 1px solid rgba(11,61,145,0.08); }
        .alerta { padding: 14px 16px; border-radius: 12px; margin-bottom: 18px; }
        .alerta.success { background: #ebfff4; color: #0a6d43; border: 1px solid #9ce4b7; }
        .alerta.error { background: #fff1f1; color: #8b2d2d; border: 1px solid #f0b5b5; }
        .admin-form { display: flex; gap: 16px; flex-wrap: wrap; align-items: end; }
        .admin-form input[type="file"] { padding: 10px; border-radius: 12px; background: #f6f9ff; border: 1px solid var(--borde); }
        .admin-actions { display: flex; gap: 12px; align-items: center; margin-top: 18px; }
        .btn-link { display: inline-flex; align-items: center; justify-content: center; text-decoration: none; }
    </style>
</head>
<body>
    <div class="admin-container">
        <div class="admin-card">
            <div class="header-content">
                <div>
                    <span class="eyebrow">Administración</span>
                    <h1>Importación de base de datos</h1>
                </div>
                <div class="admin-actions">
                    <a href="index.html" class="btn-primario btn-link">Volver a la app</a>
                    <a href="admin.php?exportar=equipos" class="btn-primario btn-link">Exportar inventario a Excel</a>
                </div>
            </div>

            <?php if ($mensaje !== ''): ?>
                <div class="alerta <?= ($mensajeTipo === 'error') ? 'error' : 'success'; ?>"><?= htmlspecialchars($mensaje, ENT_QUOTES, 'UTF-8'); ?></div>
            <?php endif; ?>

            <div class="admin-row">
                <div class="stat-box">
                    <span class="eyebrow">Equipos</span>
                    <strong class="numero"><?= $estadisticas['equipos']; ?></strong>
                </div>
                <div class="stat-box">
                    <span class="eyebrow">Órdenes</span>
                    <strong class="numero"><?= $estadisticas['ordenes']; ?></strong>
                </div>
                <div class="stat-box">
                    <span class="eyebrow">Preventivos</span>
                    <strong class="numero"><?= $estadisticas['preventivos']; ?></strong>
                </div>
            </div>

            <h2>Subir Excel institucional</h2>
            <form class="admin-form" method="POST" enctype="multipart/form-data">
                <input type="file" name="archivo" accept=".xlsx" required>
                <button type="submit" class="btn-primario">Importar datos</button>
            </form>

            <div style="margin-top: 18px; color: var(--texto-suave);">
                <p>El importador detecta los encabezados aunque haya títulos antes y procesa todas las hojas del libro.</p>
                <p>Reconoce <strong>Marca, Serial, Modelo, Localización y Dependencia</strong>; genera un código único por sede cuando el archivo solo trae el número de fila.</p>
            </div>
        </div>
    </div>
</body>
</html>
