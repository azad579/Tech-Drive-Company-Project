// Complete full menu structure matching Tech Drive ERP (BGD ERP) 1:1
export interface SubMenuItem {
  title: string;
  href: string;
}

export interface MenuItem {
  title: string;
  icon: string;
  href: string;
  subItems: SubMenuItem[];
}

export const ERP_MENU_TREE: MenuItem[] = [
  {
    "title": "Dashboard",
    "icon": "fa fa-dashboard",
    "href": "home.php",
    "subItems": []
  },
  {
    "title": "Daily Process",
    "icon": "fa fa-edit",
    "href": "#",
    "subItems": [
      {
        "title": "Price List",
        "href": "dai_pricelist.php"
      },
      {
        "title": "Update Price List",
        "href": "dai_priceupdate.php"
      },
      {
        "title": "Est.Expenses Record",
        "href": "dai_esexpenlist.php"
      },
      {
        "title": "Create Est.Expenses",
        "href": "dai_esexpensescreate.php"
      },
      {
        "title": "Expenses Record",
        "href": "dai_expenlist.php"
      },
      {
        "title": "Create Expenses",
        "href": "dai_expensescreate.php"
      },
      {
        "title": "Expenses Head",
        "href": "dai_explist.php"
      },
      {
        "title": "Add Expenses Head",
        "href": "dai_expadd.php"
      },
      {
        "title": "DSR List",
        "href": "dai_dsrlist.php"
      },
      {
        "title": "Add DSR",
        "href": "dai_dsrcreate.php"
      },
      {
        "title": "Database Backup",
        "href": "axe_databasebackup.php"
      }
    ]
  },
  {
    "title": "Purchase",
    "icon": "fa fa-shopping-basket",
    "href": "#",
    "subItems": [
      {
        "title": "Purchase Order",
        "href": "pur_porderlist.php"
      },
      {
        "title": "Purchase Order Create",
        "href": "pur_pordercteate.php"
      },
      {
        "title": "Purchase Invoice",
        "href": "pur_pinvlist.php"
      },
      {
        "title": "Purchase Invoice Create",
        "href": "pur_pinvcteate.php"
      },
      {
        "title": "Purchase Return",
        "href": "pur_preturnlist.php"
      },
      {
        "title": "Purchase Return Create",
        "href": "pur_preturncteate.php"
      }
    ]
  },
  {
    "title": "Sales",
    "icon": "fa fa-shopping-bag",
    "href": "#",
    "subItems": [
      {
        "title": "Sales Quotation",
        "href": "sel_squolist.php"
      },
      {
        "title": "Sales Quotation Create",
        "href": "sel_squocreate.php"
      },
      {
        "title": "Sales Estimate",
        "href": "sel_estlist.php"
      },
      {
        "title": "Sales Estimate Create",
        "href": "sel_estcreate.php"
      },
      {
        "title": "Sales Invoice",
        "href": "sel_sinvlist.php"
      },
      {
        "title": "Sales Invoice Create",
        "href": "sel_sinvcteate.php"
      },
      {
        "title": "Sales Return",
        "href": "sel_sreturnlist.php"
      },
      {
        "title": "Sales Return Create",
        "href": "sel_sreturncreate.php"
      }
    ]
  },
  {
    "title": "Service",
    "icon": "fa fa-wrench",
    "href": "#",
    "subItems": [
      {
        "title": "Service List",
        "href": "ser_servicelist.php"
      },
      {
        "title": "Service Received List",
        "href": "ser_sreclist.php"
      },
      {
        "title": "Service Received Create",
        "href": "ser_sreccreate.php"
      },
      {
        "title": "Service Invoice",
        "href": "ser_sinvlist.php"
      },
      {
        "title": "Service Sales Create",
        "href": "ser_sinvcreate.php"
      }
    ]
  },
  {
    "title": "Warranty Management",
    "icon": "fa fa-microchip",
    "href": "#",
    "subItems": [
      {
        "title": "Warranty Claim",
        "href": "war_claimlist.php"
      },
      {
        "title": "Product Checking",
        "href": "war_checkinglist.php"
      },
      {
        "title": "Manage Product",
        "href": "war_proclaimlist.php"
      },
      {
        "title": "Warranty Delivered",
        "href": "war_delreclist.php"
      },
      {
        "title": "Warranty Stock",
        "href": "war_stock.php"
      },
      {
        "title": "Claim To Supplier",
        "href": "war_badstockclaim.php"
      },
      {
        "title": "Service Center",
        "href": "war_servicecenter.php"
      }
    ]
  },
  {
    "title": "Inventory",
    "icon": "fa fa-barcode",
    "href": "#",
    "subItems": [
      {
        "title": "Branch",
        "href": "inv_branchlist.php"
      },
      {
        "title": "Branch Create",
        "href": "inv_branchcreate.php"
      },
      {
        "title": "Warehouse",
        "href": "inv_whouselist.php"
      },
      {
        "title": "Warehouse Create",
        "href": "inv_whousecreate.php"
      },
      {
        "title": "Product Delivery",
        "href": "inv_deliverlist.php"
      },
      {
        "title": "Product Received",
        "href": "inv_receivlist.php"
      },
      {
        "title": "Branch Stock",
        "href": "inv_brstocklist.php"
      },
      {
        "title": "Warehouse Stock",
        "href": "inv_whostock.php"
      },
      {
        "title": "Combined Stock",
        "href": "inv_comstock.php"
      },
      {
        "title": "Transfer From Branch",
        "href": "inv_bratra.php"
      },
      {
        "title": "Transfer From Warehouse",
        "href": "inv_whotra.php"
      },
      {
        "title": "Product Disposal",
        "href": "inv_prodispos.php"
      }
    ]
  },
  {
    "title": "Client Setup",
    "icon": "fa fa-handshake-o",
    "href": "#",
    "subItems": [
      {
        "title": "Customer List",
        "href": "main_cutomerlist.php"
      },
      {
        "title": "Add Customer",
        "href": "main_cutomercreate.php"
      },
      {
        "title": "Supplier List",
        "href": "main_supplierlist.php"
      },
      {
        "title": "Add Supplier",
        "href": "main_suppliercreate.php"
      },
      {
        "title": "Exchanger List",
        "href": "main_sellerlist.php"
      },
      {
        "title": "Add Exchanger",
        "href": "main_sellercreate.php"
      },
      {
        "title": "All Group",
        "href": "main_grouplist.php"
      },
      {
        "title": "Group Create",
        "href": "main_groupcreate.php"
      },
      {
        "title": "Promotional SMS",
        "href": "main_customersms.php"
      },
      {
        "title": "Indivisual Promotional SMS",
        "href": "main_indivisualcustomersms.php"
      }
    ]
  },
  {
    "title": "Product Setup",
    "icon": "fa fa-shopping-cart",
    "href": "#",
    "subItems": [
      {
        "title": "Parent List",
        "href": "pro_parentlist.php"
      },
      {
        "title": "Parent Create",
        "href": "pro_parentcreate.php"
      },
      {
        "title": "Category List",
        "href": "pro_categorylist.php"
      },
      {
        "title": "Category Create",
        "href": "pro_categorycreate.php"
      },
      {
        "title": "Sub-Category List",
        "href": "pro_subcategorylist.php"
      },
      {
        "title": "Sub-Category Create",
        "href": "pro_subcategorycreate.php"
      },
      {
        "title": "Product List",
        "href": "pro_productlist.php"
      },
      {
        "title": "Add New Product",
        "href": "pro_productcreate.php"
      }
    ]
  },
  {
    "title": "Master Setup",
    "icon": "fa fa-sun-o",
    "href": "#",
    "subItems": [
      {
        "title": "Brand List",
        "href": "mas_brandlist.php"
      },
      {
        "title": "Add Brand",
        "href": "mas_brandcreate.php"
      },
      {
        "title": "Manufacturer List",
        "href": "mas_manlist.php"
      },
      {
        "title": "Add Manufacturer",
        "href": "mas_mancreate.php"
      },
      {
        "title": "Unit List",
        "href": "mas_unitlist.php"
      },
      {
        "title": "Add Unit",
        "href": "mas_unitcreate.php"
      },
      {
        "title": "RAM List",
        "href": "mas_ramlist.php"
      },
      {
        "title": "Add RAM",
        "href": "mas_ramcreate.php"
      },
      {
        "title": "SSD List",
        "href": "mas_ssdlist.php"
      },
      {
        "title": "Add SSD",
        "href": "mas_ssdcreate.php"
      },
      {
        "title": "Currency List",
        "href": "mas_currencylist.php"
      },
      {
        "title": "Add Currency",
        "href": "mas_currencycreate.php"
      },
      {
        "title": "Country List",
        "href": "mas_countrylist.php"
      },
      {
        "title": "Add Country",
        "href": "mas_countrycreate.php"
      },
      {
        "title": "Transporter List",
        "href": "mas_shiplist.php"
      },
      {
        "title": "Add Transporter",
        "href": "mas_shipcreate.php"
      },
      {
        "title": "Color List",
        "href": "mas_colorlist.php"
      },
      {
        "title": "Add Color",
        "href": "mas_colorcreate.php"
      },
      {
        "title": "Size List",
        "href": "mas_sizelist.php"
      },
      {
        "title": "Add Size",
        "href": "mas_size.php"
      },
      {
        "title": "District",
        "href": "mas_district.php"
      },
      {
        "title": "Zone",
        "href": "mas_zone.php"
      }
    ]
  },
  {
    "title": "Accounts Setup",
    "icon": "fa fa-money",
    "href": "#",
    "subItems": [
      {
        "title": "Class",
        "href": "acc_acclass.php"
      },
      {
        "title": "Group List",
        "href": "acc_grouplist.php"
      },
      {
        "title": "Group Cteate",
        "href": "acc_groupcreate.php"
      },
      {
        "title": "Sub-Group List",
        "href": "acc_subgrouplist.php"
      },
      {
        "title": "Sub-Group Create",
        "href": "acc_subgroupcreate.php"
      },
      {
        "title": "Ledger List",
        "href": "acc_ledgerlist.php"
      },
      {
        "title": "Ledger Create",
        "href": "acc_ledgercreate.php"
      },
      {
        "title": "Payment Voucher List",
        "href": "acc_paylist.php"
      },
      {
        "title": "Payment Voucher Create",
        "href": "acc_paycreate.php"
      },
      {
        "title": "Receive Voucher List",
        "href": "acc_reclist.php"
      },
      {
        "title": "Receive Voucher Create",
        "href": "acc_reccreate.php"
      },
      {
        "title": "Journal Entry List",
        "href": "acc_joulist.php"
      },
      {
        "title": "Journal Entry Create",
        "href": "acc_joulcreate.php"
      }
    ]
  },
  {
    "title": "Installment & Loan Setup",
    "icon": "fa fa-credit-card",
    "href": "#",
    "subItems": [
      {
        "title": "Loan ID",
        "href": "lon_addloanid.php"
      }
    ]
  },
  {
    "title": "Finance Record",
    "icon": "fa fa-bar-chart",
    "href": "#",
    "subItems": [
      {
        "title": "Chart of Account",
        "href": "fin_chartofacc.php"
      },
      {
        "title": "Profit And Loss",
        "href": "fin_proandlos.php"
      },
      {
        "title": "Trial Balance",
        "href": "fin_trialbal.php"
      },
      {
        "title": "Balance Sheet",
        "href": "fin_blasheet.php"
      },
      {
        "title": "Finance Analysis",
        "href": "fin_accanalysis.php"
      }
    ]
  },
  {
    "title": "Payroll",
    "icon": "fa fa-clock-o",
    "href": "#",
    "subItems": [
      {
        "title": "Department List",
        "href": "payr_deplist.php"
      },
      {
        "title": "Add Department",
        "href": "payr_deplcre.php"
      },
      {
        "title": "Designation List",
        "href": "payr_desiglist.php"
      },
      {
        "title": "Add Designation",
        "href": "payr_desigcreate.php"
      },
      {
        "title": "Employee List",
        "href": "payr_emplist.php"
      },
      {
        "title": "Add Employee",
        "href": "payr_empcreate.php"
      },
      {
        "title": "Leave Type",
        "href": "payr_levlist.php"
      },
      {
        "title": "Add Leave Type",
        "href": "payr_levcreate.php"
      },
      {
        "title": "Leave Record",
        "href": "payr_levaplist.php"
      },
      {
        "title": "Add Leave Application",
        "href": "payr_levapcreate.php"
      },
      {
        "title": "Attendance Record",
        "href": "payr_attreclist.php"
      },
      {
        "title": "Salary Sheet &amp; Payslip",
        "href": "payr_payslip.php"
      }
    ]
  },
  {
    "title": "Bank",
    "icon": "fa fa-credit-card-alt",
    "href": "#",
    "subItems": [
      {
        "title": "Bank List",
        "href": "ban_banklist.php"
      },
      {
        "title": "Add Bank",
        "href": "ban_bankcreate.php"
      },
      {
        "title": "Account List",
        "href": "ban_accountlist.php"
      },
      {
        "title": "Add Account",
        "href": "ban_accountcreate.php"
      },
      {
        "title": "Mobile Account",
        "href": "ban_mobileaccount.php"
      },
      {
        "title": "All Transaction",
        "href": "ban_bnktranlist.php"
      },
      {
        "title": "Add Transaction",
        "href": "ban_bnkcreate.php"
      },
      {
        "title": "Cheque Management",
        "href": "ban_checkman.php"
      }
    ]
  },
  {
    "title": "Personal",
    "icon": "fa fa-user",
    "href": "#",
    "subItems": [
      {
        "title": "Personal Note",
        "href": "axe_note.php"
      },
      {
        "title": "Todo",
        "href": "axe_todo.php"
      }
    ]
  },
  {
    "title": "User & Role",
    "icon": "fa fa-address-card-o",
    "href": "#",
    "subItems": [
      {
        "title": "Role List",
        "href": "rou_rolelist.php"
      },
      {
        "title": "Add Role",
        "href": "rou_rolecreate.php"
      },
      {
        "title": "All User",
        "href": "rou_userlist.php"
      },
      {
        "title": "Add User",
        "href": "rou_usercreate.php"
      },
      {
        "title": "Add Report Role",
        "href": "rou_reprolecreate.php"
      }
    ]
  },
  {
    "title": "Report",
    "icon": "fa fa-pie-chart",
    "href": "axe_report.php",
    "subItems": []
  }
];
