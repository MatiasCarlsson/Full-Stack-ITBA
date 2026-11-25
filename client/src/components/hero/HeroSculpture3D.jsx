// components/hero/HeroSculpture3D.jsx
// Silla artesanal de autor en Three.js (r187) inspirada en la Silla Córdoba de Hermanos Jota
// Usa RoomEnvironment PBR, sombras suaves, geometría exacta punto-a-punto, THREE.Timer,
// AnimationMixer con ensamble en cascada y despiece reversible por timeScale.

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { useTema } from '../../context/TemaContext';
import { RefreshIcon } from '../common/Icons';
import './HeroSculpture3D.css';

const UP = new THREE.Vector3(0, 1, 0);

/**
 * Crea un cilindro/barra cónica perfectamente alineada entre dos puntos 3D exactos (pA -> pB).
 * Garantiza encastres matemáticos sin desplazamientos ni piezas flotando.
 */
function crearTramoEntre(pA, pB, radioA, radioB, material, segmentos = 20) {
  const dir = new THREE.Vector3().subVectors(pB, pA);
  const largo = dir.length();
  const geo = new THREE.CylinderGeometry(radioB, radioA, largo, segmentos);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.addVectors(pA, pB).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(UP, dir.normalize());
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return { mesh, geo };
}

/**
 * Genera textura procedural de nogal/petiribí aceitado (color + mapa de relieve sutil).
 */
function crearTexturasMadera() {
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = 512;
  colorCanvas.height = 512;
  const ctx = colorCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 512;
  bumpCanvas.height = 512;
  const bCtx = bumpCanvas.getContext('2d');

  if (!ctx || !bCtx) return { map: null, bumpMap: null };

  // Base cálida de nogal aceitado
  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, '#6e3d21');
  grad.addColorStop(0.35, '#7e4828');
  grad.addColorStop(0.7, '#67381e');
  grad.addColorStop(1, '#774325');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 220; i += 1) {
    const x = (i / 220) * 512;
    const wave = Math.sin(i * 0.17) * 9 + Math.cos(i * 0.05) * 4;
    const isDark = i % 3 === 0;
    ctx.strokeStyle = isDark
      ? 'rgba(42, 20, 9, 0.24)'
      : 'rgba(176, 114, 68, 0.14)';
    ctx.lineWidth = 1.2 + (i % 3) * 0.9;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(x + wave, 170, x - wave, 340, x, 512);
    ctx.stroke();

    bCtx.strokeStyle = isDark ? 'rgba(40,40,40,0.35)' : 'rgba(210,210,210,0.22)';
    bCtx.lineWidth = 1.2;
    bCtx.beginPath();
    bCtx.moveTo(x, 0);
    bCtx.bezierCurveTo(x + wave, 170, x - wave, 340, x, 512);
    bCtx.stroke();
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;

  return { map, bumpMap };
}

/**
 * Genera textura procedural de lino tejido en Verde Salvia (#87A96B) de Hermanos Jota.
 */
function crearTexturasLino() {
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = 256;
  colorCanvas.height = 256;
  const ctx = colorCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 256;
  bumpCanvas.height = 256;
  const bCtx = bumpCanvas.getContext('2d');

  if (!ctx || !bCtx) return { map: null, bumpMap: null };

  ctx.fillStyle = '#92ad78';
  ctx.fillRect(0, 0, 256, 256);
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, 256, 256);

  // Urdimbre y trama cruzada
  for (let i = 0; i < 256; i += 4) {
    ctx.fillStyle = i % 8 === 0 ? 'rgba(245, 238, 222, 0.16)' : 'rgba(65, 86, 48, 0.12)';
    ctx.fillRect(0, i, 256, 2);
    ctx.fillRect(i, 0, 2, 256);

    bCtx.fillStyle = i % 8 === 0 ? 'rgba(215, 215, 215, 0.3)' : 'rgba(70, 70, 70, 0.3)';
    bCtx.fillRect(0, i, 256, 2);
    bCtx.fillRect(i, 0, 2, 256);
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(3.5, 3.5);

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(3.5, 3.5);

  return { map, bumpMap };
}

/**
 * Crea un perfil trapezoidal redondeado en el plano 2D (más ancho al frente, más contenido atrás).
 */
function crearFormaAsiento(anchoFrente, anchoAtras, fondo, radio) {
  const hf = anchoFrente / 2;
  const ha = anchoAtras / 2;
  const hz = fondo / 2;
  const r = radio;

  const shape = new THREE.Shape();
  shape.moveTo(-ha + r, -hz);
  shape.lineTo(ha - r, -hz);
  shape.quadraticCurveTo(ha, -hz, ha + (hf - ha) * 0.15, -hz + r);
  shape.lineTo(hf, hz - r);
  shape.quadraticCurveTo(hf, hz, hf - r, hz);
  shape.lineTo(-hf + r, hz);
  shape.quadraticCurveTo(-hf, hz, -hf, hz - r);
  shape.lineTo(-ha - (hf - ha) * 0.15, -hz + r);
  shape.quadraticCurveTo(-ha, -hz, -ha + r, -hz);
  return shape;
}

/**
 * Crea el respaldo superior curvado macizo (con grosor real y cantos biselados)
 * extruyendo una banda en arco con extremos redondeados.
 */
function crearGeometriaRespaldoCurvo(radioInt, grosor, anguloMax, alto) {
  const radioExt = radioInt + grosor;
  const pasos = 28;
  const shape = new THREE.Shape();

  // Arco exterior (de izquierda a derecha; +Y en 2D pasa a -Z tras rotateX(-PI/2))
  for (let i = 0; i <= pasos; i += 1) {
    const a = -anguloMax + (i / pasos) * (anguloMax * 2);
    const x = Math.sin(a) * radioExt;
    const y = Math.cos(a) * radioExt;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }

  // Remate curvo derecho
  const capR = grosor / 2;
  const endR = {
    x: Math.sin(anguloMax) * (radioInt + capR),
    y: Math.cos(anguloMax) * (radioInt + capR),
  };
  shape.quadraticCurveTo(
    endR.x + Math.cos(anguloMax) * capR * 1.15,
    endR.y - Math.sin(anguloMax) * capR * 1.15,
    Math.sin(anguloMax) * radioInt,
    Math.cos(anguloMax) * radioInt
  );

  // Arco interior (de derecha a izquierda)
  for (let i = pasos; i >= 0; i -= 1) {
    const a = -anguloMax + (i / pasos) * (anguloMax * 2);
    const x = Math.sin(a) * radioInt;
    const y = Math.cos(a) * radioInt;
    shape.lineTo(x, y);
  }

  // Remate curvo izquierdo
  const endL = {
    x: Math.sin(-anguloMax) * (radioInt + capR),
    y: Math.cos(-anguloMax) * (radioInt + capR),
  };
  shape.quadraticCurveTo(
    endL.x - Math.cos(anguloMax) * capR * 1.15,
    endL.y - Math.sin(anguloMax) * capR * 1.15,
    Math.sin(-anguloMax) * radioExt,
    Math.cos(-anguloMax) * radioExt
  );

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: alto,
    bevelEnabled: true,
    bevelThickness: 0.018,
    bevelSize: 0.015,
    bevelSegments: 5,
    curveSegments: 24,
  });

  // ExtrudeGeometry extruye en +Z; rotamos +90° en X para que la altura quede en Y
  // y el arco mire hacia -Z con su eje centrado en Y = 0
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, -alto / 2, 0);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Construye la silla artesanal completa con Y = 0 exactamente en la base de las patas.
 * Cada subconjunto tiene un nombre estable para ser animado por AnimationMixer.
 */
function construirSillaCordoba(maderaTex, linoTex) {
  const root = new THREE.Group();
  root.name = 'SillaCordoba';

  const geometries = [];
  const materials = [];

  const matMadera = new THREE.MeshStandardMaterial({
    color: 0xb07249,
    map: maderaTex.map,
    bumpMap: maderaTex.bumpMap,
    bumpScale: 0.008,
    roughness: 0.42,
    metalness: 0.04,
  });

  const matMaderaOscura = new THREE.MeshStandardMaterial({
    color: 0x875231,
    map: maderaTex.map,
    bumpMap: maderaTex.bumpMap,
    bumpScale: 0.008,
    roughness: 0.46,
    metalness: 0.04,
  });

  const matLino = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: linoTex.map,
    bumpMap: linoTex.bumpMap,
    bumpScale: 0.014,
    roughness: 0.9,
    metalness: 0.0,
  });

  const matBronce = new THREE.MeshStandardMaterial({
    color: 0xd9ae48,
    roughness: 0.24,
    metalness: 0.88,
  });

  materials.push(matMadera, matMaderaOscura, matLino, matBronce);

  // Coordenadas exactas de las 4 patas (suelo y = 0 -> debajo del asiento y = 0.77)
  const patasDef = {
    FL: { piso: new THREE.Vector3(-0.43, 0.0, 0.42), tope: new THREE.Vector3(-0.34, 0.77, 0.32) },
    FR: { piso: new THREE.Vector3(0.43, 0.0, 0.42), tope: new THREE.Vector3(0.34, 0.77, 0.32) },
    BL: { piso: new THREE.Vector3(-0.41, 0.0, -0.43), tope: new THREE.Vector3(-0.32, 0.77, -0.32) },
    BR: { piso: new THREE.Vector3(0.41, 0.0, -0.43), tope: new THREE.Vector3(0.32, 0.77, -0.32) },
  };

  // ── 1. Grupo Patas + regatones coaxiales de bronce ──
  const grupoPatas = new THREE.Group();
  grupoPatas.name = 'GrupoPatas';

  Object.values(patasDef).forEach(({ piso, tope }) => {
    const finRegaton = new THREE.Vector3().lerpVectors(piso, tope, 0.11);

    // Regatón de bronce apoyado exactamente en y = 0
    const regaton = crearTramoEntre(piso, finRegaton, 0.022, 0.025, matBronce, 20);
    // Pata de madera torneada cónica desde el regatón hasta el asiento
    const pata = crearTramoEntre(finRegaton, tope, 0.0245, 0.037, matMadera, 22);

    geometries.push(regaton.geo, pata.geo);
    grupoPatas.add(regaton.mesh, pata.mesh);
  });
  root.add(grupoPatas);

  // ── 2. Grupo Travesaños en H (conectan matemáticamente pata con pata) ──
  const grupoTravesanos = new THREE.Group();
  grupoTravesanos.name = 'GrupoTravesanos';

  const pFL = new THREE.Vector3().lerpVectors(patasDef.FL.piso, patasDef.FL.tope, 0.42);
  const pBL = new THREE.Vector3().lerpVectors(patasDef.BL.piso, patasDef.BL.tope, 0.38);
  const pFR = new THREE.Vector3().lerpVectors(patasDef.FR.piso, patasDef.FR.tope, 0.42);
  const pBR = new THREE.Vector3().lerpVectors(patasDef.BR.piso, patasDef.BR.tope, 0.38);

  const travIzq = crearTramoEntre(pFL, pBL, 0.019, 0.019, matMaderaOscura, 16);
  const travDer = crearTramoEntre(pFR, pBR, 0.019, 0.019, matMaderaOscura, 16);

  // Travesaño central uniendo ambos travesaños laterales (H perfecta)
  const centroIzq = new THREE.Vector3().lerpVectors(pFL, pBL, 0.52);
  const centroDer = new THREE.Vector3().lerpVectors(pFR, pBR, 0.52);
  const travCentral = crearTramoEntre(centroIzq, centroDer, 0.018, 0.018, matMaderaOscura, 16);

  // Segundo travesaño trasero superior sutil para rigidez estructural
  const pBLAlta = new THREE.Vector3().lerpVectors(patasDef.BL.piso, patasDef.BL.tope, 0.48);
  const pBRAlta = new THREE.Vector3().lerpVectors(patasDef.BR.piso, patasDef.BR.tope, 0.48);
  const travTrasero = crearTramoEntre(pBLAlta, pBRAlta, 0.016, 0.016, matMaderaOscura, 16);

  geometries.push(travIzq.geo, travDer.geo, travCentral.geo, travTrasero.geo);
  grupoTravesanos.add(travIzq.mesh, travDer.mesh, travCentral.mesh, travTrasero.mesh);
  root.add(grupoTravesanos);

  // ── 3. Grupo Base de Asiento en Madera Biselada ──
  const grupoBaseAsiento = new THREE.Group();
  grupoBaseAsiento.name = 'GrupoBaseAsiento';

  const seatBaseShape = crearFormaAsiento(0.94, 0.88, 0.9, 0.15);
  const seatBaseGeo = new THREE.ExtrudeGeometry(seatBaseShape, {
    depth: 0.044,
    bevelEnabled: true,
    bevelThickness: 0.016,
    bevelSize: 0.016,
    bevelSegments: 5,
    curveSegments: 20,
  });
  seatBaseGeo.rotateX(Math.PI / 2);
  seatBaseGeo.translate(0, 0.815, 0.0);
  seatBaseGeo.computeVertexNormals();
  geometries.push(seatBaseGeo);

  const seatBaseMesh = new THREE.Mesh(seatBaseGeo, matMadera);
  seatBaseMesh.castShadow = true;
  seatBaseMesh.receiveShadow = true;
  grupoBaseAsiento.add(seatBaseMesh);
  root.add(grupoBaseAsiento);

  // ── 4. Grupo Varillas Torneadas (9 husos en abanico exacto hasta el respaldo) ──
  const NUM_VARILLAS = 9;
  const radioArcoRespaldo = 0.72;
  const centroArcoZ = 0.24; // Centro del arco hacia adelante (+Z), la curva envuelve -Z
  const respaldoY = 1.79;
  const respaldoTiltX = -0.14;

  const varillasMeta = [];
  for (let i = 0; i < NUM_VARILLAS; i += 1) {
    const u = (i / (NUM_VARILLAS - 1)) * 2 - 1; // -1 a +1
    const esBorde = i === 0 || i === NUM_VARILLAS - 1;

    // Anclaje inferior en la herradura trasera de nogal (100% libre del almohadón)
    const anguloBase = u * 0.46;
    const pAbajo = new THREE.Vector3(
      Math.sin(anguloBase) * 0.86,
      0.81,
      0.45 - Math.cos(anguloBase) * 0.86
    );

    // Anclaje superior entrando exactamente en el alma del respaldo curvo inclinado
    const anguloTop = u * 0.6;
    const radioCentro = radioArcoRespaldo + 0.028;
    const pArribaLocal = new THREE.Vector3(
      Math.sin(anguloTop) * radioCentro,
      -0.01,
      -Math.cos(anguloTop) * radioCentro
    );
    // Aplica la misma inclinación que el respaldo alrededor de su pivote (0, respaldoY, centroArcoZ)
    pArribaLocal.applyAxisAngle(new THREE.Vector3(1, 0, 0), respaldoTiltX);
    const pArriba = new THREE.Vector3(
      pArribaLocal.x,
      pArribaLocal.y + respaldoY,
      pArribaLocal.z + centroArcoZ
    );

    const varillaGroup = new THREE.Group();
    varillaGroup.name = `Varilla_${i}`;

    const rInf = esBorde ? 0.022 : 0.013;
    const rSup = esBorde ? 0.018 : 0.011;
    const varilla = crearTramoEntre(pAbajo, pArriba, rInf, rSup, matMadera, 16);
    geometries.push(varilla.geo);
    varillaGroup.add(varilla.mesh);

    // Anillo sutil de bronce en el encuentro de los 2 parantes exteriores
    if (esBorde) {
      const collarFin = new THREE.Vector3().lerpVectors(pAbajo, pArriba, 0.06);
      const collar = crearTramoEntre(pAbajo, collarFin, 0.025, 0.024, matBronce, 16);
      geometries.push(collar.geo);
      varillaGroup.add(collar.mesh);
    }

    root.add(varillaGroup);
    varillasMeta.push({ name: varillaGroup.name, distanciaCentro: Math.abs(u) });
  }

  // ── 5. Grupo Respaldo Curvo Macizo (madera curvada al vapor con biseles reales) ──
  const grupoRespaldo = new THREE.Group();
  grupoRespaldo.name = 'GrupoRespaldo';
  grupoRespaldo.position.set(0, respaldoY, centroArcoZ);

  // Pivote interno para conservar la inclinación ergonómica en el reposo
  const respaldoTiltPivot = new THREE.Group();
  respaldoTiltPivot.rotation.x = respaldoTiltX;

  const crestGeo = crearGeometriaRespaldoCurvo(radioArcoRespaldo, 0.056, 0.67, 0.165);
  geometries.push(crestGeo);
  const crestMesh = new THREE.Mesh(crestGeo, matMadera);
  crestMesh.castShadow = true;
  crestMesh.receiveShadow = true;
  respaldoTiltPivot.add(crestMesh);

  grupoRespaldo.add(respaldoTiltPivot);
  root.add(grupoRespaldo);

  // ── 6. Grupo Almohadón Tapizado en Lino Verde Salvia con bombeo orgánico ──
  const grupoAlmohadon = new THREE.Group();
  grupoAlmohadon.name = 'GrupoAlmohadon';

  const cushionShape = crearFormaAsiento(0.84, 0.72, 0.67, 0.13);
  const cushionGeo = new THREE.ExtrudeGeometry(cushionShape, {
    depth: 0.045,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.036,
    bevelSegments: 8,
    curveSegments: 22,
  });
  cushionGeo.rotateX(Math.PI / 2);

  // Bombeo suave en la cara superior para darle volumen mullido real
  const posAttr = cushionGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i += 1) {
    const vx = posAttr.getX(i);
    const vy = posAttr.getY(i);
    const vz = posAttr.getZ(i);
    if (vy > -0.01) {
      const rNorm = Math.min(1, Math.hypot(vx / 0.46, vz / 0.38));
      const crown = (1 - rNorm * rNorm) * 0.034;
      posAttr.setY(i, vy + crown);
    }
  }
  cushionGeo.translate(0, 0.905, 0.085);
  cushionGeo.computeVertexNormals();
  geometries.push(cushionGeo);

  const cushionMesh = new THREE.Mesh(cushionGeo, matLino);
  cushionMesh.castShadow = true;
  cushionMesh.receiveShadow = true;
  grupoAlmohadon.add(cushionMesh);
  root.add(grupoAlmohadon);

  return {
    root,
    respaldoReposoPos: new THREE.Vector3(0, respaldoY, centroArcoZ),
    varillasMeta,
    disposables: { geometries, materials },
  };
}

/**
 * Crea el AnimationClip de ensamble en cascada pieza por pieza (2.25s).
 * Al reproducirse en reversa (timeScale = -1) genera una vista de despiece de ebanistería perfecta.
 */
function crearClipEnsamble(respaldoReposoPos, varillasMeta) {
  const tracks = [];

  // 1. Patas: entran sutilmente desde abajo con un ajuste preciso al suelo (y = 0)
  const patasPos = new THREE.VectorKeyframeTrack(
    'GrupoPatas.position',
    [0, 0.55, 0.82],
    [0, -0.14, 0, 0, 0.01, 0, 0, 0, 0]
  );
  patasPos.setInterpolation(THREE.InterpolateSmooth);
  tracks.push(patasPos);

  // 2. Travesaños en H: suben y encastran entre las 4 patas
  const travPos = new THREE.VectorKeyframeTrack(
    'GrupoTravesanos.position',
    [0, 0.25, 0.85, 1.08],
    [0, -0.22, 0, 0, -0.22, 0, 0, 0.008, 0, 0, 0, 0]
  );
  travPos.setInterpolation(THREE.InterpolateSmooth);
  tracks.push(travPos);

  // 3. Base del asiento: desciende limpia sobre las espigas de las patas
  const basePos = new THREE.VectorKeyframeTrack(
    'GrupoBaseAsiento.position',
    [0, 0.45, 1.08, 1.3],
    [0, 0.2, 0, 0, 0.2, 0, 0, -0.006, 0, 0, 0, 0]
  );
  basePos.setInterpolation(THREE.InterpolateSmooth);
  tracks.push(basePos);

  // 4. 9 Varillas torneadas: entran en onda desde el centro hacia los bordes
  varillasMeta.forEach(({ name, distanciaCentro }) => {
    const tInicio = 0.72 + distanciaCentro * 0.28;
    const tFin = Math.min(1.62, tInicio + 0.56);
    const alturaInicio = 0.26 + distanciaCentro * 0.08;
    const varTrack = new THREE.VectorKeyframeTrack(
      `${name}.position`,
      [0, tInicio, tFin],
      [0, alturaInicio, -0.04, 0, alturaInicio, -0.04, 0, 0, 0]
    );
    varTrack.setInterpolation(THREE.InterpolateSmooth);
    tracks.push(varTrack);
  });

  // 5. Respaldo curvo macizo: baja con una leve inclinación de asiento (QuaternionKeyframeTrack)
  const rx = respaldoReposoPos.x;
  const ry = respaldoReposoPos.y;
  const rz = respaldoReposoPos.z;

  const respPos = new THREE.VectorKeyframeTrack(
    'GrupoRespaldo.position',
    [0, 1.12, 1.72, 1.92],
    [rx, ry + 0.34, rz - 0.1, rx, ry + 0.34, rz - 0.1, rx, ry - 0.006, rz, rx, ry, rz]
  );
  respPos.setInterpolation(THREE.InterpolateSmooth);
  tracks.push(respPos);

  const qAbierto = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.1);
  const qReposo = new THREE.Quaternion();
  const respQuat = new THREE.QuaternionKeyframeTrack(
    'GrupoRespaldo.quaternion',
    [0, 1.12, 1.92],
    [
      qAbierto.x, qAbierto.y, qAbierto.z, qAbierto.w,
      qAbierto.x, qAbierto.y, qAbierto.z, qAbierto.w,
      qReposo.x, qReposo.y, qReposo.z, qReposo.w,
    ]
  );
  tracks.push(respQuat);

  // 6. Almohadón de lino Verde Salvia: se posa suavemente al final del ensamble
  const almohadonPos = new THREE.VectorKeyframeTrack(
    'GrupoAlmohadon.position',
    [0, 1.38, 2.02, 2.25],
    [0, 0.34, 0.12, 0, 0.34, 0.12, 0, -0.008, 0, 0, 0, 0]
  );
  almohadonPos.setInterpolation(THREE.InterpolateSmooth);
  tracks.push(almohadonPos);

  return new THREE.AnimationClip('EnsambleSillaCordoba', 2.25, tracks);
}

export default function HeroSculpture3D() {
  const { esOscuro } = useTema();
  const containerRef = useRef(null);
  const assembleActionRef = useRef(null);
  const themeRefs = useRef(null);
  const explodadoRef = useRef(false);

  const [webglDisponible, setWebglDisponible] = useState(true);
  const [despiezada, setDespiezada] = useState(false);

  const alternarDespiece = useCallback(() => {
    const action = assembleActionRef.current;
    if (!action) return;

    const proximo = !explodadoRef.current;
    explodadoRef.current = proximo;
    setDespiezada(proximo);

    action.paused = false;
    action.timeScale = proximo ? -1.15 : 1.05;
    action.play();
  }, []);

  const reensamblar = useCallback(() => {
    const action = assembleActionRef.current;
    if (!action) return;

    explodadoRef.current = false;
    setDespiezada(false);
    action.reset();
    action.timeScale = 1.0;
    action.play();
  }, []);

  // Sincroniza luces, reflejos PBR y opacidad de sombra con el tema claro/oscuro
  useEffect(() => {
    const refs = themeRefs.current;
    if (!refs) return;
    if (esOscuro) {
      refs.scene.environmentIntensity = 0.58;
      refs.keyLight.intensity = 2.5;
      refs.rimLight.color.setHex(0xe2bb5e);
      refs.rimLight.intensity = 1.75;
      refs.hemiLight.intensity = 0.7;
      refs.shadowMat.opacity = 0.42;
    } else {
      refs.scene.environmentIntensity = 0.78;
      refs.keyLight.intensity = 2.2;
      refs.rimLight.color.setHex(0xfff1dc);
      refs.rimLight.intensity = 1.1;
      refs.hemiLight.intensity = 0.9;
      refs.shadowMat.opacity = 0.19;
    }
  }, [esOscuro]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglDisponible(false);
      return undefined;
    }

    const width = container.clientWidth || 440;
    const height = container.clientHeight || 400;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    // Entorno PBR de estudio para reflejos reales en bronce y nogal aceitado
    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = esOscuro ? 0.58 : 0.78;
    roomEnv.dispose();
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 40);
    camera.position.set(2.65, 1.62, 3.78);
    camera.lookAt(0, 0.9, 0);

    // Iluminación de estudio fotográfico con sombras suaves
    const hemiLight = new THREE.HemisphereLight(0xfff8ee, 0x452d1d, esOscuro ? 0.7 : 0.9);
    const keyLight = new THREE.DirectionalLight(0xfff4e2, esOscuro ? 2.5 : 2.2);
    keyLight.position.set(3.2, 5.4, 3.6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1.0;
    keyLight.shadow.camera.far = 12.0;
    keyLight.shadow.camera.left = -1.8;
    keyLight.shadow.camera.right = 1.8;
    keyLight.shadow.camera.top = 2.4;
    keyLight.shadow.camera.bottom = -1.2;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    keyLight.shadow.radius = 4;

    const rimLight = new THREE.DirectionalLight(
      esOscuro ? 0xe2bb5e : 0xfff1dc,
      esOscuro ? 1.75 : 1.1
    );
    rimLight.position.set(-3.4, 2.8, -2.6);

    scene.add(hemiLight, keyLight, rimLight);

    // Pedestal invisible receptor de sombra + anillo sutil de latón al ras del suelo (y = 0)
    const shadowGeo = new THREE.PlaneGeometry(5, 5);
    const shadowMat = new THREE.ShadowMaterial({ opacity: esOscuro ? 0.42 : 0.19 });
    const shadowFloor = new THREE.Mesh(shadowGeo, shadowMat);
    shadowFloor.rotation.x = -Math.PI / 2;
    shadowFloor.position.y = 0;
    shadowFloor.receiveShadow = true;
    scene.add(shadowFloor);

    const ringGeo = new THREE.RingGeometry(0.76, 0.778, 72);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xd4a437,
      roughness: 0.3,
      metalness: 0.85,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.55,
    });
    const floorRing = new THREE.Mesh(ringGeo, ringMat);
    floorRing.rotation.x = -Math.PI / 2;
    floorRing.position.y = 0.002;
    scene.add(floorRing);

    themeRefs.current = { scene, hemiLight, keyLight, rimLight, shadowMat };

    // Construcción de la silla y texturas procedurales
    const maderaTex = crearTexturasMadera();
    const linoTex = crearTexturasLino();
    const { root, respaldoReposoPos, varillasMeta, disposables } = construirSillaCordoba(
      maderaTex,
      linoTex
    );

    // Contenedor orbital centrado en el suelo (y = 0) para que la silla gire apoyada sin flotar
    const turntable = new THREE.Group();
    turntable.add(root);
    scene.add(turntable);

    // Sistema de animación r187: THREE.Timer + AnimationMixer
    const mixer = new THREE.AnimationMixer(root);
    const assembleClip = crearClipEnsamble(respaldoReposoPos, varillasMeta);

    const assembleAction = mixer.clipAction(assembleClip);
    assembleAction.setLoop(THREE.LoopOnce, 1);
    assembleAction.clampWhenFinished = true;
    assembleActionRef.current = assembleAction;

    if (prefersReducedMotion) {
      assembleAction.play();
      mixer.update(assembleClip.duration);
      turntable.rotation.y = -0.42;
      renderer.render(scene, camera);
    } else {
      assembleAction.play();
    }

    // Órbita interactiva con arrastre 360° + seguimiento sutil del puntero con THREE.MathUtils.damp
    let hoverYaw = 0;
    let userYaw = -0.45;
    let currentYaw = -0.78;
    let targetCamY = 1.62;
    let currentCamY = 1.62;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const onPointerDown = (e) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      container.setPointerCapture?.(e.pointerId);
    };

    const onPointerUp = (e) => {
      dragging = false;
      container.releasePointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      if (dragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        userYaw += dx * 0.011;
        targetCamY = THREE.MathUtils.clamp(targetCamY + dy * 0.008, 0.95, 2.35);
      } else {
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        hoverYaw = nx * 0.22;
      }
    };

    const onPointerLeave = () => {
      dragging = false;
      hoverYaw = 0;
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);
    container.addEventListener('pointermove', onPointerMove, { passive: true });
    container.addEventListener('pointerleave', onPointerLeave, { passive: true });

    // ResizeObserver para nitidez en todos los breakpoints
    const handleResize = () => {
      const nextW = container.clientWidth || 320;
      const nextH = container.clientHeight || 320;
      camera.aspect = nextW / nextH;
      camera.updateProjectionMatrix();
      renderer.setSize(nextW, nextH);
      if (prefersReducedMotion) {
        renderer.render(scene, camera);
      }
    };

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);
    } else {
      window.addEventListener('resize', handleResize);
    }

    const timer = new THREE.Timer();
    timer.connect(document);

    function animate() {
      timer.update();
      const delta = timer.getDelta();
      const elapsed = timer.getElapsed();

      mixer.update(delta);

      // Giro lento continuo de galería cuando el usuario no está arrastrando
      if (!dragging) {
        userYaw += delta * 0.16;
      }

      currentYaw = THREE.MathUtils.damp(currentYaw, userYaw + hoverYaw, 5.5, delta);
      currentCamY = THREE.MathUtils.damp(currentCamY, targetCamY, 5.5, delta);

      turntable.rotation.y = currentYaw;

      // En modo despiece agregamos una levitación casi imperceptible; armada se apoya firme en el suelo
      const targetLift = explodadoRef.current ? 0.04 + Math.sin(elapsed * 1.6) * 0.015 : 0;
      root.position.y = THREE.MathUtils.damp(root.position.y, targetLift, 4.5, delta);

      camera.position.y = currentCamY;
      camera.lookAt(0, 0.9, 0);

      renderer.render(scene, camera);
    }

    if (!prefersReducedMotion) {
      renderer.setAnimationLoop(animate);
    }

    // Pausa el render loop cuando el hero queda fuera del viewport
    let intersectionObserver = null;
    if (!prefersReducedMotion && typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          renderer.setAnimationLoop(entry.isIntersecting ? animate : null);
        },
        { threshold: 0.05 }
      );
      intersectionObserver.observe(container);
    }

    return () => {
      assembleActionRef.current = null;
      themeRefs.current = null;
      renderer.setAnimationLoop(null);
      timer.disconnect();
      mixer.stopAllAction();
      mixer.uncacheRoot(root);

      if (intersectionObserver) intersectionObserver.disconnect();
      if (resizeObserver) resizeObserver.disconnect();
      else window.removeEventListener('resize', handleResize);

      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointercancel', onPointerUp);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);

      disposables.geometries.forEach((g) => g.dispose());
      disposables.materials.forEach((m) => m.dispose());
      shadowGeo.dispose();
      shadowMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      envTarget.dispose();
      maderaTex.map?.dispose();
      maderaTex.bumpMap?.dispose();
      linoTex.map?.dispose();
      linoTex.bumpMap?.dispose();

      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!webglDisponible) {
    return (
      <div className="hero-stage hero-stage--fallback" aria-hidden="true">
        <img src="/imagenes/sillas-cordoba.png" alt="Silla Córdoba de Hermanos Jota" />
      </div>
    );
  }

  return (
    <div className="hero-stage">
      <div
        ref={containerRef}
        className="hero-stage__canvas"
        role="img"
        aria-label="Modelo tridimensional interactivo de la Silla Córdoba de Hermanos Jota en madera de nogal, lino verde salvia y bronce. Arrastrá para girar."
      />
      <div className="hero-stage__toolbar">
        <span className="hero-stage__hint">Silla Córdoba · Arrastrá para girar 360°</span>
        <div className="hero-stage__actions">
          <button
            type="button"
            className={`hero-stage__btn${despiezada ? ' hero-stage__btn--activo' : ''}`}
            onClick={alternarDespiece}
            aria-pressed={despiezada}
          >
            {despiezada ? 'Ensamblar' : 'Ver despiece'}
          </button>
          <button
            type="button"
            className="hero-stage__btn"
            onClick={reensamblar}
            aria-label="Repetir animación de ensamble 3D"
          >
            <RefreshIcon size={14} /> Repetir
          </button>
        </div>
      </div>
    </div>
  );
}
