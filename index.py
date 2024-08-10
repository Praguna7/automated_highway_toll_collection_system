import cv2
import numpy as np
import pytesseract
from tkinter import *
from tkinter import ttk
from PIL import Image, ImageTk
from ultralytics import YOLO
import dill  # Ensure dill is imported
import re
import pyrebase
import firebase_admin
from firebase_admin import credentials, firestore
from login_screen import show_login_screen

# Set the path to the Tesseract executable
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Load your custom YOLO model
model = YOLO('license_plate_detector.pt')  # Make sure the 'best.pt' file is in the same directory

# Firebase configuration
config = {
    "apiKey": "AIzaSyB0bocjx7pIwpWxbC7Qfb7XQbSiHDQwjk0",
    "authDomain": "atcs-96271.firebaseapp.com",
    "databaseURL": "https://atcs-96271.firebaseio.com",
    "projectId": "atcs-96271",
    "storageBucket": "atcs-96271.appspot.com",
    "messagingSenderId": "1046881613444",
    "appId": "1:1046881613444:web:7cacf4aea8e85c6f51b4d1"
}

firebase = pyrebase.initialize_app(config)
auth = firebase.auth()

cred = credentials.Certificate("./firebase/serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

def enforce_constraints(text):
    text = re.sub(r'[^A-Z0-9]', '', text)
    text = re.sub(r'[A-Z]+$', '', text)
    if len(text) >= 4 and text[-4:].isdigit():
        prefix = text[:-4]
        numbers = text[-4:]
        if len(prefix) > 3:
            prefix = prefix[-3:]
        if len(prefix) > 2 and prefix[0] not in ['C', 'D']:
            prefix = prefix[-2:]
        return prefix + numbers
    return None

def detect_number_plate():
    cap = cv2.VideoCapture(0)  # Ensure this is the correct camera index

    def update_frame():
        ret, frame = cap.read()
        if not ret:
            return

        results = model(frame)
        constrained_text = ""
        for result in results:
            for box in result.boxes:
                if box.cls.item() == 0: 
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    confidence = box.conf.item()
                    if confidence > 0.6:
                        roi = frame[y1:y2, x1:x2]
                        gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
                        custom_config = r'--oem 3 --psm 8 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
                        detected_text = pytesseract.image_to_string(gray, config=custom_config)
                        constrained_text = enforce_constraints(detected_text)
                        cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)

        frame_height, frame_width = frame.shape[:2]
        aspect_ratio = frame_width / frame_height
        new_width = int(600 * aspect_ratio)
        new_height = int(new_width / aspect_ratio)
        resized_frame = cv2.resize(frame, (new_width, new_height))

        rgb_frame = cv2.cvtColor(resized_frame, cv2.COLOR_BGR2RGB)
        img = Image.fromarray(rgb_frame)
        imgtk = ImageTk.PhotoImage(image=img)
        video_label.imgtk = imgtk
        video_label.configure(image=imgtk)
        detected_number_plate.set(constrained_text)
        video_label.after(10, update_frame)

    update_frame()

def load_qr_code_image(interchange,interchange_type):
    try: 
        qr_code_path = f"./QRcodes/{interchange_type}/{interchange}_{interchange_type}.png"
        qr_image = cv2.imread(qr_code_path)
        if qr_image is None:
            raise FileNotFoundError(f"QR code image for {interchange} {interchange_type} not found.")
        qr_image_rgb = cv2.cvtColor(qr_image, cv2.COLOR_BGR2RGB)
        qr_photo = ImageTk.PhotoImage(image=Image.fromarray(qr_image_rgb))
        return qr_photo
    except Exception as e:
        print(f"Error loading QR code image: {e}")
        return None

def show_detection_window(user_id):
    root = Tk()
    root.title("Number Plate Detection")

    main_frame = Frame(root)
    main_frame.pack(fill=BOTH, expand=True)

    left_frame = Frame(main_frame, width=200)
    left_frame.pack(side=LEFT, fill=Y, padx=10, pady=10)

    right_frame = Frame(main_frame)
    right_frame.pack(side=RIGHT, fill=BOTH, expand=True)

    logout_button = Button(left_frame, text="Logout", font=('Helvetica', 14), command=root.destroy)
    logout_button.pack(pady=10)

    interchanges = ["Peliyagoda", "Kerawalapitiya", "Ja-Ela", "Katunayake"]
    interchange_type = ["IN","OUT"]
    selected_interchange = StringVar()
    selected_interchange_type = StringVar()
    selected_interchange.set(interchanges[0])
    selected_interchange_type.set(interchange_type[0])
    interchange_label = Label(left_frame, text="Select Interchange:", font=('Helvetica', 14))
    interchange_label_type = Label(left_frame, text="Select Interchange Typr:", font=('Helvetica', 14))
    interchange_label.pack(pady=5)
    interchange_label_type.pack(pady=5)
    interchange_dropdown = OptionMenu(left_frame, selected_interchange, *interchanges, command=lambda _: update_qr_code())
    interchange_dropdown_type = OptionMenu(left_frame, selected_interchange_type, *interchange_type, command=lambda _: update_qr_code())
    interchange_dropdown.pack(pady=5)
    interchange_dropdown_type.pack(pady=5)


    qr_label = Label(left_frame, text="Scan me if gate didn't open automatically", font=('Helvetica', 12))
    qr_label.pack(pady=5)
    global qr_code_label
    qr_code_label = Label(left_frame)
    qr_code_label.pack(pady=5)
    def create_toll_gate_listner():
        try:
            doc_ref = db.collection("toll_gate_state").document(selected_interchange.get())
            doc_watch = doc_ref.on_snapshot(on_snapshot)
            print("Listener attached successfully.")
        except Exception as e:
            print(f"Error setting up Firestore listener: {e}")
    def update_qr_code():
        selected_qr_photo = load_qr_code_image(selected_interchange.get(),selected_interchange_type.get())
        if selected_qr_photo:
            qr_code_label.configure(image=selected_qr_photo)
            qr_code_label.image = selected_qr_photo
        else:
            qr_code_label.configure(image='', text="QR code not found")
        create_toll_gate_listner()

    update_qr_code()

    gate_state_label = Label(left_frame, text="Toll Gate State:", font=('Helvetica', 12))
    gate_state_label.pack(pady=5)
    gate_state_indicator = Canvas(left_frame, width=50, height=50)
    gate_state_indicator.pack(pady=5)

    def update_gate_state(state):
        print(f"Updating gate state to: {state}")  # Debugging print statement
        gate_state_indicator.delete("all")
        color = "green" if state == "open" else "red"
        gate_state_indicator.create_oval(10, 10, 40, 40, fill=color)
        gate_state_label.config(text=f"Toll Gate State: {state.capitalize()}")

    def on_snapshot(doc_snapshot, changes, read_time):
        print("Snapshot received.")
        for change in changes:
            print(f"Change type: {change.type.name}")
            doc = change.document
            print(f"Document ID: {doc.id}")
            print(f"Document data: {doc.to_dict()}")

            gate_state = change.document.to_dict().get(selected_interchange_type.get().lower(), "closed")
            print(f"Gate state from Firestore: {gate_state}")  # Debugging print statement
            update_gate_state(gate_state)
    
    create_toll_gate_listner()

    video_frame = Frame(right_frame)
    video_frame.pack(fill=BOTH, expand=True)

    global video_label
    video_label = Label(video_frame)
    video_label.pack()

    global detected_number_plate
    detected_number_plate = StringVar()

    label = ttk.Label(right_frame, text="Detected Number Plate:", font=('Helvetica', 14))
    label.pack(pady=5)
    number_plate_label = ttk.Label(right_frame, textvariable=detected_number_plate, font=('Helvetica', 20), background="white", anchor="center", relief="solid", width=30)
    number_plate_label.pack(pady=10)

    start_button = ttk.Button(right_frame, text="Start Detection", command=detect_number_plate)
    start_button.pack(pady=20)

    root.mainloop()

if __name__ == "__main__":
    root = Tk()
    root.title("Login")

    def on_login_success(user_id):
        root.destroy()
        show_detection_window(user_id)

    show_login_screen(root, on_login_success)
    root.mainloop()
