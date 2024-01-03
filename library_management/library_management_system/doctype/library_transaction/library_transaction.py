# Copyright (c) 2024, sanket and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.model.docstatus import DocStatus


class LibraryTransaction(Document):
    def before_submit(self):
        if self.type == "Issue":
            self.validate_issue()
            self.validate_maximum_limit()

            article = frappe.get_doc("Article", self.article)

            article.quentity = article.quentity - 1
            if article.quentity == 0:
                article.status = "Issued"

            article.save()

        elif self.type == "Return":

            article = frappe.get_doc("Article", self.article)

            check = frappe.db.exists('Library Transaction',{
                'article' : self.article,
                'library_member' : self.library_member
            })
            if check : 
                article.quentity = article.quentity + 1
                frappe.db.delete("Library Transaction", {
                    'article' : self.article,
                    'library_member' : self.library_member
                })
                article.status = "Available"

            else:
                frappe.throw("Article cannot be returned without being issued first")
                    
            article.save()

    def validate_issue(self):
        self.validate_membership()
        article = frappe.get_doc("Article", self.article)
        if article.status == "Issued":
            frappe.throw("Article is already issued by another member")

    def validate_maximum_limit(self):
        max_articles = frappe.db.get_single_value("Library Settings", "max_articles")
        count = frappe.db.count(
            "Library Transaction",
            {
                "library_member": self.library_member,
                "type": "Issue", 
                "docstatus": DocStatus.submitted()
            },
        )
        if count >= max_articles:
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
