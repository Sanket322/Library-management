frappe.ui.form.on('Library Membership', {

    refresh : function(frm){
        frm.set_value("to_date",frappe.datetime.add_days(frappe.datetime.now_date(),30))
    },

    from_date: function (frm) {
        if (frm.doc.from_date < frappe.datetime.now_date()) {
            frm.set_value('from_date', frappe.datetime.now_date())
            frappe.throw("From Date starts from today to future")
        }

        if (frm.doc.from_date > frm.doc.to_date){
            frm.set_value('from_date', frappe.datetime.now_date())
            frappe.throw('From Date can not be after to_date')
        }
    },

    to_date: function (frm) {
        if (frm.doc.from_date > frm.doc.to_date) {
            frm.set_value('to_date', frappe.datetime.now_date())
            frappe.throw("To Date Can not be in past of From Date")
        }
    }

});