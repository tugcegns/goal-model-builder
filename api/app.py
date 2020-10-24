# %%
from flask import Flask, request, render_template
from flask import flash
#from flask_restplus import Api, Resource
import logging

# %%
#from converter import Converter
#from convertAndQuery import Converter
from new_process import Converter
import io

# %%
import sys
import json
import re
import spacy
from spacy import displacy
from spacy.symbols import nsubj, dobj, pobj, NOUN, VERB, aux
import pkg_resources
#from symspellpy import SymSpell, Verbosity
nlp = spacy.load("en_core_web_sm")

# %%
from flask_cors import CORS
from flask import jsonify

# %%
app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
CORS(app)

def format_checker(content):
    for num, line in enumerate(content, 1):
        if re.search(r'(A|a)s\s*?an?\s*([^,]*)?,', line) is None:
            return False
        else:
            return True    

# %%
@app.route('/upload', methods = ['GET', 'POST'])
def read_file():
    if request.method == 'POST':
        file = request.files['file']
        if not file:
            flash("Please select a file")
        else:
            content = file.read().decode('unicode_escape')
            heuristic_number = request.form.get('value')
            return Converter.main(content, heuristic_number)  

# %%
if __name__ == '__main__':
    app.run(debug=True)
