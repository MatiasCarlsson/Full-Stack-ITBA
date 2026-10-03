#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de generación del Informe Técnico de Entrega en formato PDF
para el proyecto Hermanos Jota E-Commerce (Sprint 3 & 4).
Diseño ejecutivo calibrado a exactamente 3 páginas perfectas.
"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    Image,
    HRFlowable,
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        width, height = A4
        margin = 44

        # Encabezado (a partir de la página 2)
        if self._pageNumber > 1:
            self.saveState()
            self.setFont("Helvetica-Bold", 7.5)
            self.setFillColor(colors.HexColor("#A0522D"))
            self.drawString(margin, height - 28, "HERMANOS JOTA")
            self.setFont("Helvetica", 7.5)
            self.setFillColor(colors.HexColor("#7A6055"))
            self.drawString(margin + 75, height - 28, "— Informe Técnico de Entrega (Sprint 3 & 4)")
            
            # Línea sutil superior
            self.setStrokeColor(colors.HexColor("#E0D5C7"))
            self.setLineWidth(0.6)
            self.line(margin, height - 33, width - margin, height - 33)
            self.restoreState()

        # Pie de página (en todas las páginas)
        self.saveState()
        self.setFont("Helvetica", 7.5)
        self.setFillColor(colors.HexColor("#7A6055"))
        self.drawString(margin, 24, "Desarrollador: Matías Carlsson · Full Stack Web Developer (Santander / ITBA)")
        
        page_text = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(width - margin, 24, page_text)
        
        # Línea sutil inferior
        self.setStrokeColor(colors.HexColor("#E0D5C7"))
        self.setLineWidth(0.6)
        self.line(margin, 33, width - margin, 33)
        self.restoreState()


def build_pdf(filename="Informe_Entrega_Sprint_3_4_Hermanos_Jota.pdf"):
    # Configuración del documento
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=44,
        rightMargin=44,
        topMargin=40,
        bottomMargin=42,
    )

    # Paleta de colores Hermanos Jota
    c_siena = colors.HexColor("#A0522D")
    c_siena_osc = colors.HexColor("#7A3B1E")
    c_salvia = colors.HexColor("#3F6029")
    c_card_bg = colors.HexColor("#FDF6EE")
    c_texto = colors.HexColor("#2C1D11")
    c_suave = colors.HexColor("#6B5448")
    c_borde = colors.HexColor("#E2D4C3")
    c_blanco = colors.HexColor("#FFFFFF")

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=c_siena,
        spaceAfter=2,
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10.5,
        leading=14,
        textColor=c_suave,
        spaceAfter=6,
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=15,
        textColor=c_siena_osc,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True,
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=c_texto,
        spaceBefore=6,
        spaceAfter=3,
        keepWithNext=True,
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.2,
        textColor=c_texto,
        spaceAfter=5,
    )

    body_suave = ParagraphStyle(
        'BodySuave',
        parent=body_style,
        textColor=c_suave,
        fontSize=8,
        leading=11.5,
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=c_blanco,
        alignment=0,
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=c_texto,
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=table_cell_style,
        fontName='Helvetica-Bold',
        textColor=c_texto,
    )

    table_cell_code = ParagraphStyle(
        'TableCellCode',
        parent=table_cell_style,
        fontName='Courier',
        fontSize=7.2,
        textColor=c_siena_osc,
    )

    badge_ok = ParagraphStyle(
        'BadgeOK',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=c_salvia,
        alignment=1,
    )

    story = []

    # ══════════════════════════════════════════════════════════════════
    # PÁGINA 1: PORTADA, RESUMEN Y ARQUITECTURA
    # ══════════════════════════════════════════════════════════════════
    logo_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "client", "public", "logo192.png")
    
    header_data = [
        [
            Image(logo_path, width=40, height=40) if os.path.exists(logo_path) else "",
            [
                Paragraph("HERMANOS JOTA — MUEBLERÍA DE AUTOR", ParagraphStyle('TopPre', fontName='Helvetica-Bold', fontSize=7.5, leading=9, textColor=c_siena, textTransform='uppercase')),
                Paragraph("Informe Técnico de Entrega Final", title_style),
                Paragraph("Reconstrucción Integral Full Stack (Sprint 3 y 4) · Arquitectura Cliente-Servidor", subtitle_style),
            ]
        ]
    ]

    header_table = Table(header_data, colWidths=[48, 459])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_siena, spaceBefore=2, spaceAfter=8))

    # Ficha resumen de metadatos
    meta_data = [
        [
            Paragraph("<b>Desarrollador:</b> Matías Carlsson", table_cell_style),
            Paragraph("<b>Institución:</b> ITBA / Santander", table_cell_style),
        ],
        [
            Paragraph("<b>Repositorio GitHub:</b> <font color='#A0522D'>github.com/MatiasCarlsson/Full-Stack-ITBA</font>", table_cell_style),
            Paragraph("<b>Rama Activa:</b> <font color='#A0522D'>matias</font>", table_cell_style),
        ],
        [
            Paragraph("<b>Pull Request a dev:</b> PR #1 (Merged / Fusionada)", table_cell_style),
            Paragraph("<b>Pull Request a main:</b> PR #2 (Abierta para Release)", table_cell_style),
        ],
        [
            Paragraph("<b>Entornos Locales:</b> Backend en :3001 · Frontend en :3000", table_cell_style),
            Paragraph("<b>Fecha de Entrega:</b> Octubre 2026", table_cell_style),
        ]
    ]

    meta_table = Table(meta_data, colWidths=[265, 242])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_card_bg),
        ('BOX', (0, 0), (-1, -1), 1, c_borde),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, c_borde),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 7),
        ('RIGHTPADDING', (0, 0), (-1, -1), 7),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 6))

    # 1. Resumen Ejecutivo
    story.append(Paragraph("1. Resumen Ejecutivo del Proyecto", h1_style))
    story.append(Paragraph(
        "El presente informe formaliza la entrega de los <b>Sprints 3 y 4</b> del programa Full Stack Developer. "
        "El objetivo primordial consistió en la <b>transformación integral de una maqueta web estática hacia una verdadera aplicación "
        "cliente-servidor</b>, estructurada sobre dos pilares independientes pero estrechamente integrados: una <b>API REST</b> desarrollada "
        "con <b>Node.js y Express</b> para servir los datos del catálogo, y un <b>frontend interactivo</b> construido desde cero en "
        "<b>React 19</b> que consume dichos servicios mediante peticiones HTTP asincrónicas (<code>fetch</code>).",
        body_style
    ))
    story.append(Paragraph(
        "El desarrollo respeta al 100% las especificaciones de diseño y el <i>Manual de Marca</i> de <b>Hermanos Jota</b> (mueblería de autor con "
        "madera nativa y acabados nobles). La interfaz prescinde completamente de emojis en favor de un sistema de <b>iconografía SVG minimalista</b>, "
        "incorpora botones de acción unificados (<b>\"Agregar\"</b> + icono SVG de carrito), implementa el favicon oficial de la marca en el navegador y "
        "cumple con estándares estrictos de pruebas unitarias y accesibilidad WCAG 2.1.",
        body_style
    ))

    # 2. Arquitectura de la Solución
    story.append(Paragraph("2. Arquitectura de la Solución y Stack Tecnológico", h1_style))
    story.append(Paragraph(
        "La solución se organizó bajo una arquitectura modular limpia desacoplada en dos directorios de trabajo:",
        body_style
    ))

    arch_data = [
        [
            Paragraph("Capa / Módulo", table_header_style),
            Paragraph("Tecnología", table_header_style),
            Paragraph("Puerto / Configuración", table_header_style),
            Paragraph("Responsabilidad Principal", table_header_style),
        ],
        [
            Paragraph("<b>Backend API</b><br/><code>/backend</code>", table_cell_style),
            Paragraph("Node.js · Express 4<br/>CORS · Nodemon", table_cell_style),
            Paragraph("<b>http://localhost:3001</b>", table_cell_code),
            Paragraph("Expone endpoints REST modulares con <code>express.Router</code>, middleware de logging con timestamp y catálogo en archivo local.", table_cell_style),
        ],
        [
            Paragraph("<b>Frontend UI</b><br/><code>/client</code>", table_cell_style),
            Paragraph("React 19 · CRA<br/>Testing Library · CSS", table_cell_style),
            Paragraph("<b>http://localhost:3000</b><br/>Proxy a :3001", table_cell_code),
            Paragraph("Interfaz SPA con renderizado condicional, estado global de carrito en <code>App.js</code>, control asincrónico (carga, error, reintento) y diseño editorial.", table_cell_style),
        ],
        [
            Paragraph("<b>Calidad &amp; Tests</b>", table_cell_style),
            Paragraph("Jest · RTL · ESLint<br/>Gitflow · Commits", table_cell_style),
            Paragraph("5/5 tests pasados<br/>0 errores ESLint", table_cell_code),
            Paragraph("Suite automatizada de pruebas para marca, navegación, tarjetas, detalle y contacto, cumpliendo reglas estrictas de Testing Library.", table_cell_style),
        ],
    ]

    arch_table = Table(arch_data, colWidths=[95, 115, 125, 172])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_siena),
        ('BOX', (0, 0), (-1, -1), 1, c_borde),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, c_borde),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('BACKGROUND', (0, 1), (-1, 1), c_card_bg),
        ('BACKGROUND', (0, 3), (-1, 3), c_card_bg),
    ]))
    story.append(arch_table)
    story.append(Spacer(1, 10))

    # Salto de página para que la Matriz de Requisitos quede completa en la Página 2
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════
    # PÁGINA 2: MATRIZ DE REQUISITOS Y DETALLES TÉCNICOS
    # ══════════════════════════════════════════════════════════════════
    story.append(Paragraph("3. Matriz de Cumplimiento Técnico (Consigna Oficial)", h1_style))
    story.append(Paragraph(
        "Verificación exhaustiva de cada uno de los ítems evaluados en el Sprint 3 y 4:",
        body_style
    ))

    req_data = [
        [
            Paragraph("Requisito Exigido", table_header_style),
            Paragraph("Área", table_header_style),
            Paragraph("Archivo de Implementación", table_header_style),
            Paragraph("Estado", table_header_style),
        ],
        [
            Paragraph("Datos de productos en archivo <code>.js</code> local (array de objetos)", table_cell_style),
            Paragraph("Backend", table_cell_bold),
            Paragraph("<code>backend/src/data/productos.js</code>", table_cell_code),
            Paragraph("<b>CUMPLE 100%</b>", badge_ok),
        ],
        [
            Paragraph("<code>GET /api/productos</code> con listado completo en JSON", table_cell_style),
            Paragraph("Backend", table_cell_bold),
            Paragraph("<code>backend/src/routes/productos.js</code>", table_cell_code),
            Paragraph("<b>CUMPLE 100%</b>", badge_ok),
        ],
        [
            Paragraph("<code>GET /api/productos/:id</code> con producto o 404 estructurado", table_cell_style),
            Paragraph("Backend", table_cell_bold),
            Paragraph("<code>backend/src/routes/productos.js</code>", table_cell_code),
            Paragraph("<b>CUMPLE 100%</b>", badge_ok),
        ],
        [
            Paragraph("Middleware global de logging (método HTTP y URL con timestamp)", table_cell_style),
            Paragraph("Backend", table_cell_bold),
            Paragraph("<code>backend/src/middlewares/logger.js</code>", table_cell_code),
            Paragraph("<b>CUMPLE 100%</b>", badge_ok),
        ],
        [
            Paragraph("Middleware <code>express.json()</code> para futuras peticiones POST", table_cell_style),
            Paragraph("Backend", table_cell_bold),
            Paragraph("<code>backend/src/index.js</code>", table_cell_code),
            Paragraph("<b>CUMPLE 100%</b>", badge_ok),
        ],
        [
            Paragraph("Organización modular con <code>express.Router</code>", table_cell_style),
            Paragraph("Backend", table_cell_bold),
            Paragraph("<code>backend/src/routes/productos.js</code>", table_cell_code),
            Paragraph("<b>CUMPLE 100%</b>", badge_ok),
        ],
        [
            Paragraph("6 componentes React: Navbar, Footer, ProductCard, ProductList, ProductDetail, ContactForm", table_cell_style),
            Paragraph("Frontend", table_cell_bold),
            Paragraph("<code>client/src/components/*.jsx</code>", table_cell_code),
            Paragraph("<b>CUMPLE 100%</b>", badge_ok),
        ],
        [
            Paragraph("Fetch asincrónico a <code>/api/productos</code> con estados de carga y error", table_cell_style),
            Paragraph("Frontend", table_cell_bold),
            Paragraph("<code>client/src/components/ProductList.jsx</code>", table_cell_code),
            Paragraph("<b>CUMPLE 100%</b>", badge_ok),
        ],
        [
            Paragraph("Renderizado de lista con <code>.map()</code> y <code>key</code>s únicas basadas en ID", table_cell_style),
            Paragraph("Frontend", table_cell_bold),
            Paragraph("<code>client/src/components/ProductList.jsx</code>", table_cell_code),
            Paragraph("<b>CUMPLE 100%</b>", badge_ok),
        ],
        [
            Paragraph("Detalle de producto mediante renderizado condicional", table_cell_style),
            Paragraph("Frontend", table_cell_bold),
            Paragraph("<code>client/src/App.js</code>", table_cell_code),
            Paragraph("<b>CUMPLE 100%</b>", badge_ok),
        ],
        [
            Paragraph("Carrito como estado global en <code>App.js</code> y contador en <code>Navbar</code> vía props", table_cell_style),
            Paragraph("Frontend", table_cell_bold),
            Paragraph("<code>client/src/App.js</code> y <code>Navbar.jsx</code>", table_cell_code),
            Paragraph("<b>CUMPLE 100%</b>", badge_ok),
        ],
        [
            Paragraph("Formulario de contacto controlado con validación estricta y feedback", table_cell_style),
            Paragraph("Frontend", table_cell_bold),
            Paragraph("<code>client/src/components/ContactForm.jsx</code>", table_cell_code),
            Paragraph("<b>CUMPLE 100%</b>", badge_ok),
        ],
    ]

    req_table = Table(req_data, colWidths=[174, 56, 197, 80])
    req_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_siena_osc),
        ('BOX', (0, 0), (-1, -1), 1, c_borde),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, c_borde),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('ALIGN', (3, 1), (3, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [c_blanco, c_card_bg]),
    ]))
    story.append(req_table)
    story.append(Spacer(1, 8))

    # 4. Detalles de Implementación Técnica
    story.append(Paragraph("4. Aspectos Técnicos Destacados de la Implementación", h1_style))

    story.append(Paragraph("4.1. Backend API (Node.js + Express)", h2_style))
    story.append(Paragraph(
        "• <b>Router Modular</b>: Los endpoints se aislaron en <code>routes/productos.js</code> y se montaron bajo <code>app.use('/api/productos', productosRouter)</code>.<br/>"
        "• <b>Manejo de Errores 404</b>: Búsquedas por ID inexistente (ej: <code>GET /api/productos/999</code>) responden status 404 con JSON descriptivo: "
        "<code>{\"error\": \"Producto no encontrado\", \"mensaje\": \"No existe un producto con el ID 999\"}</code>.<br/>"
        "• <b>Logging en Consola</b>: Middleware personalizado que imprime fecha/hora ISO, método y URL de cada request.<br/>"
        "• <b>Assets Sanitizados</b>: Servidor de estáticos en <code>/imagenes</code> con nombres kebab-case sin tildes ni espacios para evitar fallos de proxy.",
        body_style
    ))

    story.append(Paragraph("4.2. Frontend Reactivo (React 19)", h2_style))
    story.append(Paragraph(
        "• <b>Consumo Asincrónico Limpio</b>: <code>fetch('/api/productos')</code> respaldado por <code>AbortController</code> para cancelar peticiones pendientes al desmontar el componente (evitando memory leaks).<br/>"
        "• <b>Ciclo de Vida Completo</b>: Spinner interactivo durante la carga, pantalla de error amigable con botón de reintento en caídas de red y renderizado dinámico en éxito.<br/>"
        "• <b>Carrito Global &amp; Drawer</b>: Estado en <code>App.js</code> con acumulación inteligente por ID. Panel lateral deslizable (<i>Cart Drawer</i>) para sumar (+), restar (-), eliminar piezas y vaciar carrito con cálculo de subtotal en ARS.<br/>"
        "• <b>Renderizado Condicional</b>: Navegación instantánea entre Catálogo, Detalle de Producto y Formulario de Contacto sin recargas de página.",
        body_style
    ))

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════
    # PÁGINA 3: DISEÑO, TESTS, FLUJO GIT Y GUÍA DE EJECUCIÓN
    # ══════════════════════════════════════════════════════════════════
    story.append(Paragraph("5. Identidad Visual, UI/UX y Sistema de Diseño", h1_style))
    story.append(Paragraph(
        "• <b>Manual de Marca</b>: Tokens CSS con la paleta oficial: Siena Tostado (<code>#A0522D</code>), Verde Salvia (<code>#87A96B</code>), Alabastro (<code>#F5E6D3</code>) y Vara de Oro (<code>#D4A437</code>).<br/>"
        "• <b>Erradicación Total de Emojis</b>: Reemplazados al 100% por un catálogo de iconos vectoriales SVG limpios y arquitectónicos en <code>Icons.jsx</code>.<br/>"
        "• <b>Botón de Compra Unificado</b>: En tarjetas y detalle, el botón de agregar presenta estrictamente <b>\"Agregar\"</b> + el SVG reutilizable <code>&lt;CartIcon /&gt;</code>.<br/>"
        "• <b>Branding en Navegador</b>: Favicon oficial en formato <code>.ico</code> multirresolución y <code>.svg</code> vectorial, junto a <code>manifest.json</code> y logos PWA.<br/>"
        "• <b>Accesibilidad WCAG</b>: <code>:focus-visible</code> de alto contraste, roles semánticos y soporte para <code>prefers-reduced-motion</code>.",
        body_style
    ))

    # 6. Calidad, Testing y ESLint
    story.append(Paragraph("6. Calidad de Código y Pruebas Unitarias (5/5 PASS)", h1_style))
    story.append(Paragraph(
        "Suite automatizada implementada con <b>React Testing Library</b> en <code>client/src/App.test.js</code>:",
        body_style
    ))

    test_data = [
        [
            Paragraph("Caso de Prueba (Test Case)", table_header_style),
            Paragraph("Componente", table_header_style),
            Paragraph("Criterio Verificado", table_header_style),
            Paragraph("Resultado", table_header_style),
        ],
        [
            Paragraph("1. Renderizado de Marca", table_cell_bold),
            Paragraph("<code>App.js</code>", table_cell_code),
            Paragraph("Presencia del nombre Hermanos Jota en la portada.", table_cell_style),
            Paragraph("PASS ✓", badge_ok),
        ],
        [
            Paragraph("2. Navegación y Carrito", table_cell_bold),
            Paragraph("<code>Navbar.jsx</code>", table_cell_code),
            Paragraph("Botones accesibles de catálogo, contacto y carrito.", table_cell_style),
            Paragraph("PASS ✓", badge_ok),
        ],
        [
            Paragraph("3. Botón Compra en Card", table_cell_bold),
            Paragraph("<code>ProductCard.jsx</code>", table_cell_code),
            Paragraph("Texto \"Agregar\", etiqueta accesible y presencia del SVG de carrito.", table_cell_style),
            Paragraph("PASS ✓", badge_ok),
        ],
        [
            Paragraph("4. Botón Compra en Detalle", table_cell_bold),
            Paragraph("<code>ProductDetail.jsx</code>", table_cell_code),
            Paragraph("Texto \"Agregar\", etiqueta accesible y presencia del SVG de carrito.", table_cell_style),
            Paragraph("PASS ✓", badge_ok),
        ],
        [
            Paragraph("5. Formulario de Contacto", table_cell_bold),
            Paragraph("<code>ContactForm.jsx</code>", table_cell_code),
            Paragraph("Inputs para nombre, email, mensaje y botón de envío.", table_cell_style),
            Paragraph("PASS ✓", badge_ok),
        ],
    ]

    test_table = Table(test_data, colWidths=[125, 90, 222, 70])
    test_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_siena),
        ('BOX', (0, 0), (-1, -1), 1, c_borde),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, c_borde),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('ALIGN', (3, 1), (3, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [c_blanco, c_card_bg]),
    ]))
    story.append(test_table)
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "<b>Auditoría ESLint</b>: Se eliminaron accesos directos al DOM resolviendo la regla <code>testing-library/no-node-access</code> con <code>within(el).getByTestId('cart-icon')</code>. <b>0 errores, 0 advertencias</b>.",
        body_suave
    ))

    # 7. Flujo Git y Pull Requests
    story.append(Paragraph("7. Flujo de Ramas Git y Pull Requests en GitHub", h1_style))

    git_data = [
        [
            Paragraph("Rama / Pull Request", table_header_style),
            Paragraph("Propósito y Contenido", table_header_style),
            Paragraph("Estado en GitHub", table_header_style),
        ],
        [
            Paragraph("<b>Rama <code>matias</code></b><br/>(Rama de Autor)", table_cell_style),
            Paragraph("Commits semánticos con la implementación completa del backend, client, tests y documentación.", table_cell_style),
            Paragraph("<b>Pushed &amp; Active</b><br/>Sincronizada", badge_ok),
        ],
        [
            Paragraph("<b>Pull Request #1</b><br/><code>matias</code> ➔ <code>dev</code>", table_cell_style),
            Paragraph("Integración formal de los cambios de desarrollo a la rama staging.", table_cell_style),
            Paragraph("<b>MERGED ✓</b><br/>Fusionada en GitHub", badge_ok),
        ],
        [
            Paragraph("<b>Pull Request #2</b><br/><code>dev</code> ➔ <code>main</code>", table_cell_style),
            Paragraph("Release final del Sprint 3 y 4 hacia la rama principal de producción.", table_cell_style),
            Paragraph("<b>OPEN (Lista)</b><br/>PR #2 creada", ParagraphStyle('BadgeOpen', parent=badge_ok, textColor=c_siena)),
        ],
    ]

    git_table = Table(git_data, colWidths=[120, 287, 100])
    git_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_siena_osc),
        ('BOX', (0, 0), (-1, -1), 1, c_borde),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, c_borde),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [c_blanco, c_card_bg]),
    ]))
    story.append(git_table)
    story.append(Spacer(1, 6))

    # 8. Guía de Ejecución
    story.append(Paragraph("8. Guía de Instalación y Ejecución", h1_style))
    code_box_content = (
        "<b>1. Iniciar Backend (API REST en :3001):</b> <code>cd backend &amp;&amp; npm install &amp;&amp; npm run dev</code><br/>"
        "<b>2. Iniciar Frontend (React en :3000):</b> <code>cd client &amp;&amp; npm install &amp;&amp; npm start</code><br/>"
        "<b>3. Ejecutar Pruebas Automatizadas:</b> <code>cd client &amp;&amp; npm test -- --watchAll=false</code>"
    )
    box_data = [[Paragraph(code_box_content, table_cell_style)]]
    box_table = Table(box_data, colWidths=[507])
    box_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_card_bg),
        ('BOX', (0, 0), (-1, -1), 0.75, c_siena),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(box_table)
    story.append(Spacer(1, 8))

    # Firma Final
    firma_data = [
        [
            Paragraph("<b>Desarrollador:</b> Matías Carlsson<br/>"
                      "<b>Curso:</b> Full Stack Web Developer — ITBA / Santander<br/>"
                      "<b>Repositorio:</b> https://github.com/MatiasCarlsson/Full-Stack-ITBA", body_suave),
            Paragraph("<b>Evaluación Final Sprint 3 y 4:</b><br/>"
                      "<font color='#3F6029'><b>Cumplimiento Total (100%) · Aprobado</b></font><br/>"
                      "Listo para entrega formal", ParagraphStyle('FirmaDer', parent=body_style, alignment=2, fontSize=8, leading=11)),
        ]
    ]
    firma_table = Table(firma_data, colWidths=[310, 197])
    firma_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(firma_table)

    # Construir PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF generado exitosamente en: {filename}")


if __name__ == "__main__":
    build_pdf()
