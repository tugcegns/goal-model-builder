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


    def get_actions_by_role(graph, role_list):
        role_action = []
        for role in role_list:
            query = '''
                        MATCH (av:Verb)<-[:ACT_VERB]-(i:Id)-[:ROLE]->(r:Role {role_name: {role_var}})
                        with i,av,r
                        match (i:Id)-[:ACT_OBJ]->(ao:Object)
                        RETURN r.role_name as role, av.action_verb as action_verb, ao.action_object as action_object
                    '''
            action_object_list = [x['action_verb']+ ' ' +x['action_object'] for x in graph.run(query, role_var=role).data()]
            role_action.append(action_object_list)
        return json.loads((str(json.dumps(role_action))))  
    
    
    def create_map(roles,actions):
        mapped_val = dict(zip(roles,actions))
        return json.loads(str(json.dumps(mapped_val)))


    def create_heuristic1(role_action_map):
        deflistverb = []
        for each in list(role_action_map.values()):
            d = defaultdict(list)
            for item in each:
                d[item.split(' ')[0] + ' operations conducted'].append(item)
            deflistverb.append(d)
        return deflistverb
    
    
    def create_heuristic2(role_action_map):
        deflistobj = []
        for each in list(role_action_map.values()):
            d = defaultdict(list)
            for item in each:
                d[item.split(' ')[-1] + ' operations done'].append(item)
            deflistobj.append(d)
        return deflistobj

    def create_new_dict_heu3(role_action_map):
        res=[]
        new_dict = {}
        for k,v in role_action_map.items():
            for each in v:
                res.append(each + ' by ' + k)    
        new_dict["null"] = res  
        return new_dict

    def create_heuristic3(role_action_map):
        new_dict = QueryGraph.create_new_dict_heu3(role_action_map)
        deflist_h3 = []
        for each in list(new_dict.values()):
            d = defaultdict(list)
            for item in each:
                d[re.search('s*([^,\.]*?)\s*(,|\.|by)', item).group(1).split(' ', 1)[1]].append(item)
            deflist_h3.append(d)
        return deflist_h3

    def get_actions_and_benefits_by_role(graph, role_list):
        role_actions_benefits = []
        for role in role_list:
            query = '''
                    MATCH (bo:BenefitObj)<-[:BNF_OBJ]-(i:Id)-[:ROLE]->(r:Role {role_name: {role_var}})
                    with i,bo,r
                    match (i:Id)-[:BNF_VERB]->(bv:BenefitVerb)
                    match (i:Id)-[:ACT_OBJ]->(ao:Object)
                    match (i:Id)-[:ACT_VERB]->(av:Verb)
                    RETURN r.role_name as role, av.action_verb as action_verb, ao.action_object as action_object, bo.benefit_obj as benefit_object, bv.benefit_verb as benefit_verb
                    '''
            result = graph.run(query, role_var=role).data()
            d = defaultdict(list)
            for row in result:
                key = row['benefit_verb'] + " " + row['benefit_object']
                value = row['action_verb'] + " " + row['action_object']
                d[key].append(value)
            role_actions_benefits.append(d)
        return json.loads((str(json.dumps(role_actions_benefits))))

    def create_heuristic4(role_benefit_map):
        pass
    
    def result(roles,deflist,heuristic_number):
        if heuristic_number == 'h3':
            no_actor = ["null"]
            mapped_val = dict(zip(no_actor, deflist))
        else:    
            mapped_val = dict(zip(roles,deflist))
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
            rslt = QueryGraph.get_actions_and_benefits_by_role(graph,role_list=roles)

        solution = QueryGraph.result(roles,rslt, heuristic_number)
        return json.dumps(QueryGraph.json_formatter(solution))
