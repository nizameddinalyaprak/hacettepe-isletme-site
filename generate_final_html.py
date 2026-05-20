import json
import re

json_path = "excel_data.json"
html_output_path = "tr/final.html"

with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

rows = data["rows"]
# Filter out empty rows (first row is header, rest are exams. Filter out rows where course code is empty)
exams = []
for r in rows[1:]:
    if r[0] and r[0].strip():
        exams.append({
            "code": r[0].strip(),
            "section": r[1].strip() if r[1] else "1",
            "name": r[2].strip(),
            "instructor": r[3].strip(),
            "class": r[4].strip() if r[4] else "1",
            "date": r[5].strip(),
            "time": r[6].strip(),
            "student_count": r[7].strip() if r[7] else "0",
            "rooms": r[8].strip() if r[8] else ""
        })

# Generate HTML table rows
table_rows_html = []
for exam in exams:
    # Parse rooms into links
    room_list = []
    if exam["rooms"]:
        # split by comma
        raw_rooms = [rm.strip() for rm in exam["rooms"].split(",") if rm.strip()]
        for rm in raw_rooms:
            if any(x in rm.upper() for x in ["YILDIZ", "AMFİ"]):
                room_list.append(f'<span class="room-tag tag-external" title="Bina Dışı Sınav Salonu">{rm}</span>')
            elif "DSS" in rm.upper():
                room_list.append(f'<span class="room-tag" title="Dekanlık Seminer Salonu (2. Kat)">{rm}</span>')
            else:
                room_list.append(f'<span class="room-tag tag-interactive" onclick="highlightRoom(\'{rm}\')" title="Kat planında göster">{rm}</span>')
    rooms_html = ", ".join(room_list) if room_list else "-"

    # Search query index (lower case for easier search)
    search_str = f"{exam['code']} {exam['name']} {exam['instructor']} {exam['date']} {exam['rooms']}".lower().replace('ı','i').replace('ö','o').replace('ü','u').replace('ş','s').replace('ç','c').replace('ğ','g')
    
    row_html = f'''            <tr data-class="{exam['class']}" data-search="{search_str}">
                <td class="cell-code"><strong>{exam['code']}</strong></td>
                <td class="cell-sec text-center">{exam['section']}</td>
                <td class="cell-name">{exam['name']}</td>
                <td class="cell-inst">{exam['instructor']}</td>
                <td class="cell-class text-center"><span class="badge-class class-{exam['class']}">{exam['class']}. Sınıf</span></td>
                <td class="cell-date">{exam['date']}</td>
                <td class="cell-time text-center"><span class="time-badge">{exam['time']}</span></td>
                <td class="cell-count text-center">{exam['student_count']}</td>
                <td class="cell-rooms">{rooms_html}</td>
            </tr>'''
    table_rows_html.append(row_html)

all_rows_html = "\n".join(table_rows_html)

# Now define the full HTML template
html_template = f'''<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>2025-2026 Bahar Yarıyılı Genel Sınav Programı - Hacettepe Üniversitesi İşletme Bölümü</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {{
            --hacettepe-red: #ac232d;
            --hacettepe-dark-red: #8a1c24;
            --primary: #ac232d;
            --primary-light: #fdf2f2;
            --primary-dark: #8a1c24;
            --secondary: #0f172a;
            --bg-body: #f8fafc;
            --bg-card: #ffffff;
            --border: #e2e8f0;
            --text-main: #334155;
            --text-muted: #64748b;
            
            /* Room colors matching original spec */
            --c-derslik: #bae6fd;
            --c-lab: #c084fc;
            --c-koridor: #f1f5f9;
            --c-islak: #fed7aa;
            --c-bosluk: #f8fafc;
            --c-asansor: #fbcfe8;
            --c-merdiven: #cbd5e1;
            --c-giris: #bbf7d0;
            --c-guvenlik: #fde047;
            --c-cihazlar: #ef4444;
        }}

        .exam-page-wrapper {{
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: transparent;
            color: var(--text-main);
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
        }}

        .header-bg {{
            width: 100%;
            background-color: var(--hacettepe-red);
            padding: 40px 20px;
            text-align: center;
            color: white;
            box-sizing: border-box;
            border-bottom: 5px solid var(--hacettepe-dark-red);
            border-radius: 8px 8px 0 0;
        }}

        .header-bg h1 {{
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            color: white !important;
        }}

        .header-bg p.subtitle {{
            margin: 15px auto 0 auto;
            font-size: 16px;
            max-width: 800px;
            line-height: 1.5;
            opacity: 0.95;
        }}

        .exam-container {{
            max-width: 1200px;
            width: 100%;
            background: var(--bg-card);
            border-radius: 0 0 8px 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            border: 1px solid var(--border);
            border-top: none;
        }}

        .tabs {{
            display: flex;
            border-bottom: 1px solid var(--border);
            background: #fafafa;
        }}

        .tab-btn {{
            flex: 1;
            padding: 16px;
            text-align: center;
            font-size: 16px;
            font-weight: 700;
            color: var(--text-muted);
            background: none;
            border: none;
            border-bottom: 3px solid transparent;
            cursor: pointer;
            text-transform: uppercase;
        }}

        .tab-btn:hover {{
            color: var(--hacettepe-red);
            background: #f1f5f9;
        }}

        .tab-btn.active {{
            color: var(--hacettepe-red);
            border-bottom-color: var(--hacettepe-red);
            background: var(--bg-card);
        }}

        .tab-btn.highlight-plan {{
            background-color: #fffbeb !important;
            color: #d97706 !important;
            border-bottom: 3px solid transparent;
            animation: pulseTab 2s infinite;
        }}

        .tab-btn.highlight-plan.active {{
            background-color: var(--bg-card) !important;
            color: var(--hacettepe-red) !important;
            border-bottom-color: var(--hacettepe-red) !important;
            animation: none;
        }}

        @keyframes pulseTab {{
            0% {{ box-shadow: inset 0 0 0 0 rgba(217, 119, 6, 0.1); }}
            70% {{ box-shadow: inset 0 0 0 10px rgba(217, 119, 6, 0); }}
            100% {{ box-shadow: inset 0 0 0 0 rgba(217, 119, 6, 0); }}
        }}

        .tab-content {{
            display: none;
            padding: 0;
            background: var(--bg-card);
        }}

        .tab-content.active {{
            display: block;
        }}

        /* Sınav Programı Listesi Styles */
        .controls-section {{
            padding: 24px;
            background: #f8fafc;
            border-bottom: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            gap: 16px;
        }}

        @media (min-width: 768px) {{
            .controls-section {{
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
            }}
        }}

        .search-wrapper {{
            position: relative;
            flex: 1;
            max-width: 500px;
        }}

        .search-wrapper i {{
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-muted);
            font-size: 16px;
        }}

        .search-input {{
            width: 100%;
            padding: 12px 16px 12px 48px;
            font-family: inherit;
            font-size: 15px;
            border: 1px solid var(--border);
            border-radius: 8px;
            background: var(--bg-card);
            color: var(--text-main);
            outline: none;
            transition: all 0.2s;
            box-sizing: border-box;
        }}

        .search-input:focus {{
            border-color: var(--hacettepe-red);
            box-shadow: 0 0 0 3px rgba(172, 35, 45, 0.15);
        }}

        .filter-buttons {{
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }}

        .filter-btn {{
            background: var(--bg-card);
            border: 1px solid var(--border);
            padding: 10px 18px;
            border-radius: 8px;
            font-weight: 600;
            color: var(--text-main);
            cursor: pointer;
            transition: all 0.2s;
            font-size: 14px;
        }}

        .filter-btn:hover {{
            border-color: var(--hacettepe-red);
            color: var(--hacettepe-red);
            background: var(--primary-light);
        }}

        .filter-btn.active {{
            background: var(--hacettepe-red);
            color: white;
            border-color: var(--hacettepe-red);
        }}

        /* Table Design */
        .table-responsive {{
            width: 100%;
            overflow-x: auto;
        }}

        .exam-table {{
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 14px;
        }}

        .exam-table th {{
            background: #f1f5f9;
            color: var(--secondary);
            font-weight: 700;
            padding: 16px;
            border-bottom: 2px solid var(--border);
            white-space: nowrap;
            font-family: 'Outfit', sans-serif;
        }}

        .exam-table td {{
            padding: 16px;
            border-bottom: 1px solid var(--border);
            vertical-align: middle;
            line-height: 1.5;
        }}

        .exam-table tbody tr:hover {{
            background-color: #f8fafc;
        }}

        .text-center {{
            text-align: center;
        }}

        .cell-code {{
            font-family: 'Outfit', sans-serif;
            color: var(--secondary);
            font-weight: 700;
        }}

        .badge-class {{
            display: inline-block;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
        }}

        .class-1 {{ background: #e0f2fe; color: #0369a1; }}
        .class-2 {{ background: #dcfce7; color: #15803d; }}
        .class-3 {{ background: #fef9c3; color: #a16207; }}
        .class-4 {{ background: #f3e8ff; color: #7e22ce; }}

        .time-badge {{
            display: inline-block;
            background: #f1f5f9;
            border: 1px solid var(--border);
            padding: 4px 10px;
            border-radius: 6px;
            font-family: monospace;
            font-weight: 700;
            color: var(--secondary);
            font-size: 13px;
        }}

        .room-tag {{
            display: inline-block;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 700;
            margin: 2px;
            transition: all 0.2s;
        }}

        .tag-interactive {{
            background: var(--primary-light);
            color: var(--hacettepe-red);
            border: 1px solid #fca5a5;
            cursor: pointer;
        }}

        .tag-interactive:hover {{
            background: var(--hacettepe-red);
            color: white;
            border-color: var(--hacettepe-red);
            transform: translateY(-1px);
        }}

        .tag-external {{
            background: #f1f5f9;
            color: #475569;
            border: 1px solid var(--border);
        }}

        /* Floor plan layout adjustments */
        #blueprint-container {{
            width: 100%;
            background: white;
            box-sizing: border-box;
            border-radius: 8px;
            overflow-x: auto;
        }}

        #floor-controls {{
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
            justify-content: center;
            background: #f8fafc;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid var(--border);
        }}

        #floor-controls button {{
            background: #fff;
            border: 1px solid var(--border);
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 700;
            color: var(--text-main);
            transition: all 0.2s;
            font-family: 'Outfit', sans-serif;
        }}

        #floor-controls button.active {{
            background: var(--hacettepe-red);
            color: white;
            border-color: var(--hacettepe-red);
            box-shadow: 0 4px 10px rgba(172, 35, 45, 0.2);
        }}

        #grid-board {{
            display: grid;
            gap: 4px;
            background-color: #334155;
            padding: 4px;
            border-radius: 8px;
            width: 100%;
            min-width: 900px;
            box-sizing: border-box;
        }}

        .room {{
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            font-weight: 700;
            font-size: 13px;
            transition: transform 0.1s, box-shadow 0.1s;
            cursor: pointer;
            user-select: none;
            position: relative;
            overflow: hidden;
            border-radius: 4px;
            min-height: 35px;
            box-sizing: border-box;
            border: 1px solid rgba(0, 0, 0, 0.05);
        }}

        .room:hover {{
            opacity: 0.9;
            z-index: 10;
        }}

        /* Color classes */
        .type-derslik {{ background-color: var(--c-derslik); color: #0f172a; }}
        .type-lab {{ background-color: var(--c-lab); color: white; }}
        .type-koridor {{ background-color: var(--c-koridor); color: #475569; border: 1px dashed #cbd5e1; }}
        .type-islak {{ background-color: var(--c-islak); color: #653b11; }}
        .type-bosluk {{ background-color: var(--c-bosluk); color: #94a3b8; font-style: italic; border: none !important; }}
        .type-bolum {{ background-color: var(--c-koridor); color: #1e293b; font-size: 14px; font-weight: bold; border-left: 4px solid var(--hacettepe-red); }}
        .type-asansor {{ background-color: var(--c-asansor); color: #9d174d; font-size: 10px; }}
        .type-merdiven {{
            background-color: var(--c-merdiven);
            background: repeating-linear-gradient(180deg, #e2e8f0, #e2e8f0 8px, #cbd5e1 8px, #cbd5e1 16px);
            color: #1e293b;
            font-size: 10px;
        }}
        .type-giris {{ background-color: var(--c-giris); color: #166534; font-weight: 800; }}
        .type-guvenlik {{ background-color: var(--c-guvenlik); color: #854d0e; font-size: 11px; }}
        .type-cihazlar {{
            background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
            color: #ffffff;
            font-size: 10px;
            font-weight: 800;
            border: 2px dashed #fca5a5;
            border-radius: 6px;
        }}

        .plan-legend {{
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            margin-top: 24px;
            padding: 20px;
            border-top: 1px solid var(--border);
            justify-content: center;
            background: #f8fafc;
            border-radius: 8px;
        }}

        .plan-legend-item {{
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            font-weight: 600;
            color: var(--text-main);
        }}

        .plan-legend-color {{
            width: 18px;
            height: 18px;
            border-radius: 4px;
            border: 1px solid rgba(0, 0, 0, 0.1);
        }}

        /* Highlights & flashing */
        @keyframes flashHighlight {{
            0% {{ background-color: #ef4444; color: white; transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }}
            50% {{ background-color: #ef4444; color: white; transform: scale(1.05); box-shadow: 0 0 15px 10px rgba(239, 68, 68, 0); }}
            100% {{ background-color: #ef4444; color: white; transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }}
        }}
        .highlight-flash {{
            animation: flashHighlight 1s ease-in-out 3;
            z-index: 100 !important;
            border: 3px solid #b91c1c !important;
        }}

        /* Modal popup warning style */
        .exam-modal-overlay {{
            display: flex;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(4px);
            z-index: 99999;
            align-items: center;
            justify-content: center;
            opacity: 1;
            transition: opacity 0.3s ease;
        }}

        .exam-modal {{
            background: #ffffff;
            width: 90%;
            max-width: 600px;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            animation: examModalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            border: 1px solid var(--border);
        }}

        @keyframes examModalFadeIn {{
            from {{ transform: translateY(-30px); opacity: 0; }}
            to {{ transform: translateY(0); opacity: 1; }}
        }}

        .exam-modal-header {{
            background-color: var(--hacettepe-red);
            color: white;
            padding: 20px 24px;
            font-size: 1.25rem;
            font-weight: 800;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-family: 'Outfit', sans-serif;
        }}

        .exam-modal-body {{
            padding: 28px 24px;
            font-size: 15px;
            color: var(--text-main);
            line-height: 1.7;
        }}

        .exam-modal-body strong {{
            color: var(--hacettepe-red);
        }}

        .exam-modal-footer {{
            padding: 16px 24px;
            background-color: #f8fafc;
            text-align: right;
            border-top: 1px solid var(--border);
        }}

        .exam-btn-accept {{
            background-color: var(--hacettepe-red);
            color: white;
            border: none;
            padding: 12px 28px;
            font-size: 15px;
            font-weight: 700;
            border-radius: 8px;
            cursor: pointer;
            display: inline-block;
            transition: background 0.2s;
            font-family: 'Outfit', sans-serif;
            box-shadow: 0 4px 10px rgba(172, 35, 45, 0.2);
        }}

        .exam-btn-accept:hover {{
            background-color: var(--hacettepe-dark-red);
            color: white;
        }}

        /* Responsive Layouts */
        @media (max-width: 768px) {{
            .tabs {{
                flex-direction: column;
            }}
            .tab-btn {{
                border-bottom: 1px solid var(--border);
                border-left: 4px solid transparent;
                text-align: left;
                padding: 16px 24px;
                justify-content: flex-start;
            }}
            .tab-btn.active {{
                border-bottom-color: var(--border);
                border-left-color: var(--hacettepe-red);
            }}
            .header-bg {{
                padding: 35px 15px;
            }}
            .header-bg h1 {{
                font-size: 24px;
            }}
            .exam-table th, .exam-table td {{
                padding: 12px 10px;
                font-size: 13px;
            }}
        }}
    </style>
</head>
<body>
    <div class="exam-page-wrapper">
        <div class="header-bg">
        <h1>2025-2026 Bahar Yarıyılı Genel Sınav (Final) Programı</h1>
        <p class="subtitle">Hacettepe Üniversitesi İşletme Bölümü final sınav programı ve salon yerleşim planı. Lütfen sınav saatinden en az 15 dakika önce ilgili salonda hazır bulununuz.</p>
    </div>

    <div class="exam-container">
        <div class="tabs">
            <button type="button" class="tab-btn active" data-target="pdf-tab" style="font-size: 18px;">
                📄 Sınav Programı Listesi
            </button>
            <button type="button" class="tab-btn highlight-plan" data-target="plan-tab">
                🏢 BİNA YERLEŞİM PLANI <span style="display:block; font-size: 12px; color:#d84315; margin-top:5px;">(Sınav Salonunuzu Görmek İçin Tıklayın)</span>
            </button>
        </div>

        <!-- Tab 1: Sınav Listesi -->
        <div id="pdf-tab" class="tab-content active">
            <div class="controls-section">
                <div class="search-wrapper">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input type="text" id="searchInput" class="search-input" placeholder="Ders kodu, ders adı, öğretim elemanı veya sınıf ara..." oninput="filterTable()">
                </div>
                <div class="filter-buttons">
                    <button class="filter-btn active" onclick="filterClass('all', this)">Tüm Sınavlar</button>
                    <button class="filter-btn" onclick="filterClass('1', this)">1. Sınıf</button>
                    <button class="filter-btn" onclick="filterClass('2', this)">2. Sınıf</button>
                    <button class="filter-btn" onclick="filterClass('3', this)">3. Sınıf</button>
                    <button class="filter-btn" onclick="filterClass('4', this)">4. Sınıf</button>
                </div>
            </div>
            
            <div class="table-responsive">
                <table class="exam-table" id="examTable">
                    <thead>
                        <tr>
                            <th>Ders Kodu</th>
                            <th class="text-center">Şube</th>
                            <th>Ders Adı</th>
                            <th>Öğretim Elemanı</th>
                            <th class="text-center">Sınıfı</th>
                            <th>Sınav Tarihi</th>
                            <th class="text-center">Sınav Saati</th>
                            <th class="text-center">Öğr. Say.</th>
                            <th>Sınav Salonu</th>
                        </tr>
                    </thead>
                    <tbody>
{all_rows_html}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Tab 2: Bina Yerleşim Planı -->
        <div id="plan-tab" class="tab-content" style="padding: 24px;">
            <p style="text-align: center; color: var(--text-muted); margin-bottom: 24px; font-weight: 500;">Kat planını görüntülemek için aşağıdaki kat butonlarını kullanabilirsiniz.</p>
            <div id="floor-controls">
                <!-- Butonlar JavaScript ile buraya eklenecek -->
            </div>
            
            <div id="blueprint-container">
                <div id="grid-board">
                    <!-- Odalar JavaScript ile çizilecek -->
                </div>
                
                <div class="plan-legend">
                    <div class="plan-legend-item"><div class="plan-legend-color" style="background-color: var(--c-derslik);"></div> Derslik</div>
                    <div class="plan-legend-item"><div class="plan-legend-color" style="background-color: var(--c-lab);"></div> Laboratuvar</div>
                    <div class="plan-legend-item"><div class="plan-legend-color" style="background-color: var(--c-koridor);"></div> Koridor</div>
                    <div class="plan-legend-item"><div class="plan-legend-color" style="background-color: var(--c-islak);"></div> WC / Islak Hacim</div>
                    <div class="plan-legend-item"><div class="plan-legend-color" style="background-color: var(--c-asansor);"></div> Asansör</div>
                    <div class="plan-legend-item"><div class="plan-legend-color" style="background-color: var(--c-merdiven);"></div> Merdiven</div>
                    <div class="plan-legend-item"><div class="plan-legend-color" style="background-color: var(--c-giris);"></div> Giriş</div>
                    <div class="plan-legend-item"><div class="plan-legend-color" style="background-color: var(--c-guvenlik);"></div> Güvenlik</div>
                    <div class="plan-legend-item"><div class="plan-legend-color" style="background-color: var(--c-cihazlar); border: 2px dashed #fca5a5;"></div> Otomat...</div>
                    <div class="plan-legend-item"><div class="plan-legend-color" style="background-color: var(--c-bosluk);"></div> Ara Boşluk</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Warning Overlay -->
    <div class="exam-modal-overlay" id="examModalOverlay">
        <div class="exam-modal">
            <div class="exam-modal-header">
                <span><i class="fa-solid fa-circle-exclamation"></i> Önemli Uyarı</span>
            </div>
            <div class="exam-modal-body">
                <p><strong>DİKKAT:</strong> Öğrencilerimizin sınav günü, saati veya atanmış oldukları sınav salonlarında zorunlu durumlara istinaden değişiklikler yapılabilir.</p>
                <p>Mağduriyet yaşamamak adına sınav haftası boyunca anlık duyuruları düzenli olarak takip etmeniz önemle rica olunur.</p>
                <p>Sınav programında herhangi bir çakışma veya problem ile karşılaşırsanız vakit kaybetmeden <strong>nizameddin.alyaprak@hacettepe.edu.tr</strong> adresine e-posta gönderebilirsiniz.</p>
            </div>
            <div class="exam-modal-footer">
                <button type="button" class="exam-btn-accept" id="btnAcceptExam" onclick="closeExamModal()">Okudum, Onaylıyorum</button>
            </div>
        </div>
    </div>

    <script>
        // Modal logic
        function closeExamModal() {{
            document.getElementById('examModalOverlay').style.opacity = '0';
            setTimeout(() => {{
                document.getElementById('examModalOverlay').style.display = 'none';
            }}, 300);
        }}

        // Tab Switcher
        function switchTab(tabId, btnElement) {{
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
            
            document.getElementById(tabId).classList.add('active');
            btnElement.classList.add('active');
            
            // Trigger redraw of floor plan if switching to plan tab
            if (tabId === 'plan-tab') {{
                window.dispatchEvent(new Event('resize'));
            }}
        }}

        // Table search and filter logic
        let currentClassFilter = 'all';

        function filterTable() {{
            const searchInput = document.getElementById('searchInput');
            let query = searchInput.value.toLowerCase()
                .replace(/ı/g, 'i')
                .replace(/ö/g, 'o')
                .replace(/ü/g, 'u')
                .replace(/ş/g, 's')
                .replace(/ç/g, 'c')
                .replace(/ğ/g, 'g');
            
            const rows = document.querySelectorAll('#examTable tbody tr');
            
            rows.forEach(row => {{
                const searchStr = row.getAttribute('data-search') || '';
                const rowClass = row.getAttribute('data-class') || '';
                
                const matchesSearch = searchStr.includes(query);
                const matchesClass = (currentClassFilter === 'all' || rowClass === currentClassFilter);
                
                if (matchesSearch && matchesClass) {{
                    row.style.display = '';
                }} else {{
                    row.style.display = 'none';
                }}
            }});
        }}

        function filterClass(classNum, btnElement) {{
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            btnElement.classList.add('active');
            currentClassFilter = classNum;
            filterTable();
        }}

        // Building Plan Drawing Logic (from Bina_Yerlesim_Plani.html)
        const plans = {{
            "Kat B (Bodrum)": {{
                columns: 12,
                rows: 10,
                rooms: [
                    {{ id: "B5 Lab", x: 1, w: 2, y: 1, h: 2, type: "lab" }},
                    {{ id: "FTS", x: 1, w: 2, y: 3, h: 2, type: "derslik" }},
                    {{ id: "B4", x: 1, w: 2, y: 5, h: 3, type: "derslik" }},
                    {{ id: "Koridor", x: 3, w: 1, y: 1, h: 7, type: "koridor" }},
                    {{ id: "B7 Lab", x: 8, w: 3, y: 1, h: 2, type: "lab" }},
                    {{ id: "WC", x: 4, w: 1, y: 3, h: 4, type: "islak" }},
                    {{ id: "Ara Boşluk", x: 5, w: 6, y: 3, h: 5, type: "bosluk" }},
                    {{ id: "Koridor", x: 3, w: 12, y: 7, h: 1, type: "koridor" }},
                    {{ id: "B3", x: 1, w: 3, y: 8, h: 3, type: "derslik" }},
                    {{ id: "B2", x: 4, w: 2, y: 8, h: 3, type: "derslik" }},
                    {{ id: "Asansör", x: 7, w: 1, y: 9, h: 2, type: "asansor" }},
                    {{ id: "Asansör", x: 8, w: 1, y: 9, h: 2, type: "asansor" }},
                    {{ id: "Merdiven", x: 6, w: 1, y: 8, h: 3, type: "merdiven" }},
                    {{ id: "B1", x: 9, w: 2, y: 8, h: 3, type: "derslik" }},
                    {{ id: "B8", x: 11, w: 2, y: 8, h: 3, type: "derslik" }}
                ]
            }},
            "Kat Z (Zemin)": {{
                columns: 102,
                rows: 42,
                rooms: [
                    {{ id: "Derslik Z5", x: 1, w: 15, y: 1, h: 12, type: "derslik" }},
                    {{ id: "Derslik Z4", x: 1, w: 15, y: 13, h: 12, type: "derslik" }},
                    {{ id: "Koridor", x: 16, w: 9, y: 1, h: 26, type: "koridor" }},
                    {{ id: "WC", x: 35, w: 6, y: 15, h: 10, type: "islak" }},
                    {{ id: "Ara Boşluk", x: 41, w: 20, y: 9, h: 20, type: "bosluk" }},
                    {{ id: "Derslik Z6", x: 25, w: 16, y: 4, h: 10, type: "derslik" }},
                    {{ id: "Derslik Z7", x: 41, w: 20, y: 1, h: 8, type: "derslik" }},
                    {{ id: "Derslik Z8", x: 61, w: 17, y: 6, h: 8, type: "derslik" }},
                    {{ id: "Derslik Z9 LAB", x: 61, w: 17, y: 14, h: 8, type: "lab" }},
                    {{ id: "Otomatlar", x: 61, w: 10, y: 22, h: 3, type: "cihazlar" }},
                    {{ id: "Koridor", x: 16, w: 70, y: 25, h: 6, type: "koridor" }},
                    {{ id: "Derslik Z3", x: 10, w: 18, y: 31, h: 12, type: "derslik" }},
                    {{ id: "Derslik Z2", x: 28, w: 18, y: 31, h: 12, type: "derslik" }},
                    {{ id: "Merdiven", x: 46, w: 8, y: 36, h: 7, type: "merdiven" }},
                    {{ id: "Asansör", x: 54, w: 7, y: 38, h: 5, type: "asansor" }},
                    {{ id: "Asansör", x: 61, w: 7, y: 38, h: 5, type: "asansor" }},
                    {{ id: "Derslik Z1", x: 68, w: 18, y: 31, h: 12, type: "derslik" }},
                    {{ id: "Giriş", x: 86, w: 16, y: 25, h: 12, type: "giris" }},
                    {{ id: "Giriş", x: 94, w: 8, y: 37, h: 6, type: "giris" }},
                    {{ id: "Güvenlik", x: 86, w: 8, y: 37, h: 6, type: "guvenlik" }}
                ]
            }},
            "1. Kat": {{
                columns: 46,
                rows: 36,
                rooms: [
                    {{ id: "Derslik K1", x: 4, w: 12, y: 7, h: 6, type: "derslik" }},
                    {{ id: "WC", x: 13, w: 3, y: 13, h: 5, type: "islak" }},
                    {{ id: "Derslik K2", x: 16, w: 14, y: 1, h: 6, type: "derslik" }},
                    {{ id: "Derslik K3", x: 30, w: 15, y: 5, h: 6, type: "derslik" }},
                    {{ id: "Derslik K4 LAB", x: 30, w: 15, y: 11, h: 6, type: "lab" }},
                    {{ id: "Ara Boşluk", x: 16, w: 14, y: 7, h: 12, type: "bosluk" }},
                    {{ id: "SBKY Böl.", x: 1, w: 15, y: 18, h: 5, type: "bolum" }},
                    {{ id: "Koridor", x: 16, w: 14, y: 18, h: 5, type: "koridor" }},
                    {{ id: "Maliye Böl.", x: 30, w: 16, y: 18, h: 5, type: "bolum" }},
                    {{ id: "Koridor", x: 16, w: 14, y: 23, h: 14, type: "bosluk" }},
                    {{ id: "Merdiven", x: 16, w: 5, y: 26, h: 8, type: "merdiven" }},
                    {{ id: "Asansör", x: 21, w: 4, y: 28, h: 6, type: "asansor" }},
                    {{ id: "Asansör", x: 25, w: 4, y: 28, h: 6, type: "asansor" }}
                ]
            }}
        }};

        const board = document.getElementById('grid-board');
        const controls = document.getElementById('floor-controls');
        let activeFloor = 'Kat B (Bodrum)';

        function renderFloor(floorName) {{
            board.innerHTML = '';
            activeFloor = floorName;
            const floorData = plans[floorName];

            board.style.gridTemplateColumns = `repeat(${{floorData.columns}}, 1fr)`;
            board.style.gridTemplateRows = `repeat(${{floorData.rows}}, 1fr)`;

            floorData.rooms.forEach(room => {{
                const div = document.createElement('div');
                div.className = `room type-${{room.type}}`;
                div.textContent = room.id;
                div.setAttribute('data-id', room.id.toUpperCase());

                div.style.gridColumn = `${{room.x}} / ${{room.x + room.w}}`;
                div.style.gridRow = `${{room.y}} / ${{room.y + room.h}}`;

                div.addEventListener('click', () => {{
                    div.style.transform = 'scale(0.95)';
                    setTimeout(() => div.style.transform = 'scale(1)', 150);
                }});

                board.appendChild(div);
            }});

            document.querySelectorAll('#floor-controls button').forEach(btn => {{
                btn.classList.remove('active');
                if (btn.textContent === floorName) {{
                    btn.classList.add('active');
                }}
            }});
        }}

        // Initialize buttons
        Object.keys(plans).forEach((floorName, index) => {{
            const btn = document.createElement('button');
            btn.textContent = floorName;
            btn.onclick = () => renderFloor(floorName);
            controls.appendChild(btn);

            if (index === 0) {{
                renderFloor(floorName);
            }}
        }});

        // Interactive highlight room function
        function highlightRoom(roomName) {{
            let floor = '';
            roomName = roomName.trim().toUpperCase();
            
            // Map room prefix to floor name
            if (roomName.startsWith('Z')) {{
                floor = 'Kat Z (Zemin)';
            }} else if (roomName.startsWith('K')) {{
                floor = '1. Kat';
            }} else if (roomName.startsWith('B') || roomName === 'FTS') {{
                floor = 'Kat B (Bodrum)';
            }} else {{
                // Fallback / outer building
                return;
            }}

            // Switch to plan tab
            switchTab('plan-tab', document.getElementById('btn-plan-tab'));
            
            // Render the target floor
            renderFloor(floor);

            // Wait brief moment for DOM render, then highlight room
            setTimeout(() => {{
                const rooms = document.querySelectorAll('.room');
                let targetEl = null;
                
                for (let r of rooms) {{
                    let text = r.textContent.trim().toUpperCase();
                    if (text === roomName || 
                        text.includes(roomName) || 
                        roomName.includes(text) ||
                        (roomName.startsWith('Z') && text.endsWith(roomName)) ||
                        (roomName.startsWith('K') && text.endsWith(roomName))) {{
                        targetEl = r;
                        break;
                    }}
                }}
                
                if (targetEl) {{
                    // Remove existing highlights
                    document.querySelectorAll('.room').forEach(el => el.classList.remove('highlight-flash'));
                    
                    // Add flash animation
                    targetEl.classList.add('highlight-flash');
                    
                    // Scroll container to target room if it overflows
                    targetEl.scrollIntoView({{ behavior: 'smooth', block: 'nearest', inline: 'center' }});
                }}
            }}, 150);
        }}
    </script>
    </div>
</body>
</html>
'''

with open(html_output_path, "w", encoding="utf-8") as f:
    f.write(html_template)

with open("../Sinav_Duyurusu.html", "w", encoding="utf-8") as f:
    f.write(html_template)

print(f"Successfully generated {html_output_path} and ../Sinav_Duyurusu.html with {len(exams)} exams.")

