# %%
import sys
import import_ipynb
import json
import re
import spacy
import pandas as pd
import numpy as np
from spacy import displacy
from spacy.symbols import nsubj, dobj, pobj, NOUN, VERB, aux
import pkg_resources
from symspellpy import SymSpell, Verbosity
nlp = spacy.load("en_core_web_sm")
from pathlib import Path

# %%
from neo4jQueries import QueryGraph


# %%
class Converter:
    def getVerbsAndNouns(doc):
        verbs = []
        nouns = []
        for token in doc:
            if token.pos == VERB and token.dep != aux and token.text != "want":
                verbs.append(token)
            elif token.pos == NOUN:
                nouns.append(token)
        return verbs, nouns


    def getObject(token):
        if token.dep == pobj or token.dep == dobj:
            return token
        else:
            for child in token.children:
                obj = Converter.getObject(child)
                if(obj):
                    return obj
        return None


    def getObjectWithChunk(token, doc):
        obj = Converter.getObject(token)
        if not obj:
            return None
        else:
            obj_ = {}
            obj_["text"] = obj.text
            for chunk in doc.noun_chunks:
                if obj.text != chunk.text and obj.text in chunk.text:
                    obj_["chunk"] = chunk.text
                    break
            return obj_


    def tokenizeTagWords(text):
        global nlp
        doc = nlp(text)
        res = {}
        try:
            verbs, nouns = Converter.getVerbsAndNouns(doc)
            main_verb = verbs[0]

            # Add verb
            res["main_verb"] = main_verb.text

            # Create and add main object
            obj_ = Converter.getObjectWithChunk(main_verb, doc)
            if obj_ is None and len(nouns) > 0:
                res["main_object"] = {"text": nouns[0].text}
            else:
                res["main_object"] = obj_

            num_verbs = len(verbs)
            if num_verbs > 1 and "and" in text:
                # There might be another action
                sec_verbs = []
                for i in range(1, num_verbs):
                    sec_verbs.append(
                        {"verb": verbs[i].text, "object": Converter.getObjectWithChunk(verbs[i], doc)})
                res["sec-verbs"] = sec_verbs
        except Exception as error:
            #print(error.args)
            pass
        finally:
            return res


    def lowerFirstWord(sentence):
        words = sentence.split(' ')
        words[0] = words[0].lower()
        return " ".join(words)


    def printStories(file):
        user_stories = nlp(file)
        sentences = [sent.string.strip() for sent in user_stories.sents]
        parsed_stories = []
        # As a user, I want to click on the address, so that it takes me to a new tab with Google Maps.

        for story in sentences:
            story = story.strip()
            if not story.endswith('.'):
                story += '.'
            actor = re.search(r'(A|a)s\s*?an?\s*([^,]*)?,', story)
            action = re.search(
                r'[I|i]\s+?(want to|can|would like to)\s*([^,\.]*?)\s*(,|\.|so that)', story)
            benefit = re.search(r'so that\s*(.*)\.$', story)

            parsed_story = {}
            if actor:
                parsed_story["actor"] = actor.group(2)
            if action:
                parsed_story["action"] = action.group(2)
            if benefit:
                parsed_story["benefit"] = benefit.group(1)

            if parsed_story == {}:
                continue

            parsed_story["tokens"] = {}

            element = "action"

            if element in parsed_story:
                action = "I want to " + Converter.lowerFirstWord(parsed_story[element])
                parsed_story["tokens"][element] = Converter.tokenizeTagWords(action)

            element = "benefit"

            if element in parsed_story:
                benefit = Converter.lowerFirstWord(parsed_story[element])
                parsed_story["tokens"][element] = Converter.tokenizeTagWords(benefit)

            parsed_stories.append(parsed_story) 
        return parsed_stories


    def getFeatures(json_dict):
        actors, main_verb, main_obj = [], [], []
        for item in json_dict:
            actors.append(item.get('actor'))
            main_verb.append(item.get('tokens').get('action').get('main_verb'))
            #benefit.append(item.get('benefit')) 
            if len(item.get('tokens').get('action'))>0:
                main_obj.append(item.get('tokens').get('action').get('main_object').get('chunk'))
            else:
                main_obj.append('---')    
        return actors, main_verb, main_obj
    
    
    def create_csv(actorsCol, mainVerbsCol, mainObjCol):
        dataset = pd.DataFrame({'actors': list(actorsCol), 'mainVerbs': list(mainVerbsCol), 'mainObjects' : list(mainObjCol) }, columns=['actors', 'mainVerbs', 'mainObjects'])
        cleanedSet = dataset.dropna()
        cleanedSet.drop_duplicates(keep='first',inplace=True) 
        cleanedSet['us_id'] = range(1, 1+len(cleanedSet))
        
        mypath = Path().absolute()
        csvpath = mypath / 'USSet.csv'
        cleanedSet.to_csv(csvpath, sep=';', header=True, index=False)
        return csvpath
        

    def main(file, heuristic_number):
        json_dict = json.loads((str(json.dumps(Converter.printStories(file)))))
        actorsCol, mainVerbsCol, mainObjCol = Converter.getFeatures(json_dict)
        csvpath = Converter.create_csv(actorsCol, mainVerbsCol, mainObjCol)
        return QueryGraph.main(csvpath, heuristic_number)

