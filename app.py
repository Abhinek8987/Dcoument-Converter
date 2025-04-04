from flask import Flask, render_template, request, redirect, url_for, send_from_directory, jsonify
import os
import comtypes.client
import pythoncom
from werkzeug.utils import secure_filename
import tempfile
from zipfile import ZipFile
import time
from concurrent.futures import ThreadPoolExecutor
import pdf2docx

app = Flask(__name__, static_folder='static')
app.secret_key = 'your-secret-key-here'
app.config['UPLOAD_FOLDER'] = tempfile.mkdtemp()
app.config['CONVERTED_FOLDER'] = tempfile.mkdtemp()
app.config['ALLOWED_EXTENSIONS'] = {'doc', 'docx', 'pdf'}
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024

executor = ThreadPoolExecutor(max_workers=4)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def convert_to_pdf(doc_path, pdf_path):
    try:
        # First try Windows comtypes approach
        try:
            pythoncom.CoInitialize()
            word = comtypes.client.CreateObject("Word.Application")
            word.Visible = False
            doc = word.Documents.Open(doc_path)
            doc.SaveAs(pdf_path, FileFormat=17)
            doc.Close()
            word.Quit()
            pythoncom.CoUninitialize()
            return True
        except (ImportError, AttributeError, OSError):
            # Fallback to Linux LibreOffice if comtypes fails
            cmd = f"libreoffice --headless --convert-to pdf --outdir {os.path.dirname(pdf_path)} '{doc_path}'"
            if os.system(cmd) == 0:
                # LibreOffice adds .pdf extension automatically
                converted_file = os.path.splitext(doc_path)[0] + ".pdf"
                if os.path.exists(converted_file):
                    if converted_file != pdf_path:
                        os.rename(converted_file, pdf_path)
                    return True
            return False
    except Exception as e:
        print(f"Conversion error: {e}")
        return False

def convert_pdf_to_docx(pdf_path, docx_path):
    try:
        converter = pdf2docx.Converter(pdf_path)
        converter.convert(docx_path, start=0, end=None)
        converter.close()
        return True
    except Exception as e:
        print(f"Conversion error: {e}")
        return False

def create_zip(files, zip_path):
    with ZipFile(zip_path, 'w') as zipf:
        for file in files:
            zipf.write(file, os.path.basename(file))
    return True

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        if 'files' not in request.files:
            return jsonify({"error": "No files selected"}), 400
        
        files = request.files.getlist('files')
        if not files or files[0].filename == '':
            return jsonify({"error": "No files selected"}), 400

        conversion_type = request.form.get('conversion_type', 'docx_to_pdf')
        session_id = str(int(time.time()))
        upload_dir = os.path.join(app.config['UPLOAD_FOLDER'], session_id)
        converted_dir = os.path.join(app.config['CONVERTED_FOLDER'], session_id)
        os.makedirs(upload_dir, exist_ok=True)
        os.makedirs(converted_dir, exist_ok=True)

        input_paths, output_paths = [], []
        for file in files:
            if allowed_file(file.filename):
                filename = secure_filename(file.filename)
                input_path = os.path.join(upload_dir, filename)
                
                if conversion_type == 'docx_to_pdf' and filename.lower().endswith(('.doc', '.docx')):
                    output_filename = f"{os.path.splitext(filename)[0]}.pdf"
                elif conversion_type == 'pdf_to_docx' and filename.lower().endswith('.pdf'):
                    output_filename = f"{os.path.splitext(filename)[0]}.docx"
                else:
                    continue
                
                output_path = os.path.join(converted_dir, output_filename)
                file.save(input_path)
                input_paths.append(input_path)
                output_paths.append(output_path)

        if not input_paths:
            return jsonify({"error": "No valid files for selected conversion"}), 400

        futures = []
        if conversion_type == 'docx_to_pdf':
            futures = [executor.submit(convert_to_pdf, inp, out) for inp, out in zip(input_paths, output_paths)]
        elif conversion_type == 'pdf_to_docx':
            futures = [executor.submit(convert_pdf_to_docx, inp, out) for inp, out in zip(input_paths, output_paths)]
        
        success_count = sum(1 for f in futures if f.result())

        zip_filename = f"converted_{session_id}.zip"
        zip_path = os.path.join(app.config['CONVERTED_FOLDER'], zip_filename)
        if not create_zip([p for p in output_paths if os.path.exists(p)], zip_path):
            return jsonify({"error": "Failed to create ZIP"}), 500

        return jsonify({
            "download_url": url_for('download_file', filename=zip_filename),
            "message": f"Converted {success_count}/{len(files)} files successfully!",
            "stats": {
                "uploaded": len(files),
                "converted": success_count
            }
        })

    return render_template('index.html')

@app.route('/download/<filename>')
def download_file(filename):
    return send_from_directory(
        app.config['CONVERTED_FOLDER'],
        filename,
        as_attachment=True,
        download_name="Converted_Files.zip"
    )

@app.route('/thank-you')
def thank_you():
    return render_template('thank_you.html')

if __name__ == '__main__':
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static/css', exist_ok=True)
    os.makedirs('static/js', exist_ok=True)
    app.run(debug=True)