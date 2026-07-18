#!/usr/bin/env python3
"""
Script para probar los endpoints de la API de toxicidad
Ejecuta: python test_api.py
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Prueba que el servicio esté activo"""
    print("🔍 Probando endpoint raíz...")
    response = requests.get(f"{BASE_URL}/")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}\n")

def test_single_prediction():
    """Prueba predicción individual"""
    print("📝 Probando predicción individual...")
    
    test_cases = [
        "gracias por el gran trabajo equipo",
        "eres un idiota, callate",
        "Hola, ¿cómo estás?",
        "Te odio, eres lo peor"
    ]
    
    for text in test_cases:
        response = requests.post(
            f"{BASE_URL}/predict",
            json={"text": text}
        )
        
        if response.status_code == 200:
            data = response.json()
            emoji = "🚨" if data["is_toxic"] else "✅"
            print(f"{emoji} '{text}'")
            print(f"   → Toxicidad: {data['toxicity_percentage']} (score: {data['toxicity_score']})\n")
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"   {response.text}\n")

def test_batch_prediction():
    """Prueba predicción en lote"""
    print("📦 Probando predicción en lote...")
    
    texts = [
        "gracias por el gran trabajo equipo",
        "eres un idiota, callate",
        "Esto es muy bonito",
        "Te odio, eres lo peor"
    ]
    
    response = requests.post(
        f"{BASE_URL}/batch-predict",
        json={"texts": texts}
    )
    
    if response.status_code == 200:
        results = response.json()
        print(f"Analizados {len(results)} mensajes:\n")
        
        for result in results:
            emoji = "🚨" if result["is_toxic"] else "✅"
            print(f"{emoji} '{result['text']}'")
            print(f"   → {result['toxicity_percentage']} (score: {result['toxicity_score']})\n")
    else:
        print(f"❌ Error: {response.status_code}")
        print(f"   {response.text}\n")

if __name__ == "__main__":
    print("=" * 60)
    print("🛡️  TOXICITY MODEL API - TEST SUITE")
    print("=" * 60)
    print()
    
    try:
        test_health()
        test_single_prediction()
        test_batch_prediction()
        
        print("=" * 60)
        print("✅ Todas las pruebas completadas")
        print("=" * 60)
        
    except requests.exceptions.ConnectionError:
        print("❌ Error: No se puede conectar al servicio")
        print(f"   Asegúrate de que el servidor esté en ejecución en {BASE_URL}")
        print("   Ejecuta: python main.py")
    except Exception as e:
        print(f"❌ Error: {e}")
