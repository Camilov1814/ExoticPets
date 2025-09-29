import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# --- 1. Leer las tres hojas ---
archivo = "Sample - Superstore.xls"  # Cambia por el nombre real
ordenes = pd.read_excel(archivo, sheet_name=0)
devoluciones = pd.read_excel(archivo, sheet_name=1)
personas = pd.read_excel(archivo, sheet_name=2)

# --- 2. Limpieza de datos ---
# Comas decimales
for col in ['Sales', 'Profit', 'Discount']:
    ordenes[col] = ordenes[col].astype(str).str.replace(',', '.').astype(float)

# Fechas
ordenes['Order Date'] = pd.to_datetime(ordenes['Order Date'], dayfirst=True, errors='coerce')

# --- 3. Unir con devoluciones ---
ordenes = ordenes.merge(devoluciones, on='Order ID', how='left')
ordenes['Returned'] = ordenes['Returned'].fillna('No')

# --- 4. Unir con personas por región ---
ordenes = ordenes.merge(personas, on='Region', how='left')

# --- 5. Resumen de devoluciones ---
dev_stats = ordenes.groupby('Returned')[['Sales', 'Profit']].sum()
print("\n📦 Impacto de las devoluciones:")
print(dev_stats)

# --- 6. Ventas por persona ---
ventas_persona = ordenes.groupby('Person')['Sales'].sum().sort_values(ascending=False)
print("\n👥 Ventas por persona:")
print(ventas_persona)

# --- 7. Graficar devoluciones ---
plt.figure(figsize=(6,4))
sns.countplot(data=ordenes, x='Returned', palette='pastel')
plt.title("Número de órdenes devueltas vs no devueltas")
plt.show()

# --- 8. Graficar ventas por persona ---
ventas_persona.plot(kind='bar', color='skyblue')
plt.title("Ventas por persona")
plt.ylabel("Ventas ($)")
plt.show()

# --- 9. Guardar datos limpios ---
ordenes.to_csv("ventas_con_devoluciones_persona.csv", index=False)
