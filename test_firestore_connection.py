import firebase_admin
from firebase_admin import credentials, firestore
import logging

# Set logging level to DEBUG
logging.basicConfig(level=logging.DEBUG)

# Use a service account.
cred = credentials.Certificate('./firebase/serviceAccountKey.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

# Function to handle snapshot updates
def on_snapshot(doc_snapshot, changes, read_time):
    print("Snapshot received.")
    for change in changes:
        print(f'Change type: {change.type.name}')
        if change.type.name == 'ADDED':
            print(f'New document: {change.document.id}')
        elif change.type.name == 'MODIFIED':
            print(f'Modified document: {change.document.id}')
        elif change.type.name == 'REMOVED':
            print(f'Removed document: {change.document.id}')
        print(f'Document data: {change.document.to_dict()}')
        gate_state = change.document.to_dict().get("status", "closed")
        print(f'Gate state: {gate_state}')

# Set up Firestore listener
try:
    doc_ref = db.collection("toll_gate_state").document("gate")
    doc_watch = doc_ref.on_snapshot(on_snapshot)
    print("Listener attached successfully.")
except Exception as e:
    print(f"Error setting up Firestore listener: {e}")

# Function to manually update the document
def update_document():
    try:
        doc_ref.update({"status": "open"})
        print("Document updated to 'open'")
    except Exception as e:
        print(f"Error updating document: {e}")

print("Listening for updates... Press Ctrl+C to exit.")
print("Updating document to test listener...")

# Manually update the document to test the listener
update_document()

# Keep the script running to listen for updates
try:
    while True:
        pass
except KeyboardInterrupt:
    print("Exiting...")
