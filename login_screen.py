import tkinter as tk
from tkinter import messagebox
import pyrebase

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

def show_login_screen(root, on_login_success):
    def login():
        email = email_entry.get()
        password = password_entry.get()
        try:
            user = auth.sign_in_with_email_and_password("praguna7@gmail.com", "admin123")
            on_login_success(user['localId'])
        except Exception as e:
            error_message = str(e)
            if "INVALID_EMAIL" in error_message:
                messagebox.showerror("Error", "The email address you entered does not exist. Please try again.")
            elif "INVALID_PASSWORD" in error_message:
                messagebox.showerror("Error", "The password you entered is incorrect. Please try again.")
            elif "MISSING_PASSWORD" in error_message:
                messagebox.showerror("Error", "Please enter the password.")
            elif "USER_DISABLED" in error_message:
                messagebox.showerror("Error", "The user account has been disabled by an administrator.")
            elif "INVALID_LOGIN_CREDENTIALS" in error_message:
                messagebox.showerror("Error", "Invalid login credentials")
            elif "TOO_MANY_ATTEMPTS_TRY_LATER" in error_message:
                messagebox.showerror("Error", "We have detected unusual activity on this account. Please try again later.")
            else:
                # messagebox.showerror("Error", "Login failed. Try again with correct email & password")
                messagebox.showerror("Error", error_message)

    # Create login frame
    login_frame = tk.Frame(root)
    login_frame.pack(pady=20)

    tk.Label(login_frame, text="Email:", font=('Helvetica', 14)).grid(row=0, column=0, padx=10, pady=10)
    email_entry = tk.Entry(login_frame, font=('Helvetica', 14))
    email_entry.grid(row=0, column=1, padx=10, pady=10)

    tk.Label(login_frame, text="Password:", font=('Helvetica', 14)).grid(row=1, column=0, padx=10, pady=10)
    password_entry = tk.Entry(login_frame, show='*', font=('Helvetica', 14))
    password_entry.grid(row=1, column=1, padx=10, pady=10)

    login_button = tk.Button(login_frame, text="Login", command=login, font=('Helvetica', 14))
    login_button.grid(row=2, column=0, columnspan=2, pady=20)

    return login_frame
