import pandas as pd
from openpyxl import Workbook
from datetime import datetime
import requests

def main():
    print("=== Welcome to the Interactive Python Demo ===")
    
    name = input("Enter your name: ")
    age = input("Enter your age: ")
    
    print(f"Hello, {name}! You are {age} years old.")

    # Fetch some data from an API
    choice = input("Do you want to fetch a random joke from an API? (yes/no): ").strip().lower()
    if choice == "yes":
        response = requests.get("https://official-joke-api.appspot.com/random_joke")
        if response.status_code == 200:
            joke = response.json()
            print(f"Here's a joke for you: {joke['setup']} - {joke['punchline']}")
        else:
            print("Failed to fetch a joke.")

    # Create a DataFrame and save as Excel
    data = {
        "Name": [name],
        "Age": [age],
        "Timestamp": [datetime.now().strftime("%Y-%m-%d %H:%M:%S")]
    }
    df = pd.DataFrame(data)
    excel_filename = "output.xlsx"
    df.to_excel(excel_filename, index=False)
    print(f"Data saved to {excel_filename}")

    # Save a TXT file
    txt_filename = "output.txt"
    with open(txt_filename, "w") as f:
        f.write(f"Name: {name}\nAge: {age}\nGenerated on: {datetime.now()}\n")
    print(f"Text data saved to {txt_filename}")

    print("=== Script finished ===")

if __name__ == "__main__":
    main()

