# -*- coding: utf-8 -*-
# %%
from py2neo import Graph, Node, Relationship
import json
import pandas as pd
from collections import defaultdict 


# %%
class QueryGraph:
    def create_db(csvpath, graph):
        '''
        Creates a graph database in Neo4j from csv file.
        '''
        strcsv = 'file:///' + csvpath.as_posix()
        query = '''
                LOAD CSV WITH HEADERS FROM {csvfile} AS row FIELDTERMINATOR ';'
                MERGE (r:Role {role_name: row.actors})
                MERGE (i:Id {us_id: row.us_id})
                MERGE (o:Object {obj_name: row.mainObjects})
                MERGE (v:Verb {action_name: row.mainVerbs})
                MERGE (i)-[:object]->(o)
                MERGE (i)-[:action]->(v)
                MERGE (i)-[:role]->(r)
                '''
        graph.run(query, parameters = {'csvfile':strcsv})
        return graph
    
    
    def get_role_types(graph):
        '''
        Returns a list of role types in the graph.
        '''
        query = '''
                MATCH (n:Role) RETURN n.role_name as rolename
                '''
        role_list = [x['rolename'] for x in graph.run(query).data()]
        return role_list


    def get_actions_by_role(graph, role_list):
        role_action = []
        for role in role_list:
            query = '''
                        MATCH (v:Verb)<-[:action]-(i:Id)-[:role]->(r:Role {role_name: {role_var}})
                        with i,v,r
                        match (i:Id)-[:object]->(o:Object)
                        RETURN r.role_name as role, v.action_name as action, o.obj_name as object
                    '''
            action_object_list = [x['action']+ ' ' +x['object'] for x in graph.run(query, role_var=role).data()]
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


    #TODO : heuristic 3 yazılacak.
    
    
    def result(roles,deflist):
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
        graph = Graph(ip_addr = "http://localhost:7474/db/data", username = "tugce", password = "tugce")
        graph = QueryGraph.create_db(csv_path, graph)
        roles = QueryGraph.get_role_types(graph)
        actions_and_objects = QueryGraph.get_actions_by_role(graph,role_list=roles)
        role_action_map = QueryGraph.create_map(roles,actions_and_objects)
        rslt = []
        if heuristic_number == 'h1':
            rslt = QueryGraph.create_heuristic1(role_action_map)
        elif heuristic_number == 'h2':
            rslt = QueryGraph.create_heuristic2(role_action_map)
        #else:
        #    rslt = QueryGraph.create_heuristic3(role_action_map)
        
        solution = QueryGraph.result(roles,rslt)
        return json.dumps(QueryGraph.json_formatter(solution))

