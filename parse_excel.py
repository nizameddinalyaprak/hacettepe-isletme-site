import pandas as pd
import json

file_path = "/Volumes/T9_Main/onedrive_hacettepe/04_Projeler_ve_Girisimler/Web_Sitesi_Yonetimi/02_Canli_Web_Sitesi/final_programi_2526bahar.xlsx"

try:
    # Read columns A to I (0 to 8)
    df = pd.read_excel(file_path, usecols="A:I")
    
    # Convert to list of dicts, handle NaN values
    df = df.fillna("")
    
    def clean_val(v):
        if isinstance(v, (int, float)):
            if float(v).is_integer():
                return str(int(v))
            return str(v)
        return str(v).strip()
        
    headers = [str(c) for c in df.columns]
    data = [headers] + [[clean_val(cell) for cell in row] for row in df.values]
    
    output = {
        "headers": headers,
        "rows": data
    }
    
    print(json.dumps(output, ensure_ascii=False, indent=2))
except Exception as e:
    import traceback
    print(json.dumps({"error": str(e), "trace": traceback.format_exc()}))
