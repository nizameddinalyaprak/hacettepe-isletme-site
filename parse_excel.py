import pandas as pd
import json

file_path = "/Volumes/T9_Main/onedrive_hacettepe/04_Projeler_ve_Girisimler/Web_Sitesi_Yonetimi/02_Canli_Web_Sitesi/final_programi_2526bahar.xlsx"

try:
    # Read columns A to I (0 to 8)
    df = pd.read_excel(file_path, usecols="A:I")
    
    # Convert to list of dicts, handle NaN values
    df = df.fillna("")
    data = df.values.tolist()
    headers = [str(c) for c in df.columns]
    
    output = {
        "headers": headers,
        "rows": data
    }
    
    print(json.dumps(output, ensure_ascii=False, indent=2))
except Exception as e:
    import traceback
    print(json.dumps({"error": str(e), "trace": traceback.format_exc()}))
