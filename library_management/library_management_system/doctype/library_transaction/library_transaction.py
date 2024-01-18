# Copyright (c) 2024, sanket and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.model.docstatus import DocStatus


class LibraryTransaction(Document):

    def before_submit(self):

        if self.type == "Issue":
            self.validate_issue()
            self.validate_outstanding_debt()

            article = frappe.get_doc("Books", self.article)
            article.quentity = article.quentity - 1
            if article.quentity == 0:
                article.status = "Issued"

            article.save()

        elif self.type == "Return":

            # self.recordExists()

            article = frappe.get_doc("Books", self.article)
            article.quentity = article.quentity + 1
            article.status = "Available"
            article.save()


    @frappe.whitelist(allow_guest=True)
    def recordExists(self): 

        memberExists = frappe.db.get_list('Library Transaction',
            filters = {
                'article' : self.article,
                'library_member' : self.library_member,
                'type' : "Issue",
                'date' : ("<",self.date),
                "docstatus": DocStatus.submitted()
            },
            fields = ['date']
        ) 
        if memberExists :
            return memberExists
        else : 
            return "No record present"
    

    def validate_issue(self):
        self.validate_membership()
        article = frappe.get_doc("Books", self.article)
        if article.status == "Issued":
            frappe.throw("All Copy of this book are issued")


    def validate_outstanding_debt(self):
        member_transaction = frappe.db.get_list('Library Transaction',
            filters = {
                'library_member' : self.library_member,
            },
            fields = ['price','type']
        )
        
        member_debt = self.price;
        for dict in member_transaction:
                if (dict['type'] == 'Issue' ):
                    member_debt += dict['price']
                elif (dict['type'] == 'Return'):
                    member_debt -= dict['price']

        maximum_outstanding_debt = frappe.db.get_single_value('Library Settings','maximum_outstanding_debt')
        if(member_debt >= maximum_outstanding_debt):
           frappe.throw("Your outstanding debt is more than 500")
        

    def validate_maximum_limit(self):
        max_articles = frappe.db.get_single_value("Library Settings", "max_articles")
        issuedBooks = frappe.db.count(
            "Library Transaction",
            {
                "library_member": self.library_member,
                "type": "Issue", 
                "docstatus": DocStatus.submitted()
            },
        )
        returnedBooks = frappe.db.count(
            "Library Transaction",
            {
                "library_member": self.library_member,
                "type": "Return", 
                "docstatus": DocStatus.submitted()
            },
        )
        if (issuedBooks - returnedBooks) >= max_articles:
            frappe.throw("Maximum limit reached for issuing articles")


    def validate_membership(self):
        valid_membership = frappe.db.exists(
            "Library Membership",
            {
                "library_member": self.library_member,
                "docstatus": DocStatus.submitted(),
                "from_date": ("<=", self.date),
                "to_date": (">", self.date),
            },
        )
        if not valid_membership:
            frappe.throw("The member does not have a valid membership")

        
