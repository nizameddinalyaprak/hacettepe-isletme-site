import zipfile
import xml.etree.ElementTree as ET
import os
import json

file_path = "/Volumes/T9_Main/onedrive_hacettepe/04_Projeler_ve_Girisimler/Web_Sitesi_Yonetimi/02_Canli_Web_Sitesi/final_programi_2526bahar.xlsx"

def read_xlsx(file_path):
    namespaces = {
        'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
        'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
    }
    
    with zipfile.ZipFile(file_path, 'r') as z:
        # Read shared strings
        shared_strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            ss_content = z.read('xl/sharedStrings.xml')
            root = ET.fromstring(ss_content)
            # Find all <t> elements
            for t in root.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t'):
                shared_strings.append(t.text or "")
        
        # Read workbook to get sheet names
        sheets = []
        wb_content = z.read('xl/workbook.xml')
        wb_root = ET.fromstring(wb_content)
        for sheet in wb_root.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheet'):
            sheets.append({
                'name': sheet.attrib.get('name'),
                'id': sheet.attrib.get('sheetId'),
                'rId': sheet.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
            })
            
        print("Sheets found:", sheets)
        
        # We assume the first sheet is the one we want (usually xl/worksheets/sheet1.xml)
        # Let's read sheet1.xml
        sheet_xml = 'xl/worksheets/sheet1.xml'
        if sheet_xml in z.namelist():
            sheet_content = z.read(sheet_xml)
            sheet_root = ET.fromstring(sheet_content)
            
            # We want to extract cells
            rows = {}
            for row in sheet_root.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'):
                row_idx = int(row.attrib.get('r'))
                row_data = {}
                for cell in row.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                    ref = cell.attrib.get('r') # e.g. "A1"
                    col_letter = ''.join([c for c in ref if not c.isdigit()])
                    val_el = cell.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                    val = ""
                    if val_el is not None:
                        val = val_el.text or ""
                        cell_type = cell.attrib.get('t')
                        if cell_type == 's': # shared string
                            val = shared_strings[int(val)]
                    row_data[col_letter] = val
                rows[row_idx] = row_data
            
            # Format rows as columns A to I (A, B, C, D, E, F, G, H, I)
            cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
            formatted_rows = []
            max_row = max(rows.keys()) if rows else 0
            for r in range(1, max_row + 1):
                row_data = rows.get(r, {})
                row_list = [row_data.get(c, "") for c in cols]
                formatted_rows.append(row_list)
                
            return {
                "headers": cols,
                "rows": formatted_rows
            }
            
    return None

data = read_xlsx(file_path)
if data:
    with open("excel_data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("Successfully wrote parsed data to excel_data.json. Rows count:", len(data['rows']))
else:
    print("Failed to parse sheet.")
