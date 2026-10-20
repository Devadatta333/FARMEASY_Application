import os
import sys
from dotenv import load_dotenv

sys.stdout.reconfigure(line_buffering=True)
load_dotenv('AI/.env')

from app.rag.vectorstore import load_index
from app.rag.chain import answer
from app.schemas import CatalogItem

print("Loading index...", flush=True)
vs = load_index()
print("Index loaded:", vs is not None, flush=True)

print("\n--- Testing Farmer Query ---", flush=True)
farmer_q = "How do I prevent late blight in tomato?"
ans, sources = answer(vs, farmer_q, role="farmer")
print("Farmer Answer:\n", ans, flush=True)
print("Sources count:", len(sources), flush=True)
for s in sources:
    print(f" - [{s['source']}]: {s['snippet'][:80]}...", flush=True)

print("\n--- Testing Consumer Query with Catalog ---", flush=True)
catalog = [
    CatalogItem(name="Organic Red Tomatoes", category="Vegetables", price=40, unit="kg", quantity=15),
    CatalogItem(name="Fresh Spinach (Palak)", category="Vegetables", price=25, unit="bunch", quantity=20),
]
consumer_q = "Do you have any fresh vegetables available to buy?"
ans2, sources2 = answer(vs, consumer_q, role="consumer", catalog=catalog)
print("Consumer Answer:\n", ans2, flush=True)
