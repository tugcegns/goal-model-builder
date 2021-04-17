#!/usr/bin/env python
# coding: utf-8

# In[ ]:


# -*- coding: utf-8 -*-
# %%
from py2neo import Graph, Node, Relationship
import json
import pandas as pd
from collections import defaultdict 
import logging
import re


# %%
class QueryGraph:
    
    def delete_all_db(graph):
        query = '''
                MATCH (n)
                DETACH DELETE n
                '''
        graph.run(query)
        return graph
    
    
    def create_db(csvpath, graph):
        '''
        Creates a graph database in Neo4j from csv file.
        '''
        strcsv = 'file:///' + csvpath.as_posix()
        query = '''
                LOAD CSV WITH HEADERS FROM {csvfile} AS row FIELDTERMINATOR ';'
                MERGE (r:Role {role_name: row.actors})
                MERGE (i:Id {us_id: row.us_id})
                MERGE (ao:Object {action_object: row.mainObjects})
                MERGE (av:Verb {action_verb: row.mainVerbs})
                MERGE (bo:BenefitObj {benefit_obj: coalesce(row.benefitObjects, "None")})
                MERGE (bv:BenefitVerb {benefit_verb: coalesce(row.benefitVerbs, "None")})
                MERGE (i)-[:ACT_VERB]->(av)
                MERGE (i)-[:ACT_OBJ]->(ao)
                MERGE (i)-[:BNF_VERB]->(bv)
                MERGE (i)-[:BNF_OBJ]->(bo)
                MERGE (i)-[:ROLE]->(r)
                '''
        graph.run(query, parameters = {'csvfile':strcsv})
        return graph
   

    def eliminate_duplicate_verb(graph):
        query = '''
            WITH * LIMIT 10
            MATCH (av:Verb)           
            MATCH (bv:BenefitVerb)
            WHERE av.action_verb = bv.benefit_verb
            CALL apoc.refactor.mergeNodes([av,bv]) YIELD node1
            RETURN "none"
            '''  

        
    def eliminate_duplicate_obj(graph):
        query = '''
            WITH ao,bo
            MATCH (ao:Object)            
            MATCH (bo:BenefitObj)
            WHERE ao.action_object = bo.benefit_obj
            CALL apoc.refactor.mergeNodes([ao,bo]) YIELD node2
            RETURN "none"
            '''
    
    
    def get_role_types(graph):
        '''
        Returns a list of role types in the graph.
        '''
        query = '''
                MATCH (r:Role) RETURN r.role_name as rolename
                '''
        role_list = [x['rolename'] for x in graph.run(query).data()]
        return role_list

    #Query for Heuristics 1, 2 and 3
    def get_actions_by_role(graph, role_list):
        role_actions = []
        for role in role_list:
            query = '''
                        MATCH (av:Verb)<-[:ACT_VERB]-(i:Id)-[:ROLE]->(r:Role {role_name: {role_var}})
                        with i,av,r
                        match (i:Id)-[:ACT_OBJ]->(ao:Object)
                        RETURN av.action_verb as action_verb, ao.action_object as action_object
                    '''
            result = graph.run(query, role_var=role).data()
            role_actions.append(result)
        return json.loads((str(json.dumps(role_actions))))  
    
    def create_heuristic1(role_action_map):
        new_map = defaultdict(list)
        for role, rows in role_action_map.items():
            d = defaultdict(list)
            for row in rows:
                d[row['action_verb'] + ' operations conducted'].append(" ".join([row[k] for k in row]))
            new_map[role] = d
        return new_map
    
    def create_heuristic2(role_action_map):
        new_map = defaultdict(list)
        for role, rows in role_action_map.items():
            d = defaultdict(list)
            for row in rows:
                d[row['action_object'] + ' operations done'].append(" ".join([row[k] for k in row]))
            new_map[role] = d
        return new_map

    def create_heuristic3(role_action_map):
        container = defaultdict(list)
        for role, rows in role_action_map.items():
            for row in rows:
                container[row['action_object']].append(" ".join([row[k] for k in row]) + " as " + role)
        new_map = {"null":container}
        return new_map

    #Query for Heuristics 4 and 5
    def get_actions_and_benefits_by_role(graph, role_list):
        role_actions_benefits = []
        for role in role_list:
            query = '''
                    MATCH (bo:BenefitObj)<-[:BNF_OBJ]-(i:Id)-[:ROLE]->(r:Role {role_name: {role_var}})
                    with i,bo,r
                    match (i:Id)-[:BNF_VERB]->(bv:BenefitVerb)
                    match (i:Id)-[:ACT_OBJ]->(ao:Object)
                    match (i:Id)-[:ACT_VERB]->(av:Verb)
                    RETURN av.action_verb as action_verb, ao.action_object as action_object, bo.benefit_obj as benefit_object, bv.benefit_verb as benefit_verb
                    '''
            result = graph.run(query, role_var=role).data()
            role_actions_benefits.append(result)
        return json.loads((str(json.dumps(role_actions_benefits))))

    def create_heuristic4(role_actions_benefits_map):
        new_map = defaultdict(list)
        for role, rows in role_actions_benefits_map.items():
            d = defaultdict(list)
            for row in rows:
                key = "to " + row['benefit_verb'] + " " + row['benefit_object']
                value = row['action_verb'] + " " + row['action_object']
                d[key].append(value)
            new_map[role] = d
        return new_map
        
    def create_heuristic5(role_actions_benefits_map):
        container = defaultdict(list)
        for role, rows in role_actions_benefits_map.items():
            for row in rows:
                key = "to " + row['benefit_verb'] + " " + row['benefit_object']
                value = row['action_verb'] + " " + row['action_object'] + " as " + role
                container[key].append(value)

        new_map = {"null": container}
        return new_map
    
    def create_map(roles, objects):
        mapped_val = dict(zip(roles, objects))
        return json.loads(str(json.dumps(mapped_val)))
    
    def json_formatter(rslt):
        json_dict = {}
        for k,v in rslt.items():
            arr=[]
            for top,low in v.items():
                 arr.append({"type": "goal", "label": top, "children": [{"type": "goal", "label": low, "relationship": "and"}]})
            json_dict[k]=arr 
        return json_dict    
    
    def main(csv_path, heuristic_number):
        graph = Graph(ip_addr = "http://localhost:7474/db/data")
        graph = QueryGraph.delete_all_db(graph)
        graph = QueryGraph.create_db(csv_path, graph)

        rslt = []
        roles = QueryGraph.get_role_types(graph)
        
        if heuristic_number in ['h1', 'h2', 'h3']:
            actions_and_objects = QueryGraph.get_actions_by_role(graph,role_list=roles)
            data = QueryGraph.create_map(roles,actions_and_objects)
            if heuristic_number == 'h1':
                rslt = QueryGraph.create_heuristic1(data)
            elif heuristic_number == 'h2':
                rslt = QueryGraph.create_heuristic2(data)
            else:
                rslt = QueryGraph.create_heuristic3(data)

        elif heuristic_number in ['h4', 'h5']:
            actions_and_benefits = QueryGraph.get_actions_and_benefits_by_role(graph,role_list=roles)
            data = QueryGraph.create_map(roles,actions_and_benefits)
            if heuristic_number == 'h4':
                rslt = QueryGraph.create_heuristic4(data)
            else:
                rslt = QueryGraph.create_heuristic5(data)

        return json.dumps(QueryGraph.json_formatter(rslt))
