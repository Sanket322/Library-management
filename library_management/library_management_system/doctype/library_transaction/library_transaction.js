// Copyright (c) 2024, sanket and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Library Transaction", {
// 	refresh(frm) {

// 	},
// });

frappe.ui.form.on("Library Transaction", {

    date: function (frm) {
        if (frm.doc.date < frappe.datetime.now_date()) {
            frm.set_value('date', frappe.datetime.now_date())
            frappe.throw("Date can not be in past")
        }
    },

    before_save: async function (frm) {
        if (frm.doc.type == "Return") {
            const r = await frm.call({
                doc: frm.doc,
                method: 'recordExists'
            });

            if (r.message == "No record present") {
                frm.set_value('article','');
                frm.set_value('fees',0);
                frappe.msgprint("Article cannot be returned without being issued first");
                frm.save_cancel();
                return;
            } else {
                list = r.message;
                issueDate = list[0]['date'];
                let date1 = new Date(issueDate);
                let date2 = new Date(frm.doc.date);
                let diffTime = Math.abs(date2 - date1);
                let dateDiff_BetweenBuySell = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                library_settings = await frappe.db.get_doc('Library Settings');
                borrowing_period = Number(library_settings.borrowing_period);
                rent_fees = Number(library_settings.rent_fees);

                if (dateDiff_BetweenBuySell > borrowing_period) {
                    dateDiff_BetweenBuySell -= borrowing_period;
                    total_cost = dateDiff_BetweenBuySell * rent_fees;
                    frm.set_value('fees', total_cost);
                }
            }
        }
    }



})
