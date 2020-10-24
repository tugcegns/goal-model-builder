# %%
from flask import Flask, request, render_template
from flask_restplus import Api, Resource
import logging

# %%
#from converter import Converter
from convertAndQuery import Converter
import io

# %%
import sys
import import_ipynb
import json
import re
import spacy
from spacy import displacy
from spacy.symbols import nsubj, dobj, pobj, NOUN, VERB, aux
import pkg_resources
from symspellpy import SymSpell, Verbosity
nlp = spacy.load("en_core_web_sm")

# %%
from flask_cors import CORS
from flask import jsonify

# %%
app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
CORS(app)


# %%
@app.route('/upload', methods = ['GET', 'POST'])
def read_file():
    if request.method == 'POST':
        file = request.files['file']
        if not file:
            return "Please select a file"
        else:
            content = file.read().decode('unicode_escape')
            heuristic_number = request.form.get('value')
            return jsonify(Converter.main(content, heuristic_number))


# %%
if __name__ == '__main__':
    app.run(debug=True)
