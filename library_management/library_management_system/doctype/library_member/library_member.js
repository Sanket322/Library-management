// Copyright (c) 2024, sanket and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Library Member", {
// 	refresh(frm) {

// 	},
// });

frappe.ui.form.on('Library Member', {

    first_name: function (frm) {
        frm.set_value("full_name", frm.doc.first_name + " " + (frm.doc.last_name ? frm.doc.last_name : ""))
    },
    last_name: function (frm) {
        frm.set_value("full_name", (frm.doc.first_name ? frm.doc.first_name+" " : "") + frm.doc.last_name)
    },


    refresh: function (frm) {
        
        frm.add_custom_button('Create Membership', () => {
            frappe.new_doc('Library Membership', {
                library_member: frm.doc.name,
            })
        })
        frm.add_custom_button('Create Transaction', () => {
            frappe.new_doc('Library Transaction', {
                library_member: frm.doc.name,
                type: "Issue",
            })
        })
    }
});

//
