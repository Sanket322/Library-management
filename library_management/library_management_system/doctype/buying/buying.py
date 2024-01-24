# Copyright (c) 2024, sanket and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
import json


class Buying(Document):

    @frappe.whitelist()
    def getDatabaseBooks(self): 
        memberExists = frappe.db.get_list('Books') 
        return memberExists
    
	    
    @frappe.whitelist()
    def insertBooks(self,books,quentity):
        books = json.loads(books);
        print(books)
		
        for i in range(quentity):
            print(books[i])

            book_doc = frappe.get_doc({
				'doctype': 'Books',
				'article_name': books[i]['article_name'],
				'author': books[i]['author'],
                'isbn' : books[i]['isbn'],
				'status': 'Available',
				'route': books[i]['route'],
				'price': 100,
				'published': 1,
			})
			
            try:
                book_doc.insert()
            except Exception as e:
                #if code duplication error comes don;t break this
                if e.http_status_code == 409:
                    pass
                else:
                    return f"Error inserting data: {e}"

        return "Data inserted successfully"
    
        

