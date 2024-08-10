import firebase_admin
from firebase_admin import credentials

def initialize_firebase():
    # Initialize Firebase Admin SDK
    cred = credentials.Certificate("./firebase/serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
