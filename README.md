# 📄 Document Converter 🚀  

*A powerful web application that allows users to convert between document formats seamlessly and efficiently.*  

<div align="center">

![image](https://github.com/user-attachments/assets/4ccd2593-1f4c-4eb1-a75c-b09f230615c8)



![image](https://github.com/user-attachments/assets/5b7f6db3-9926-424e-beb0-be3ea5f7b69c)




</div>  

---

## ✨ Features  

✅ **Simple, modern UI** – Drag & drop functionality for easy file selection  
🔄 **Bidirectional Conversion** – Convert **DOCX to PDF** and **PDF to DOCX**  
📦 **Batch Processing** – Convert multiple files at once with **automatic ZIP packaging**  
🚀 **Parallel Processing** – Faster conversions using multi-threading  
📱 **Fully Responsive** – Works on both desktop & mobile devices  
⚡ **Real-time Progress** – Track conversion status instantly  
🔒 **Secure Handling** – Temporary storage ensures privacy and safety  

---

## 🛠 Tech Stack  

💻 **Backend:** Python with Flask web framework  
📄 **Document Processing:**  
   - 📝 **DOCX → PDF** – Microsoft Word COM automation  
   - 📑 **PDF → DOCX** – `pdf2docx` library  
🎨 **Frontend:** HTML, CSS, JavaScript (Vanilla)  
📦 **Dependencies:** `flask`, `comtypes`, `pythoncom`, `werkzeug`, `pdf2docx`  

---

## 📌 Prerequisites  

- 🐍 **Python 3.6+** – Required for running the application  
- 📝 **Microsoft Word** – Needed for **DOCX → PDF** conversion  

---

## 📥 Installation  

1️⃣ **Clone the repository:**  
```bash
git clone https://github.com/yourusername/document-converter.git
cd document-converter

2️⃣ Create and activate a virtual environment:
   ```bashpython -m venv venv
venv\Scripts\activate  # For Windows
source venv/bin/activate  # For macOS/Linux
   ```

3️⃣ Install dependencies:
   ```bash
 pip install flask comtypes werkzeug pdf2docx
   ```

## Usage

1️⃣ Run the application:
   ```bash
   python app.py
   ```

2️⃣ Open your browser and visit:
   ```
   http://127.0.0.1:5000/
   ```

3️⃣ Use the application:
Select conversion type (DOCX → PDF or PDF → DOCX)

Drag & drop files or click to browse and select files

Click "Convert Files"

The converted files will be automatically downloaded as a ZIP archive

## 📂 Project Structure

```Dcoument-Converter/
├── app.py
├── requirements.txt
├── static/
│   ├── css/
│   │   ├── main.css
│   │   └── thank-you.css
│   └── js/
│       ├── main.js
│       └── thank-you.js
└── templates/
    ├── index.html
    └── thank_you.html
```


## 🔍 How It Works
🔹 File Upload – User uploads DOCX or PDF files through the web interface
🔹 Server Processing:

DOCX → PDF – Uses Microsoft Word COM automation via comtypes

PDF → DOCX – Uses pdf2docx for accurate text extraction
🔹 Parallel Processing – Converts multiple files simultaneously
🔹 File Packaging – Converted files are bundled into a ZIP archive
🔹 Download & Cleanup – User receives the ZIP file, and temporary files are cleaned up automatically



## 📬 Contact  

<p align="center">
  <a href="https://github.com/Abhinek8987">
    <img src="https://img.shields.io/badge/GitHub-000?logo=github&logoColor=white&style=for-the-badge" />
  </a>
  <a href="https://www.linkedin.com/in/abhinek-kumar-pandey-bb8821248/">
    <img src="https://img.shields.io/badge/LinkedIn-0A66C2?logo=linkedin&logoColor=white&style=for-the-badge" />
  </a>
  <a href="mailto:kumar12345abhinek@gmail.com">
    <img src="https://img.shields.io/badge/Email-D14836?logo=gmail&logoColor=white&style=for-the-badge" />
  </a>
</p>



