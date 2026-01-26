import pandas as pd

def analyze_csv(file):
    df = pd.read_csv(file)

    summary = {
        "total_count": int(len(df)),
        "avg_flowrate": round(df["Flowrate"].mean(), 2),
        "avg_pressure": round(df["Pressure"].mean(), 2),
        "avg_temperature": round(df["Temperature"].mean(), 2),
        "type_distribution": df["Type"].value_counts().to_dict()
    }

    return summary
